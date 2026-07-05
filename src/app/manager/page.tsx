'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  ArrowLeft,
  Users,
  AlertTriangle,
  TrendingUp,
  Activity,
  Target,
  Lightbulb,
  Flame,
  CheckCircle2,
  UserPlus,
  Building2,
  PieChart,
  BarChart3,
  ChevronRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useSafeUser } from '@/lib/safe-auth';
import { MobileHeader } from '@/components/MobileHeader';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  profile: string | null;
  lastCheckIn: string | null;
  avgScore: number | null;
}

interface Team {
  id: string;
  name: string;
  memberCount: number;
  members: TeamMember[];
}

interface ManagerData {
  company: {
    id: string;
    name: string;
    planType: string;
    totalMembers: number;
    totalTeams: number;
  };
  archetypeDistribution: {
    Driver: number;
    Strategist: number;
    Connector: number;
    Reactor: number;
  };
  riskZones: {
    burnout: Array<{ userId: string; name: string; score: number }>;
    lowConfidence: Array<{ userId: string; name: string; score: number }>;
    decliningTrend: Array<{ userId: string; name: string; trend: string }>;
  };
  engagement: {
    activeThisWeek: number;
    totalMembers: number;
    engagementRate: number;
    totalCheckIns: number;
  };
  teams: Team[];
  userRole: string;
}

const ARCHETYPE_CONFIG = {
  Driver: { color: 'bg-red-500', textColor: 'text-red-500', icon: Target },
  Strategist: { color: 'bg-blue-500', textColor: 'text-blue-500', icon: Lightbulb },
  Connector: { color: 'bg-green-500', textColor: 'text-green-500', icon: Users },
  Reactor: { color: 'bg-amber-500', textColor: 'text-amber-500', icon: AlertTriangle },
};

