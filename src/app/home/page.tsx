'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  MessageCircle,
  Calendar,
  Flame,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Users,
  Activity,
  RefreshCcw,
  Building2,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useSafeUser } from '@/lib/safe-auth';
import { MobileHeader } from '@/components/MobileHeader';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface DiagnosticResult {
  primaryProfile: string;
  secondaryProfile?: string;
  scores: {
    driver: number;
    strategist: number;
    connector: number;
    reactor: number;
  };
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weeklyAverages: {
    mood: number;
    energy: number;
    confidence: number;
    count: number;
  };
  weeklyCheckIns: Array<{
    date: string;
    mood: number;
    energy: number;
    confidence: number;
  }>;
}

interface CoachingTip {
  actionTitle: string;
  tip: string;
}

const PATTERN_CONFIG = {
  Driver: {
    icon: Target,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    gradient: 'from-red-500 to-red-600',
    description: 'Increase momentum and take action',
  },
  Strategist: {
    icon: Lightbulb,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    gradient: 'from-blue-500 to-blue-600',
    description: 'Regain control through analysis and planning',
  },
  Connector: {
    icon: Users,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    gradient: 'from-green-500 to-green-600',
    description: 'Stabilise through relationships and communication',
  },
  Reactor: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    gradient: 'from-amber-500 to-amber-600',
    description: 'Emotional sensitivity to outcomes',
  },
};

