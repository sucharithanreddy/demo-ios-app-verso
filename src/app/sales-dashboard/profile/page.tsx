'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Target,
  Brain,
  Heart,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  RefreshCcw,
  UserPlus,
  UserCheck,
  Link2,
  X,
  BookOpen,
  Sparkles,
  Layers,
  Activity,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { SalesDashboardLayout } from '@/components/dashboard/SalesDashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WellbeingDashboard } from '@/components/wellbeing-dashboard/WellbeingDashboard';

interface DiagnosticResults {
  primaryProfile: string;
  secondaryProfile: string;
  confidence: string;
  percentages: {
    driver: number;
    strategist: number;
    connector: number;
    reactor: number;
  };
  rawScores: {
    driver: number;
    strategist: number;
    connector: number;
    reactor: number;
  };
  strengths: string[];
  wellbeingRisks: string[];
  reflectionQuestion: string;
  description: string;
  completedAt: string;
}

// ── Full (64-question) diagnostic result shape ───────────────────────────
// Mirrors FullDiagnosticResult from src/lib/full-diagnostic-questions.ts.
// Duplicated here as a local type so we don't pull the heavy question bank
// into the profile bundle.
type ArchetypeKey = 'driver' | 'strategist' | 'connector' | 'reactor';
type DimensionCodeKey =
  | 'D1' | 'D2' | 'D3' | 'D4'
  | 'S1' | 'S2' | 'S3' | 'S4'
  | 'C1' | 'C2' | 'C3' | 'C4'
  | 'R1' | 'R2' | 'R3' | 'R4';
type DimensionBandKey = 'low' | 'mild' | 'moderate' | 'strong' | 'very_strong';
type SustainabilityBandKey = 'strongly_sustainable' | 'generally_sustainable' | 'mixed' | 'several_pressure_points' | 'significant_pressure';
type WellbeingPressureLevelKey = 'low' | 'emerging' | 'moderate' | 'elevated';
type ProfileClassificationKey = 'strong_primary' | 'blended' | 'balanced' | 'flexible';

interface FullDiagnosticResults {
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
  responseQuality: { fastCompletion: boolean; straightLining: boolean; excessiveNeutrality: boolean; hasFlags: boolean; completionTimeSeconds: number };
  completedAt: string;
  assessmentVersion?: string;
}

const FULL_ARCHETYPE_CONFIG: Record<ArchetypeKey, {
  name: string;
  icon: typeof Target;
  color: string;
  bgColor: string;
  gradient: string;
  description: string;
}> = {
  driver: { name: 'Driver', icon: Target, color: 'text-red-500', bgColor: 'bg-red-500/10', gradient: 'from-red-500 to-orange-500', description: 'Action, momentum, achievement' },
  strategist: { name: 'Strategist', icon: Brain, color: 'text-blue-500', bgColor: 'bg-blue-500/10', gradient: 'from-blue-500 to-cyan-500', description: 'Clarity, planning, analysis' },
  connector: { name: 'Connector', icon: Heart, color: 'text-green-500', bgColor: 'bg-green-500/10', gradient: 'from-green-500 to-emerald-500', description: 'Relationships, trust, communication' },
  reactor: { name: 'Reactor', icon: Zap, color: 'text-amber-500', bgColor: 'bg-amber-500/10', gradient: 'from-amber-500 to-yellow-500', description: 'Emotional sensitivity to outcomes' },
};

// Friendly labels for the 16 dimensions, keyed by dimension code.
const DIMENSION_LABELS: Record<DimensionCodeKey, string> = {
  D1: 'Action and urgency',
  D2: 'Momentum and achievement',
  D3: 'Intensification under pressure',
  D4: 'Boundaries and recovery',
  S1: 'Need for clarity',
  S2: 'Analysis and mental processing',
  S3: 'Planning and control',
  S4: 'Standards, risk and completion',
  C1: 'External processing and support-seeking',
  C2: 'Relationship priority',
  C3: 'Emotional attunement and labour',
  C4: 'Harmony and personal boundaries',
  R1: 'Confidence volatility',
  R2: 'Emotional sensitivity to outcomes',
  R3: 'Recovery and rumination',
  R4: 'Behavioural reactivity',
};

