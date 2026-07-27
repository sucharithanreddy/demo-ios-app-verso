'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  Target,
  Brain,
  Heart,
  Zap,
  ArrowRight,
  Search,
  Flame,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus,
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
  email: string | null;
  avatarUrl?: string | null;
  isAnonymous?: boolean;
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
  participationWeight: number;
  checkIns: {
    total: number;
    lastCheckIn: string | null;
  };
}

interface TeamData {
  totalMembers: number;
  members: TeamMember[];
  privacy?: {
    minTeamSizeRequired: number;
    currentTeamSize: number;
    individualProfilesHidden: boolean;
    reason?: string;
    anonymousMemberCount?: number;
    notice?: string;
  };
}

const ARCHETYPE_ICONS: Record<string, any> = {
  Driver: Target,
  Strategist: Brain,
  Connector: Heart,
  Reactor: Zap,
};

// Category badge configuration
const getCategoryBadge = (category: string) => {
  switch (category) {
    case 'thriving':
      return { 
        label: 'Thriving', 
        color: 'bg-green-500/10 text-green-500 border-green-500/20', 
        icon: Sparkles,
        gradient: 'from-green-500 to-emerald-500',
      };
    case 'stable':
      return { 
        label: 'Stable', 
        color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', 
        icon: Shield,
        gradient: 'from-amber-500 to-yellow-500',
      };
    case 'needsSupport':
      return { 
        label: 'Needs Support', 
        color: 'bg-red-500/10 text-red-500 border-red-500/20', 
        icon: HeartHandshake,
        gradient: 'from-red-500 to-orange-500',
      };
    default:
      return { 
        label: 'Unknown', 
        color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', 
        icon: Minus,
        gradient: 'from-gray-500 to-gray-400',
      };
  }
};

