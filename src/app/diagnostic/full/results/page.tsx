'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Moon,
  Sun,
  Target,
  Lightbulb,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Share2,
  RefreshCcw,
  Sparkles,
  Layers,
  Activity,
  Heart,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useSafeUser } from '@/lib/safe-auth';
import { MobileHeader } from '@/components/MobileHeader';
import { cn } from '@/lib/utils';
import type { FullDiagnosticResult, Archetype, SubDimension } from '@/lib/full-diagnostic-questions';

export const dynamic = 'force-dynamic';

const ARCHETYPE_CONFIG: Record<
  Archetype,
  { name: string; icon: typeof Target; color: string; bgColor: string; gradient: string }
> = {
  driver: {
    name: 'Driver',
    icon: Target,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    gradient: 'from-red-500 to-red-600',
  },
  strategist: {
    name: 'Strategist',
    icon: Lightbulb,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    gradient: 'from-blue-500 to-blue-600',
  },
  connector: {
    name: 'Connector',
    icon: Users,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    gradient: 'from-green-500 to-green-600',
  },
  reactor: {
    name: 'Reactor',
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    gradient: 'from-amber-500 to-amber-600',
  },
};

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

const WELLBEING_INDICATOR_CONFIG = [
  {
    key: 'confidenceStability' as const,
    label: 'Confidence Stability',
    description: 'How stable your self-belief is under varying outcomes',
    icon: Shield,
  },
  {
    key: 'energySustainability' as const,
    label: 'Energy Sustainability',
    description: 'Whether your current pace is sustainable without burnout',
    icon: Activity,
  },
  {
    key: 'responseToRejection' as const,
    label: 'Response to Rejection',
    description: 'How deeply setbacks and "no"s affect you emotionally',
    icon: Heart,
  },
  {
    key: 'toleranceOfUncertainty' as const,
    label: 'Tolerance of Uncertainty',
    description: 'Your comfort acting without complete information',
    icon: TrendingUp,
  },
];

