'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Heart,
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Activity,
  TrendingFlat,
  Sparkles,
  Shield,
  HeartHandshake,
} from 'lucide-react';
import { ManagerDashboardLayout } from '@/components/dashboard/ManagerDashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  archetype: string | null;
  streak: number;
  scores: {
    mood: number;
    energy: number;
    confidence: number;
    overall: number;
  };
  trend: string;
  riskLevel: 'green' | 'yellow' | 'red';
  category: 'thriving' | 'stable' | 'needsSupport';
  checkIns: {
    total: number;
    lastCheckIn: string | null;
  };
}

interface NPSDistribution {
  thriving: { count: number; percentage: number; label: string; description: string; color: string };
  stable: { count: number; percentage: number; label: string; description: string; color: string };
  needsSupport: { count: number; percentage: number; label: string; description: string; color: string };
}

interface TeamData {
  totalMembers: number;
  members: TeamMember[];
  averages: {
    mood: number;
    energy: number;
    confidence: number;
    overall: number;
  };
  nps: {
    score: number;
    distribution: NPSDistribution;
    label: string;
    trend: string;
  };
  participation: {
    rate: number;
    activeMembers: number;
    optimalCheckIns: number;
    description: string;
  };
  riskDistribution: {
    green: number;
    yellow: number;
    red: number;
  };
  archetypeDistribution: {
    Driver: number;
    Strategist: number;
    Connector: number;
    Reactor: number;
    Unknown: number;
  };
}

