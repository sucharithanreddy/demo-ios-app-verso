'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Moon,
  Sun,
  Loader2,
  Target,
  Lightbulb,
  Users,
  AlertTriangle,
  CheckCircle2,
  ListChecks,
} from 'lucide-react';
import Link from 'next/link';
import { useSafeUser } from '@/lib/safe-auth';
import { MobileHeader } from '@/components/MobileHeader';
import { cn } from '@/lib/utils';
import {
  fullDiagnosticQuestions,
  calculateFullResults,
  type Archetype,
  type SubDimension,
} from '@/lib/full-diagnostic-questions';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Response scale — same as the Snapshot, "Strongly Agree" = 5
const RESPONSE_SCALE = [
  { value: 5, label: 'Strongly Agree' },
  { value: 4, label: 'Agree' },
  { value: 3, label: 'Neutral' },
  { value: 2, label: 'Disagree' },
  { value: 1, label: 'Strongly Disagree' },
];

// Display metadata for each archetype (mirrors the snapshot page so the
// UI feels consistent across both flows).
const ARCHETYPE_INFO: Record<
  Archetype,
  { name: string; icon: typeof Target; color: string; bgColor: string; description: string }
> = {
  driver: {
    name: 'Driver',
    icon: Target,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    description: 'Action, momentum, achievement',
  },
  strategist: {
    name: 'Strategist',
    icon: Lightbulb,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Clarity, planning, analysis',
  },
  connector: {
    name: 'Connector',
    icon: Users,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    description: 'Relationships, trust, communication',
  },
  reactor: {
    name: 'Reactor',
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    description: 'Emotional sensitivity to outcomes',
  },
};

// Friendly labels for the 8 sub-dimensions (used in the progress breakdown
// and on the results page).
const SUB_DIMENSION_LABELS: Record<SubDimension, string> = {
  achievement: 'Achievement',
  pace: 'Pace',
  pressure_response: 'Pressure Response',
  recovery: 'Recovery',
  motivation: 'Motivation',
  decision_making: 'Decision-Making',
  confidence: 'Confidence',
  relationships: 'Relationships',
};