export default function ManagerDashboard() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useSafeUser();

  const [data, setData] = useState<ManagerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

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
      fetchManagerData();
    }
  }, [isSignedIn]);

  const fetchManagerData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/manager');
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || result.error || 'Failed to load dashboard');
      } else {
        setData(result);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
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

  const totalArchetypes = data 
    ? Object.values(data.archetypeDistribution).reduce((a, b) => a + b, 0) 
    : 0;

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
        title="Manager Dashboard"
        subtitle="Team insights"
        icon="users"
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-premium">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Manager Dashboard</h1>
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
              <p className="text-muted-foreground">Loading team data...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="glass rounded-2xl border border-red-500/30 p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Access Required</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link
                href="/home"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {/* Manager Dashboard Content */}
          {data && !isLoading && (
            <>
              {/* Company Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{data.company.name}</h2>
                    <p className="text-muted-foreground">
                      {data.company.totalMembers} members • {data.company.totalTeams} teams
                    </p>
                  </div>
                  <div className="ml-auto hidden md:block">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {data.userRole.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{data.company.totalMembers}</p>
                    <p className="text-xs text-muted-foreground">Total Members</p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <Activity className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{data.engagement.engagementRate}%</p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {data.riskZones.burnout.length + data.riskZones.lowConfidence.length}
                    </p>
                    <p className="text-xs text-muted-foreground">At Risk</p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{data.engagement.totalCheckIns}</p>
                    <p className="text-xs text-muted-foreground">Check-ins (30d)</p>
                  </div>
                </div>
              </motion.div>

              {/* Archetype Distribution & Risk Zones */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Archetype Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <PieChart className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Team Archetypes</h3>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(data.archetypeDistribution).map(([archetype, count]) => {
                      const config = ARCHETYPE_CONFIG[archetype as keyof typeof ARCHETYPE_CONFIG];
                      const percentage = totalArchetypes > 0 
                        ? Math.round((count / totalArchetypes) * 100) 
                        : 0;

                      return (
                        <div key={archetype} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={cn('w-3 h-3 rounded-full', config.color)} />
                              <span className="font-medium text-foreground">{archetype}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', config.color)}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Risk Zones */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass rounded-2xl border border-red-500/20 p-6 shadow-premium"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-semibold text-foreground">Risk Zones</h3>
                  </div>

                  {data.riskZones.burnout.length === 0 && 
                   data.riskZones.lowConfidence.length === 0 &&
                   data.riskZones.decliningTrend.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-muted-foreground">No risk indicators detected</p>
                      <p className="text-xs text-muted-foreground mt-1">Team wellbeing looks stable</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.riskZones.burnout.length > 0 && (
                        <div className="bg-red-500/10 rounded-xl p-4">
                          <p className="text-sm font-medium text-red-500 mb-2">Burnout Risk</p>
                          {data.riskZones.burnout.map(user => (
                            <div key={user.userId} className="flex items-center justify-between py-1">
                              <span className="text-sm text-foreground">{user.name}</span>
                              <span className="text-xs text-red-400">Energy: {user.score}%</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {data.riskZones.lowConfidence.length > 0 && (
                        <div className="bg-amber-500/10 rounded-xl p-4">
                          <p className="text-sm font-medium text-amber-500 mb-2">Low Confidence</p>
                          {data.riskZones.lowConfidence.map(user => (
                            <div key={user.userId} className="flex items-center justify-between py-1">
                              <span className="text-sm text-foreground">{user.name}</span>
                              <span className="text-xs text-amber-400">Confidence: {user.score}%</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {data.riskZones.decliningTrend.length > 0 && (
                        <div className="bg-blue-500/10 rounded-xl p-4">
                          <p className="text-sm font-medium text-blue-500 mb-2">Declining Trend</p>
                          {data.riskZones.decliningTrend.map(user => (
                            <div key={user.userId} className="flex items-center justify-between py-1">
                              <span className="text-sm text-foreground">{user.name}</span>
                              <span className="text-xs text-blue-400">{user.trend}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Teams List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Teams</h3>
                  </div>
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    Create Team
                  </button>
                </div>

                {data.teams.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No teams created yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Create your first team to start tracking</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.teams.map(team => (
                      <button
                        key={team.id}
                        onClick={() => setSelectedTeam(selectedTeam?.id === team.id ? null : team)}
                        className="w-full bg-secondary/50 hover:bg-secondary/80 rounded-xl p-4 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">{team.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <ChevronRight className={cn(
                            'w-5 h-5 text-muted-foreground transition-transform',
                            selectedTeam?.id === team.id && 'rotate-90'
                          )} />
                        </div>

                        {/* Expanded team members */}
                        {selectedTeam?.id === team.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-4 pt-4 border-t border-border/50"
                          >
                            <div className="space-y-2">
                              {team.members.map(member => {
                                const profileConfig = member.profile 
                                  ? ARCHETYPE_CONFIG[member.profile as keyof typeof ARCHETYPE_CONFIG]
                                  : null;

                                return (
                                  <div
                                    key={member.id}
                                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-medium text-primary">
                                          {(member.name || member.email || '?')[0].toUpperCase()}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                                        {member.profile && (
                                          <p className={cn('text-xs', profileConfig?.textColor)}>
                                            {member.profile}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      {member.avgScore !== null ? (
                                        <span className={cn(
                                          'text-sm font-medium',
                                          member.avgScore >= 60 ? 'text-green-500' :
                                          member.avgScore >= 40 ? 'text-amber-500' : 'text-red-500'
                                        )}>
                                          {member.avgScore}%
                                        </span>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">No data</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Engagement Trend Placeholder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Engagement Overview</h3>
                  </div>
                  <span className="text-sm text-muted-foreground">Last 30 days</span>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Active This Week</p>
                    <p className="text-3xl font-bold text-foreground">
                      {data.engagement.activeThisWeek}
                      <span className="text-sm font-normal text-muted-foreground">/{data.engagement.totalMembers}</span>
                    </p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total Check-ins</p>
                    <p className="text-3xl font-bold text-foreground">{data.engagement.totalCheckIns}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
                    <p className="text-3xl font-bold text-green-500">{data.engagement.engagementRate}%</p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
