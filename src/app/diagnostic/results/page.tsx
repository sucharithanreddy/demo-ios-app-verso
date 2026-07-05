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
  AlertCircle,
  TrendingUp,
  Share2,
  RefreshCcw,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSafeUser } from '@/lib/safe-auth';
import { MobileHeader } from '@/components/MobileHeader';
import { cn } from '@/lib/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface DiagnosticResult {
  scores: {
    driver: number;
    strategist: number;
    connector: number;
    reactor: number;
  };
  rawScores?: {
    driver: number;
    strategist: number;
    connector: number;
    reactor: number;
  };
  percentages?: {
    driver: number;
    strategist: number;
    connector: number;
    reactor: number;
  };
  primaryProfile: string;
  secondaryProfile: string;
  confidence?: 'strong' | 'moderate' | 'blended';
  description?: string;
  strengths: string[];
  wellbeingRisks: string[];
  reflectionQuestion: string;
  completedAt: string;
}

const PATTERN_CONFIG = {
  driver: {
    name: 'Driver',
    icon: Target,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    gradient: 'from-red-500 to-red-600',
    description: 'Increase momentum and take action',
    detailedDescription: 'When work becomes demanding, you instinctively respond by pushing forward. You increase activity, accelerate progress and focus on moving outcomes forward. You can be highly effective in maintaining momentum and generating results. However, sustained intensity can make it difficult to step back, recover or switch off, which may impact longer-term wellbeing and decision-making.',
  },
  strategist: {
    name: 'Strategist',
    icon: Lightbulb,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    gradient: 'from-blue-500 to-blue-600',
    description: 'Regain control through analysis and planning',
    detailedDescription: 'You respond to challenge by stepping back and seeking to understand the situation more clearly. You analyse information, reassess approach and aim to regain clarity before acting. This can bring strong judgement and structured thinking. However, prolonged uncertainty may lead to over-analysis or difficulty disengaging from work outside of working hours.',
  },
  connector: {
    name: 'Connector',
    icon: Users,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    gradient: 'from-green-500 to-green-600',
    description: 'Stabilise through relationships and communication',
    detailedDescription: 'You respond by focusing on people. You prioritise communication, trust and collaboration, often helping to stabilise both client relationships and team dynamics. This relational strength is highly valuable. However, sustained emotional engagement can sometimes lead to fatigue or difficulty maintaining personal boundaries.',
  },
  reactor: {
    name: 'Reactor',
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    gradient: 'from-amber-500 to-amber-600',
    description: 'Emotional sensitivity to outcomes',
    detailedDescription: 'You experience the emotional impact of sales more strongly. Your confidence and energy can fluctuate in response to wins, setbacks and changing circumstances. You often bring passion and accountability to your work. However, without strategies for stabilisation, these emotional shifts can affect confidence, focus and consistency over time.',
  },
};

