'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Target,
  Brain,
  Sparkles,
  Award,
  ChevronLeft,
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { MoodTracker } from '@/components/features/MoodTracker';
import { GratitudeJournal } from '@/components/features/GratitudeJournal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Stats {
  totalSessions: number;
  completedSessions: number;
  totalReframes: number;
  topDistortions: { type: string; count: number }[];
  topEmotions: { emotion: string; count: number }[];
  averageMood: number;
  moodTrend: 'up' | 'down' | 'stable';
  gratitudeCount: number;
  streakDays: number;
  layerProgress: { layer: string; count: number; percentage: number }[];
  coreBeliefs: string[];
  averageSessionDepth: number;
}

interface MoodEntry {
  id: string;
  mood: number;
  createdAt: string;
}

type Session = {
  id: string;
  title?: string | null;
  summary?: string | null;
  coreBelief?: string | null;
  currentLayer?: string | null;
  isCompleted?: boolean;
  createdAt?: string;
  messages?: any[];
};

function safeLower(s: unknown) {
  return (typeof s === 'string' ? s : '').toLowerCase();
}

// Prefer both naming conventions because your app stores fields in multiple places
function getDistortionFromMessage(msg: any): string {
  const v =
    msg?.distortionType ??
    msg?.thoughtPattern ??
    msg?.thought_pattern ??
    msg?.meta?.distortionType ??
    msg?.meta?.thoughtPattern ??
    '';
  return typeof v === 'string' ? v.trim() : '';
}

function getLayerFromSession(s: Session): string {
  const layer = (s?.currentLayer || 'surface').toString();
  // normalize possible variants
  if (layer === 'core_belief') return 'coreBelief';
  if (layer === 'corebelief') return 'coreBelief';
  return layer;
}

