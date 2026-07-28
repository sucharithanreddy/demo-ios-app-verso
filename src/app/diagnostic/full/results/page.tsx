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
  RefreshCcw,
  Sparkles,
  Layers,
  Activity,
  Heart,
  Shield,
  TrendingUp,
  Brain,
  Gauge,
  Zap,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useSafeUser } from '@/lib/safe-auth';
import { MobileHeader } from '@/components/MobileHeader';
import { cn } from '@/lib/utils';
import {
  type FullDiagnosticResult,
  type Archetype,
  type DimensionCode,
  type DimensionBand,
  type SustainabilityBand,
  type WellbeingPressureLevel,
  DIMENSION_META,
  BAND_LABELS,
  SUSTAINABILITY_LABELS,
  PRESSURE_LABELS,
} from '@/lib/full-diagnostic-questions';

export const dynamic = 'force-dynamic';

const ARCHETYPE_CONFIG: Record<
  Archetype,
  { name: string; icon: typeof Target; color: string; bgColor: string; gradient: string; description: string }
> = {
  driver: {
    name: 'Driver',
    icon: Target,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    gradient: 'from-red-500 to-red-600',
    description: 'Prioritises action, momentum and visible progress.',
  },
  strategist: {
    name: 'Strategist',
    icon: Lightbulb,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    gradient: 'from-blue-500 to-blue-600',
    description: 'Prioritises clarity, structure and understanding.',
  },
  connector: {
    name: 'Connector',
    icon: Users,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    gradient: 'from-green-500 to-green-600',
    description: 'Prioritises relationships, trust and emotional harmony.',
  },
  reactor: {
    name: 'Reactor',
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    gradient: 'from-amber-500 to-amber-600',
    description: 'Experiences outcomes with noticeable emotional intensity.',
  },
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  strong_primary: 'Strong primary pattern',
  blended: 'Blended profile',
  balanced: 'Balanced profile',
  flexible: 'Flexible profile',
};

