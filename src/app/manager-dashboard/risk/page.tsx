'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Activity,
  Flame,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { ManagerDashboardLayout } from '@/components/dashboard/ManagerDashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  archetype: string | null;
  scores: {
    mood: number;
    energy: number;
    confidence: number;
    overall: number;
  };
  trend: string;
  riskLevel: 'green' | 'yellow' | 'red';
  streak: number;
}

export default function ManagerRiskPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/manager/team');
        if (res.ok) {
          const data = await res.json();
          setMembers(data.team.members);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRiskColor = (score: number) => {
    if (score < 50) return 'text-red-500';
    if (score < 70) return 'text-amber-500';
    return 'text-green-500';
  };

  const getRiskBg = (score: number) => {
    if (score < 50) return 'bg-red-500';
    if (score < 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getRiskLabel = (score: number) => {
    if (score < 50) return 'High Risk';
    if (score < 70) return 'Caution';
    return 'Good';
  };

  const sortedMembers = [...members].sort((a, b) => {
    const riskOrder = { red: 0, yellow: 1, green: 2 };
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
  });

  return (
    <ManagerDashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Risk Areas</h1>
              <p className="text-sm text-muted-foreground">Stress levels and confidence indicators for each team member</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-8 p-4 rounded-xl bg-secondary/30 border border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">Good (70-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500" />
            <span className="text-sm text-muted-foreground">Caution (50-69%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-sm text-muted-foreground">High Risk (0-49%)</span>
          </div>
        </div>

        {/* Members Risk Cards */}
        <div className="space-y-4">
          {sortedMembers.map((member, index) => {
            const overallRisk = member.riskLevel;
            const borderColor = overallRisk === 'red' ? 'border-red-500/30' : overallRisk === 'yellow' ? 'border-amber-500/30' : 'border-green-500/30';
            const bgColor = overallRisk === 'red' ? 'bg-red-500/5' : overallRisk === 'yellow' ? 'bg-amber-500/5' : 'bg-green-500/5';

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn('rounded-2xl border p-6', borderColor, bgColor)}
              >
                {/* Member Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg',
                      overallRisk === 'red' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                      overallRisk === 'yellow' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                      'bg-gradient-to-br from-green-500 to-green-600'
                    )}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          overallRisk === 'red' ? 'bg-red-500/10 text-red-500' :
                          overallRisk === 'yellow' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-green-500/10 text-green-500'
                        )}>
                          {overallRisk === 'red' ? 'High Risk' : overallRisk === 'yellow' ? 'Caution' : 'Doing Well'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <Link href={`/manager-dashboard/discussions?member=${member.id}`}>
                    <Button size="sm" className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Get on a Discussion
                    </Button>
                  </Link>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Stress Level (inverse of energy) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        Stress Level
                      </span>
                      <span className={cn('text-sm font-bold', getRiskColor(100 - member.scores.energy))}>
                        {100 - member.scores.energy}%
                      </span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', getRiskBg(100 - member.scores.energy))}
                        style={{ width: `${100 - member.scores.energy}%` }}
                      />
                    </div>
                    <p className={cn('text-xs font-medium', getRiskColor(100 - member.scores.energy))}>
                      {getRiskLabel(100 - member.scores.energy)}
                    </p>
                  </div>

                  {/* Confidence Level */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Confidence
                      </span>
                      <span className={cn('text-sm font-bold', getRiskColor(member.scores.confidence))}>
                        {member.scores.confidence}%
                      </span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', getRiskBg(member.scores.confidence))}
                        style={{ width: `${member.scores.confidence}%` }}
                      />
                    </div>
                    <p className={cn('text-xs font-medium', getRiskColor(member.scores.confidence))}>
                      {getRiskLabel(member.scores.confidence)}
                    </p>
                  </div>

                  {/* Mood Level */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        Mood
                      </span>
                      <span className={cn('text-sm font-bold', getRiskColor(member.scores.mood))}>
                        {member.scores.mood}%
                      </span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', getRiskBg(member.scores.mood))}
                        style={{ width: `${member.scores.mood}%` }}
                      />
                    </div>
                    <p className={cn('text-xs font-medium', getRiskColor(member.scores.mood))}>
                      {getRiskLabel(member.scores.mood)}
                    </p>
                  </div>
                </div>

                {/* Recommended Actions */}
                {overallRisk !== 'green' && (
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-xs text-muted-foreground mb-2">Recommended Actions:</p>
                    <div className="flex flex-wrap gap-2">
                      {overallRisk === 'red' && (
                        <>
                          <span className="px-3 py-1 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium">
                            Schedule 1-on-1 check-in
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium">
                            Review workload
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium">
                            Offer support resources
                          </span>
                        </>
                      )}
                      {overallRisk === 'yellow' && (
                        <>
                          <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-medium">
                            Monitor closely
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-medium">
                            Casual conversation
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </ManagerDashboardLayout>
  );
}