export default function ManagerDashboardPage() {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const res = await fetch('/api/manager/team');
        if (res.ok) {
          const data = await res.json();
          setTeamData(data.team);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamData();
  }, []);

  if (isLoading) {
    return (
      <ManagerDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-purple-500/20 animate-pulse" />
            <div className="absolute inset-2 rounded-xl bg-purple-500/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="absolute inset-4 rounded-lg bg-purple-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </ManagerDashboardLayout>
    );
  }

  if (!teamData || teamData.totalMembers === 0) {
    return (
      <ManagerDashboardLayout>
        <div className="max-w-xl mx-auto">
          <div className="glass rounded-2xl border border-border/50 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No Team Members Yet</h2>
            <p className="text-muted-foreground mb-6">
              Share your manager code with your team members. They can link to you from their profile page.
            </p>
            <Link href="/manager-dashboard/patterns">
              <Button className="gap-2">
                View Instructions
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </ManagerDashboardLayout>
    );
  }

  const needsSupportMembers = teamData.members.filter(m => m.category === 'needsSupport');
  const { nps, participation } = teamData;

  return (
    <ManagerDashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Manager Dashboard</h1>
          <p className="text-muted-foreground">Monitor your team's mental wellbeing and performance</p>
        </div>

        {/* NPS Team Health Score - HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-border/50 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: NPS Score */}
            <div className="flex items-center gap-6">
              <div className={cn(
                'w-24 h-24 rounded-2xl flex items-center justify-center',
                nps.score >= 50 ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                nps.score >= 20 ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                nps.score >= 0 ? 'bg-gradient-to-br from-amber-500 to-yellow-500' :
                'bg-gradient-to-br from-red-500 to-orange-500'
              )}>
                <div className="text-center text-white">
                  <p className="text-3xl font-bold">{nps.score > 0 ? '+' : ''}{nps.score}</p>
                  <p className="text-xs opacity-80">NPS Score</p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-foreground">Team Health Score</h2>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    nps.score >= 50 ? 'bg-green-500/20 text-green-600' :
                    nps.score >= 20 ? 'bg-blue-500/20 text-blue-600' :
                    nps.score >= 0 ? 'bg-amber-500/20 text-amber-600' :
                    'bg-red-500/20 text-red-600'
                  )}>
                    {nps.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Based on thriving vs needs-support ratio
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{participation.description}</span>
                </div>
              </div>
            </div>

            {/* Right: Distribution Bar */}
            <div className="flex-1 max-w-md">
              <div className="mb-2">
                <p className="text-sm font-medium text-foreground mb-3">Team Distribution</p>
              </div>
              {/* Horizontal stacked bar */}
              <div className="h-8 rounded-lg overflow-hidden flex bg-secondary">
                {nps.distribution.thriving.percentage > 0 && (
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center"
                    style={{ width: `${nps.distribution.thriving.percentage}%` }}
                  >
                    {nps.distribution.thriving.percentage >= 15 && (
                      <span className="text-xs font-medium text-white">{nps.distribution.thriving.percentage}%</span>
                    )}
                  </div>
                )}
                {nps.distribution.stable.percentage > 0 && (
                  <div
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center"
                    style={{ width: `${nps.distribution.stable.percentage}%` }}
                  >
                    {nps.distribution.stable.percentage >= 15 && (
                      <span className="text-xs font-medium text-white">{nps.distribution.stable.percentage}%</span>
                    )}
                  </div>
                )}
                {nps.distribution.needsSupport.percentage > 0 && (
                  <div
                    className="bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center"
                    style={{ width: `${nps.distribution.needsSupport.percentage}%` }}
                  >
                    {nps.distribution.needsSupport.percentage >= 15 && (
                      <span className="text-xs font-medium text-white">{nps.distribution.needsSupport.percentage}%</span>
                    )}
                  </div>
                )}
              </div>
              {/* Legend */}
              <div className="flex justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                  <span className="text-xs text-muted-foreground">
                    Thriving ({nps.distribution.thriving.count})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    Stable ({nps.distribution.stable.count})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
                  <span className="text-xs text-muted-foreground">
                    Support ({nps.distribution.needsSupport.count})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-border/50 p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{teamData.totalMembers}</p>
            <p className="text-sm text-muted-foreground">Team Members</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl border border-border/50 p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{nps.distribution.thriving.count}</p>
            <p className="text-sm text-muted-foreground">Thriving</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl border border-border/50 p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{nps.distribution.stable.count}</p>
            <p className="text-sm text-muted-foreground">Stable</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl border border-border/50 p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{nps.distribution.needsSupport.count}</p>
            <p className="text-sm text-muted-foreground">Need Support</p>
          </motion.div>
        </div>

        {/* Alerts Section - Only show if there are members needing support */}
        {needsSupportMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <HeartHandshake className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-foreground">Members Needing Support</h2>
            </div>

            <div className="space-y-3">
              {needsSupportMembers.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-red-500">Score: {member.scores.overall}% - May need attention</p>
                    </div>
                  </div>
                  <Link href={`/manager-dashboard/discussions?member=${member.id}`}>
                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-500">
                      Reach Out
                    </Button>
                  </Link>
                </div>
              ))}
              {needsSupportMembers.length > 3 && (
                <Link href="/manager-dashboard/team" className="block text-center">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    View all {needsSupportMembers.length} members needing support
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* Team Metrics Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Team Averages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl border border-border/50 p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Team Averages</h2>
            <div className="space-y-4">
              {[
                { label: 'Mood', value: teamData.averages.mood, color: 'from-pink-500 to-rose-500' },
                { label: 'Energy', value: teamData.averages.energy, color: 'from-amber-500 to-orange-500' },
                { label: 'Confidence', value: teamData.averages.confidence, color: 'from-blue-500 to-cyan-500' },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                    <span className="text-sm font-medium text-foreground">{metric.value}%</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full bg-gradient-to-r transition-all', metric.color)}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Archetype Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl border border-border/50 p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Team Archetype Distribution</h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: 'Driver', count: teamData.archetypeDistribution.Driver, icon: Target, color: 'from-red-500 to-orange-500' },
                { name: 'Strategist', count: teamData.archetypeDistribution.Strategist, icon: Brain, color: 'from-blue-500 to-cyan-500' },
                { name: 'Connector', count: teamData.archetypeDistribution.Connector, icon: Heart, color: 'from-green-500 to-emerald-500' },
                { name: 'Reactor', count: teamData.archetypeDistribution.Reactor, icon: Zap, color: 'from-amber-500 to-yellow-500' },
              ].map((archetype) => (
                <div key={archetype.name} className="text-center">
                  <div className={cn(
                    'w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center bg-gradient-to-br',
                    archetype.color
                  )}>
                    <archetype.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{archetype.count}</p>
                  <p className="text-xs text-muted-foreground">{archetype.name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Participation Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass rounded-2xl border border-border/50 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Team Participation</h2>
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              participation.rate >= 80 ? 'bg-green-500/20 text-green-600' :
              participation.rate >= 50 ? 'bg-amber-500/20 text-amber-600' :
              'bg-red-500/20 text-red-600'
            )}>
              {participation.rate}% Active
            </span>
          </div>
          <div className="h-4 bg-secondary rounded-full overflow-hidden mb-3">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                participation.rate >= 80 ? 'bg-green-500' :
                participation.rate >= 50 ? 'bg-amber-500' :
                'bg-red-500'
              )}
              style={{ width: `${participation.rate}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {participation.activeMembers} of {teamData.totalMembers} team members have 5+ check-ins in the last 30 days
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/manager-dashboard/team">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-xl border border-border/50 p-5 hover:border-purple-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Team Members</h3>
                    <p className="text-xs text-muted-foreground">View individual insights</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
              </div>
            </motion.div>
          </Link>

          <Link href="/manager-dashboard/risk">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="glass rounded-xl border border-border/50 p-5 hover:border-red-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Risk Areas</h3>
                    <p className="text-xs text-muted-foreground">Stress & confidence levels</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-red-500 transition-colors" />
              </div>
            </motion.div>
          </Link>

          <Link href="/manager-dashboard/discussions">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass rounded-xl border border-border/50 p-5 hover:border-blue-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Discussions</h3>
                    <p className="text-xs text-muted-foreground">Communicate with team</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </ManagerDashboardLayout>
  );
}