export default function ProgressPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);

    try {
      // ✅ cache-bust param + no-store prevents stale progress numbers
      const ts = Date.now();

      const [sessionsRes, moodRes, gratitudeRes] = await Promise.all([
        fetch(`/api/sessions?ts=${ts}`, { cache: 'no-store' }),
        fetch(`/api/mood?days=30&ts=${ts}`, { cache: 'no-store' }),
        fetch(`/api/gratitude?limit=100&ts=${ts}`, { cache: 'no-store' }),
      ]);

      if (!sessionsRes.ok) {
        const t = await sessionsRes.text();
        throw new Error(`/api/sessions failed: ${sessionsRes.status} ${t}`);
      }
      if (!moodRes.ok) {
        const t = await moodRes.text();
        throw new Error(`/api/mood failed: ${moodRes.status} ${t}`);
      }
      if (!gratitudeRes.ok) {
        const t = await gratitudeRes.text();
        throw new Error(`/api/gratitude failed: ${gratitudeRes.status} ${t}`);
      }

      const sessionsData = await sessionsRes.json();
      const moodData = await moodRes.json();
      const gratitudeData = await gratitudeRes.json();

      const sessions: Session[] = Array.isArray(sessionsData?.sessions) ? sessionsData.sessions : [];

      // ✅ If your API is paginating/limiting sessions, stats will be wrong.
      // This log helps you detect it immediately.
      if (sessions.length > 0 && sessions.length < 50) {
        console.warn(
          `[Progress] /api/sessions returned ${sessions.length} sessions. If you expect ~94, your sessions API is probably paginated/limited.`
        );
      }

      // Stable ordering
      const sessionsSorted = [...sessions].sort((a, b) => {
        const ta = new Date(a.createdAt || 0).getTime();
        const tb = new Date(b.createdAt || 0).getTime();
        return tb - ta;
      });

      const completedSessions = sessionsSorted.filter((s) => !!s.isCompleted);

      // Flatten messages (safe)
      const totalMessages = sessionsSorted.flatMap((s) => (Array.isArray(s.messages) ? s.messages : []));

      // ----- Distortions -----
      const distortionCounts: Record<string, number> = {};
      for (const msg of totalMessages) {
        const d = getDistortionFromMessage(msg);
        if (d) distortionCounts[d] = (distortionCounts[d] || 0) + 1;
      }

      const topDistortions = Object.entries(distortionCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // ----- Layer progress (by session currentLayer) -----
      const layerCounts: Record<string, number> = { surface: 0, trigger: 0, emotion: 0, coreBelief: 0 };
      for (const s of sessionsSorted) {
        const layer = getLayerFromSession(s);
        if (layerCounts[layer] !== undefined) layerCounts[layer]++;
        else layerCounts.surface++; // fallback
      }

      const layerOrder = ['surface', 'trigger', 'emotion', 'coreBelief'];
      const layerProgress = layerOrder.map((layer) => ({
        layer,
        count: layerCounts[layer],
        percentage: sessionsSorted.length > 0 ? Math.round((layerCounts[layer] / sessionsSorted.length) * 100) : 0,
      }));

      // Avg depth
      const layerDepth: Record<string, number> = { surface: 0, trigger: 1, emotion: 2, coreBelief: 3 };
      const averageSessionDepth =
        sessionsSorted.length > 0
          ? sessionsSorted.reduce((sum, s) => sum + (layerDepth[getLayerFromSession(s)] ?? 0), 0) / sessionsSorted.length
          : 0;

      // Core beliefs
      const coreBeliefs: string[] = sessionsSorted
        .map((s) => (typeof s.coreBelief === 'string' ? s.coreBelief.trim() : ''))
        .filter((b) => b.length > 0)
        .slice(0, 5);

      // ----- Emotions (basic keyword scan, but safer) -----
      const emotionPatterns = [
        'anxious',
        'sad',
        'angry',
        'ashamed',
        'exhausted',
        'confused',
        'disappointed',
        'inadequate',
        'unsettled',
        'overwhelmed',
        'scared',
        'worried',
      ];

      const emotionCounts: Record<string, number> = {};
      for (const msg of totalMessages) {
        const text = `${safeLower(msg?.content)} ${safeLower(msg?.layerInsight)}`;
        for (const e of emotionPatterns) {
          if (text.includes(e)) emotionCounts[e] = (emotionCounts[e] || 0) + 1;
        }
      }

      const topEmotions = Object.entries(emotionCounts)
        .map(([emotion, count]) => ({ emotion, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Mood trend
      const entries: MoodEntry[] = Array.isArray(moodData?.entries) ? moodData.entries : [];
      setMoodHistory(entries);

      const recentMoods = entries.slice(0, 7);
      let moodTrend: 'up' | 'down' | 'stable' = 'stable';
      if (recentMoods.length >= 3) {
        const half = Math.floor(recentMoods.length / 2);
        const firstHalf = recentMoods.slice(0, half);
        const secondHalf = recentMoods.slice(half);
        const firstAvg = firstHalf.reduce((sum, e) => sum + e.mood, 0) / (firstHalf.length || 1);
        const secondAvg = secondHalf.reduce((sum, e) => sum + e.mood, 0) / (secondHalf.length || 1);
        if (secondAvg > firstAvg + 0.5) moodTrend = 'up';
        else if (secondAvg < firstAvg - 0.5) moodTrend = 'down';
      }

      // Streak (mood-based)
      const today = new Date();
      let streakDays = 0;
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const hasEntry = entries.some((e) => new Date(e.createdAt).toDateString() === checkDate.toDateString());
        if (hasEntry) streakDays++;
        else if (i > 0) break;
      }

      const gratitudeCount = Array.isArray(gratitudeData?.entries) ? gratitudeData.entries.length : 0;

      setStats({
        totalSessions: sessionsSorted.length,
        completedSessions: completedSessions.length,
        // ✅ totalReframes should count assistant outputs that actually had a distortion/thoughtPattern
        totalReframes: totalMessages.filter((m: any) => !!getDistortionFromMessage(m)).length,
        topDistortions,
        topEmotions,
        averageMood: moodData?.stats?.averageMood ?? 0,
        moodTrend,
        gratitudeCount,
        streakDays,
        layerProgress,
        coreBeliefs,
        averageSessionDepth,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(null);
      setMoodHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Simple mood chart (SVG)
  const MoodChart = ({ data }: { data: MoodEntry[] }) => {
    if (!data?.length) return null;

    const reversedData = [...data].reverse().slice(-14);
    const maxMood = 10;
    const chartWidth = 300;
    const chartHeight = 100;
    const padding = 10;

    const points = reversedData
      .map((entry, index) => {
        const x = padding + (index / (reversedData.length - 1 || 1)) * (chartWidth - padding * 2);
        const y = chartHeight - padding - (entry.mood / maxMood) * (chartHeight - padding * 2);
        return `${x},${y}`;
      })
      .join(' ');

    const areaPoints = `${padding},${chartHeight - padding} ${points} ${chartWidth - padding},${chartHeight - padding}`;

    return (
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32">
        <defs>
          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#moodGradient)" />
        <polyline
          points={points}
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {reversedData.map((entry, index) => {
          const x = padding + (index / (reversedData.length - 1 || 1)) * (chartWidth - padding * 2);
          const y = chartHeight - padding - (entry.mood / maxMood) * (chartHeight - padding * 2);
          return <circle key={entry.id} cx={x} cy={y} r="3" fill="rgb(59, 130, 246)" />;
        })}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Your Progress
                </h1>
                <p className="text-xs text-gray-500">Track your mental wellness journey</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={fetchStats}>
              Refresh
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-lg rounded-2xl border border-blue-100 p-4">
                <div className="flex items-center gap-2 text-blue-500 mb-2">
                  <Target className="w-5 h-5" />
                  <span className="text-sm font-medium">Sessions</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats?.totalSessions || 0}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-lg rounded-2xl border border-blue-100 p-4">
                <div className="flex items-center gap-2 text-teal-500 mb-2">
                  <Award className="w-5 h-5" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats?.completedSessions || 0}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-lg rounded-2xl border border-blue-100 p-4">
                <div className="flex items-center gap-2 text-sky-500 mb-2">
                  <Brain className="w-5 h-5" />
                  <span className="text-sm font-medium">Reframes</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats?.totalReframes || 0}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/80 backdrop-blur-lg rounded-2xl border border-blue-100 p-4">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Streak</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats?.streakDays || 0} days</p>
              </motion.div>
            </div>

            {moodHistory.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/80 backdrop-blur-lg rounded-2xl border border-blue-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Mood Trend</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Avg: {stats?.averageMood}/10</span>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        stats?.moodTrend === 'up' && 'text-teal-500',
                        stats?.moodTrend === 'down' && 'text-rose-500',
                        stats?.moodTrend === 'stable' && 'text-gray-500'
                      )}
                    >
                      {stats?.moodTrend === 'up' && '↑ Improving'}
                      {stats?.moodTrend === 'down' && '↓ Declining'}
                      {stats?.moodTrend === 'stable' && '→ Stable'}
                    </span>
                  </div>
                </div>
                <MoodChart data={moodHistory} />
              </motion.div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <MoodTracker onMoodLogged={fetchStats} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <GratitudeJournal />
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
