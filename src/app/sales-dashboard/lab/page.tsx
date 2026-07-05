'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Wind,
  HelpCircle,
  Eye,
  Heart,
  Zap,
  Target,
  Flame,
  TrendingDown,
  X,
  Play,
  RotateCcw,
  Check,
  AlertCircle,
  ClipboardCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { SalesDashboardLayout } from '@/components/dashboard/SalesDashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// QUICK TOOLS - Grounding, Breathwork, Reality Check
// ============================================================================

function GroundingExercise({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const steps = [
    { sense: 'see', count: 5, icon: Eye, color: 'text-blue-500' },
    { sense: 'touch', count: 4, icon: Heart, color: 'text-purple-500' },
    { sense: 'hear', count: 3, icon: '👂', color: 'text-green-500' },
    { sense: 'smell', count: 2, icon: '👃', color: 'text-amber-500' },
    { sense: 'taste', count: 1, icon: '👅', color: 'text-rose-500' },
  ];

  const currentStep = steps[step];
  const progress = items.length;
  const needed = currentStep.count;

  const handleAdd = () => {
    if (input.trim()) {
      setItems([...items, input.trim()]);
      setInput('');
    }
  };

  const handleNext = () => {
    if (progress >= needed && step < steps.length - 1) {
      setStep(step + 1);
      setItems([]);
    }
  };

  const isComplete = step === steps.length - 1 && progress >= needed;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-secondary/80 text-muted-foreground transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className={cn('w-3 h-3 rounded-full transition-all', i <= step ? 'bg-primary' : 'bg-secondary')} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Well Done!</h2>
              <p className="text-muted-foreground mb-6">You've grounded yourself. Take a deep breath.</p>
              <Button onClick={onClose} className="bg-primary text-primary-foreground">
                Continue
              </Button>
            </motion.div>
          ) : (
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-8">
                <div className={cn('text-6xl mb-4', currentStep.color)}>
                  {typeof currentStep.icon === 'string' ? currentStep.icon : <currentStep.icon className="w-16 h-16 mx-auto" />}
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Name {needed} thing{needed > 1 ? 's' : ''} you {currentStep.sense}
                </h2>
                <p className="text-muted-foreground">{progress} of {needed}</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder={`I ${currentStep.sense}...`}
                    className="flex-1 px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
                    autoFocus
                  />
                  <Button onClick={handleAdd} disabled={!input.trim()} className="bg-primary text-primary-foreground">
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {items.map((item, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                      {item}
                    </span>
                  ))}
                </div>

                {progress >= needed && (
                  <Button onClick={handleNext} className="w-full bg-gradient-to-r from-primary to-accent text-white">
                    Next Step
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function BreathworkExercise({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  const phases = [
    { name: 'Inhale', duration: 4000, scale: 1.5 },
    { name: 'Hold', duration: 4000, scale: 1.5 },
    { name: 'Exhale', duration: 4000, scale: 1 },
    { name: 'Hold', duration: 4000, scale: 1 },
  ];

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      setPhase((prev) => {
        if (prev === phases.length - 1) {
          setCycles((c) => c + 1);
          return 0;
        }
        return prev + 1;
      });
    }, phases[phase].duration);

    return () => clearTimeout(timer);
  }, [isActive, phase]);

  const currentPhase = phases[phase];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <div className="text-center">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-secondary/80 text-muted-foreground transition-colors">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold text-foreground mb-2">Box Breathing</h2>
        <p className="text-muted-foreground mb-8">4-4-4-4 Rhythm • Great for pre-call calm</p>

        <div className="relative w-48 h-48 mx-auto mb-8">
          <motion.div
            animate={{ scale: isActive ? currentPhase.scale : 1 }}
            transition={{ duration: currentPhase.duration / 1000, ease: 'easeInOut' }}
            className="w-full h-full rounded-3xl bg-gradient-to-br from-primary to-accent shadow-lg"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">
              {isActive ? currentPhase.name : 'Start'}
            </span>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">Cycles: {cycles}</p>

        <div className="flex gap-3 justify-center">
          {!isActive ? (
            <Button onClick={() => setIsActive(true)} className="bg-primary text-primary-foreground">
              <Play className="w-4 h-4 mr-2" />
              Begin
            </Button>
          ) : (
            <Button onClick={() => setIsActive(false)} variant="outline" className="border-border/50">
              Pause
            </Button>
          )}
          <Button onClick={() => { setPhase(0); setCycles(0); setIsActive(false); }} variant="ghost">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function RealityCheck({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);

  const questions = [
    { question: 'Is this a fact or a feeling?', hint: 'Separate what you know from what you feel.', placeholder: 'This is a...' },
    { question: 'What is the evidence?', hint: 'What facts support or contradict this thought?', placeholder: 'The evidence is...' },
    { question: 'What is a more likely outcome?', hint: 'Consider what\'s most probable, not worst-case.', placeholder: 'A more likely outcome is...' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-secondary/80 text-muted-foreground transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-8">
          {questions.map((_, i) => (
            <div key={i} className={cn('w-3 h-3 rounded-full transition-all', i <= step ? 'bg-primary' : 'bg-secondary')} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step >= questions.length ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Reality Checked!</h2>
              <p className="text-muted-foreground mb-6">You've examined the evidence objectively.</p>
              <Button onClick={onClose} className="bg-primary text-primary-foreground">
                Continue
              </Button>
            </motion.div>
          ) : (
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-accent" />
                </div>
                <h2 className="text-xl font-bold text-foreground text-center mb-2">{questions[step].question}</h2>
                <p className="text-muted-foreground text-center text-sm">{questions[step].hint}</p>
              </div>

              <textarea
                value={answers[step]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[step] = e.target.value;
                  setAnswers(newAnswers);
                }}
                placeholder={questions[step].placeholder}
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none resize-none text-foreground placeholder:text-muted-foreground/60 min-h-[100px]"
                autoFocus
              />

              <div className="flex gap-3 mt-4">
                {step > 0 && (
                  <Button onClick={() => setStep(step - 1)} variant="ghost" className="flex-1">
                    Back
                  </Button>
                )}
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!answers[step].trim()}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  {step === questions.length - 1 ? 'Complete' : 'Next'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ============================================================================
// PRACTICE - Reframe Lab & Distortion Spotter
// ============================================================================

function ReframeLab() {
  const [thought, setThought] = useState('');
  const [result, setResult] = useState<{ label: string; reframe: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!thought.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/reframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: thought,
          conversationHistory: [],
          sessionContext: { mode: 'quick' }
        }),
      });
      const data = await res.json();
      setResult({
        label: data.thoughtPattern || data.distortionType || 'Pattern detected',
        reframe: data.reframe || 'Consider alternative perspectives.',
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl border border-border/50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Reframe Lab</h3>
          <p className="text-xs text-muted-foreground">Transform negative thoughts instantly</p>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          placeholder="Enter a negative thought..."
          className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none resize-none text-foreground placeholder:text-muted-foreground/60"
          rows={2}
        />

        <Button
          onClick={handleAnalyze}
          disabled={!thought.trim() || isLoading}
          className="w-full bg-gradient-to-r from-primary to-accent text-white"
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </Button>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 pt-4 border-t border-border/50"
          >
            <div>
              <span className="text-xs text-muted-foreground">Detected Pattern</span>
              <p className="text-sm font-medium text-primary bg-primary/10 rounded-lg px-3 py-2 mt-1">{result.label}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Reframe</span>
              <p className="text-sm text-foreground bg-accent/10 border border-accent/20 rounded-lg px-3 py-2 mt-1">{result.reframe}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DistortionSpotter() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [score, setScore] = useState(0);

  const examples = [
    { thought: "I failed once, so I'm a total failure.", distortion: "All-or-Nothing Thinking", options: ["All-or-Nothing Thinking", "Overgeneralization", "Labeling", "Catastrophizing"] },
    { thought: "Everyone is judging me right now.", distortion: "Mind Reading", options: ["Mind Reading", "Fortune Telling", "Personalization", "Emotional Reasoning"] },
    { thought: "I feel stupid, therefore I am stupid.", distortion: "Emotional Reasoning", options: ["Labeling", "Emotional Reasoning", "Should Statements", "Mental Filter"] },
    { thought: "They didn't text back. They hate me.", distortion: "Mind Reading", options: ["Mind Reading", "Overgeneralization", "Catastrophizing", "All-or-Nothing Thinking"] },
    { thought: "I should always be productive.", distortion: "Should Statements", options: ["Should Statements", "All-or-Nothing Thinking", "Labeling", "Mental Filter"] },
  ];

  const current = examples[currentIndex];

  const handleSelect = (option: string) => {
    setSelected(option);
    const correct = option === current.distortion;
    setFeedback({
      correct,
      explanation: correct
        ? "Correct! You're getting good at spotting these."
        : `Not quite. This is "${current.distortion}". Keep practicing!`,
    });
    if (correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    setSelected(null);
    setFeedback(null);
    setCurrentIndex((i) => (i + 1) % examples.length);
  };

  return (
    <div className="glass rounded-2xl border border-border/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Distortion Spotter</h3>
            <p className="text-xs text-muted-foreground">Train your pattern recognition</p>
          </div>
        </div>
        <span className="text-sm font-medium text-primary">Score: {score}</span>
      </div>

      <div className="space-y-4">
        <div className="bg-secondary/50 rounded-xl p-4 border border-border/30">
          <p className="text-foreground italic">"{current.thought}"</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {current.options.map((option) => (
            <button
              key={option}
              onClick={() => !feedback && handleSelect(option)}
              disabled={!!feedback}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-medium transition-all text-left',
                feedback
                  ? option === current.distortion
                    ? 'bg-primary text-primary-foreground'
                    : selected === option
                    ? 'bg-destructive/20 text-destructive'
                    : 'bg-secondary/50 text-muted-foreground'
                  : 'bg-secondary/50 text-foreground hover:bg-secondary border border-border/30'
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className={cn('text-sm', feedback.correct ? 'text-primary' : 'text-muted-foreground')}>
              {feedback.explanation}
            </p>
            <Button onClick={handleNext} variant="outline" className="w-full border-border/50">
              Next Example
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// GOALS - The Metrics
// ============================================================================

function GoalsSection() {
  const goals = [
    {
      title: 'Lower Stress',
      icon: TrendingDown,
      current: 6.2,
      target: 4.0,
      unit: '/10 avg',
      progress: 65,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Patterns Interrupted',
      icon: Zap,
      current: 12,
      target: 20,
      unit: 'thoughts',
      progress: 60,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Daily Streak',
      icon: Flame,
      current: 4,
      target: 7,
      unit: 'days',
      progress: 57,
      color: 'from-rose-500 to-pink-500',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Your Mental Fitness Goals</h2>
      </div>

      <div className="grid gap-4">
        {goals.map((goal) => (
          <motion.div
            key={goal.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-border/50 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center', goal.color)}>
                  <goal.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{goal.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {goal.current} / {goal.target} {goal.unit}
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-foreground">{goal.progress}%</span>
            </div>

            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={cn('h-full rounded-full bg-gradient-to-r', goal.color)}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN LAB PAGE
// ============================================================================

export default function SalesLabPage() {
  const [activeTool, setActiveTool] = useState<'grounding' | 'breathwork' | 'reality' | null>(null);

  return (
    <SalesDashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">The Lab</h1>
              <p className="text-sm text-muted-foreground">Your mental fitness toolkit</p>
            </div>
          </div>
        </div>

        {/* Sales Diagnostic - Featured */}
        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link href="/diagnostic" className="block">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-accent p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full blur-xl" />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <ClipboardCheck className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Sales Wellbeing Diagnostic</h3>
                      <p className="text-sm text-white/80">Discover your sales personality profile in 5 minutes</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </section>

        {/* Quick Tools Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Quick Tools</h2>
            <span className="text-xs text-muted-foreground ml-2">Tap to start</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setActiveTool('grounding')}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="relative h-full flex flex-col items-center justify-center p-4 text-white">
                <Brain className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-lg">Grounding</span>
                <span className="text-xs opacity-80">5-4-3-2-1 Technique</span>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setActiveTool('breathwork')}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="relative h-full flex flex-col items-center justify-center p-4 text-white">
                <Wind className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-lg">Breathwork</span>
                <span className="text-xs opacity-80">Box Breathing</span>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setActiveTool('reality')}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="relative h-full flex flex-col items-center justify-center p-4 text-white">
                <HelpCircle className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-lg">Reality Check</span>
                <span className="text-xs opacity-80">Is this true?</span>
              </div>
            </motion.button>
          </div>
        </section>

        {/* Practice Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Practice</h2>
            <span className="text-xs text-muted-foreground ml-2">Train your mind</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ReframeLab />
            <DistortionSpotter />
          </div>
        </section>

        {/* Goals Section */}
        <section>
          <GoalsSection />
        </section>
      </div>

      {/* Tool Overlays */}
      <AnimatePresence>
        {activeTool === 'grounding' && <GroundingExercise onClose={() => setActiveTool(null)} />}
        {activeTool === 'breathwork' && <BreathworkExercise onClose={() => setActiveTool(null)} />}
        {activeTool === 'reality' && <RealityCheck onClose={() => setActiveTool(null)} />}
      </AnimatePresence>
    </SalesDashboardLayout>
  );
}
