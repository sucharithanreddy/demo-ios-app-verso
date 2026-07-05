'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  Zap,
  Target,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { SalesDashboardLayout } from '@/components/dashboard/SalesDashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MOOD_OPTIONS = [
  { value: 1, emoji: '😔', label: 'Tough', color: 'from-red-500 to-red-600' },
  { value: 2, emoji: '😕', label: 'Off', color: 'from-orange-500 to-orange-600' },
  { value: 3, emoji: '😐', label: 'Okay', color: 'from-yellow-500 to-yellow-600' },
  { value: 4, emoji: '🙂', label: 'Good', color: 'from-lime-500 to-lime-600' },
  { value: 5, emoji: '😄', label: 'Great', color: 'from-green-500 to-green-600' },
];

const ENERGY_OPTIONS = [
  { value: 1, label: 'Drained', icon: '🔋', description: 'Running on empty' },
  { value: 2, label: 'Low', icon: '🪫', description: 'Need a recharge' },
  { value: 3, label: 'Moderate', icon: '⚡', description: 'Steady energy' },
  { value: 4, label: 'High', icon: '⚡⚡', description: 'Ready to go' },
  { value: 5, label: 'Charged', icon: '⚡⚡⚡', description: 'Peak performance' },
];

const CONFIDENCE_OPTIONS = [
  { value: 1, label: 'Shaky', description: 'Feeling uncertain' },
  { value: 2, label: 'Wobbly', description: 'Some doubts' },
  { value: 3, label: 'Steady', description: 'Fairly confident' },
  { value: 4, label: 'Strong', description: 'Good confidence' },
  { value: 5, label: 'Unstoppable', description: 'Full belief' },
];

const IMPACT_TAGS = [
  { id: 'missed_target', label: 'Missed target', icon: '🎯' },
  { id: 'tough_client', label: 'Tough client', icon: '😤' },
  { id: 'rejection', label: 'Rejection', icon: '❌' },
  { id: 'win', label: 'Win!', icon: '🏆' },
  { id: 'good_call', label: 'Great call', icon: '📞' },
  { id: 'pipeline', label: 'Pipeline work', icon: '📊' },
  { id: 'team_support', label: 'Team support', icon: '👥' },
  { id: 'learning', label: 'Learned something', icon: '💡' },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: '🌊' },
  { id: 'recognition', label: 'Recognition', icon: '⭐' },
];

