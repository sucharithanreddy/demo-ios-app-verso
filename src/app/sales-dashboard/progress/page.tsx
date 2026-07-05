'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Target,
  Heart,
  Brain,
  Award,
  Flame,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { SalesDashboardLayout } from '@/components/dashboard/SalesDashboardLayout';
import { cn } from '@/lib/utils';

interface CheckInData {
  id: string;
  date: string;
  mood: number;
  energy: number;
  confidence: number;
  impactTags?: string[];
}

export default function SalesProgressPage() {
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'mood' | 'energy' | 'confidence'>('mood');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch check-ins
        const checkinRes = await fetch('/api/checkin?limit=30');
        const checkinData = await checkinRes.json();
        if (checkinData.checkIns) {
          setCheckIns(checkinData.checkIns);
        }

        // Fetch streak
        const streakRes = await fetch('/api/streak');
        const streakData = await streakRes.json();
        if (streakData.streak) {
          setStreak(streakData.streak.currentStreak || 0);
          setLongestStreak(streakData.streak.longestStreak || 0);
        }
      } catch (e) {
        // Use localStorage fallback
        const stored = localStorage.getItem('salesCheckIns');
        if (stored) {
          setCheckIns(JSON.parse(stored));
        }
        const streakStored = localStorage.getItem('userStreak');
        if (streakStored) {
          const s = JSON.parse(streakStored);
          setStreak(s.currentStreak || 0);
          setLongestStreak(s.longestStreak || 0);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateAverage = (metric: 'mood' | 'energy' | 'confidence') => {
    if (checkIns.length === 0) return 0;
    const sum = checkIns.reduce((acc, c) => acc + (c[metric] || 0), 0);
    return (sum / checkIns.length).toFixed(1);
  };

  const getTrend = (metric: 'mood' | 'energy' | 'confidence') => {
    if (checkIns.length < 3) return 'stable';
    const recent = checkIns.slice(0, Math.floor(checkIns.length / 2));
    const older = checkIns.slice(Math.floor(checkIns.length / 2));
    
    const recentAvg = recent.reduce((acc, c) => acc + (c[metric] || 0), 0) / recent.length;
    const olderAvg = older.reduce((acc, c) => acc + (c[metric] || 0), 0) / older.length;
    
    if (recentAvg > olderAvg + 0.3) return 'up';
    if (recentAvg < olderAvg - 0.3) return 'down';
    return 'stable';
  };

  // Simple chart component
  const SimpleChart = ({ data, metric }: { data: CheckInData[]; metric: 'mood' | 'energy' | 'confidence' }) => {
    if (data.length === 0) return null;
    
    const reversedData = [...data].reverse().slice(-14);
    const maxValue = 5;
    const width = 100;
    const height = 60;
    
    const points = reversedData.map((d, i) => {
      const x = (i / (reversedData.length - 1 || 1)) * width;
      const y = height - ((d[metric] || 0) / maxValue) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.45 0.2 270)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="oklch(0.45 0.2 270)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill="url(#chartGradient)"
        />
        <polyline
          points={points}
          fill="none"
          stroke="oklch(0.45 0.2 270)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {reversedData.map((d, i) => {
          const x = (i / (reversedData.length - 1 || 1)) * width;
          const y = height - ((d[metric] || 0) / maxValue) * height;
          return (
            <circle
              key={d.id || i}
              cx={x}
              cy={y}
              r="2"
              fill="oklch(0.45 0.2 270)"
            />
          );
        })}
      </svg>
    );
  };

  // Calendar heatmap for last 30 days
  const CalendarHeatmap = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const hasCheckIn = checkIns.some((c) => {
        const checkInDate = new Date(c.date).toISOString().split('T')[0];
        return checkInDate === dateStr;
      });
      
      days.push({
        date: dateStr,
        dayNum: date.getDate(),
        hasCheckIn,
      });
    }

    return (
      <div className="grid grid-cols-10 gap-1">
        {days.map((day, i) => (
          <div
            key={i}
            className={cn(
              'aspect-square rounded text-xs flex items-center justify-center',
              day.hasCheckIn
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            )}
            title={day.date}
          >
            {day.dayNum}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
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

  return (
    <SalesDashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Your Progress</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Flame, label: 'Current Streak', value: `${streak} days`, color: 'text-orange-500' },
            { icon: Award, label: 'Longest Streak', value: `${longestStreak} days`, color: 'text-yellow-500' },
            { icon: Heart, label: 'Avg Mood', value: calculateAverage('mood'), color: 'text-pink-500' },
            { icon: Brain, label: 'Avg Confidence', value: calculateAverage('confidence'), color: 'text-blue-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl border border-border/50 p-4"
            >
              <stat.icon className={cn('w-5 h-5 mb-2', stat.color)} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl border border-border/50 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Trends</h2>
            <div className="flex gap-2">
              {(['mood', 'energy', 'confidence'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    selectedMetric === metric
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {checkIns.length > 0 ? (
            <>
              <SimpleChart data={checkIns} metric={selectedMetric} />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <span className="text-sm text-muted-foreground">
                  Last {Math.min(checkIns.length, 14)} check-ins
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">Trend:</span>
                  <span
                    className={cn(
                      'text-sm font-medium px-2 py-0.5 rounded',
                      getTrend(selectedMetric) === 'up' && 'bg-green-500/10 text-green-600',
                      getTrend(selectedMetric) === 'down' && 'bg-red-500/10 text-red-600',
                      getTrend(selectedMetric) === 'stable' && 'bg-secondary text-muted-foreground'
                    )}
                  >
                    {getTrend(selectedMetric) === 'up' && '↑ Improving'}
                    {getTrend(selectedMetric) === 'down' && '↓ Declining'}
                    {getTrend(selectedMetric) === 'stable' && '→ Stable'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No check-ins yet. Start tracking your progress!</p>
              <Link href="/sales-dashboard/checkin" className="text-primary hover:underline mt-2 inline-block">
                Do your first check-in →
              </Link>
            </div>
          )}
        </motion.div>

        {/* Calendar Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl border border-border/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Activity Calendar</h2>
            <span className="text-sm text-muted-foreground">Last 30 days</span>
          </div>
          <CalendarHeatmap />
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary" />
              <span>Checked in</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-secondary" />
              <span>No check-in</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        {checkIns.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <Link
              href="/sales-dashboard/checkin"
              className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-90 transition-all"
            >
              Start Your First Check-in
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </div>
    </SalesDashboardLayout>
  );
}
