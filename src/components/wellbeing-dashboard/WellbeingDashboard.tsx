'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Brain,
  Heart,
  Zap,
  Shield,
  Activity,
  TrendingUp,
  Moon,
  Users,
  Gauge,
  Layers,
  Sparkles,
  ChevronDown,
  Info,
  AlertCircle,
  RefreshCcw,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CircularGauge } from './CircularGauge';
import { RadarChart, type RadarAxis } from './RadarChart';

// ---------------------------------------------------------------------------
// Types - mirror FullDiagnosticResult from src/lib/full-diagnostic-questions.ts
// ---------------------------------------------------------------------------
type ArchetypeKey = 'driver' | 'strategist' | 'connector' | 'reactor';
type DimensionCodeKey =
  | 'D1' | 'D2' | 'D3' | 'D4'
  | 'S1' | 'S2' | 'S3' | 'S4'
  | 'C1' | 'C2' | 'C3' | 'C4'
  | 'R1' | 'R2' | 'R3' | 'R4';
type DimensionBandKey = 'low' | 'mild' | 'moderate' | 'strong' | 'very_strong';
type SustainabilityBandKey =
  | 'strongly_sustainable'
  | 'generally_sustainable'
  | 'mixed'
  | 'several_pressure_points'
  | 'significant_pressure';
type WellbeingPressureLevelKey = 'low' | 'emerging' | 'moderate' | 'elevated';
type ProfileClassificationKey = 'strong_primary' | 'blended' | 'balanced' | 'flexible';

export interface WellbeingDashboardResult {
  archetypeScores: Record<ArchetypeKey, number>;
  primaryArchetype: ArchetypeKey;
  secondaryArchetype: ArchetypeKey;
  profileClassification: ProfileClassificationKey;
  profileSummaryText: string;
  dimensionScores: Record<DimensionCodeKey, number>;
  dimensionBands: Record<DimensionCodeKey, DimensionBandKey>;
  derivedMeasures: {
    confidenceStability: number;
    energySustainability: number;
    recoveryCapacity: number;
    boundarySustainability: number;
    toleranceOfUncertainty: number;
    behaviouralStability: number;
    setbackRecovery: number;
    relationshipOrientation: number;
    emotionalLabourLoad: number;
    abilityToSwitchOff: number;
    needForCertainty: number;
    responseToPressure: { action: number; analysis: number; connection: number; emotional: number };
    decisionStyle: { fast: number; analytical: number; collaborative: number; emotionallyInfluenced: number };
  };
  salesWellbeingSustainabilityIndex: number;
  sustainabilityBand: SustainabilityBandKey;
  wellbeingPressureIndicator: WellbeingPressureLevelKey;
  responseQuality?: { hasFlags?: boolean; fastCompletion?: boolean; straightLining?: boolean; excessiveNeutrality?: boolean };
  completedAt?: string;
}

// ---------------------------------------------------------------------------
// Archetype config - colors, icons, descriptions, narrative summaries
// ---------------------------------------------------------------------------
interface ArchetypeConfig {
  key: ArchetypeKey;
  name: string;
  icon: LucideIcon;
  color: string;       // primary hex
  colorSoft: string;   // bg tint
  gradient: string;    // tailwind gradient classes
  tagline: string;
  summary: string;
  strengths: string[];
  watchouts: string[];
  reflection: string;
}