const DIMENSION_ARCHETYPE: Record<DimensionCodeKey, ArchetypeKey> = {
  D1: 'driver', D2: 'driver', D3: 'driver', D4: 'driver',
  S1: 'strategist', S2: 'strategist', S3: 'strategist', S4: 'strategist',
  C1: 'connector', C2: 'connector', C3: 'connector', C4: 'connector',
  R1: 'reactor', R2: 'reactor', R3: 'reactor', R4: 'reactor',
};

const DIMENSION_BAND_LABELS: Record<DimensionBandKey, string> = {
  low: 'Low',
  mild: 'Mild',
  moderate: 'Moderate',
  strong: 'Strong',
  very_strong: 'Very strong',
};

const SUSTAINABILITY_BAND_LABELS: Record<SustainabilityBandKey, string> = {
  strongly_sustainable: 'Strongly sustainable',
  generally_sustainable: 'Generally sustainable',
  mixed: 'Mixed sustainability',
  several_pressure_points: 'Several pressure points',
  significant_pressure: 'Significant pressure',
};

const PRESSURE_LABELS: Record<WellbeingPressureLevelKey, string> = {
  low: 'Low',
  emerging: 'Emerging',
  moderate: 'Moderate',
  elevated: 'Elevated',
};

const CLASSIFICATION_LABELS: Record<ProfileClassificationKey, string> = {
  strong_primary: 'Strong primary',
  blended: 'Blended',
  balanced: 'Balanced',
  flexible: 'Flexible',
};

// Six key derived measures surfaced on the profile summary (full set
// is on /diagnostic/full/results).
const KEY_DERIVED_MEASURES: Array<{
  key: keyof FullDiagnosticResults['derivedMeasures'];
  label: string;
  description: string;
  icon: typeof Target;
}> = [
  { key: 'confidenceStability', label: 'Confidence Stability', description: 'How stable your self-belief is under varying outcomes', icon: Shield },
  { key: 'energySustainability', label: 'Energy Sustainability', description: 'Whether your current pace is sustainable without depletion', icon: Activity },
  { key: 'recoveryCapacity', label: 'Recovery Capacity', description: 'How effectively you recover from setbacks', icon: Heart },
  { key: 'boundarySustainability', label: 'Boundary Sustainability', description: 'How well you protect recovery and personal capacity', icon: Shield },
  { key: 'toleranceOfUncertainty', label: 'Tolerance of Uncertainty', description: 'Your comfort acting without complete information', icon: TrendingUp },
  { key: 'behaviouralStability', label: 'Behavioural Stability', description: 'How consistently you behave under pressure', icon: Activity },
];

const ARCHETYPE_INFO = {
  Driver: {
    name: 'Driver',
    icon: Target,
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-500',
    borderColor: 'border-red-500/30',
    summary: 'When work becomes demanding, you instinctively respond by pushing forward. You increase activity, accelerate progress and focus on moving outcomes forward.',
    strengths: [
      'Strong drive to move things forward',
      'Ability to create momentum quickly',
      'Resilience in fast-paced or high-demand situations',
      'Willingness to take ownership and responsibility',
    ],
    risks: [
      'Difficulty switching off or recovering outside of work',
      'Sustained mental and physical fatigue over time',
      'Impatience when progress is slower than expected',
      'Tendency to prioritise output over personal wellbeing',
    ],
    reflection: 'What would happen if you paused before pushing forward? What might you notice?',
  },
  Strategist: {
    name: 'Strategist',
    icon: Brain,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    borderColor: 'border-blue-500/30',
    summary: 'You respond to challenge by stepping back and seeking to understand the situation more clearly. You analyse information, reassess approach and aim to regain clarity before acting.',
    strengths: [
      'Thoughtful and considered decision-making',
      'Strong planning and problem-solving capability',
      'Ability to identify patterns and make sense of complexity',
      'Maintaining perspective in uncertain situations',
    ],
    risks: [
      'Overthinking or difficulty switching off mentally',
      'Reduced confidence when clarity is lacking',
      'Hesitation when quick decisions are required',
      'Mental fatigue from sustained cognitive load',
    ],
    reflection: 'What would it feel like to trust your instincts without having all the answers?',
  },
  Connector: {
    name: 'Connector',
    icon: Heart,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-500',
    borderColor: 'border-green-500/30',
    summary: 'You respond by focusing on people. You prioritise communication, trust and collaboration, often helping to stabilise both client relationships and team dynamics.',
    strengths: [
      'Strong emotional intelligence and empathy',
      'Ability to build trust and maintain relationships',
      'Collaborative approach to challenges',
      'Positive influence on team morale and cohesion',
    ],
    risks: [
      'Absorbing emotional stress from others',
      'Difficulty maintaining boundaries between work and personal life',
      'Avoidance of difficult or uncomfortable conversations',
      'Emotional fatigue from sustained interpersonal demands',
    ],
    reflection: 'What would change if you prioritised your own needs alongside others?',
  },
  Reactor: {
    name: 'Reactor',
    icon: Zap,
    color: 'from-amber-500 to-yellow-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-500/30',
    summary: 'You experience the emotional impact of sales more strongly. Your confidence and energy can fluctuate in response to wins, setbacks and changing circumstances.',
    strengths: [
      'Strong sense of accountability and ownership',
      'High levels of engagement and care for outcomes',
      'Responsiveness and awareness of changing situations',
      'Energy and passion in performance-driven environments',
    ],
    risks: [
      'Fluctuations in confidence, focus and motivation',
      'Difficulty maintaining perspective during setbacks',
      'Emotional exhaustion over prolonged periods',
      'Reactive patterns that affect consistency',
    ],
    reflection: 'What small ritual could help you stabilise when things feel uncertain?',
  },
};