export default function ManagerTeamPage() {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'thriving' | 'stable' | 'needsSupport'>('all');

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

  const filteredMembers = teamData?.members.filter((member) => {
    const searchLower = searchQuery.toLowerCase();
    // Anonymous members can only be found by archetype, not name/email
    if (member.isAnonymous) {
      const matchesSearch = !searchQuery ||
                            (member.archetype?.toLowerCase().includes(searchLower) ?? false);
      const matchesFilter = filterCategory === 'all' || member.category === filterCategory;
      return matchesSearch && matchesFilter;
    }
    const matchesSearch = member.name.toLowerCase().includes(searchLower) ||
                          (member.email?.toLowerCase().includes(searchLower) ?? false);
    const matchesFilter = filterCategory === 'all' || member.category === filterCategory;
    return matchesSearch && matchesFilter;
  }) || [];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

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

  return (
    <ManagerDashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Team Members</h1>
          <p className="text-muted-foreground">Individual mental health insights for each team member</p>
        </div>

        {/* Privacy locked view: team too small */}
        {teamData?.privacy?.individualProfilesHidden && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-amber-500/20 p-8 text-center mb-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Individual profiles are hidden
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              {teamData.privacy.reason || 'To protect team member privacy, individual profiles are only visible when your team has at least 8 members with visible data.'}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 text-sm">
              <span className="text-muted-foreground">Current team size:</span>
              <span className="font-semibold text-foreground">{teamData.privacy.currentTeamSize}</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-semibold text-foreground">{teamData.privacy.minTeamSizeRequired} required</span>
            </div>
          </motion.div>
        )}

        {/* Privacy notice banner (when profiles ARE shown) */}
        {!teamData?.privacy?.individualProfilesHidden && teamData?.privacy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-blue-500/20 p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-foreground">
                  {teamData.privacy.notice || 'Individual results are for development support only and should not be used for performance management, promotion, or disciplinary decisions.'}
                </p>
                {teamData.privacy.anonymousMemberCount && teamData.privacy.anonymousMemberCount > 0 ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    {teamData.privacy.anonymousMemberCount} team {teamData.privacy.anonymousMemberCount === 1 ? 'member has' : 'members have'} chosen to display their profile as &ldquo;Anonymous team member.&rdquo;
                  </p>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}

        {/* Search & Filter — only show if profiles are visible */}
        {!teamData?.privacy?.individualProfilesHidden && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or archetype..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'thriving', 'stable', 'needsSupport'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterCategory(filter as any)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                  filterCategory === filter
                    ? filter === 'thriving'
                      ? 'bg-green-500 text-white'
                      : filter === 'stable'
                      ? 'bg-amber-500 text-white'
                      : filter === 'needsSupport'
                      ? 'bg-red-500 text-white'
                      : 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 text-muted-foreground hover:text-foreground border border-border/50'
                )}
              >
                {filter === 'all' ? 'All' : filter === 'thriving' ? 'Thriving' : filter === 'stable' ? 'Stable' : 'Support'}
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Team Members List */}
        {!teamData?.privacy?.individualProfilesHidden && (
        <div className="space-y-4">
          {filteredMembers.map((member, index) => {
            const categoryBadge = getCategoryBadge(member.category);
            const ArchetypeIcon = member.archetype ? ARCHETYPE_ICONS[member.archetype] : Users;
            const CategoryIcon = categoryBadge.icon;
            const isAnonymous = !!member.isAnonymous;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'glass rounded-xl border p-5 transition-all',
                  isAnonymous
                    ? 'border-dashed border-border/50 opacity-90'
                    : 'border-border/50 hover:border-primary/30'
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Member Info */}
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg bg-gradient-to-br relative',
                      categoryBadge.gradient
                    )}>
                      {isAnonymous ? (
                        <Users className="w-5 h-5" />
                      ) : (
                        <>{member.name.charAt(0)}</>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{member.name}</h3>
                        {isAnonymous && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-muted/30 text-muted-foreground border-border/50 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Anonymous
                          </span>
                        )}
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1', categoryBadge.color)}>
                          <CategoryIcon className="w-3 h-3" />
                          {categoryBadge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {!isAnonymous && member.email && (
                          <span className="text-sm text-muted-foreground">{member.email}</span>
                        )}
                        {member.archetype && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <ArchetypeIcon className="w-3 h-3" />
                            {member.archetype}
                          </span>
                        )}
                        {member.streak > 0 && (
                          <span className="text-xs text-orange-500 flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {member.streak} day streak
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{member.scores.mood}%</p>
                        <p className="text-xs text-muted-foreground">Mood</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{member.scores.energy}%</p>
                        <p className="text-xs text-muted-foreground">Energy</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{member.scores.confidence}%</p>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <p className="text-lg font-bold text-foreground">{member.scores.overall}%</p>
                          {getTrendIcon(member.trend)}
                        </div>
                        <p className="text-xs text-muted-foreground">Overall</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/manager-dashboard/discussions?member=${member.id}`}>
                        <Button size="sm" variant="outline" className="gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Discuss
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Score Bars */}
                <div className="mt-4 pt-4 border-t border-border/30">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Mood</span>
                        <span className="text-xs font-medium">{member.scores.mood}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', member.scores.mood < 50 ? 'bg-red-500' : member.scores.mood < 80 ? 'bg-amber-500' : 'bg-green-500')}
                          style={{ width: `${member.scores.mood}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Energy</span>
                        <span className="text-xs font-medium">{member.scores.energy}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', member.scores.energy < 50 ? 'bg-red-500' : member.scores.energy < 80 ? 'bg-amber-500' : 'bg-green-500')}
                          style={{ width: `${member.scores.energy}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Confidence</span>
                        <span className="text-xs font-medium">{member.scores.confidence}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', member.scores.confidence < 50 ? 'bg-red-500' : member.scores.confidence < 80 ? 'bg-amber-500' : 'bg-green-500')}
                          style={{ width: `${member.scores.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Check-in info */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {member.checkIns.total} check-ins in last 30 days
                    </span>
                    {member.checkIns.lastCheckIn && (
                      <span className="text-xs text-muted-foreground">
                        Last active: {new Date(member.checkIns.lastCheckIn).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        )}

        {filteredMembers.length === 0 && !teamData?.privacy?.individualProfilesHidden && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No team members found</p>
          </div>
        )}
      </div>
    </ManagerDashboardLayout>
  );
}