const ARCHETYPES: Record<ArchetypeKey, ArchetypeConfig> = {
  driver: {
    key: 'driver',
    name: 'Driver',
    icon: Target,
    color: '#ef4444', // red-500
    colorSoft: 'rgba(239, 68, 68, 0.12)',
    gradient: 'from-red-500 via-rose-500 to-orange-500',
    tagline: 'Action, momentum, achievement',
    summary:
      'You are energised by progress, challenge and achieving results. Pressure often motivates you, but prolonged intensity may make switching off and recovering more difficult.',
    strengths: [
      'Strong drive to move things forward',
      'Creates momentum quickly under pressure',
      'Resilient in fast-paced environments',
      'Takes ownership and accountability',
    ],
    watchouts: [
      'Difficulty switching off outside work',
      'Risk of sustained fatigue over time',
      'Impatience with slower progress',
      'Tendency to prioritise output over recovery',
    ],
    reflection: 'What would happen if you paused before pushing forward? What might you notice?',
  },
  strategist: {
    key: 'strategist',
    name: 'Strategist',
    icon: Brain,
    color: '#3b82f6', // blue-500
    colorSoft: 'rgba(59, 130, 246, 0.12)',
    gradient: 'from-blue-500 via-sky-500 to-cyan-500',
    tagline: 'Clarity, planning, analysis',
    summary:
      'You respond to challenge by stepping back and seeking clarity. You analyse, reassess and aim to understand before acting - bringing strong judgement, but risking over-analysis when uncertainty lingers.',
    strengths: [
      'Thoughtful, considered decision-making',
      'Strong planning and problem-solving',
      'Identifies patterns in complexity',
      'Maintains perspective in uncertainty',
    ],
    watchouts: [
      'Overthinking or mental looping',
      'Reduced confidence without clarity',
      'Hesitation when speed matters',
      'Mental fatigue from sustained load',
    ],
    reflection: 'What would it feel like to trust your instincts without having all the answers?',
  },
  connector: {
    key: 'connector',
    name: 'Connector',
    icon: Heart,
    color: '#10b981', // emerald-500
    colorSoft: 'rgba(16, 185, 129, 0.12)',
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    tagline: 'Relationships, trust, communication',
    summary:
      'You respond by focusing on people. You prioritise communication, trust and collaboration - a relational strength, though sustained emotional engagement can lead to fatigue or boundary pressure.',
    strengths: [
      'Strong emotional intelligence',
      'Builds trust and lasting relationships',
      'Collaborative under pressure',
      'Lifts team morale and cohesion',
    ],
    watchouts: [
      'Absorbing others\u2019 emotional stress',
      'Difficulty holding boundaries',
      'Avoiding difficult conversations',
      'Emotional fatigue over time',
    ],
    reflection: 'What would change if you prioritised your own needs alongside others?',
  },
  reactor: {
    key: 'reactor',
    name: 'Reactor',
    icon: Zap,
    color: '#f59e0b', // amber-500
    colorSoft: 'rgba(245, 158, 11, 0.12)',
    gradient: 'from-amber-500 via-yellow-500 to-orange-500',
    tagline: 'Emotional sensitivity to outcomes',
    summary:
      'You experience the emotional impact of sales more strongly. Your confidence and energy can fluctuate with wins and setbacks - bringing passion and accountability, but needing active stabilisation strategies.',
    strengths: [
      'Strong accountability and care',
      'High engagement with outcomes',
      'Responsive to changing situations',
      'Energetic in performance settings',
    ],
    watchouts: [
      'Confidence and focus fluctuations',
      'Losing perspective during setbacks',
      'Emotional exhaustion over time',
      'Reactive patterns affecting consistency',
    ],
    reflection: 'What small ritual could help you stabilise when things feel uncertain?',
  },
};

// ---------------------------------------------------------------------------
// Dimension metadata - labels + which archetype each belongs to
// ---------------------------------------------------------------------------
const DIMENSION_META: Record<DimensionCodeKey, { label: string; archetype: ArchetypeKey }> = {
  D1: { label: 'Action and urgency', archetype: 'driver' },
  D2: { label: 'Momentum and achievement', archetype: 'driver' },
  D3: { label: 'Intensification under pressure', archetype: 'driver' },
  D4: { label: 'Boundaries and recovery', archetype: 'driver' },
  S1: { label: 'Need for clarity', archetype: 'strategist' },
  S2: { label: 'Analysis and mental processing', archetype: 'strategist' },
  S3: { label: 'Planning and control', archetype: 'strategist' },
  S4: { label: 'Standards, risk and completion', archetype: 'strategist' },
  C1: { label: 'External processing & support', archetype: 'connector' },
  C2: { label: 'Relationship priority', archetype: 'connector' },
  C3: { label: 'Emotional attunement & labour', archetype: 'connector' },
  C4: { label: 'Harmony & personal boundaries', archetype: 'connector' },
  R1: { label: 'Confidence volatility', archetype: 'reactor' },
  R2: { label: 'Emotional sensitivity to outcomes', archetype: 'reactor' },
  R3: { label: 'Recovery and rumination', archetype: 'reactor' },
  R4: { label: 'Behavioural reactivity', archetype: 'reactor' },
};

const DIMENSION_BAND_LABELS: Record<DimensionBandKey, string> = {
  low: 'Low',
  mild: 'Mild',
  moderate: 'Moderate',
  strong: 'Strong',
  very_strong: 'Very strong',
};

const SUSTAINABILITY_BAND_META: Record<
  SustainabilityBandKey,
  { label: string; color: string; description: string }
> = {
  strongly_sustainable: {
    label: 'Strongly sustainable',
    color: '#10b981',
    description: 'Your current pattern is highly sustainable across confidence, energy, recovery and boundaries.',
  },
  generally_sustainable: {
    label: 'Generally sustainable',
    color: '#22c55e',
    description: 'Your pattern is broadly sustainable, with a few areas worth keeping an eye on.',
  },
  mixed: {
    label: 'Mixed sustainability',
    color: '#f59e0b',
    description: 'Your pattern shows a mix of sustainable and pressure-prone areas - small adjustments would help.',
  },
  several_pressure_points: {
    label: 'Several pressure points',
    color: '#f97316',
    description: 'Multiple areas are showing pressure. Targeted recovery or boundary work would benefit you.',
  },
  significant_pressure: {
    label: 'Significant pressure pattern',
    color: '#ef4444',
    description: 'Your current pattern carries significant pressure across several measures - recovery and support are recommended.',
  },
};