export default function SalesProfilePage() {
  const [results, setResults] = useState<DiagnosticResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hasFullDiagnostic, setHasFullDiagnostic] = useState(false);
  const [fullResults, setFullResults] = useState<FullDiagnosticResults | null>(null);

  // Manager linking state
  const [managerCode, setManagerCode] = useState('');
  const [linkedManager, setLinkedManager] = useState<{ id: string; name: string; email: string; designation?: string } | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('diagnosticResults');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as DiagnosticResults;
        // Validate the parsed shape - a partial/garbage object can crash
        // the render. Require at least primaryProfile to be a string.
        if (parsed && typeof parsed.primaryProfile === 'string') {
          setResults(parsed);
        } else {
          // Stale or malformed - clear it so we don't keep crashing.
          console.warn('[PROFILE] discarding malformed diagnosticResults', parsed);
          localStorage.removeItem('diagnosticResults');
        }
      } catch (err) {
        console.error('[PROFILE] failed to parse diagnosticResults', err);
        localStorage.removeItem('diagnosticResults');
      }
    }

    // Check for linked manager in localStorage
    const storedManager = localStorage.getItem('linkedManager');
    if (storedManager) {
      try {
        const parsedManager = JSON.parse(storedManager);
        if (parsedManager && typeof parsedManager === 'object' && typeof parsedManager.email === 'string') {
          setLinkedManager(parsedManager);
        } else {
          console.warn('[PROFILE] discarding malformed linkedManager', parsedManager);
          localStorage.removeItem('linkedManager');
        }
      } catch (err) {
        console.error('[PROFILE] failed to parse linkedManager', err);
        localStorage.removeItem('linkedManager');
      }
    }

    // Detect + load full 64-question assessment (separate localStorage key written by /diagnostic/full)
    const storedFull = localStorage.getItem('fullDiagnosticResults');
    if (storedFull) {
      try {
        const parsed = JSON.parse(storedFull) as FullDiagnosticResults;
        // Validate the minimum shape we render below.
        if (
          parsed &&
          typeof parsed === 'object' &&
          typeof parsed.primaryArchetype === 'string' &&
          parsed.archetypeScores &&
          typeof parsed.archetypeScores === 'object' &&
          typeof parsed.salesWellbeingSustainabilityIndex === 'number' &&
          parsed.dimensionScores &&
          parsed.derivedMeasures
        ) {
          setHasFullDiagnostic(true);
          setFullResults(parsed);
        } else {
          console.warn('[PROFILE] discarding malformed fullDiagnosticResults', parsed);
          localStorage.removeItem('fullDiagnosticResults');
        }
      } catch (err) {
        console.error('[PROFILE] failed to parse fullDiagnosticResults', err);
        localStorage.removeItem('fullDiagnosticResults');
      }
    }
  }, []);

  const handleLinkManager = async () => {
    if (!managerCode.trim()) return;
    
    setIsLinking(true);
    setLinkError('');
    
    try {
      const res = await fetch('/api/manager/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerCode: managerCode.trim() }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setLinkedManager(data.manager);
        localStorage.setItem('linkedManager', JSON.stringify(data.manager));
        setShowLinkInput(false);
        setManagerCode('');
      } else {
        setLinkError(data.message || data.error || 'Failed to link manager');
      }
    } catch (error) {
      setLinkError('An error occurred. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkManager = async () => {
    try {
      await fetch('/api/manager/link', { method: 'DELETE' });
      setLinkedManager(null);
      localStorage.removeItem('linkedManager');
    } catch (error) {
      console.error('Error unlinking manager:', error);
    }
  };

  if (!mounted) {
    return (
      <SalesDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse" />
            <div className="absolute inset-2 rounded-xl bg-primary/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="absolute inset-4 rounded-lg bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </SalesDashboardLayout>
    );
  }

  if (!results) {
    return (
      <SalesDashboardLayout>
        <div className="max-w-xl mx-auto">
          <div className="glass rounded-2xl border border-border/50 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Take the Assessment</h2>
            <p className="text-muted-foreground mb-6">
              Discover your sales wellbeing pattern and get personalized insights to improve your performance.
            </p>
            <Link href="/diagnostic">
              <Button className="gap-2">
                Start Assessment
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </SalesDashboardLayout>
    );
  }

  const archetypeInfo = ARCHETYPE_INFO[results.primaryProfile as keyof typeof ARCHETYPE_INFO]
    || ARCHETYPE_INFO[(results.primaryProfile?.charAt(0).toUpperCase() + results.primaryProfile?.slice(1).toLowerCase()) as keyof typeof ARCHETYPE_INFO];
  const Icon = archetypeInfo?.icon || Target;

  return (
    <SalesDashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* ── Snapshot summary (16-question) - only shown when no full diagnostic exists ──
            When the user has taken the 64-question Full Map, the interactive
            <WellbeingDashboard /> below replaces this entire snapshot block. */}
        {!hasFullDiagnostic && (
        <>
        {/* Archetype Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-2xl border p-6 md:p-8 mb-6 bg-gradient-to-br',
            archetypeInfo?.bgColor
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br',
              archetypeInfo?.color
            )}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-foreground capitalize">{results.primaryProfile}</h1>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  results.confidence === 'strong' && 'bg-green-500/20 text-green-600',
                  results.confidence === 'moderate' && 'bg-blue-500/20 text-blue-600',
                  results.confidence === 'blended' && 'bg-purple-500/20 text-purple-600'
                )}>
                  {results.confidence} match
                </span>
              </div>
              <p className="text-muted-foreground mb-4">
                Secondary: <span className="font-medium text-foreground capitalize">{results.secondaryProfile}</span>
              </p>
              <p className="text-foreground leading-relaxed">
                {archetypeInfo?.summary}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Score Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl border border-border/50 p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Pattern Scores</h2>
          <div className="space-y-4">
            {Object.entries(results.percentages || {}).map(([key, value]) => {
              // percentages keys can be lowercase ('driver') or capitalized ('Driver')
              // - normalize to the capitalized form so ARCHETYPE_INFO lookup works.
              const normalizedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
              const info = ARCHETYPE_INFO[normalizedKey as keyof typeof ARCHETYPE_INFO];
              if (!info) {
                // Unknown key - skip rather than crash. This is what was throwing
                // the "client-side exception" on /sales-dashboard/profile.
                return null;
              }
              // primaryProfile may also be lowercase - normalize for comparison
              const normalizedPrimary = results.primaryProfile
                ? results.primaryProfile.charAt(0).toUpperCase() + results.primaryProfile.slice(1).toLowerCase()
                : '';
              const isPrimary = normalizedKey === normalizedPrimary;
              const Icon = info.icon;
              return (
                <div key={key} className="flex items-center gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    info.bgColor
                  )}>
                    <Icon className={cn('w-5 h-5', info.textColor)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn('font-medium capitalize', isPrimary && 'text-primary')}>
                        {normalizedKey}
                        {isPrimary && ' (Primary)'}
                      </span>
                      <span className="text-sm text-muted-foreground">{value}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', isPrimary && 'bg-primary')}
                        style={{ width: `${Math.max(0, Math.min(100, Number(value) || 0))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Strengths & Risks */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl border border-green-500/20 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <h3 className="font-semibold text-foreground">Your Strengths</h3>
            </div>
            <ul className="space-y-3">
              {(results.strengths || archetypeInfo?.strengths || []).map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{strength}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Wellbeing Risks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-2xl border border-amber-500/20 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="font-semibold text-foreground">Areas to Watch</h3>
            </div>
            <ul className="space-y-3">
              {(results.wellbeingRisks || archetypeInfo?.risks || []).map((risk, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{risk}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Reflection Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-6 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Reflection Question</h3>
              <p className="text-muted-foreground leading-relaxed">
                {results.reflectionQuestion || archetypeInfo?.reflection}
              </p>
            </div>
          </div>
        </motion.div>
        </>
        )}

        {/* Manager Link Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl border border-border/50 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              {linkedManager ? (
                <UserCheck className="w-5 h-5 text-purple-500" />
              ) : (
                <UserPlus className="w-5 h-5 text-purple-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Link to Manager</h3>
              <p className="text-xs text-muted-foreground">
                {linkedManager 
                  ? 'Your manager can view your wellbeing insights' 
                  : 'Connect with your manager for personalized support'}
              </p>
            </div>
          </div>

          {linkedManager ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {linkedManager.name?.charAt(0) || linkedManager.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{linkedManager.name || linkedManager.email}</p>
                  {linkedManager.designation && (
                    <p className="text-xs text-muted-foreground">{linkedManager.designation}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnlinkManager}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4 mr-1" />
                Unlink
              </Button>
            </div>
          ) : showLinkInput ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={managerCode}
                  onChange={(e) => setManagerCode(e.target.value.toUpperCase())}
                  placeholder="Enter manager code (e.g., MGR-ABC123)"
                  className="flex-1 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
                />
                <Button
                  onClick={handleLinkManager}
                  disabled={!managerCode.trim() || isLinking}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  {isLinking ? 'Linking...' : 'Link'}
                </Button>
              </div>
              {linkError && (
                <p className="text-sm text-destructive">{linkError}</p>
              )}
              <button
                onClick={() => { setShowLinkInput(false); setLinkError(''); }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          ) : (
            <Button
              onClick={() => setShowLinkInput(true)}
              variant="outline"
              className="w-full border-purple-500/30 text-purple-500 hover:bg-purple-500/10"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Link to Manager
            </Button>
          )}
        </motion.div>

        {/* ─── Full Wellbeing Map (64-question) ─────────────────────────── */}
        {fullResults ? (
          <>
            {/* Section header + completion badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl border border-emerald-500/30 p-6 mb-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">Your Interactive Wellbeing Dashboard</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-600 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    64-question Sales Wellbeing Map - completed on{' '}
                    {fullResults.completedAt
                      ? new Date(fullResults.completedAt).toLocaleDateString()
                      : 'N/A'}
                    . Tap between archetypes and switch tabs to explore your full profile.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* The new interactive dashboard - replaces the old Layer 1/2/3 cards */}
            <WellbeingDashboard
              result={fullResults}
              onViewFullResults={() => window.location.href = '/diagnostic/full/results'}
              onRetake={() => {
                localStorage.removeItem('fullDiagnosticResults');
                window.location.href = '/diagnostic/full';
              }}
            />
          </>
        ) : (
          /* No full diagnostic yet - show the upsell CTA card. */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl border border-emerald-500/20 p-6 mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  Go deeper with the Full Wellbeing Map
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This profile is based on the 16-question Snapshot. The full 64-question Sales Wellbeing Map unlocks 16 underlying dimensions, 12 derived wellbeing measures, and a Sales Wellbeing Sustainability Index - your AI Companion uses all of it to personalize advice.
                </p>
                <Link
                  href="/diagnostic/full"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Take Full Assessment (64 Q)
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Privacy & Manager Visibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Link
            href="/sales-dashboard/profile/privacy"
            className="glass rounded-2xl border border-border/50 p-5 flex items-center justify-between ios-tap cursor-pointer hover:border-primary/30 transition-all block"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Privacy &amp; Manager Visibility</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose whether your manager sees your name or &ldquo;Anonymous team member&rdquo;
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </Link>
        </motion.div>

        {/* Retake Assessment (snapshot) - hidden when full diagnostic is present,
            the dashboard already provides its own retake action */}
        {!hasFullDiagnostic && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Completed on {results.completedAt ? new Date(results.completedAt).toLocaleDateString() : 'N/A'}
          </p>
          <Link href="/diagnostic">
            <Button variant="outline" className="gap-2">
              <RefreshCcw className="w-4 h-4" />
              Retake Assessment
            </Button>
          </Link>
        </motion.div>
        )}
      </div>
    </SalesDashboardLayout>
  );
}