const DAILY_INSIGHTS = [
  "Your patterns are your superpower. Understanding them is the first step to mastery.",
  "Every check-in is an investment in your self-awareness.",
  "Small consistent actions lead to significant lasting changes.",
  "Your wellbeing directly impacts your sales performance.",
  "Awareness precedes change. You're on the right path.",
];

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useSafeUser();

  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [coachingTip, setCoachingTip] = useState<CoachingTip | null>(null);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

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
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      loadDashboardData();
    }
  }, [isSignedIn]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load diagnostic results from localStorage
      const storedResults = localStorage.getItem('diagnosticResults');
      if (storedResults) {
        setDiagnosticResult(JSON.parse(storedResults));
      }

      // Load streak data
      try {
        const streakResponse = await fetch('/api/streak');
        if (streakResponse.ok) {
          const streakData = await streakResponse.json();
          setStreakData(streakData);
        }
      } catch (e) {
        console.log('Streak data not available yet');
      }

      // Load check-in status
      try {
        const checkInResponse = await fetch('/api/checkin');
        if (checkInResponse.ok) {
          const checkInData = await checkInResponse.json();
          setHasCheckedInToday(checkInData.hasCheckedInToday);
        }
      } catch (e) {
        console.log('Check-in data not available yet');
      }

      // Load coaching tip
      try {
        const tipResponse = await fetch('/api/coaching?situation=morning');
        if (tipResponse.ok) {
          const tipData = await tipResponse.json();
          setCoachingTip(tipData.tip);
        }
      } catch (e) {
        console.log('Coaching tip not available yet');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  const getDailyInsight = () => {
    const today = new Date().getDate();
    return DAILY_INSIGHTS[today % DAILY_INSIGHTS.length];
  };

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

  const profileConfig = diagnosticResult
    ? PATTERN_CONFIG[diagnosticResult.primaryProfile as keyof typeof PATTERN_CONFIG]
    : null;
  const ProfileIcon = profileConfig?.icon || Target;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden noise">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, oklch(0.45 0.2 270), oklch(0.55 0.22 300))' }}
        />
        <div className="absolute inset-0 dot-pattern opacity-30" />
      </div>

      <MobileHeader
        title="Dashboard"
        subtitle="Your wellbeing journey"
        icon="home"
        onToggleDark={toggleDark}
        isDark={isDark}
      />

      <header className="sticky top-0 z-50 hide-on-mobile">
        <div className="glass border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-premium">
                  <img src="/logo.svg" alt="Verso" className="w-6 h-6" style={{ filter: 'brightness(0) invert(1)' }} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Home</h1>
                  <p className="text-xs text-muted-foreground">Your wellbeing dashboard</p>
                </div>
              </div>
              <button
                onClick={toggleDark}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pb-8 px-4 md:px-6 pt-6 md:pt-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome & Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {getGreeting()}
                </h2>
                <p className="text-muted-foreground">{getDailyInsight()}</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Streak Counter */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {streakData?.currentStreak || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">day streak</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {/* Check-in Button */}
            <Link
              href="/checkin"
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                hasCheckedInToday
                  ? 'border-green-500/30 bg-green-500/10'
                  : 'border-primary/30 bg-primary/10 hover:bg-primary/20'
              )}
            >
              {hasCheckedInToday ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <Calendar className="w-8 h-8 text-primary" />
              )}
              <span className="text-sm font-medium text-foreground">
                {hasCheckedInToday ? 'Checked In' : 'Check In'}
              </span>
            </Link>

            {/* Diagnostic */}
            <Link
              href="/diagnostic"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-secondary/50 hover:bg-secondary/80 transition-all"
            >
              <Target className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Retake Test</span>
            </Link>

            {/* Results */}
            <Link
              href="/diagnostic/results"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-secondary/50 hover:bg-secondary/80 transition-all"
            >
              <Activity className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">View Results</span>
            </Link>

            {/* Reflect */}
            <Link
              href="/reflect"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-secondary/50 hover:bg-secondary/80 transition-all"
            >
              <Sparkles className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Reflect</span>
            </Link>
          </motion.div>

          {/* Profile Card */}
          {diagnosticResult && profileConfig && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
            >
              <div className="flex items-start gap-4">
                <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center', profileConfig.bgColor)}>
                  <ProfileIcon className={cn('w-7 h-7', profileConfig.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-foreground">
                      {diagnosticResult.primaryProfile}
                    </h3>
                    {diagnosticResult.secondaryProfile && (
                      <span className="text-sm text-muted-foreground">
                        + {diagnosticResult.secondaryProfile}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{profileConfig.description}</p>
                </div>
                <Link
                  href="/diagnostic/results"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Mini Score Bars */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {Object.entries(diagnosticResult.scores).map(([key, score]) => {
                  const config = PATTERN_CONFIG[key.charAt(0).toUpperCase() + key.slice(1) as keyof typeof PATTERN_CONFIG];
                  return (
                    <div key={key} className="text-center">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-1">
                        <div
                          className={cn('h-full rounded-full bg-gradient-to-r', config.gradient)}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">{key}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Coaching Tip */}
          {coachingTip && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl border border-primary/20 p-6 shadow-premium"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{coachingTip.actionTitle}</h3>
                  <p className="text-sm text-muted-foreground">{coachingTip.tip}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* B2B Dashboard Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="grid md:grid-cols-2 gap-4"
          >
            <Link
              href="/manager"
              className="glass rounded-2xl border border-border/50 p-5 shadow-premium hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Team Dashboard</h4>
                  <p className="text-sm text-muted-foreground">View team insights & patterns</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
              </div>
            </Link>

            <Link
              href="/admin"
              className="glass rounded-2xl border border-border/50 p-5 shadow-premium hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Admin Dashboard</h4>
                  <p className="text-sm text-muted-foreground">Company ROI & metrics</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
              </div>
            </Link>
          </motion.div>

          {/* Weekly Pattern */}
          {streakData && streakData.weeklyAverages.count > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">This Week's Pattern</h3>
                <span className="text-sm text-muted-foreground">
                  {streakData.weeklyAverages.count} check-ins
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-secondary/50">
                  <MessageCircle className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    {streakData.weeklyAverages.mood}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Mood</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary/50">
                  <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    {streakData.weeklyAverages.energy}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Energy</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary/50">
                  <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    {streakData.weeklyAverages.confidence}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Confidence</p>
                </div>
              </div>

              {/* Trend Chart Placeholder */}
              {streakData.weeklyCheckIns && streakData.weeklyCheckIns.length > 1 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-end justify-between h-20 gap-1">
                    {streakData.weeklyCheckIns.slice(-7).map((checkIn, index) => {
                      const avgHeight = ((checkIn.mood + checkIn.energy + checkIn.confidence) / 3 / 5) * 100;
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-gradient-to-t from-primary to-accent rounded-t"
                          style={{ height: `${avgHeight}%`, minHeight: '8px' }}
                          title={`Mood: ${checkIn.mood}, Energy: ${checkIn.energy}, Confidence: ${checkIn.confidence}`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">7-day trend</p>
                </div>
              )}
            </motion.div>
          )}

          {/* No Results Yet */}
          {!diagnosticResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl border border-border/50 p-8 shadow-premium text-center"
            >
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Discover Your Sales Profile
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Take our 3-minute diagnostic to understand how you respond to sales pressure and unlock personalized insights.
              </p>
              <Link
                href="/diagnostic"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:opacity-90 transition-all"
              >
                Take the Snapshot
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          )}

          {/* Longest Streak Badge */}
          {streakData && streakData.longestStreak > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-muted-foreground"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">
                Longest streak: <strong className="text-foreground">{streakData.longestStreak} days</strong>
              </span>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