const PRESSURE_META: Record<WellbeingPressureLevelKey, { label: string; color: string }> = {
  low:      { label: 'Low',      color: '#10b981' },
  emerging: { label: 'Emerging', color: '#22c55e' },
  moderate: { label: 'Moderate', color: '#f59e0b' },
  elevated: { label: 'Elevated', color: '#ef4444' },
};

const CLASSIFICATION_LABELS: Record<ProfileClassificationKey, string> = {
  strong_primary: 'Strong primary pattern',
  blended: 'Blended profile',
  balanced: 'Balanced profile',
  flexible: 'Flexible profile',
};

// ---------------------------------------------------------------------------
// Helper - band a 0..100 "higher = healthier" score into a color + label
// ---------------------------------------------------------------------------
function healthBand(score: number): { color: string; label: string; tone: 'good' | 'ok' | 'watch' | 'risk' } {
  const s = Math.max(0, Math.min(100, score));
  if (s >= 75) return { color: '#10b981', label: 'Strong',  tone: 'good' };
  if (s >= 60) return { color: '#22c55e', label: 'Healthy', tone: 'good' };
  if (s >= 45) return { color: '#f59e0b', label: 'Mixed',   tone: 'ok'   };
  if (s >= 25) return { color: '#f97316', label: 'Watch',   tone: 'watch'};
  return         { color: '#ef4444', label: 'Attn.',    tone: 'risk' };
}

function pressureBand(score: number): { color: string; label: string } {
  const s = Math.max(0, Math.min(100, score));
  if (s <= 40) return { color: '#10b981', label: 'Low load'    };
  if (s <= 60) return { color: '#f59e0b', label: 'Moderate'    };
  return         { color: '#ef4444', label: 'High load'    };
}

// ---------------------------------------------------------------------------
// Narrative generators (PDF spec §10)
// ---------------------------------------------------------------------------
function pressureNarrative(p: { action: number; analysis: number; connection: number; emotional: number }): string {
  const entries = [
    { name: 'action',     label: 'increase action and personal effort',   v: p.action     },
    { name: 'analysis',   label: 'seek clarity through analysis',         v: p.analysis   },
    { name: 'connection', label: 'turn to others for support',            v: p.connection },
    { name: 'emotional',  label: 'process the situation emotionally',     v: p.emotional  },
  ].sort((a, b) => b.v - a.v);
  const [first, second] = entries;
  return `Under pressure, your strongest instinct is to ${first.label}. Your secondary response is to ${second.label}.`;
}

function decisionStyleNarrative(d: { fast: number; analytical: number; collaborative: number; emotionallyInfluenced: number }): string {
  const entries = [
    { label: 'fast or instinctive',       v: d.fast                },
    { label: 'analytical or considered',  v: d.analytical          },
    { label: 'collaborative',             v: d.collaborative       },
    { label: 'emotionally influenced',    v: d.emotionallyInfluenced },
  ].sort((a, b) => b.v - a.v);
  return `Your primary decision tendency is ${entries[0].label}. Your secondary tendency is ${entries[1].label}.`;
}

// ===========================================================================
// MAIN DASHBOARD COMPONENT
// ===========================================================================
export interface WellbeingDashboardProps {
  result: WellbeingDashboardResult;
  onRetake?: () => void;
  onViewFullResults?: () => void;
}

