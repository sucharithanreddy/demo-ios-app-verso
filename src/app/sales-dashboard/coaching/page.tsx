'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Target,
  Zap,
  Coffee,
  Sunset,
  AlertTriangle,
  Trophy,
  ArrowRight,
  RefreshCcw,
  Brain,
  Heart,
} from 'lucide-react';
import { SalesDashboardLayout } from '@/components/dashboard/SalesDashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SITUATIONS = [
  { id: 'morning', label: 'Morning boost', icon: Coffee, description: 'Start your day right', color: 'from-amber-500 to-orange-500' },
  { id: 'before_call', label: 'Before a call', icon: Target, description: 'Get focused', color: 'from-blue-500 to-cyan-500' },
  { id: 'after_rejection', label: 'After rejection', icon: AlertTriangle, description: 'Stay resilient', color: 'from-red-500 to-rose-500' },
  { id: 'bad_day', label: 'Rough day', icon: Sunset, description: 'Reset and recover', color: 'from-purple-500 to-pink-500' },
  { id: 'good_win', label: 'After a win', icon: Trophy, description: 'Channel momentum', color: 'from-green-500 to-emerald-500' },
];

const ARCHETYPE_TIPS: Record<string, Record<string, { title: string; tip: string }>> = {
  Driver: {
    morning: {
      title: 'Set 3 Non-Negotiable Wins',
      tip: 'Your competitive nature thrives on clear targets. Before you start, identify three outcomes that MUST happen today. This gives your drive a focused direction and prevents scattered energy.',
    },
    before_call: {
      title: 'Visualize the Successful Close',
      tip: 'Take 60 seconds to mentally walk through the call ending exactly how you want. Your natural momentum will help you create that reality. Trust your instinct to push forward at the right moments.',
    },
    after_rejection: {
      title: 'Rejection is Data, Not Defeat',
      tip: 'Your instinct is to immediately move to the next opportunity. Pause for 30 seconds. Ask: "What did I learn?" Then redirect your energy. The next call benefits from this insight.',
    },
    bad_day: {
      title: 'Channel, Don\'t Suppress',
      tip: 'Your intensity is a strength, but today it worked against you. Physical movement-10 pushups, a brisk walk-helps you metabolize the frustration. Then reset and attack tomorrow fresh.',
    },
    good_win: {
      title: 'Capture What Worked',
      tip: 'You\'re already thinking about the next target. Pause. Write down exactly what you did that led to this win. Your pattern recognition will help you replicate success.',
    },
  },
  Strategist: {
    morning: {
      title: 'Review Your Research',
      tip: 'Your preparation is your superpower. Spend 5 minutes reviewing your key prospects\' latest updates. Your analytical mind will find the perfect approach for each conversation.',
    },
    before_call: {
      title: 'Trust Your Analysis',
      tip: 'You\'ve done the research. You understand the situation. Now trust your preparation. Your thoughtful approach gives you a unique advantage-use it.',
    },
    after_rejection: {
      title: 'Log and Learn',
      tip: 'Your analytical mind wants to understand what happened. Spend 2 minutes writing down the key points. This turns rejection into valuable data for future strategies.',
    },
    bad_day: {
      title: 'Step Back and Analyze',
      tip: 'When things feel chaotic, your gift is finding patterns. Take a 10,000-foot view. What\'s really happening? Your clarity will return once you see the bigger picture.',
    },
    good_win: {
      title: 'Document the Strategy',
      tip: 'Your systematic approach paid off. Write down the steps that led to this win. Your future self will thank you for creating this playbook.',
    },
  },
  Connector: {
    morning: {
      title: 'Reach Out to One Person',
      tip: 'Your relationships are your strength. Start today by sending one genuine message to a client or colleague. This builds the trust that will carry you through the day.',
    },
    before_call: {
      title: 'Remember: You\'re Helping, Not Selling',
      tip: 'Your natural empathy is your advantage. Focus on how you can genuinely help this person. When they feel your authenticity, trust builds automatically.',
    },
    after_rejection: {
      title: 'They Weren\'t the Right Fit',
      tip: 'Your relationship-building nature makes rejection feel personal. It\'s not. The right connection is out there. Keep nurturing your network-the right fit will come.',
    },
    bad_day: {
      title: 'Reconnect with Your Why',
      tip: 'Your energy comes from meaningful connections. When drained, reach out to someone you enjoy working with. A 5-minute genuine conversation can restore your energy.',
    },
    good_win: {
      title: 'Share the Success',
      tip: 'Your wins are built on relationships. Take a moment to thank those who helped. Send a message of appreciation. This reinforces the trust that makes you successful.',
    },
  },
  Reactor: {
    morning: {
      title: 'Create Your Stability Ritual',
      tip: 'Your day will have ups and downs. Start with something grounding-3 deep breaths, a short walk, or writing down your intention. This gives you a center to return to.',
    },
    before_call: {
      title: 'Ground Yourself First',
      tip: 'Take 3 slow breaths before dialing. Your emotional awareness is a gift, but you need to be centered to use it effectively. This 30-second reset can change the call\'s outcome.',
    },
    after_rejection: {
      title: 'Feel, Then Release',
      tip: 'Your sensitivity means rejection hits hard. Give yourself 2 minutes to fully feel it. Then physically shake it off-stand up, move, reset. Your resilience will carry you forward.',
    },
    bad_day: {
      title: 'Tomorrow Is a Fresh Start',
      tip: 'Your emotions are signals, not permanent states. Today was hard, but it doesn\'t define you. List 3 things you\'re grateful for. This small act can shift your entire perspective.',
    },
    good_win: {
      title: 'Capture Your Confidence',
      tip: 'When things go well, your confidence soars. Write down exactly how you feel right now. Return to this note on tough days-it\'s proof of your capability.',
    },
  },
};