export default function DiagnosticResultsPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useSafeUser();

  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Dark mode
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');
  }, []);

  // Redirect if not signed in - LOGIN FIRST
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  // Load results from localStorage
  useEffect(() => {
    const storedResults = localStorage.getItem('diagnosticResults');
    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults);
        setResult(parsed);
      } catch (e) {
        console.error('Error parsing results:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Check if user has "unlocked" full features (demo bypass)
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    const unlocked = localStorage.getItem('verso_full_access');
    setHasAccess(unlocked === 'true');
  }, []);

  const handleContinueFurther = () => {
    // If already signed in, go directly to payment
    if (isSignedIn) {
      router.push('/payment');
    } else {
      router.push('/sign-up?redirect_url=/payment');
    }
  };

  // Show loading while checking auth or redirecting
  if (!mounted || !isLoaded || !isSignedIn) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse" />
            <div className="absolute inset-2 rounded-xl bg-primary/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="absolute inset-4 rounded-lg bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Results Found</h2>
          <p className="text-muted-foreground mb-6">Complete the diagnostic test to see your results.</p>
          <Link
            href="/diagnostic"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all"
          >
            Take the Test
          </Link>
        </div>
      </div>
    );
  }

  const primaryConfig = PATTERN_CONFIG[result.primaryProfile as keyof typeof PATTERN_CONFIG];
  const secondaryConfig = result.secondaryProfile
    ? PATTERN_CONFIG[result.secondaryProfile as keyof typeof PATTERN_CONFIG]
    : null;

  // Use percentages if available (new format), otherwise fall back to scores (old format)
  const displayScores = result.percentages || result.scores;

  const scores = [
    { key: 'driver', score: displayScores.driver, ...PATTERN_CONFIG.driver },
    { key: 'strategist', score: displayScores.strategist, ...PATTERN_CONFIG.strategist },
    { key: 'connector', score: displayScores.connector, ...PATTERN_CONFIG.connector },
    { key: 'reactor', score: displayScores.reactor, ...PATTERN_CONFIG.reactor },
  ].sort((a, b) => b.score - a.score);

  const PrimaryIcon = primaryConfig.icon;

  // Get confidence display info
  const getConfidenceInfo = () => {
    switch (result.confidence) {
      case 'strong':
        return { 
          text: 'Strong Profile', 
          description: 'Your primary pattern is clearly dominant',
          color: 'text-green-500', 
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
        };
      case 'moderate':
        return { 
          text: 'Moderate Profile', 
          description: 'Your primary pattern is moderately dominant',
          color: 'text-blue-500', 
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
        };
      case 'blended':
        return { 
          text: 'Blended Profile', 
          description: 'You show a blend of multiple patterns',
          color: 'text-amber-500', 
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
        };
      default:
        return { 
          text: 'Profile', 
          description: '',
          color: 'text-muted-foreground', 
          bgColor: 'bg-secondary',
          borderColor: 'border-border/50',
        };
    }
  };

  const confidenceInfo = getConfidenceInfo();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden noise">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, oklch(0.45 0.2 270), oklch(0.55 0.22 300))' }}
        />
        <div
          className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[40%] rounded-full opacity-15 blur-[100px]"
          style={{ background: 'linear-gradient(135deg, oklch(0.55 0.18 200), oklch(0.45 0.2 270))' }}
        />
        <div className="absolute inset-0 dot-pattern opacity-30" />
      </div>

      {/* Mobile Header */}
      <MobileHeader
        title="Your Results"
        subtitle="Verso Sales Wellbeing Map"
        icon="target"
        onToggleDark={toggleDark}
        isDark={isDark}
      />

      {/* Desktop Header */}
      <header className="sticky top-0 z-50 hide-on-mobile">
        <div className="glass border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/diagnostic" className="p-2 rounded-xl hover:bg-secondary/80 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-premium">
                  <img src="/logo.svg" alt="Verso" className="w-6 h-6" style={{ filter: 'brightness(0) invert(1)' }} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Your Results</h1>
                  <p className="text-xs text-muted-foreground">Verso Sales Wellbeing Map</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleDark}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pb-8 px-4 md:px-6 pt-6 md:pt-10">
        <div className="max-w-4xl mx-auto">
          {/* Primary Profile Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-2xl border border-border/50 p-6 md:p-8 shadow-premium mb-6"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className={cn('w-20 h-20 rounded-2xl flex items-center justify-center', primaryConfig.bgColor)}>
                <PrimaryIcon className={cn('w-10 h-10', primaryConfig.color)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    You are {primaryConfig.name}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {/* Confidence Badge */}
                  {result.confidence && (
                    <span className={cn('px-3 py-1 rounded-full text-sm font-medium border', confidenceInfo.bgColor, confidenceInfo.color, confidenceInfo.borderColor)}>
                      {confidenceInfo.text}
                    </span>
                  )}
                  {secondaryConfig && (
                    <span className={cn('px-3 py-1 rounded-full text-sm font-medium', secondaryConfig.bgColor, secondaryConfig.color)}>
                      Secondary: {secondaryConfig.name}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mb-2">{result.description || primaryConfig.detailedDescription}</p>
                <p className={cn('text-sm font-medium', primaryConfig.color)}>
                  Core response: {primaryConfig.description}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Score Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl border border-border/50 p-6 md:p-8 shadow-premium mb-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Pattern Breakdown</h3>
            <div className="space-y-4">
              {scores.map((item, index) => {
                const Icon = item.icon;
                const isTop = index === 0;
                return (
                  <div key={item.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', item.bgColor)}>
                          <Icon className={cn('w-4 h-4', item.color)} />
                        </div>
                        <span className={cn('font-medium', isTop ? 'text-foreground' : 'text-muted-foreground')}>
                          {item.name}
                        </span>
                        {isTop && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-foreground">{item.score}%</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className={cn('h-full rounded-full bg-gradient-to-r', item.gradient)}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                      />
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
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass rounded-2xl border border-green-500/20 p-6 shadow-premium"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Your Strengths</h3>
              </div>
              <ul className="space-y-3">
                {(result.strengths || []).map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-muted-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Wellbeing Risks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass rounded-2xl border border-amber-500/20 p-6 shadow-premium"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Wellbeing Risks</h3>
              </div>
              <ul className="space-y-3">
                {(result.wellbeingRisks || []).map((risk, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    </div>
                    <span className="text-muted-foreground">{risk}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Reflection Question */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="glass rounded-2xl border border-primary/20 p-6 shadow-premium mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Reflection Question</h3>
            </div>
            <p className="text-lg text-muted-foreground italic">{result.reflectionQuestion}</p>
          </motion.div>

          {/* Continue Further CTA - Show if not yet unlocked */}
          {!hasAccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass rounded-2xl border-2 border-primary/30 p-6 md:p-8 shadow-premium mb-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Unlock Your Full Results</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Get access to personalized reflection tools, grounding exercises, and track your wellbeing journey over time.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/payment"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    Continue to Payment
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Show direct access if already unlocked */}
          {hasAccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass rounded-2xl border border-green-500/30 p-6 shadow-premium mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Full Access Unlocked</p>
                    <p className="text-sm text-muted-foreground">All features are now available</p>
                  </div>
                </div>
                <Link
                  href="/home"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Basic Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              href="/diagnostic"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 glass border border-border/50 rounded-xl font-medium text-foreground hover:bg-secondary/80 transition-all"
            >
              <RefreshCcw className="w-4 h-4" />
              Retake Test
            </Link>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + '/diagnostic');
                alert('Link copied to clipboard!');
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 glass border border-border/50 rounded-xl font-medium text-foreground hover:bg-secondary/80 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share Test
            </button>
            {hasAccess && (
              <Link
                href="/lab"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-primary text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-premium"
              >
                <Sparkles className="w-4 h-4" />
                Visit The Lab
              </Link>
            )}
          </motion.div>

          {/* Timestamp */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Assessment completed on {new Date(result.completedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </main>
    </div>
  );
}
