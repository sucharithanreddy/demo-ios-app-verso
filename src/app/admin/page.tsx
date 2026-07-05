'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  ArrowLeft,
  Building2,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  BarChart3,
  Download,
  Key,
  Settings,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useSafeUser } from '@/lib/safe-auth';
import { MobileHeader } from '@/components/MobileHeader';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface AdminData {
  company: {
    id: string;
    name: string;
    planType: string;
    maxUsers: number;
    totalMembers: number;
    totalTeams: number;
  };
  metrics: {
    last30Days: { checkIns: number; avgScore: number; activeUsers: number };
    last60Days: { checkIns: number; avgScore: number; activeUsers: number };
    last90Days: { checkIns: number; avgScore: number; activeUsers: number };
    engagementRate: number;
    wellbeingTrend: number;
  };
  weeklyTrend: Array<{ week: string; checkIns: number; avgScore: number }>;
  retentionRisk: {
    count: number;
    percentage: number;
    users: Array<{ userId: string; name: string; risk: string; lastActive: string }>;
  };
  unlockCodes: {
    total: number;
    used: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useSafeUser();

  const [data, setData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      fetchAdminData();
    }
  }, [isSignedIn]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin');
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || result.error || 'Failed to load dashboard');
      } else {
        setData(result);
      }
    } catch (err) {
      setError('Failed to load admin data');
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
        title="Admin Dashboard"
        subtitle="Company ROI & metrics"
        icon="settings"
        onToggleDark={toggleDark}
        isDark={isDark}
      />

      <header className="sticky top-0 z-50 hide-on-mobile">
        <div className="glass border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/home" className="p-2 rounded-xl hover:bg-secondary/80 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-premium">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
                  <p className="text-xs text-muted-foreground">
                    {data?.company.name || 'Loading...'}
                  </p>
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

      <main className="relative z-10 pb-8 px-4 md:px-6 pt-6 md:pt-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading company data...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="glass rounded-2xl border border-red-500/30 p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link
                href="/manager"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
              >
                Go to Manager Dashboard
              </Link>
            </div>
          )}

          {/* Admin Dashboard Content */}
          {data && !isLoading && (
            <>
              {/* Company Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{data.company.name}</h2>
                      <p className="text-muted-foreground">
                        {data.company.totalMembers} / {data.company.maxUsers} seats used
                      </p>
                    </div>
                  </div>
                  <span className="px-4 py-2 rounded-full bg-accent/10 text-accent font-medium">
                    {data.company.planType}
                  </span>
                </div>

                {/* Progress bar for seats */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">License Utilization</span>
                    <span className="font-medium text-foreground">
                      {Math.round((data.company.totalMembers / data.company.maxUsers) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      style={{ width: `${(data.company.totalMembers / data.company.maxUsers) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* ROI Cards */}
              <div className="grid md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 text-green-500" />
                    <span className="text-xs text-muted-foreground">30 days</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{data.metrics.engagementRate}%</p>
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
                >
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                    {data.metrics.wellbeingTrend > 0 ? (
                      <span className="text-xs text-green-500 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +{data.metrics.wellbeingTrend}%
                      </span>
                    ) : data.metrics.wellbeingTrend < 0 ? (
                      <span className="text-xs text-red-500 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        {data.metrics.wellbeingTrend}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Stable</span>
                    )}
                  </div>
                  <p className="text-3xl font-bold text-foreground">{data.metrics.last30Days.avgScore}%</p>
                  <p className="text-sm text-muted-foreground">Wellbeing Score</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8 text-purple-500" />
                    <span className="text-xs text-muted-foreground">Total</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{data.metrics.last30Days.checkIns}</p>
                  <p className="text-sm text-muted-foreground">Check-ins (30d)</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
                >
                  <div className="flex items-center justify-between mb-4">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                    <span className="text-xs text-muted-foreground">At risk</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{data.retentionRisk.percentage}%</p>
                  <p className="text-sm text-muted-foreground">Retention Risk</p>
                </motion.div>
              </div>

              {/* Weekly Trend & Retention Risk */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Weekly Trend Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-6 h-6 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">8-Week Trend</h3>
                    </div>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      View Details
                    </button>
                  </div>

                  {/* Simple bar chart */}
                  <div className="flex items-end justify-between h-40 gap-2">
                    {data.weeklyTrend.map((week, index) => (
                      <div key={week.week} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className={cn(
                            'w-full rounded-t transition-all',
                            index === data.weeklyTrend.length - 1 
                              ? 'bg-gradient-to-t from-primary to-accent' 
                              : 'bg-primary/40'
                          )}
                          style={{ height: `${Math.max(week.avgScore, 5)}%` }}
                        />
                        <span className="text-[10px] text-muted-foreground">{week.week.replace('Week ', 'W')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-primary/40" />
                      <span className="text-muted-foreground">Avg Score</span>
                    </div>
                    <span className="font-medium text-foreground">
                      Latest: {data.weeklyTrend[data.weeklyTrend.length - 1]?.avgScore || 0}%
                    </span>
                  </div>
                </motion.div>

                {/* Retention Risk */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="glass rounded-2xl border border-red-500/20 p-6 shadow-premium"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                      <h3 className="text-lg font-semibold text-foreground">Retention Risk</h3>
                    </div>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium',
                      data.retentionRisk.percentage > 30 
                        ? 'bg-red-500/10 text-red-500'
                        : data.retentionRisk.percentage > 15
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-green-500/10 text-green-500'
                    )}>
                      {data.retentionRisk.count} users
                    </span>
                  </div>

                  {data.retentionRisk.count === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-muted-foreground">All users are engaged</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.retentionRisk.users.map(user => (
                        <div
                          key={user.userId}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                        >
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Last active: {user.lastActive === 'Never' ? 'Never' : new Date(user.lastActive).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            user.risk === 'inactive' 
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-amber-500/10 text-amber-500'
                          )}>
                            {user.risk === 'inactive' ? 'Inactive' : 'At Risk'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid md:grid-cols-3 gap-4"
              >
                <Link
                  href="/manager"
                  className="glass rounded-2xl border border-border/50 p-6 shadow-premium hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Manager View</h4>
                      <p className="text-sm text-muted-foreground">Team-level insights</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                  </div>
                </Link>

                <button className="glass rounded-2xl border border-border/50 p-6 shadow-premium hover:border-primary/30 transition-all text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Key className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Generate Codes</h4>
                      <p className="text-sm text-muted-foreground">Create invite codes</p>
                    </div>
                  </div>
                </button>

                <button className="glass rounded-2xl border border-border/50 p-6 shadow-premium hover:border-primary/30 transition-all text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Download className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Export Report</h4>
                      <p className="text-sm text-muted-foreground">Download CSV</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