export default function SalesCoachingPage() {
  const [archetype, setArchetype] = useState<string>('Driver');
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);
  const [currentTip, setCurrentTip] = useState<{ title: string; tip: string } | null>(null);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const results = localStorage.getItem('diagnosticResults');
    if (results) {
      const parsed = JSON.parse(results);
      if (parsed.primaryProfile) {
        setArchetype(parsed.primaryProfile);
      }
    }
  }, []);

  const handleSelectSituation = (situationId: string) => {
    setSelectedSituation(situationId);
    
    // Get tip for this archetype and situation
    const tips = ARCHETYPE_TIPS[archetype] || ARCHETYPE_TIPS.Driver;
    const tip = tips[situationId] || tips.morning;
    setCurrentTip(tip);
    
    // Animate in
    setTimeout(() => setShowTip(true), 100);
  };

  const handleGetAnother = () => {
    setShowTip(false);
    setTimeout(() => {
      setSelectedSituation(null);
      setCurrentTip(null);
    }, 300);
  };

  return (
    <SalesDashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Archetype Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm font-medium text-primary">
              Tips personalized for {archetype} profile
            </span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showTip ? (
            <motion.div
              key="situations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-2xl border border-border/50 p-6 md:p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">What do you need?</h2>
                <p className="text-muted-foreground">Select your situation to get a personalized tip</p>
              </div>

              <div className="space-y-3">
                {SITUATIONS.map((situation) => {
                  const Icon = situation.icon;
                  return (
                    <button
                      key={situation.id}
                      onClick={() => handleSelectSituation(situation.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-secondary/50 transition-all group"
                    >
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
                        situation.color
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium text-foreground">{situation.label}</span>
                        <p className="text-sm text-muted-foreground">{situation.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tip"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Tip Card */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border-2 border-primary/30 p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Lightbulb className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {currentTip?.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {currentTip?.tip}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleGetAnother}
                  className="flex-1 py-4 rounded-xl font-medium text-muted-foreground border border-border/50 hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Get Another Tip
                </button>
              </div>

              {/* Archetype-specific insight */}
              <div className="glass rounded-xl border border-border/50 p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">As a {archetype},</span> your natural response to challenges is{' '}
                  {archetype === 'Driver' && 'to push forward with intensity and momentum.'}
                  {archetype === 'Strategist' && 'to step back and analyze for clarity.'}
                  {archetype === 'Connector' && 'to focus on relationships and communication.'}
                  {archetype === 'Reactor' && 'to feel deeply and respond with passion.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SalesDashboardLayout>
  );
}