export function WellbeingDashboard({ result, onRetake, onViewFullResults }: WellbeingDashboardProps) {
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeKey>(result.primaryArchetype);
  const [activeTab, setActiveTab] = useState<'overview' | 'dimensions' | 'pressure' | 'decision'>('overview');

  // Sort archetypes by score for ranking display
  const rankedArchetypes = useMemo(() => {
    return (Object.entries(result.archetypeScores) as [ArchetypeKey, number][])
      .map(([key, score]) => ({ ...ARCHETYPES[key], score }))
      .sort((a, b) => b.score - a.score);
  }, [result.archetypeScores]);

  const primary = ARCHETYPES[result.primaryArchetype];
  const sustainabilityMeta = SUSTAINABILITY_BAND_META[result.sustainabilityBand];
  const pressureMeta = PRESSURE_META[result.wellbeingPressureIndicator];

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────
          1. RESPONSE QUALITY NOTICE (if flagged)
          ─────────────────────────────────────────────────────────── */}
      {result.responseQuality?.hasFlags && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/30"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-300">
              <p className="font-medium mb-1">A note on your responses</p>
              <p className="text-xs">
                Your responses produced a less differentiated profile. You may find it helpful to retake the assessment
                when you have time to respond more instinctively.
                {result.responseQuality.fastCompletion && ' · Completed quickly.'}
                {result.responseQuality.straightLining && ' · Many answers used the same option.'}
                {result.responseQuality.excessiveNeutrality && ' · Many neutral answers.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ───────────────────────────────────────────────────────────
          2. ARCHETYPE HERO - primary archetype with circular gauge
          ─────────────────────────────────────────────────────────── */}
      <ArchetypeHero
        result={result}
        rankedArchetypes={rankedArchetypes}
        selectedArchetype={selectedArchetype}
        onSelectArchetype={setSelectedArchetype}
      />

      {/* ───────────────────────────────────────────────────────────
          3. SUSTAINABILITY INDEX HERO - the composite gauge
          ─────────────────────────────────────────────────────────── */}
      <SustainabilityHero result={result} />

      {/* ───────────────────────────────────────────────────────────
          4. TAB BAR - Overview / Dimensions / Pressure / Decision
          ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-[64px] z-20 -mx-1 px-1 py-2 backdrop-blur-md">
        <div className="glass rounded-2xl border border-border/50 p-1.5 flex gap-1 overflow-x-auto">
          {([
            { id: 'overview' as const,   label: 'Overview',                icon: Sparkles },
            { id: 'dimensions' as const, label: '16 Dimensions',           icon: Layers   },
            { id: 'pressure' as const,   label: 'Response to Pressure',    icon: Zap      },
            { id: 'decision' as const,   label: 'Decision Style',          icon: Brain    },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                activeTab === id
                  ? 'bg-primary text-primary-foreground shadow-premium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          5. TAB CONTENT
          ─────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'overview'   && <OverviewTab    result={result} />}
          {activeTab === 'dimensions' && <DimensionsTab  result={result} />}
          {activeTab === 'pressure'   && <PressureTab    result={result} />}
          {activeTab === 'decision'   && <DecisionTab    result={result} />}
        </motion.div>
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────
          6. ACTION FOOTER
          ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        {onViewFullResults && (
          <button
            onClick={onViewFullResults}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-premium"
          >
            <BookOpen className="w-4 h-4" />
            View Full Results Page
          </button>
        )}
        {onRetake && (
          <button
            onClick={onRetake}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/50 text-foreground hover:bg-secondary/50 text-sm font-medium transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Retake Assessment
          </button>
        )}
      </div>

      {result.completedAt && (
        <p className="text-center text-xs text-muted-foreground pt-1">
          Assessment completed on {new Date(result.completedAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}

// ===========================================================================
// SUB-COMPONENT: ARCHETYPE HERO
// ===========================================================================
function ArchetypeHero({
  result,
  rankedArchetypes,
  selectedArchetype,
  onSelectArchetype,
}: {
  result: WellbeingDashboardResult;
  rankedArchetypes: Array<ArchetypeConfig & { score: number }>;
  selectedArchetype: ArchetypeKey;
  onSelectArchetype: (k: ArchetypeKey) => void;
}) {
  const selected = ARCHETYPES[selectedArchetype];
  const SelectedIcon = selected.icon;
  const isSelectedPrimary = selectedArchetype === result.primaryArchetype;
  const score = result.archetypeScores[selectedArchetype];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-border/50 shadow-premium"
    >
      {/* Gradient background - uses selected archetype's color */}
      <div
        className={cn('absolute inset-0 bg-gradient-to-br opacity-15', selected.gradient)}
      />
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-25"
        style={{ background: selected.color }}
      />

      <div className="relative p-6 md:p-8">
        {/* Header row: badge + classification */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm border border-border/40">
            <Sparkles className="w-3.5 h-3.5" style={{ color: selected.color }} />
            <span className="text-xs font-medium text-foreground">
              {isSelectedPrimary ? 'Your Primary Pattern' : 'Archetype Profile'}
            </span>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-background/60 backdrop-blur-sm border border-border/40 text-muted-foreground">
            {CLASSIFICATION_LABELS[result.profileClassification]}
          </span>
        </div>

        {/* Hero: circular gauge + narrative */}
        <div className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-center">
          {/* Big circular gauge */}
          <div className="flex justify-center md:justify-start">
            <CircularGauge
              value={score}
              size={180}
              stroke={14}
              color={selected.color}
              label={selected.name}
              sublabel={selected.tagline}
              delay={0.2}
              glow
              icon={
                <div
                  className="rounded-2xl flex items-center justify-center"
                  style={{
                    width: 44, height: 44,
                    background: selected.color,
                    color: 'white',
                  }}
                >
                  <SelectedIcon className="w-6 h-6" />
                </div>
              }
            />
          </div>

          {/* Narrative */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedArchetype}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {selected.name} <span style={{ color: selected.color }}>- {Math.round(score)}%</span>
                </h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  {selected.summary}
                </p>

                {/* Strengths + Watchouts in two compact columns */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl p-3 bg-background/40 border border-border/40">
                    <p className="text-xs font-semibold text-emerald-500 mb-1.5 uppercase tracking-wider">Strengths</p>
                    <ul className="space-y-1">
                      {selected.strengths.slice(0, 2).map((s, i) => (
                        <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5">·</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl p-3 bg-background/40 border border-border/40">
                    <p className="text-xs font-semibold text-amber-500 mb-1.5 uppercase tracking-wider">Watch-outs</p>
                    <ul className="space-y-1">
                      {selected.watchouts.slice(0, 2).map((s, i) => (
                        <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                          <span className="text-amber-500 mt-0.5">·</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Ranked archetypes - clickable mini-gauges */}
        <div className="mt-8 pt-6 border-t border-border/40">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            All 4 Patterns - Tap to explore
          </p>
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {rankedArchetypes.map((a, idx) => {
              const Icon = a.icon;
              const isSelected = a.key === selectedArchetype;
              const isPrimary = a.key === result.primaryArchetype;
              return (
                <motion.button
                  key={a.key}
                  onClick={() => onSelectArchetype(a.key)}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'relative rounded-2xl p-3 md:p-4 border transition-all text-center',
                    isSelected
                      ? 'border-2 shadow-premium'
                      : 'border-border/40 hover:border-border/80 bg-background/40'
                  )}
                  style={isSelected ? { borderColor: a.color, background: a.colorSoft } : undefined}
                >
                  {/* Rank badge */}
                  <div className="absolute top-1.5 right-1.5 text-[9px] font-bold text-muted-foreground">
                    #{idx + 1}
                  </div>
                  {/* Primary badge */}
                  {isPrimary && (
                    <div
                      className="absolute top-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: a.color }}
                    >
                      PRIMARY
                    </div>
                  )}
                  {/* Mini gauge */}
                  <div className="flex justify-center mb-2">
                    <CircularGauge
                      value={a.score}
                      size={70}
                      stroke={7}
                      color={a.color}
                      delay={0.3 + idx * 0.1}
                      label=""
                      showValue
                      icon={
                        <div
                          className="rounded-lg flex items-center justify-center"
                          style={{ width: 18, height: 18, background: a.color }}
                        >
                          <Icon className="w-2.5 h-2.5 text-white" />
                        </div>
                      }
                    />
                  </div>
                  <p
                    className="text-xs font-semibold leading-tight"
                    style={{ color: isSelected ? a.color : undefined }}
                  >
                    {a.name}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===========================================================================
// SUB-COMPONENT: SUSTAINABILITY HERO
// ===========================================================================
function SustainabilityHero({ result }: { result: WellbeingDashboardResult }) {
  const meta = SUSTAINABILITY_BAND_META[result.sustainabilityBand];
  const idx = result.salesWellbeingSustainabilityIndex;

  // The 6 contributing measures with their weights (PDF spec §9.3)
  const contributors = [
    { label: 'Confidence Stability',  weight: 0.20, value: result.derivedMeasures.confidenceStability,  icon: Shield    },
    { label: 'Energy Sustainability', weight: 0.20, value: result.derivedMeasures.energySustainability, icon: Activity  },
    { label: 'Recovery Capacity',     weight: 0.20, value: result.derivedMeasures.recoveryCapacity,     icon: Heart     },
    { label: 'Boundary Sustainability', weight: 0.15, value: result.derivedMeasures.boundarySustainability, icon: Shield  },
    { label: 'Tolerance of Uncertainty', weight: 0.10, value: result.derivedMeasures.toleranceOfUncertainty, icon: TrendingUp },
    { label: 'Behavioural Stability', weight: 0.15, value: result.derivedMeasures.behaviouralStability, icon: Gauge    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="relative overflow-hidden rounded-3xl border border-border/50 shadow-premium glass"
    >
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: meta.color + '22', color: meta.color }}
          >
            <Gauge className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">Sales Wellbeing Sustainability Index</h3>
            <p className="text-xs text-muted-foreground">
              Composite of confidence, energy, recovery, boundaries, tolerance and behavioural stability.
              This is not a clinical mental-health score - it reflects how sustainable your current pattern is.
            </p>
          </div>
        </div>

        {/* Big gauge + band label */}
        <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">
          <div className="flex justify-center">
            <CircularGauge
              value={idx}
              size={200}
              stroke={16}
              color={meta.color}
              label={meta.label}
              sublabel="Sustainability"
              delay={0.3}
              glow
              valueSuffix="/100"
              icon={
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 36, height: 36, background: meta.color, color: 'white' }}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
              }
            />
          </div>

          <div>
            <p className="text-sm text-foreground/80 leading-relaxed mb-4">
              {meta.description}
            </p>

            {/* Band scale visualization */}
            <div className="space-y-1.5">
              {([
                { range: '80-100', label: 'Strongly sustainable',  color: '#10b981', active: result.sustainabilityBand === 'strongly_sustainable' },
                { range: '65-79',  label: 'Generally sustainable', color: '#22c55e', active: result.sustainabilityBand === 'generally_sustainable' },
                { range: '50-64',  label: 'Mixed sustainability',  color: '#f59e0b', active: result.sustainabilityBand === 'mixed' },
                { range: '35-49',  label: 'Several pressure points', color: '#f97316', active: result.sustainabilityBand === 'several_pressure_points' },
                { range: '0-34',   label: 'Significant pressure',  color: '#ef4444', active: result.sustainabilityBand === 'significant_pressure' },
              ]).map(band => (
                <div
                  key={band.range}
                  className={cn(
                    'flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all',
                    band.active
                      ? 'border-current bg-current/10'
                      : 'border-border/40 opacity-50'
                  )}
                  style={band.active ? { color: band.color } : undefined}
                >
                  <span className="text-xs font-mono font-semibold w-14">{band.range}</span>
                  <span className="text-xs font-medium">{band.label}</span>
                  {band.active && (
                    <motion.span
                      layoutId="sustain-band-marker"
                      className="ml-auto text-xs"
                    >
                      ● you
                    </motion.span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6 contributing measures with weights */}
        <div className="mt-6 pt-6 border-t border-border/40">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            6 Contributing Measures (weighted)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {contributors.map((c, i) => {
              const Icon = c.icon;
              const band = healthBand(c.value);
              return (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="rounded-xl p-3 bg-secondary/30 border border-border/40"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: band.color + '22', color: band.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{c.label}</p>
                      <p className="text-[10px] text-muted-foreground">Weight: {Math.round(c.weight * 100)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: band.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${c.value}%` }}
                        transition={{ duration: 0.9, delay: 0.5 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className="text-xs font-bold" style={{ color: band.color }}>
                      {Math.round(c.value)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===========================================================================
// TAB: OVERVIEW - 12 derived measures in a colorful grid
// ===========================================================================
function OverviewTab({ result }: { result: WellbeingDashboardResult }) {
  const measures = [
    { key: 'confidenceStability',     label: 'Confidence Stability',    desc: 'How stable your self-belief is when results change.',         value: result.derivedMeasures.confidenceStability,     icon: Shield,      direction: 'health' as const },
    { key: 'energySustainability',    label: 'Energy Sustainability',   desc: 'Whether your pace is sustainable without depletion.',         value: result.derivedMeasures.energySustainability,    icon: Activity,    direction: 'health' as const },
    { key: 'recoveryCapacity',        label: 'Recovery Capacity',       desc: 'How effectively you recover from setbacks.',                  value: result.derivedMeasures.recoveryCapacity,        icon: Heart,       direction: 'health' as const },
    { key: 'boundarySustainability',  label: 'Boundary Sustainability', desc: 'How well you protect recovery, workload and capacity.',       value: result.derivedMeasures.boundarySustainability,  icon: Shield,      direction: 'health' as const },
    { key: 'toleranceOfUncertainty',  label: 'Tolerance of Uncertainty',desc: 'Comfort acting without complete information.',                value: result.derivedMeasures.toleranceOfUncertainty,  icon: TrendingUp,  direction: 'health' as const },
    { key: 'behaviouralStability',    label: 'Behavioural Stability',   desc: 'How consistently you behave under pressure.',                 value: result.derivedMeasures.behaviouralStability,    icon: Gauge,       direction: 'health' as const },
    { key: 'setbackRecovery',         label: 'Setback Recovery',        desc: 'Speed of recovery after difficult outcomes.',                 value: result.derivedMeasures.setbackRecovery,         icon: TrendingUp,  direction: 'health' as const },
    { key: 'abilityToSwitchOff',      label: 'Ability to Switch Off',   desc: 'How well you disconnect from work outside hours.',            value: result.derivedMeasures.abilityToSwitchOff,      icon: Moon,        direction: 'health' as const },
    { key: 'relationshipOrientation', label: 'Relationship Orientation',desc: 'How strongly relationships shape your decisions.',            value: result.derivedMeasures.relationshipOrientation, icon: Users,       direction: 'health' as const },
    { key: 'emotionalLabourLoad',     label: 'Emotional Labour Load',   desc: 'Personal cost of managing others\u2019 emotions.',            value: result.derivedMeasures.emotionalLabourLoad,     icon: Heart,       direction: 'pressure' as const },
    { key: 'needForCertainty',        label: 'Need for Certainty',      desc: 'How much certainty you require before acting.',               value: result.derivedMeasures.needForCertainty,        icon: Brain,       direction: 'pressure' as const },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {measures.map((m, idx) => {
          const Icon = m.icon;
          const band = m.direction === 'pressure' ? pressureBand(m.value) : healthBand(m.value);
          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative overflow-hidden rounded-2xl border border-border/50 p-5 glass"
            >
              {/* Subtle color wash */}
              <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-20"
                style={{ background: band.color }}
              />
              <div className="relative flex items-start gap-4">
                {/* Mini circular gauge */}
                <CircularGauge
                  value={m.value}
                  size={68}
                  stroke={6}
                  color={band.color}
                  delay={idx * 0.05}
                  showValue
                />
                {/* Label + description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: band.color }} />
                    <p className="text-sm font-semibold text-foreground leading-tight">{m.label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight mb-2">{m.desc}</p>
                  <span
                    className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: band.color + '22', color: band.color }}
                  >
                    {band.label}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pressure Indicator callout */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-border/50 p-5 glass flex items-center gap-4"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: PRESSURE_META[result.wellbeingPressureIndicator].color + '22', color: PRESSURE_META[result.wellbeingPressureIndicator].color }}
        >
          <Activity className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Wellbeing Pressure Indicator</p>
          <p className="text-lg font-bold" style={{ color: PRESSURE_META[result.wellbeingPressureIndicator].color }}>
            {PRESSURE_META[result.wellbeingPressureIndicator].label}
          </p>
          <p className="text-xs text-muted-foreground">A non-clinical development indicator of combined pressure within your current pattern.</p>
        </div>
      </motion.div>
    </div>
  );
}

// ===========================================================================
// TAB: DIMENSIONS - all 16 dimensions grouped by archetype
// ===========================================================================
function DimensionsTab({ result }: { result: WellbeingDashboardResult }) {
  const archetypes: ArchetypeKey[] = ['driver', 'strategist', 'connector', 'reactor'];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Each archetype contains four underlying dimensions. Higher scores indicate a more pronounced expression of that dimension.
      </p>

      {archetypes.map((archKey, idx) => {
        const archConfig = ARCHETYPES[archKey];
        const dims = (Object.keys(DIMENSION_META) as DimensionCodeKey[]).filter(
          d => DIMENSION_META[d].archetype === archKey,
        );
        const ArchIcon = archConfig.icon;
        return (
          <motion.div
            key={archKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-2xl border border-border/50 p-5 glass"
          >
            {/* Archetype header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: archConfig.color, color: 'white' }}
              >
                <ArchIcon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{archConfig.name}</p>
                <p className="text-xs text-muted-foreground">{archConfig.tagline}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Archetype score</p>
                <p className="text-lg font-bold" style={{ color: archConfig.color }}>
                  {Math.round(result.archetypeScores[archKey])}
                </p>
              </div>
            </div>

            {/* 4 dimensions in a grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dims.map(dim => {
                const score = result.dimensionScores[dim] ?? 0;
                const band = result.dimensionBands?.[dim];
                const meta = DIMENSION_META[dim];
                const hue = healthBand(score);
                return (
                  <div
                    key={dim}
                    className="rounded-xl p-3 bg-secondary/30 border border-border/40 flex items-center gap-3"
                  >
                    {/* Mini gauge */}
                    <CircularGauge
                      value={score}
                      size={56}
                      stroke={5}
                      color={archConfig.color}
                      delay={0.2}
                      showValue
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono text-muted-foreground">{dim}</span>
                        {band && (
                          <span
                            className="text-[9px] px-1.5 py-0 rounded-full font-medium"
                            style={{ background: hue.color + '22', color: hue.color }}
                          >
                            {DIMENSION_BAND_LABELS[band]}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-foreground leading-tight">{meta.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ===========================================================================
// TAB: PRESSURE - Response to Pressure radar + narrative
// ===========================================================================
function PressureTab({ result }: { result: WellbeingDashboardResult }) {
  const rp = result.derivedMeasures.responseToPressure;
  const narrative = pressureNarrative(rp);

  const axes: RadarAxis[] = [
    { label: 'Action',     value: rp.action,     color: '#ef4444', description: 'Increase pace and personal effort' },
    { label: 'Analysis',   value: rp.analysis,   color: '#3b82f6', description: 'Seek clarity through analysis' },
    { label: 'Connection', value: rp.connection, color: '#10b981', description: 'Turn to others for support' },
    { label: 'Emotional',  value: rp.emotional,  color: '#f59e0b', description: 'Process emotionally' },
  ];

  // Also surface setback recovery + sensitivity
  const setbackRecovery = result.derivedMeasures.setbackRecovery;
  const setbackSensitivity = 100 - setbackRecovery; // mean of R1, R2, R3

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-border/50 p-5 glass">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Response to Pressure</h3>
            <p className="text-xs text-muted-foreground">
              Your pattern isn&apos;t a single response - it&apos;s a combination of four. All four contribute.
            </p>
          </div>
        </div>

        {/* Narrative */}
        <div className="rounded-xl p-4 bg-primary/5 border border-primary/20 mb-5">
          <p className="text-sm text-foreground italic leading-relaxed">
            &ldquo;{narrative}&rdquo;
          </p>
        </div>

        {/* Radar + 4 axis legend */}
        <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">
          <div className="flex justify-center">
            <RadarChart axes={axes} size={280} delay={0.2} />
          </div>
          <div className="space-y-2.5">
            {axes.map(axis => {
              const band = healthBand(axis.value);
              return (
                <div key={axis.label} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: axis.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{axis.label} response</p>
                      <p className="text-sm font-bold" style={{ color: axis.color }}>{Math.round(axis.value)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{axis.description}</p>
                    <div className="h-1 rounded-full bg-secondary mt-1 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: axis.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${axis.value}%` }}
                        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Setback Recovery + Sensitivity row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Setback Recovery (positive) */}
        <div className="rounded-2xl border border-border/50 p-5 glass flex items-center gap-4">
          <CircularGauge
            value={setbackRecovery}
            size={90}
            stroke={8}
            color="#10b981"
            label="Recovery"
            delay={0.3}
          />
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Setback Recovery</p>
            <p className="text-sm text-foreground mb-2">
              100 − mean of R1, R2, R3. Higher means you bounce back faster after difficult outcomes.
            </p>
            <p className="text-xs text-muted-foreground">
              Setback Sensitivity: <span className="font-bold text-amber-500">{Math.round(setbackSensitivity)}</span>
            </p>
          </div>
        </div>

        {/* Behavioural Stability */}
        <div className="rounded-2xl border border-border/50 p-5 glass flex items-center gap-4">
          <CircularGauge
            value={result.derivedMeasures.behaviouralStability}
            size={90}
            stroke={8}
            color={healthBand(result.derivedMeasures.behaviouralStability).color}
            label="Stability"
            delay={0.4}
          />
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Behavioural Stability</p>
            <p className="text-sm text-foreground mb-2">
              100 − mean(R4, max(D3, S2, C4)). How consistently you communicate, decide and behave under pressure.
            </p>
            <p className="text-xs text-muted-foreground">
              Instability may stem from urgency, over-analysis, conflict avoidance or emotional reactivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// TAB: DECISION STYLE - 4-axis profile
// ===========================================================================
function DecisionTab({ result }: { result: WellbeingDashboardResult }) {
  const ds = result.derivedMeasures.decisionStyle;
  const narrative = decisionStyleNarrative(ds);

  const axes: RadarAxis[] = [
    { label: 'Fast',         value: ds.fast,                color: '#ef4444', description: 'Act quickly on instinct' },
    { label: 'Analytical',   value: ds.analytical,          color: '#3b82f6', description: 'Analyse and consider before acting' },
    { label: 'Collaborative',value: ds.collaborative,       color: '#10b981', description: 'Decide with others' },
    { label: 'Emotional',    value: ds.emotionallyInfluenced, color: '#f59e0b', description: 'Shaped by emotional investment' },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/50 p-5 glass">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Decision Style</h3>
            <p className="text-xs text-muted-foreground">
              How you tend to make decisions. The strongest style is your primary tendency - but all four contribute.
            </p>
          </div>
        </div>

        <div className="rounded-xl p-4 bg-primary/5 border border-primary/20 mb-5">
          <p className="text-sm text-foreground italic leading-relaxed">&ldquo;{narrative}&rdquo;</p>
        </div>

        <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">
          <div className="flex justify-center">
            <RadarChart axes={axes} size={280} delay={0.2} />
          </div>
          <div className="space-y-2.5">
            {axes.map(axis => (
              <div key={axis.label} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: axis.color }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{axis.label}</p>
                    <p className="text-sm font-bold" style={{ color: axis.color }}>{Math.round(axis.value)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{axis.description}</p>
                  <div className="h-1 rounded-full bg-secondary mt-1 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: axis.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${axis.value}%` }}
                      transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional measures that influence decisions */}
      <div className="grid md:grid-cols-3 gap-4">
        <DecisionMeasureCard
          label="Need for Certainty"
          value={result.derivedMeasures.needForCertainty}
          description="How much certainty you need before acting."
          icon={Brain}
          direction="pressure"
        />
        <DecisionMeasureCard
          label="Tolerance of Uncertainty"
          value={result.derivedMeasures.toleranceOfUncertainty}
          description="Comfort operating without complete information."
          icon={TrendingUp}
          direction="health"
        />
        <DecisionMeasureCard
          label="Relationship Orientation"
          value={result.derivedMeasures.relationshipOrientation}
          description="How strongly relationships shape your decisions."
          icon={Users}
          direction="health"
        />
      </div>
    </div>
  );
}

function DecisionMeasureCard({
  label, value, description, icon: Icon, direction,
}: {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  direction: 'health' | 'pressure';
}) {
  const band = direction === 'pressure' ? pressureBand(value) : healthBand(value);
  return (
    <div className="rounded-2xl border border-border/50 p-4 glass flex items-start gap-3">
      <CircularGauge value={value} size={56} stroke={5} color={band.color} delay={0.2} showValue />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-3.5 h-3.5" style={{ color: band.color }} />
          <p className="text-sm font-medium text-foreground">{label}</p>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
