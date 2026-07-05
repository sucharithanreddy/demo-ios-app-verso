'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Target,
  Lightbulb,
  Users,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  TrendingUp,
  Crown,
  RefreshCcw,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PATTERN_CONFIG = {
  Driver: {
    icon: Target,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    gradient: 'from-red-500 to-red-600',
    description: 'You channel pressure into action and momentum. When stressed, you push harder and move faster.',
    strengths: ['Decisive action', 'High energy', 'Results-focused', 'Natural leader'],
    challenges: ['May bypass emotions', 'Risk of burnout', 'Difficulty slowing down'],
    recommendations: ['Practice pausing before reacting', 'Schedule recovery time', 'Check in with your emotions'],
  },
  Strategist: {
    icon: Lightbulb,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    gradient: 'from-blue-500 to-blue-600',
    description: 'You process pressure through analysis and planning. You regain control by thinking things through.',
    strengths: ['Analytical thinking', 'Problem-solving', 'Long-term planning', 'Attention to detail'],
    challenges: ['Analysis paralysis', 'Overthinking', 'Emotional distance'],
    recommendations: ['Set decision deadlines', 'Trust your intuition sometimes', 'Practice expressing emotions'],
  },
  Connector: {
    icon: Users,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    gradient: 'from-green-500 to-green-600',
    description: 'You navigate pressure through relationships and communication. You seek stability through connection.',
    strengths: ['Relationship building', 'Emotional intelligence', 'Team collaboration', 'Communication'],
    challenges: ['Taking things personally', 'Difficulty with conflict', 'Over-accommodating'],
    recommendations: ['Set healthy boundaries', 'Practice saying no', 'Validate your own feelings'],
  },
  Reactor: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    gradient: 'from-amber-500 to-amber-600',
    description: 'You feel pressure intensely and emotionally. Your sensitivity helps you connect but can overwhelm.',
    strengths: ['Deep empathy', 'Authentic expression', 'High emotional awareness', 'Intuition'],
    challenges: ['Emotional overwhelm', 'Rejection sensitivity', 'Mood fluctuations'],
    recommendations: ['Practice grounding techniques', 'Develop emotional boundaries', 'Use reframing exercises'],
  },
};

interface DiagnosticResult {
  primaryProfile: string;
  secondaryProfile?: string;
  scores: {
    driver: number;
    strategist: number;
    connector: number;
    reactor: number;
  };
}

export default function ResultsPage() {
  const [results, setResults] = useState<DiagnosticResult | null>(null);
  const [hasFullAccess, setHasFullAccess] = useState(false);

  useEffect(() => {
    const storedResults = localStorage.getItem('diagnosticResults');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    
    const access = localStorage.getItem('verso_full_access');
    setHasFullAccess(access === 'true');
  }, []);

  const profileConfig = results ? PATTERN_CONFIG[results.primaryProfile as keyof typeof PATTERN_CONFIG] : null;
  const ProfileIcon = profileConfig?.icon || Target;

  if (!results) {
    return (
      <DashboardLayout title="Test Results" subtitle="Your Sales Wellbeing Pattern">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background rounded-2xl border border-border/50 p-8 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No Results Yet</h2>
            <p className="text-muted-foreground mb-6">
              Complete the Sales Wellbeing Map to discover your pattern and get personalized insights.
            </p>
            <Link href="/diagnostic">
              <Button className="gap-2">
                Take the Assessment
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Test Results" subtitle="Your Sales Wellbeing Pattern">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Primary Pattern Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'bg-background rounded-2xl border p-6',
            profileConfig?.borderColor
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center', profileConfig?.bgColor)}>
              <ProfileIcon className={cn('w-8 h-8', profileConfig?.color)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-foreground">{results.primaryProfile}</h2>
                {results.secondaryProfile && (
                  <span className="text-muted-foreground">+ {results.secondaryProfile}</span>
                )}
              </div>
              <p className="text-muted-foreground">{profileConfig?.description}</p>
            </div>
            <Link href="/diagnostic">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCcw className="w-4 h-4" />
                Retake
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Score Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background rounded-2xl border border-border/50 p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Your Pattern Scores</h3>
          
          <div className="space-y-4">
            {Object.entries(results.scores).map(([key, score]) => {
              const config = PATTERN_CONFIG[key.charAt(0).toUpperCase() + key.slice(1) as keyof typeof PATTERN_CONFIG];
              const Icon = config.icon;
              const isPrimary = key.charAt(0).toUpperCase() + key.slice(1) === results.primaryProfile;
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={cn('w-5 h-5', config.color)} />
                      <span className={cn('font-medium', isPrimary ? 'text-foreground' : 'text-muted-foreground')}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      {isPrimary && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Primary
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-foreground">{score}%</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={cn('h-full rounded-full bg-gradient-to-r', config.gradient)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Detailed Insights - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background rounded-2xl border border-border/50 p-6 relative overflow-hidden"
        >
          {!hasFullAccess && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="text-center p-6">
                <Crown className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Unlock Full Insights</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get detailed strengths, challenges, and personalized recommendations.
                </p>
                <Link href="/pricing">
                  <Button className="gap-2">
                    Upgrade to Premium
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className={cn(!hasFullAccess && 'blur-sm')}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Your Strengths
                </h3>
                <ul className="space-y-2">
                  {profileConfig?.strengths.map((strength) => (
                    <li key={strength} className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Challenges */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Areas to Watch
                </h3>
                <ul className="space-y-2">
                  {profileConfig?.challenges.map((challenge) => (
                    <li key={challenge} className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 pt-6 border-t border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-3">Personalized Recommendations</h3>
              <ul className="space-y-2">
                {profileConfig?.recommendations.map((rec) => (
                  <li key={rec} className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          <Link href="/reflect" className="block">
            <div className="bg-background rounded-2xl border border-border/50 p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground">Explore Your Pattern</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Talk to our AI about your results and get personalized guidance.
              </p>
            </div>
          </Link>

          <Link href="/lab" className="block">
            <div className="bg-background rounded-2xl border border-border/50 p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-green-500" />
                </div>
                <h4 className="font-semibold text-foreground">Reframing Lab</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Practice techniques to work with your pattern, not against it.
              </p>
            </div>
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
