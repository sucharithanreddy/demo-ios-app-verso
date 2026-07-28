'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  User,
  TrendingUp,
  Lightbulb,
  Target,
  Flame,
  Calendar,
  Award,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Brain,
  MessageCircle,
  BookOpen,
} from 'lucide-react';
import { SalesDashboardLayout } from '@/components/dashboard/SalesDashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CheckInData {
  date: string;
  mood: number;
  energy: number;
  confidence: number;
}

export default function SalesDashboardPage() {
  const [archetype, setArchetype] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInData[]>([]);
  const [hasDiagnostic, setHasDiagnostic] = useState(false);
  const [hasFullDiagnostic, setHasFullDiagnostic] = useState(false);

  useEffect(() => {
    // Get archetype from localStorage - guard against malformed JSON
    const results = localStorage.getItem('diagnosticResults');
    if (results) {
      try {
        const parsed = JSON.parse(results);
        if (parsed && typeof parsed.primaryProfile === 'string') {
          setArchetype(parsed.primaryProfile);
          setHasDiagnostic(true);
        }
      } catch (err) {
        console.error('[SALES DASHBOARD] failed to parse diagnosticResults', err);
        localStorage.removeItem('diagnosticResults');
      }
    }

    // Detect whether the user has completed the full 64-question assessment
    // (separate localStorage key written by /diagnostic/full on submit).
    const fullResults = localStorage.getItem('fullDiagnosticResults');
    if (fullResults) {
      try {
        const parsed = JSON.parse(fullResults);
        if (parsed && typeof parsed === 'object') {
          setHasFullDiagnostic(true);
        }
      } catch (err) {
        console.error('[SALES DASHBOARD] failed to parse fullDiagnosticResults', err);
        localStorage.removeItem('fullDiagnosticResults');
      }
    }

    // Get streak
    const fetchStreak = async () => {
      try {
        const res = await fetch('/api/streak');
        const data = await res.json();
        if (data.streak) {
          setStreak(data.streak.currentStreak || 0);
        }
      } catch (e) {
        const stored = localStorage.getItem('userStreak');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setStreak(parsed?.currentStreak || 0);
          } catch (err) {
            console.error('[SALES DASHBOARD] failed to parse userStreak', err);
            localStorage.removeItem('userStreak');
          }
        }
      }
    };
    fetchStreak();

    // Get recent check-ins
    const fetchCheckIns = async () => {
      try {
        const res = await fetch('/api/checkin?limit=7');
        const data = await res.json();
        if (data.checkIns && data.checkIns.length > 0) {
          setRecentCheckIns(data.checkIns);
          // Check if today's check-in exists
          const today = new Date().toDateString();
          const hasToday = data.checkIns.some((c: CheckInData) => new Date(c.date).toDateString() === today);
          setTodayCheckedIn(hasToday);
        }
      } catch (e) {
        const stored = localStorage.getItem('salesCheckIns');
        if (stored) {
          try {
            const checkIns = JSON.parse(stored);
            if (Array.isArray(checkIns)) {
              setRecentCheckIns(checkIns.slice(0, 7));
              const today = new Date().toDateString();
              const hasToday = checkIns.some((c: CheckInData) => new Date(c.date).toDateString() === today);
              setTodayCheckedIn(hasToday);
            }
          } catch (err) {
            console.error('[SALES DASHBOARD] failed to parse salesCheckIns', err);
            localStorage.removeItem('salesCheckIns');
          }
        }
      }
    };
    fetchCheckIns();
  }, []);

  const getArchetypeInfo = () => {
    const info: Record<string, { color: string; icon: any; description: string; strength: string }> = {
      Driver: {
        color: 'from-red-500 to-orange-500',
        icon: Target,
        description: 'You increase momentum and push forward',
        strength: 'Action-oriented & results-driven',
      },
      Strategist: {
        color: 'from-blue-500 to-cyan-500',
        icon: Brain,
        description: 'You seek clarity before acting',
        strength: 'Thoughtful & analytical',
      },
      Connector: {
        color: 'from-green-500 to-emerald-500',
        icon: Heart,
        description: 'You stabilize through relationships',
        strength: 'Emotionally intelligent',
      },
      Reactor: {
        color: 'from-amber-500 to-yellow-500',
        icon: Zap,
        description: 'You experience outcomes deeply',
        strength: 'Passionate & accountable',
      },
    };
    return archetype ? info[archetype] || info.Driver : null;
  };

  const archetypeInfo = getArchetypeInfo();

  const quickActions = [
    {
      title: todayCheckedIn ? 'Check-in Complete!' : 'Daily Check-in',
      description: todayCheckedIn ? 'Come back tomorrow' : 'Log your mood, energy & confidence',
      href: '/sales-dashboard/checkin',
      icon: Heart,
      color: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      disabled: todayCheckedIn,
    },
    {
      title: 'Reflect AI',
      description: 'AI-powered thought companion',
      href: '/sales-dashboard/reflect',
      icon: Sparkles,
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    },
    {
      title: 'The Lab',
      description: 'Mental fitness tools & exercises',
      href: '/sales-dashboard/lab',
      icon: Brain,
      color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    },
    {
      title: hasDiagnostic ? 'View Your Profile' : 'Take Assessment',
      description: hasDiagnostic ? 'See your archetype details' : 'Discover your sales wellbeing pattern',
      href: hasDiagnostic ? '/sales-dashboard/profile' : '/diagnostic',
      icon: User,
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    },
    {
      title: hasFullDiagnostic ? 'Full Map Complete' : 'Full Wellbeing Map',
      description: hasFullDiagnostic
        ? '64-Q assessment done - view your sub-dimensions'
        : '64-Q deep dive: 8 sub-dimensions + wellbeing index',
      href: hasFullDiagnostic ? '/diagnostic/full/results' : '/diagnostic/full',
      icon: BookOpen,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      disabled: false,
    },
    {
      title: 'Your Progress',
      description: 'Track trends and improvements',
      href: '/sales-dashboard/progress',
      icon: TrendingUp,
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    {
      title: 'Get Coaching',
      description: 'Personalized tips for your situation',
      href: '/sales-dashboard/coaching',
      icon: Lightbulb,
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    },
  ];

  return (
    <SalesDashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-border/50 p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Welcome back!
                </h1>
                <p className="text-muted-foreground">
                  {todayCheckedIn
                    ? "You've checked in today. Keep the momentum going!"
                    : "Start your day with a quick check-in."}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{streak}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Archetype Card */}
        {archetype && archetypeInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className={cn(
              'rounded-2xl border p-6 md:p-8 bg-gradient-to-br',
              archetypeInfo.color.replace('from-', 'from-').replace('to-', 'to-').replace('500', '500/20')
            )}>
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br',
                  archetypeInfo.color
                )}>
                  <archetypeInfo.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Your Archetype</p>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{archetype}</h2>
                  <p className="text-muted-foreground mb-3">{archetypeInfo.description}</p>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{archetypeInfo.strength}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Link href="/sales-dashboard/profile">
                    <Button variant="outline" size="sm" className="gap-2 w-full">
                      View Profile
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  {!hasFullDiagnostic && (
                    <Link href="/diagnostic/full">
                      <Button size="sm" className="gap-2 w-full">
                        <BookOpen className="w-4 h-4" />
                        Go Deeper
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={action.href}
                href={action.disabled ? '#' : action.href}
                className={cn(
                  'glass rounded-xl border border-border/50 p-5 transition-all group',
                  action.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary/30 hover:shadow-lg'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border', action.color)}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{action.title}</h3>
                      {action.disabled && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                  {!action.disabled && (
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        {recentCheckIns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Check-ins</h2>
            <div className="glass rounded-xl border border-border/50 p-6">
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">{day}</p>
                    <div className="w-full aspect-square rounded-lg bg-secondary/50 flex items-center justify-center">
                      <span className="text-lg">-</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {recentCheckIns.length} check-ins this week
                </p>
                <Link href="/sales-dashboard/progress" className="text-sm text-primary hover:underline">
                  View all →
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Take Assessment CTA (if no archetype) */}
        {!archetype && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Discover Your Sales Wellbeing Pattern
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Take our 3-minute assessment to learn your archetype and get personalized tips for your sales journey.
              </p>
              <Link href="/diagnostic">
                <Button size="lg" className="gap-2">
                  Take Assessment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </SalesDashboardLayout>
  );
}
