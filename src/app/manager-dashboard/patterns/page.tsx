'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Target,
  Brain,
  Heart,
  Zap,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { ManagerDashboardLayout } from '@/components/dashboard/ManagerDashboardLayout';
import { cn } from '@/lib/utils';

interface TeamPatterns {
  teamSize: number;
  teamAverages: {
    mood: number;
    energy: number;
    confidence: number;
  };
  archetypeDistribution: {
    Driver: number;
    Strategist: number;
    Connector: number;
    Reactor: number;
    Unknown: number;
  };
  engagement: {
    activeMembers: number;
    totalMembers: number;
    rate: number;
  };
  patterns: Array<{
    type: string;
    severity: string;
    title: string;
    description: string;
    recommendation: string;
  }>;
}

export default function ManagerPatternsPage() {
  const [data, setData] = useState<TeamPatterns | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/manager/insights');
        if (res.ok) {
          const data = await res.json();
          setData(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
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

  return (
    <ManagerDashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Team Patterns</h1>
              <p className="text-sm text-muted-foreground">Aggregated insights and patterns for your team</p>
            </div>
          </div>
        </div>

        {/* Team Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
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
            <p className="text-3xl font-bold text-foreground">{data?.teamSize || 0}</p>
            <p className="text-sm text-muted-foreground">Team Size</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl border border-border/50 p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{data?.engagement.rate || 0}%</p>
            <p className="text-sm text-muted-foreground">Engagement Rate</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl border border-border/50 p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{data?.teamAverages?.confidence || 0}%</p>
            <p className="text-sm text-muted-foreground">Avg Confidence</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl border border-border/50 p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{data?.teamAverages?.energy || 0}%</p>
            <p className="text-sm text-muted-foreground">Avg Energy</p>
          </motion.div>
        </div>

        {/* Archetype Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl border border-border/50 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">Team Archetype Distribution</h2>
          <div className="grid grid-cols-4 gap-6">
            {[
              { name: 'Driver', count: data?.archetypeDistribution?.Driver || 0, icon: Target, color: 'from-red-500 to-orange-500', desc: 'Action-oriented' },
              { name: 'Strategist', count: data?.archetypeDistribution?.Strategist || 0, icon: Brain, color: 'from-blue-500 to-cyan-500', desc: 'Analytical' },
              { name: 'Connector', count: data?.archetypeDistribution?.Connector || 0, icon: Heart, color: 'from-green-500 to-emerald-500', desc: 'Relationship-focused' },
              { name: 'Reactor', count: data?.archetypeDistribution?.Reactor || 0, icon: Zap, color: 'from-amber-500 to-yellow-500', desc: 'Emotionally engaged' },
            ].map((archetype) => {
              const total = data?.teamSize || 1;
              const percentage = Math.round((archetype.count / total) * 100);

              return (
                <div key={archetype.name} className="text-center">
                  <div className={cn(
                    'w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-gradient-to-br shadow-lg',
                    archetype.color
                  )}>
                    <archetype.icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{archetype.count}</p>
                  <p className="text-sm font-medium text-foreground">{archetype.name}</p>
                  <p className="text-xs text-muted-foreground">{percentage}% of team</p>
                  <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full bg-gradient-to-r', archetype.color)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Detected Patterns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl border border-border/50 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Detected Patterns & Insights</h2>
          </div>

          {data?.patterns && data.patterns.length > 0 ? (
            <div className="space-y-4">
              {data.patterns.map((pattern, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-xl border',
                    pattern.severity === 'high' ? 'bg-red-500/5 border-red-500/20' :
                    pattern.severity === 'medium' ? 'bg-amber-500/5 border-amber-500/20' :
                    'bg-blue-500/5 border-blue-500/20'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      pattern.severity === 'high' ? 'bg-red-500/10' :
                      pattern.severity === 'medium' ? 'bg-amber-500/10' :
                      'bg-blue-500/10'
                    )}>
                      <AlertTriangle className={cn(
                        'w-5 h-5',
                        pattern.severity === 'high' ? 'text-red-500' :
                        pattern.severity === 'medium' ? 'text-amber-500' :
                        'text-blue-500'
                      )} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{pattern.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{pattern.description}</p>
                      <p className="text-sm font-medium text-primary">💡 {pattern.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-foreground font-medium">No concerning patterns detected</p>
              <p className="text-sm text-muted-foreground">Your team is doing well!</p>
            </div>
          )}
        </motion.div>
      </div>
    </ManagerDashboardLayout>
  );
}