const BAND_COLOR_CLASSES: Record<DimensionBand, { bar: string; chip: string; text: string }> = {
  low:         { bar: 'bg-slate-400',   chip: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',   text: 'text-slate-500' },
  mild:        { bar: 'bg-blue-400',    chip: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',     text: 'text-blue-500' },
  moderate:    { bar: 'bg-amber-400',   chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',  text: 'text-amber-500' },
  strong:      { bar: 'bg-orange-400',  chip: 'bg-orange-500/10 text-orange-600 dark:text-orange-300', text: 'text-orange-500' },
  very_strong: { bar: 'bg-red-400',     chip: 'bg-red-500/10 text-red-600 dark:text-red-300',         text: 'text-red-500' },
};

const SUSTAINABILITY_COLOR: Record<SustainabilityBand, string> = {
  strongly_sustainable:   'text-green-500',
  generally_sustainable:  'text-emerald-500',
  mixed:                  'text-amber-500',
  several_pressure_points: 'text-orange-500',
  significant_pressure:   'text-red-500',
};

const PRESSURE_COLOR: Record<WellbeingPressureLevel, string> = {
  low:      'text-green-500',
  emerging: 'text-emerald-500',
  moderate: 'text-amber-500',
  elevated: 'text-red-500',
};

// Helper: classify a 0-100 "higher = healthier" measure into a coloured band.
function healthHue(score: number): 'good' | 'ok' | 'risk' {
  return score >= 67 ? 'good' : score >= 40 ? 'ok' : 'risk';
}

// Helper: classify a 0-100 "higher = more pressure" measure (like Emotional Labour Load).
function pressureHue(score: number): 'good' | 'ok' | 'risk' {
  return score <= 40 ? 'good' : score <= 60 ? 'ok' : 'risk';
}

const HEALTH_COLOR = {
  good: { icon: 'text-green-500', bg: 'bg-green-500/10', bar: 'bg-green-500' },
  ok:   { icon: 'text-amber-500', bg: 'bg-amber-500/10', bar: 'bg-amber-500' },
  risk: { icon: 'text-red-500',   bg: 'bg-red-500/10',   bar: 'bg-red-500' },
};

const PRESSURE_COLOR_MAP = {
  good: { icon: 'text-green-500', bg: 'bg-green-500/10', bar: 'bg-green-500' },
  ok:   { icon: 'text-amber-500', bg: 'bg-amber-500/10', bar: 'bg-amber-500' },
  risk: { icon: 'text-red-500',   bg: 'bg-red-500/10',   bar: 'bg-red-500' },
};

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
    // on submit). If absent, the user landed here directly - redirect
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
  const classificationLabel = CLASSIFICATION_LABELS[result.profileClassification] ?? 'Profile';

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Your Sales Wellbeing Map" subtitle="Full results" icon="target" />

      {/* Top nav */}
      <div className="max-w-4xl mx-auto px-4 pt-4 flex items-center justify-between">
        <Link
          href="/sales-dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Dashboard
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
            Your Sales Wellbeing Map
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A 64-question deep dive across 4 archetypes, 16 dimensions, and 12 derived wellbeing measures.
          </p>
        </motion.div>

        {/* --- Response quality notice (PDF spec §20) ------------------- */}
        {result.responseQuality.hasFlags && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
                  Your responses produced a less differentiated profile
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400/80">
                  You may find it helpful to retake the assessment when you have time to respond more instinctively.
                  {result.responseQuality.fastCompletion && ' · Completed in under 4 minutes.'}
                  {result.responseQuality.straightLining && ' · Many answers used the same option.'}
                  {result.responseQuality.excessiveNeutrality && ' · Many answers were neutral.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- Layer 1: Primary + Secondary Archetype ------------------- */}
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
            <h2 className="text-lg font-semibold text-foreground">Your Archetype Pattern</h2>
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
              <p className="text-sm text-muted-foreground mb-2">{primaryConfig.description}</p>
              <p className="text-2xl font-bold text-foreground">
                {Math.round(result.archetypeScores[result.primaryArchetype])}
                <span className="text-sm text-muted-foreground">/100</span>
              </p>
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
              <p className="text-sm text-muted-foreground mb-2">{secondaryConfig.description}</p>
              <p className="text-2xl font-bold text-foreground">
                {Math.round(result.archetypeScores[result.secondaryArchetype])}
                <span className="text-sm text-muted-foreground">/100</span>
              </p>
            </div>
          </div>

          {/* Profile classification summary */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 mb-4">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground">{result.profileSummaryText}</span>
          </div>

          {/* Classification badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-xs font-medium text-primary">{classificationLabel}</span>
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
                      <span className="text-sm text-muted-foreground">{Math.round(score)}/100</span>
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

        {/* --- Sustainability Index + Pressure Indicator (hero row) ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid md:grid-cols-2 gap-4 mb-6"
        >
          {/* Sales Wellbeing Sustainability Index */}
          <div className="glass rounded-2xl border border-border/50 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Gauge className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Sales Wellbeing Sustainability Index</p>
                <p className="text-xs text-muted-foreground">Composite of confidence, energy, recovery, boundary, tolerance and behavioural measures.</p>
              </div>
            </div>
            <div className="flex items-end justify-between mb-3">
              <p className={cn('text-4xl font-bold', SUSTAINABILITY_COLOR[result.sustainabilityBand])}>
                {result.salesWellbeingSustainabilityIndex}
                <span className="text-lg text-muted-foreground">/100</span>
              </p>
              <span className={cn('text-xs font-medium px-2 py-1 rounded-full', SUSTAINABILITY_COLOR[result.sustainabilityBand], 'bg-current/10')}>
                {SUSTAINABILITY_LABELS[result.sustainabilityBand]}
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={cn('h-full transition-all duration-500', SUSTAINABILITY_COLOR[result.sustainabilityBand].replace('text-', 'bg-'))}
                style={{ width: `${result.salesWellbeingSustainabilityIndex}%` }}
              />
            </div>
          </div>

          {/* Wellbeing Pressure Indicator */}
          <div className="glass rounded-2xl border border-border/50 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Wellbeing Pressure Indicator</p>
                <p className="text-xs text-muted-foreground">A non-clinical indicator of combined pressure within your current profile.</p>
              </div>
            </div>
            <div className="flex items-end justify-between mb-3">
              <p className={cn('text-4xl font-bold', PRESSURE_COLOR[result.wellbeingPressureIndicator])}>
                {PRESSURE_LABELS[result.wellbeingPressureIndicator]}
              </p>
              <span className={cn('text-xs px-2 py-1 rounded-full bg-current/10', PRESSURE_COLOR[result.wellbeingPressureIndicator])}>
                Current pattern
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              This is a development indicator, not a clinical assessment of mental health risk.
            </p>
          </div>
        </motion.div>

        {/* --- Layer 2: 16 Dimension Scores ---------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl border border-border/50 p-6 md:p-8 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">16 Underlying Dimensions</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Each archetype contains four underlying dimensions. Higher scores indicate a more pronounced expression of that dimension.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            {(Object.entries(result.dimensionScores) as [DimensionCode, number][]).map(([dim, score]) => {
              const meta = DIMENSION_META[dim];
              const band = result.dimensionBands[dim];
              const colors = BAND_COLOR_CLASSES[band];
              return (
                <div key={dim} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono text-muted-foreground">{dim}</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {meta.archetype}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-foreground leading-tight">{meta.label}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-foreground">{Math.round(score)}</p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-2">
                    <div
                      className={cn('h-full transition-all duration-500', colors.bar)}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className={cn('inline-block text-[10px] px-1.5 py-0.5 rounded', colors.chip)}>
                    {BAND_LABELS[band]}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* --- Layer 3: Derived Wellbeing Measures --------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl border border-border/50 p-6 md:p-8 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Derived Wellbeing Measures</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            These indicators cut across all four archetypes to surface sales-specific wellbeing patterns. Higher = healthier (except Emotional Labour Load, where higher = more effort/cost).
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            {/* Confidence Stability */}
            <DerivedMeasureCard
              icon={Shield}
              label="Confidence Stability"
              description="How stable your self-belief is under varying outcomes."
              score={result.derivedMeasures.confidenceStability}
              direction="health"
            />
            {/* Energy Sustainability */}
            <DerivedMeasureCard
              icon={Activity}
              label="Energy Sustainability"
              description="Whether your current pace is sustainable without depletion."
              score={result.derivedMeasures.energySustainability}
              direction="health"
            />
            {/* Recovery Capacity */}
            <DerivedMeasureCard
              icon={Heart}
              label="Recovery Capacity"
              description="How effectively you recover from setbacks."
              score={result.derivedMeasures.recoveryCapacity}
              direction="health"
            />
            {/* Boundary Sustainability */}
            <DerivedMeasureCard
              icon={Shield}
              label="Boundary Sustainability"
              description="How well you protect recovery, workload and personal capacity."
              score={result.derivedMeasures.boundarySustainability}
              direction="health"
            />
            {/* Tolerance of Uncertainty */}
            <DerivedMeasureCard
              icon={Brain}
              label="Tolerance of Uncertainty"
              description="Comfort acting without complete information."
              score={result.derivedMeasures.toleranceOfUncertainty}
              direction="health"
            />
            {/* Behavioural Stability */}
            <DerivedMeasureCard
              icon={Gauge}
              label="Behavioural Stability"
              description="How consistently you behave under pressure."
              score={result.derivedMeasures.behaviouralStability}
              direction="health"
            />
            {/* Setback Recovery */}
            <DerivedMeasureCard
              icon={TrendingUp}
              label="Setback Recovery"
              description="Recovery speed after difficult outcomes."
              score={result.derivedMeasures.setbackRecovery}
              direction="health"
            />
            {/* Relationship Orientation */}
            <DerivedMeasureCard
              icon={Users}
              label="Relationship Orientation"
              description="How strongly relationships shape your decisions."
              score={result.derivedMeasures.relationshipOrientation}
              direction="health"
              invertMeaning={true}
            />
            {/* Ability to Switch Off */}
            <DerivedMeasureCard
              icon={Moon}
              label="Ability to Switch Off"
              description="How well you disconnect from work outside hours."
              score={result.derivedMeasures.abilityToSwitchOff}
              direction="health"
            />
            {/* Emotional Labour Load (higher = more cost) */}
            <DerivedMeasureCard
              icon={Heart}
              label="Emotional Labour Load"
              description="Personal cost of managing others' emotions."
              score={result.derivedMeasures.emotionalLabourLoad}
              direction="pressure"
            />
            {/* Need for Certainty (higher = more rigid) */}
            <DerivedMeasureCard
              icon={Brain}
              label="Need for Certainty"
              description="How much certainty you need before acting."
              score={result.derivedMeasures.needForCertainty}
              direction="pressure"
            />
          </div>
        </motion.div>

        {/* --- Response to Pressure (4 sub-scores) -------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl border border-border/50 p-6 md:p-8 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Response to Pressure</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Under pressure, different patterns drive your response. These four scores show the relative strength of each.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <PressureSubCard label="Action response" description="Increase pace and personal effort" score={result.derivedMeasures.responseToPressure.action} />
            <PressureSubCard label="Analysis response" description="Seek clarity through analysis" score={result.derivedMeasures.responseToPressure.analysis} />
            <PressureSubCard label="Connection response" description="Turn to others for support" score={result.derivedMeasures.responseToPressure.connection} />
            <PressureSubCard label="Emotional response" description="Process emotionally" score={result.derivedMeasures.responseToPressure.emotional} />
          </div>
        </motion.div>

        {/* --- Decision Style (4 sub-scores) -------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl border border-border/50 p-6 md:p-8 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Decision Style</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            How you tend to make decisions. The strongest style is your primary tendency - but all four contribute.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <PressureSubCard label="Fast / instinctive" description="Act quickly on instinct" score={result.derivedMeasures.decisionStyle.fast} />
            <PressureSubCard label="Analytical / considered" description="Analyse and consider before acting" score={result.derivedMeasures.decisionStyle.analytical} />
            <PressureSubCard label="Collaborative" description="Decide with others" score={result.derivedMeasures.decisionStyle.collaborative} />
            <PressureSubCard label="Emotionally influenced" description="Decisions shaped by emotional investment" score={result.derivedMeasures.decisionStyle.emotionallyInfluenced} />
          </div>
        </motion.div>

        {/* --- What happens next --------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass rounded-2xl border border-border/50 p-6 md:p-8 mb-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Your AI Companion now knows your pattern</h2>
              <p className="text-sm text-muted-foreground">
                Your full profile has been saved. When you use the Reflect AI tool, your responses will be personalised based on how YOUR pattern tends to experience sales pressure - not generic advice.
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DerivedMeasureCard({
  icon: Icon,
  label,
  description,
  score,
  direction,
  invertMeaning = false,
}: {
  icon: typeof Shield;
  label: string;
  description: string;
  score: number;
  direction: 'health' | 'pressure';
  invertMeaning?: boolean;
}) {
  // For 'health' direction: higher = healthier.
  // For 'pressure' direction: higher = more pressure/cost.
  // invertMeaning flips the rendering interpretation (e.g. Relationship
  // Orientation is presented as a strength even though it's not strictly
  // "health" - we just don't flag it as a risk at high values).
  const safeScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const hue = direction === 'pressure' ? pressureHue(safeScore) : healthHue(safeScore);
  const colors = direction === 'pressure' ? PRESSURE_COLOR_MAP[hue] : HEALTH_COLOR[hue];

  return (
    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', colors.bg)}>
          <Icon className={cn('w-4 h-4', colors.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="text-sm font-bold text-foreground">{safeScore}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-tight">{description}</p>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500', colors.bar)}
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}

function PressureSubCard({
  label,
  description,
  score,
}: {
  label: string;
  description: string;
  score: number;
}) {
  const safeScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  // For pressure/decision sub-scores, higher = more pronounced pattern
  // (not necessarily good or bad). Use a neutral→warm gradient.
  const hue: 'low' | 'mid' | 'high' = safeScore >= 67 ? 'high' : safeScore >= 33 ? 'mid' : 'low';
  const colorClass =
    hue === 'high' ? 'bg-orange-500'
    : hue === 'mid' ? 'bg-amber-500'
    : 'bg-slate-400';

  return (
    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-bold text-foreground">{safeScore}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2 leading-tight">{description}</p>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500', colorClass)}
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}
