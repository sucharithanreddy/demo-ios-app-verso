'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  MessageCircle,
  Zap,
  Target,
  Flame,
  Crown,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export default function PerformancePage() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const streakResponse = await fetch('/api/streak');
        if (streakResponse.ok) {
          setStreakData(await streakResponse.json());
        }
      } catch (e) {
        console.log('Streak data not available');
      }
      
      const access = localStorage.getItem('verso_full_access');
      setHasFullAccess(access === 'true');
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="Performance" subtitle="Track your mental health journey">
        <div className="flex items-center justify-center py-20">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-xl bg-primary/20 animate-pulse" />
            <div className="absolute inset-2 rounded-lg bg-primary/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="absolute inset-3 rounded bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Performance" subtitle="Track your mental health journey">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Premium Gate */}
        {!hasFullAccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-8 text-center"
          >
            <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Unlock Performance Tracking</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Track your mood, energy, and confidence over time. Identify patterns and see how your wellbeing impacts your performance.
            </p>
            <Link href="/pricing">
              <Button className="gap-2">
                Upgrade to Premium
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className={cn(!hasFullAccess && 'blur-sm pointer-events-none')}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background rounded-2xl border border-border/50 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-muted-foreground">Current Streak</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{streakData?.currentStreak || 0}</p>
              <p className="text-xs text-muted-foreground">days</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-background rounded-2xl border border-border/50 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Best Streak</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{streakData?.longestStreak || 0}</p>
              <p className="text-xs text-muted-foreground">days</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-background rounded-2xl border border-border/50 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">This Week</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{streakData?.weeklyAverages.count || 0}</p>
              <p className="text-xs text-muted-foreground">check-ins</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-background rounded-2xl border border-border/50 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Avg Score</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {streakData?.weeklyAverages.count 
                  ? ((streakData.weeklyAverages.mood + streakData.weeklyAverages.energy + streakData.weeklyAverages.confidence) / 3).toFixed(1)
                  : '0.0'
                }
              </p>
              <p className="text-xs text-muted-foreground">out of 5</p>
            </motion.div>
          </div>

          {/* Weekly Averages */}
          {streakData && streakData.weeklyAverages.count > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-background rounded-2xl border border-border/50 p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Averages</h3>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{streakData.weeklyAverages.mood}</p>
                  <p className="text-sm text-muted-foreground">Mood</p>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-3">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(streakData.weeklyAverages.mood / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-yellow-500" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{streakData.weeklyAverages.energy}</p>
                  <p className="text-sm text-muted-foreground">Energy</p>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-3">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${(streakData.weeklyAverages.energy / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{streakData.weeklyAverages.confidence}</p>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-3">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(streakData.weeklyAverages.confidence / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Trend Chart */}
              {streakData.weeklyCheckIns && streakData.weeklyCheckIns.length > 1 && (
                <div className="mt-8 pt-6 border-t border-border/50">
                  <h4 className="text-sm font-semibold text-foreground mb-4">7-Day Trend</h4>
                  <div className="flex items-end justify-between h-32 gap-2">
                    {streakData.weeklyCheckIns.slice(-7).map((checkIn, index) => {
                      const avgHeight = ((checkIn.mood + checkIn.energy + checkIn.confidence) / 3 / 5) * 100;
                      const date = new Date(checkIn.date);
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t transition-all hover:from-primary hover:to-primary/80"
                            style={{ height: `${avgHeight}%`, minHeight: '8px' }}
                            title={`Mood: ${checkIn.mood}, Energy: ${checkIn.energy}, Confidence: ${checkIn.confidence}`}
                          />
                          <span className="text-xs text-muted-foreground mt-2">{dayName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* No Data Yet */}
          {(!streakData || streakData.weeklyAverages.count === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-background rounded-2xl border border-border/50 p-8 text-center"
            >
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Data Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start checking in daily to see your performance trends.
              </p>
              <Link href="/checkin">
                <Button className="gap-2">
                  Start Daily Check-in
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          )}

          {/* AI Chat Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-background rounded-2xl border border-border/50 p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">AI Therapy Progress</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Track insights and breakthroughs from your conversations with the AI Therapy Engine.
                </p>
                <Link href="/progress">
                  <Button variant="outline" size="sm" className="gap-2">
                    View AI Chat Progress
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