export default function FullDiagnosticResultsPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useSafeUser();
  const [result, setResult] = useState<FullDiagnosticResult | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');

    // Load the full result from localStorage (set by /diagnostic/full
    // on submit). If absent, the user landed here directly — redirect
    // them to the assessment.
    const raw = localStorage.getItem('fullDiagnosticResults');
    if (raw) {
      try {
        setResult(JSON.parse(raw));
      } catch {
        router.push('/diagnostic/full');
      }
    } else {
      router.push('/diagnostic/full');
    }
  }, [router]);

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

  if (!isSignedIn) return null;

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Loading your results...</p>
          <Link href="/diagnostic/full" className="text-primary hover:underline">
            Take the assessment
          </Link>
        </div>
      </div>
    );
  }

  const primaryConfig = ARCHETYPE_CONFIG[result.primaryArchetype];
  const secondaryConfig = ARCHETYPE_CONFIG[result.secondaryArchetype];
  const PrimaryIcon = primaryConfig.icon;
  const SecondaryIcon = secondaryConfig.icon;

  const confidenceLabel = {
    strong: 'Strong primary pattern',
    moderate: 'Moderate primary pattern with secondary blend',
    blended: 'Blended patterns — no single dominant archetype',
  }[result.confidence];

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />

      {/* Top nav */}
      <div className="max-w-4xl mx-auto px-4 pt-4 flex items-center justify-between">
        <Link
          href="/diagnostic"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Diagnostic
        </Link>
        <button
          onClick={toggleDark}
          className="w-10 h-10 rounded-xl flex items-center justify-center glass border border-border/50"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Full Sales Wellbeing Map</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Your 3-Layer Sales Wellbeing Map
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A 64-question deep dive into how you experience sales pressure — across 4 archetypes, 8 sub-dimensions, and 4 wellbeing indicators.
          </p>
        </motion.div>

        {/* ─── Layer 1: Primary + Secondary Archetype ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl border border-border/50 p-6 md:p-8 mb-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Layer 1: Your Archetype Pattern</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Primary */}
            <div className={cn('rounded-xl border-2 p-5', primaryConfig.bgColor, 'border-primary/30')}>
              <div className="flex items-center gap-3 mb-2">
                <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center', primaryConfig.gradient)}>
                  <PrimaryIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Primary Pattern</p>
                  <p className="text-xl font-bold text-foreground">{primaryConfig.name}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{primaryConfig.description}</p>
            </div>

            {/* Secondary */}
            <div className={cn('rounded-xl border-2 p-5', secondaryConfig.bgColor, 'border-border/50')}>
              <div className="flex items-center gap-3 mb-2">
                <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center opacity-80', secondaryConfig.gradient)}>
                  <SecondaryIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Secondary Pattern</p>
                  <p className="text-xl font-bold text-foreground">{secondaryConfig.name}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{secondaryConfig.description}</p>
            </div>
          </div>

          {/* Confidence badge */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">{confidenceLabel}</span>
          </div>

          {/* Archetype score bars */}
          <div className="mt-6 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">All 4 Archetype Scores</p>
            {(Object.entries(result.archetypeScores) as [Archetype, number][]).map(([archetype, score]) => {
              const config = ARCHETYPE_CONFIG[archetype];
              const Icon = config.icon;
              return (
                <div key={archetype} className="flex items-center gap-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', config.bgColor)}>
                    <Icon className={cn('w-4 h-4', config.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{config.name}</span>
                      <span className="text-sm text-muted-foreground">{score}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn('h-full bg-gradient-to-r transition-all duration-500', config.gradient)}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Layer 2: Sub-Dimension Drill-Down ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl border border-border/50 p-6 md:p-8 mb-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Layer 2: Sub-Dimension Drill-Down</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Within each archetype, your responses reveal finer-grained patterns across 8 sub-dimensions. These are aggregated across all 4 archetypes — a high score in "Recovery" means you recover well regardless of which archetype triggered the stress.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {(Object.entries(result.subDimensionScores) as [SubDimension, number][]).map(([sd, score]) => {
              const label = SUB_DIMENSION_LABELS[sd] ?? sd;
              const hue = score >= 67 ? 'high' : score >= 33 ? 'mid' : 'low';
              const colorClass =
                hue === 'high'
                  ? 'from-green-500 to-emerald-500'
                  : hue === 'mid'
                    ? 'from-amber-500 to-yellow-500'
                    : 'from-red-500 to-orange-500';
              return (
                <div key={sd} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    <span className="text-sm font-bold text-foreground">{score}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn('h-full bg-gradient-to-r transition-all duration-500', colorClass)}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Layer 3: Wellbeing Indicators ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl border border-border/50 p-6 md:p-8 mb-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Layer 3: Cross-Archetype Wellbeing Indicators</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            These indicators cut across all 4 archetypes to surface sales-specific wellbeing risks. Each is a 0-100 score where higher = healthier. These are initial heuristics pending psychometric sign-off.
          </p>

          {/* Overall index — hero number */}
          <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Overall Sales Wellbeing Index</p>
                <p className="text-3xl font-bold text-foreground">
                  {result.wellbeingIndicators.overallSalesWellbeingIndex}
                  <span className="text-lg text-muted-foreground">/100</span>
                </p>
              </div>
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                result.wellbeingIndicators.overallSalesWellbeingIndex >= 67
                  ? 'bg-green-500/20'
                  : result.wellbeingIndicators.overallSalesWellbeingIndex >= 33
                    ? 'bg-amber-500/20'
                    : 'bg-red-500/20'
              )}>
                <Activity className={cn(
                  'w-7 h-7',
                  result.wellbeingIndicators.overallSalesWellbeingIndex >= 67
                    ? 'text-green-500'
                    : result.wellbeingIndicators.overallSalesWellbeingIndex >= 33
                      ? 'text-amber-500'
                      : 'text-red-500'
                )} />
              </div>
            </div>
          </div>

          {/* Individual indicators */}
          <div className="grid sm:grid-cols-2 gap-4">
            {WELLBEING_INDICATOR_CONFIG.map(({ key, label, description, icon: Icon }) => {
              const score = result.wellbeingIndicators[key];
              const hue = score >= 67 ? 'good' : score >= 33 ? 'ok' : 'risk';
              return (
                <div key={key} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                      hue === 'good' ? 'bg-green-500/10' : hue === 'ok' ? 'bg-amber-500/10' : 'bg-red-500/10'
                    )}>
                      <Icon className={cn(
                        'w-4 h-4',
                        hue === 'good' ? 'text-green-500' : hue === 'ok' ? 'text-amber-500' : 'text-red-500'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        <span className="text-sm font-bold text-foreground">{score}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-500',
                        hue === 'good' ? 'bg-green-500' : hue === 'ok' ? 'bg-amber-500' : 'bg-red-500'
                      )}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── What happens next + actions ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl border border-border/50 p-6 md:p-8 mb-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Your AI Companion now knows your pattern</h2>
              <p className="text-sm text-muted-foreground">
                Your archetype profile has been saved. When you use the Reflect AI tool, your responses will be personalized based on how YOUR pattern tends to experience sales pressure — not generic advice.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            <Link
              href="/sales-dashboard/reflect"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              Try Reflect AI
            </Link>
            <Link
              href="/sales-dashboard/profile"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border/50 text-foreground hover:bg-secondary/50 transition-colors text-sm font-medium"
            >
              <CheckCircle2 className="w-4 h-4" />
              View My Profile
            </Link>
          </div>
        </motion.div>

        {/* Retake */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              localStorage.removeItem('fullDiagnosticResults');
              router.push('/diagnostic/full');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Retake Full Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