export default function FullDiagnosticPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useSafeUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Shuffle questions once on mount so the 16 per-archetype blocks aren't
  // presented in a predictable order. (Same Fisher-Yates approach as the
  // snapshot page.)
  const randomizedQuestions = useMemo(() => {
    const shuffled = [...fullDiagnosticQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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

  const canSubmit = answeredCount >= totalQuestions * 0.8; // require 80% answered

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    // Build the answers array in the shape calculateFullResults expects.
    // Unanswered questions are omitted (the scoring function handles
    // partial results gracefully — Layer 2/3 indicators just get less
    // precise with fewer data points).
    const answersArray = Object.entries(answers).map(([qid, score]) => ({
      questionId: Number(qid),
      score,
    }));

    // Calculate the 3-layer result (archetype scores, sub-dimensions,
    // wellbeing indicators) using the shared scoring function from
    // full-diagnostic-questions.ts.
    const fullResult = calculateFullResults(answersArray);

    // Title-case the primary/secondary archetypes for DB storage
    // (DiagnosticResult.primaryProfile is "Driver" | "Strategist" | etc.)
    const titleCase = (a: string) => a.charAt(0).toUpperCase() + a.slice(1);
    const primaryProfileTitleCase = titleCase(fullResult.primaryArchetype);
    const secondaryProfileTitleCase = titleCase(fullResult.secondaryArchetype);

    // Store the full result (including sub-dimension + wellbeing indicator
    // data) in localStorage for the results page to read. The results
    // page reads from localStorage first (offline-friendly), then optionally
    // hydrates from the DB.
    localStorage.setItem(
      'fullDiagnosticResults',
      JSON.stringify(fullResult)
    );

    // Persist a DiagnosticResult row to the DB so the manager dashboards
    // and AI engine can read it. We send the standard fields the API
    // expects, plus the sub-dimension scores in `strengths` (the closest
    // existing field — the API accepts any string array here). A future
    // schema migration can add a dedicated `subDimensionScores` JSON
    // column; for now this preserves the data without a migration.
    const subDimensionSummary = Object.entries(fullResult.subDimensionScores).map(
      ([sd, score]) => `${SUB_DIMENSION_LABELS[sd as SubDimension] ?? sd}: ${score}`
    );

    const wellbeingSummary = [
      `Overall Wellbeing Index: ${fullResult.wellbeingIndicators.overallSalesWellbeingIndex}`,
      `Confidence Stability: ${fullResult.wellbeingIndicators.confidenceStability}`,
      `Energy Sustainability: ${fullResult.wellbeingIndicators.energySustainability}`,
      `Response to Rejection: ${fullResult.wellbeingIndicators.responseToRejection}`,
      `Tolerance of Uncertainty: ${fullResult.wellbeingIndicators.toleranceOfUncertainty}`,
    ];

    try {
      await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverScore: fullResult.archetypeScores.driver,
          strategistScore: fullResult.archetypeScores.strategist,
          connectorScore: fullResult.archetypeScores.connector,
          reactorScore: fullResult.archetypeScores.reactor,
          primaryProfile: primaryProfileTitleCase,
          secondaryProfile: secondaryProfileTitleCase,
          answers: answersArray,
          strengths: subDimensionSummary,
          wellbeingRisks: wellbeingSummary,
          recommendations: [],
          isPaid: true, // full assessment is a paid-tier feature
          attemptSource: 'full_map',
        }),
      });
    } catch (err) {
      // Non-fatal — localStorage already has the full result
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

  // ─── Submit screen ──────────────────────────────────────────────
  if (currentQuestion >= totalQuestions - 1 && answeredCount >= totalQuestions * 0.8) {
    const archetypeInfo = ARCHETYPE_INFO[currentQ.archetype];
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader />
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
              You've answered {answeredCount} of {totalQuestions} questions. Your 3-layer Sales Wellbeing Map is ready to generate.
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
            {answeredCount < totalQuestions && (
              <p className="text-xs text-muted-foreground mt-3">
                You can still submit with {answeredCount}/{totalQuestions} answered — unanswered questions will be treated as neutral.
              </p>
            )}
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
  const archetypeInfo = ARCHETYPE_INFO[currentQ.archetype];
  const Icon = archetypeInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />

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
            {/* Archetype badge (informational — user doesn't need to know
                which archetype each question maps to, but the color coding
                gives subtle visual variety across the 64 questions) */}
            <div className="flex items-center gap-2 mb-6">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', archetypeInfo.bgColor)}>
                <Icon className={cn('w-4 h-4', archetypeInfo.color)} />
              </div>
              <span className="text-xs text-muted-foreground">
                Section {Math.floor(currentQuestion / 16) + 1} of 4
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed mb-8">
              {currentQ.text}
            </h2>

            {/* Response options */}
            <div className="space-y-2">
              {RESPONSE_SCALE.map((option) => {
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
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip →
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Quick jump dots — lets users see their progress through the 4 sections */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: 4 }).map((_, sectionIdx) => {
            const sectionStart = sectionIdx * 16;
            const sectionEnd = sectionStart + 16;
            const sectionAnswered = Object.keys(answers).filter(qid => {
              const q = fullDiagnosticQuestions.find(q => q.id === Number(qid));
              return q && q.id >= sectionStart + 1 && q.id <= sectionEnd;
            }).length;
            const sectionComplete = sectionAnswered === 16;
            const isCurrentSection =
              currentQuestion >= sectionStart && currentQuestion < sectionEnd;

            return (
              <div
                key={sectionIdx}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  isCurrentSection ? 'w-8 bg-primary' : sectionComplete ? 'w-4 bg-primary/60' : 'w-4 bg-secondary'
                )}
                title={`Section ${sectionIdx + 1}: ${sectionAnswered}/16 answered`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