export default function SalesCheckinPage() {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patternInsight, setPatternInsight] = useState<string | null>(null);
  const [archetype, setArchetype] = useState<string | null>(null);

  useEffect(() => {
    const results = localStorage.getItem('diagnosticResults');
    if (results) {
      const parsed = JSON.parse(results);
      setArchetype(parsed.primaryProfile);
    }
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    if (!mood) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood,
          energy: energy || mood,
          confidence: confidence || mood,
          impactTags: selectedTags,
          notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPatternInsight(data.patternInsight);
        setStep(5); // Show success

        // Also save to localStorage for offline access
        const checkIns = JSON.parse(localStorage.getItem('salesCheckIns') || '[]');
        checkIns.unshift({
          date: new Date().toISOString(),
          mood,
          energy: energy || mood,
          confidence: confidence || mood,
          impactTags: selectedTags,
        });
        localStorage.setItem('salesCheckIns', JSON.stringify(checkIns.slice(0, 30)));
      } else {
        console.error('Check-in error:', data.error);
        // Still show success for offline mode
        setStep(5);
      }
    } catch (error) {
      console.error('Error submitting check-in:', error);
      // Save locally and show success
      const checkIns = JSON.parse(localStorage.getItem('salesCheckIns') || '[]');
      checkIns.unshift({
        date: new Date().toISOString(),
        mood,
        energy: energy || mood,
        confidence: confidence || mood,
        impactTags: selectedTags,
      });
      localStorage.setItem('salesCheckIns', JSON.stringify(checkIns.slice(0, 30)));
      setStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNew = () => {
    setStep(1);
    setMood(null);
    setEnergy(null);
    setConfidence(null);
    setSelectedTags([]);
    setNotes('');
    setPatternInsight(null);
  };

  return (
    <SalesDashboardLayout>
      <div className="max-w-xl mx-auto">
        {/* Progress bar */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Step {step} of 4</span>
              <span className="text-xs text-muted-foreground">{Math.round((step / 4) * 100)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Mood */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass rounded-2xl border border-border/50 p-6 md:p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">How was today?</h2>
                <p className="text-muted-foreground">Your overall feeling about the day</p>
              </div>

              <div className="grid grid-cols-5 gap-3 mb-8">
                {MOOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMood(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                      mood === option.value
                        ? 'border-primary bg-primary/10 scale-105'
                        : 'border-border/50 hover:border-primary/50 hover:bg-secondary/50'
                    )}
                  >
                    <span className="text-3xl">{option.emoji}</span>
                    <span className="text-xs font-medium text-muted-foreground">{option.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => mood && setStep(2)}
                disabled={!mood}
                className={cn(
                  'w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
                  mood
                    ? 'bg-gradient-to-r from-primary to-accent text-white hover:opacity-90'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed'
                )}
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Energy */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass rounded-2xl border border-border/50 p-6 md:p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Energy Level</h2>
                <p className="text-muted-foreground">How's your physical and mental energy?</p>
              </div>

              <div className="space-y-3 mb-8">
                {ENERGY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setEnergy(option.value)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                      energy === option.value
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-border/50 hover:border-yellow-500/50 hover:bg-secondary/50'
                    )}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1 text-left">
                      <span className="font-medium text-foreground">{option.label}</span>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    {energy === option.value && (
                      <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-4 rounded-xl font-medium text-muted-foreground hover:bg-secondary/80 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => energy && setStep(3)}
                  disabled={!energy}
                  className={cn(
                    'flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
                    energy
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:opacity-90'
                      : 'bg-secondary text-muted-foreground cursor-not-allowed'
                  )}
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confidence */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass rounded-2xl border border-border/50 p-6 md:p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Confidence Level</h2>
                <p className="text-muted-foreground">How confident do you feel right now?</p>
              </div>

              <div className="space-y-3 mb-8">
                {CONFIDENCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setConfidence(option.value)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                      confidence === option.value
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-border/50 hover:border-blue-500/50 hover:bg-secondary/50'
                    )}
                  >
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{option.label}</span>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    {confidence === option.value && (
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-4 rounded-xl font-medium text-muted-foreground hover:bg-secondary/80 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => confidence && setStep(4)}
                  disabled={!confidence}
                  className={cn(
                    'flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
                    confidence
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90'
                      : 'bg-secondary text-muted-foreground cursor-not-allowed'
                  )}
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Impact Tags */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass rounded-2xl border border-border/50 p-6 md:p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">What impacted you?</h2>
                <p className="text-muted-foreground">Select all that apply (optional)</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {IMPACT_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all',
                      selectedTags.includes(tag.id)
                        ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'border-border/50 hover:border-green-500/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span>{tag.icon}</span>
                    <span className="text-sm font-medium">{tag.label}</span>
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Anything else? (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Quick note about your day..."
                  className="w-full p-4 rounded-xl border border-border/50 bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-4 rounded-xl font-medium text-muted-foreground hover:bg-secondary/80 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-teal-500 text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Check-in
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Success with Pattern Insight */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl border border-green-500/30 p-6 md:p-8"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Check-in Complete!</h2>
                <p className="text-muted-foreground">Great job taking a moment for yourself</p>
              </div>

              {patternInsight && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 mb-6 border border-primary/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Pattern Insight</h3>
                      <p className="text-sm text-muted-foreground">{patternInsight}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-3 rounded-xl bg-secondary/50">
                  <p className="text-2xl font-bold text-foreground">{mood}</p>
                  <p className="text-xs text-muted-foreground">Mood</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-secondary/50">
                  <p className="text-2xl font-bold text-foreground">{energy}</p>
                  <p className="text-xs text-muted-foreground">Energy</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-secondary/50">
                  <p className="text-2xl font-bold text-foreground">{confidence}</p>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/sales-dashboard"
                  className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Back to Dashboard
                </Link>
                <button
                  onClick={handleStartNew}
                  className="w-full py-4 rounded-xl font-medium text-foreground border border-border/50 hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
                >
                  Log Another Check-in
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SalesDashboardLayout>
  );
}
