'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Moon,
  Sun,
  Loader2,
  CheckCircle2,
  ListChecks,
  Lock,
  Sparkles,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import { useSafeUser } from '@/lib/safe-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { MobileHeader } from '@/components/MobileHeader';
import { cn } from '@/lib/utils';
import {
  fullDiagnosticQuestions,
  shuffleQuestions,
  calculateFullResults,
  RESPONSE_SCALE,
  ASSESSMENT_VERSION,
  type FullDiagnosticQuestion,
} from '@/lib/full-diagnostic-questions';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// 5-point Likert scale per PDF spec §4 (Strongly disagree → Strongly agree).
// We render options in the natural reading order (1 → 5), unlike the older
// version which rendered Strongly Agree first.
const SCALE_OPTIONS = RESPONSE_SCALE;

export default function FullDiagnosticPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useSafeUser();
  const { canAccessProFeatures, isLoading: subLoading } = useSubscription();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Track when the user started the assessment (for the fast-completion
  // response-quality flag - PDF spec §20). Recorded on first interaction
  // rather than page load so the timer doesn't run while the user is on
  // the intro screen.
  const startTimeRef = useRef<number | null>(null);

  // Shuffle questions once on mount using the constrained shuffle
  // (PDF spec §6: max 2 same-archetype consecutive, no adjacent
  // reverse-pair, no clustering of reverse items).
  const randomizedQuestions = useMemo<FullDiagnosticQuestion[]>(() => {
    return shuffleQuestions(Date.now());
  }, []);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  const currentQ = randomizedQuestions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = randomizedQuestions.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleAnswer = (value: number) => {
    // Start the timer on the first answer
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }
    setAnswers({ ...answers, [currentQ.id]: value });
    // Auto-advance after a short delay (same UX as snapshot)
    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSkip = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Require 100% of questions answered for the paid assessment (stricter
  // than the previous 80% threshold - the spec wants a complete result
  // so all 16 dimensions have full data). Users can still skip back and
  // fill in skipped items before submitting.
  const canSubmit = answeredCount === totalQuestions;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    // Calculate completion time (PDF spec §20). If the timer never
    // started (user somehow submitted without answering), default to 0
    // which disables the fast-completion flag.
    const completionTimeSeconds = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : 0;

    // Build the answers array in the shape calculateFullResults expects.
    const answersArray = Object.entries(answers).map(([qid, score]) => ({
      questionId: Number(qid),
      score,
    }));

    // Calculate the full multi-layer result (archetype scores, 16 dimension
    // scores, 12 derived measures, sustainability index, pressure indicator,
    // response quality flags).
    const fullResult = calculateFullResults(answersArray, completionTimeSeconds);

    // Title-case the primary/secondary archetypes for DB storage
    const titleCase = (a: string) => a.charAt(0).toUpperCase() + a.slice(1);
    const primaryProfileTitleCase = titleCase(fullResult.primaryArchetype);
    const secondaryProfileTitleCase = titleCase(fullResult.secondaryArchetype);

    // Build the blended-archetypes string (e.g. "Driver+Strategist")
    const blendedArchetypes = fullResult.blendedArchetypes
      ? fullResult.blendedArchetypes.map(titleCase).join('+')
      : null;

    // Store the full result in localStorage for the results page to read.
    localStorage.setItem(
      'fullDiagnosticResults',
      JSON.stringify(fullResult)
    );

    // Persist a DiagnosticResult row to the DB.
    //
    // NOTE: As of v1.0.1, the server recomputes ALL scores from `answers`
    // server-side and ignores the computed fields we send here (driverScore,
    // dimensionScores, sustainabilityIndex, etc.). We still send them for
    // backward compatibility with older API builds, but the persisted DB
    // row is always the server's computation - never the client's. This
    // closes the integrity hole where a user could tamper with scores
    // via DevTools before submission.
    //
    // The client's local computation (fullResult) is still used to render
    // the immediate results page from localStorage. If the server's
    // computation differs (e.g. due to a scoring bug fix), the server's
    // version wins and is what dashboards/AI/manager views will see.
    try {
      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Raw answers - server uses these as the source of truth
          answers: answersArray,
          // Computed fields below are ignored by the server (kept for
          // backward compat with older builds that don't yet have
          // server-side scoring)
          driverScore: fullResult.archetypeScores.driver,
          strategistScore: fullResult.archetypeScores.strategist,
          connectorScore: fullResult.archetypeScores.connector,
          reactorScore: fullResult.archetypeScores.reactor,
          primaryProfile: primaryProfileTitleCase,
          secondaryProfile: secondaryProfileTitleCase,
          strengths: [],
          wellbeingRisks: [],
          recommendations: [],
          isPaid: true,
          attemptSource: 'full_map',
          assessmentVersion: ASSESSMENT_VERSION,
          dimensionScores: fullResult.dimensionScores,
          derivedMeasures: fullResult.derivedMeasures,
          sustainabilityIndex: fullResult.salesWellbeingSustainabilityIndex,
          profileClassification: fullResult.profileClassification,
          blendedArchetypes,
          responseQualityFlags: fullResult.responseQuality,
          completionTimeSeconds,
        }),
      });

      // If the server echoed back its computed scores and they differ
      // from our local computation, refresh localStorage so the results
      // page shows the canonical (server) version. This handles the
      // case where the server has a newer scoring algorithm than the
      // client bundle.
      if (response.ok) {
        const body = await response.json();
        if (body?.serverComputed) {
          const sc = body.serverComputed;
          const local = fullResult.archetypeScores;
          if (
            sc.driverScore !== local.driver ||
            sc.strategistScore !== local.strategist ||
            sc.connectorScore !== local.connector ||
            sc.reactorScore !== local.reactor ||
            sc.sustainabilityIndex !== fullResult.salesWellbeingSustainabilityIndex
          ) {
            // Server differs - log and refresh localStorage from server.
            // We don't have the full server result here (just the
            // summary echo), so we leave the local render as-is and
            // rely on the next GET /api/diagnostic to surface the
            // canonical row.
            console.info(
              '[diagnostic] Server scores differ from local - server is canonical',
              { server: sc, local: { ...local, sustainabilityIndex: fullResult.salesWellbeingSustainabilityIndex } },
            );
          }
        }
      }
    } catch (err) {
      // Non-fatal - localStorage already has the full result
      console.warn('Failed to persist full diagnostic result to DB:', err);
    }

    // Navigate to the results page
    router.push('/diagnostic/full/results');
  };

  // ─── Loading / auth gate ────────────────────────────────────────
  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse" />
          <div className="absolute inset-2 rounded-xl bg-primary/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="absolute inset-4 rounded-lg bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // useEffect will redirect
  }

  // ─── Subscription gate (PDF spec payment tier) ──────────────────
  // The 64-question Full Map is a paid-tier feature. Users without an
  // active PRO or ENTERPRISE subscription see a paywall instead of the
  // assessment. We wait for subLoading to settle so we don't flash the
  // paywall on initial render before the subscription status comes back.
  if (!subLoading && !canAccessProFeatures) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Full Sales Wellbeing Map" subtitle="Premium assessment" icon="target" />
        <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <Lock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-500">Premium assessment</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              The full 64-question Sales Wellbeing Map
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              The full assessment goes beyond the free Snapshot to reveal all 16 underlying dimensions, 12 derived wellbeing measures, your Sales Wellbeing Sustainability Index, and a personalised dashboard.
            </p>
          </motion.div>

          <div className="glass rounded-2xl border border-border/50 p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Verso Pro</p>
                <p className="text-xs text-muted-foreground">Unlock the full Map + AI Companion</p>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {[
                'Full 64-question assessment across 16 dimensions',
                '12 derived dashboard measures (Confidence Stability, Recovery Capacity, etc.)',
                'Sales Wellbeing Sustainability Index',
                'Response-quality checks (fast-completion, straight-lining)',
                'AI Companion trained on your full profile',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/pricing"
                className="flex-1 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Pro
              </Link>
              <Link
                href="/diagnostic"
                className="flex-1 px-6 py-3 rounded-xl border border-border/50 text-foreground hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"
              >
                Try the free Snapshot
              </Link>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Already have an unlock code? Visit your <Link href="/sales-dashboard/profile" className="underline">profile</Link> to redeem it.
          </p>
        </div>
      </div>
    );
  }

  // ─── Submit screen ──────────────────────────────────────────────
  if (currentQuestion >= totalQuestions - 1 && canSubmit) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Full Sales Wellbeing Map" subtitle="Almost there" icon="target" />
        <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <ListChecks className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Full Sales Wellbeing Map</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Ready to see your results?
            </h1>
            <p className="text-muted-foreground">
              You've answered all {totalQuestions} questions. Your personalised Sales Wellbeing Map is ready to generate.
            </p>
          </motion.div>

          <div className="glass rounded-2xl border border-border/50 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-foreground">Completion</span>
              <span className="text-sm text-muted-foreground">{progressPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              className="flex-1 px-6 py-3 rounded-xl border border-border/50 text-foreground hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Review Answers
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating your map...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Generate My Map
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Question screen ────────────────────────────────────────────
  // Per the spec §6, the archetype/dimension being measured should NOT
  // be visible to the user during the assessment. We deliberately don't
  // show the archetype badge or section indicator here.

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Full Sales Wellbeing Map" subtitle={`Question ${currentQuestion + 1} of ${totalQuestions}`} icon="target" />

      {/* Top nav */}
      <div className="max-w-2xl mx-auto px-4 pt-4 flex items-center justify-between">
        <Link
          href="/diagnostic"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Snapshot
        </Link>
        <button
          onClick={toggleDark}
          className="w-10 h-10 rounded-xl flex items-center justify-center glass border border-border/50"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Progress bar */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <span className="text-xs text-muted-foreground">
            {answeredCount} answered · {progressPercent}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-2xl border border-border/50 p-6 md:p-8"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed mb-8">
              {currentQ.text}
            </h2>

            {/* Response options - 5-point Likert scale, Strongly disagree → Strongly agree */}
            <div className="space-y-2">
              {SCALE_OPTIONS.map((option) => {
                const isSelected = answers[currentQ.id] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border-2 transition-all text-left flex items-center justify-between',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50 hover:border-primary/30 hover:bg-secondary/30'
                    )}
                  >
                    <span className={cn('text-sm font-medium', isSelected ? 'text-primary' : 'text-foreground')}>
                      {option.label}
                    </span>
                    <span className={cn('text-xs', isSelected ? 'text-primary' : 'text-muted-foreground')}>
                      {option.value}/5
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Skip + Back */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
              <button
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              {currentQuestion < totalQuestions - 1 && (
                <button
                  onClick={handleSkip}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip →
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Inline notice if the user has skipped questions - encourages them to go back */}
        {answeredCount < totalQuestions && currentQuestion === totalQuestions - 1 && (
          <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              You've answered {answeredCount} of {totalQuestions} questions. To generate your full Map, please go back and answer any skipped items.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
