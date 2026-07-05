'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Wind,
  Eye,
  Hand,
  Ear,
  Heart,
  Timer,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Crown,
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const GROUNDING_EXERCISES = [
  {
    id: '5-4-3-2-1',
    name: '5-4-3-2-1 Technique',
    description: 'A powerful sensory grounding exercise to bring you back to the present moment.',
    duration: '2-3 min',
    icon: Eye,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    steps: [
      { sense: 'See', count: 5, instruction: 'Look around and name 5 things you can see' },
      { sense: 'Touch', count: 4, instruction: 'Notice 4 things you can physically feel' },
      { sense: 'Hear', count: 3, instruction: 'Listen for 3 sounds in your environment' },
      { sense: 'Smell', count: 2, instruction: 'Identify 2 things you can smell' },
      { sense: 'Taste', count: 1, instruction: 'Notice 1 thing you can taste' },
    ],
  },
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    description: 'A structured breathing technique used by Navy SEALs to stay calm under pressure.',
    duration: '2-4 min',
    icon: Wind,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10',
    steps: [
      { phase: 'Inhale', duration: 4, instruction: 'Breathe in slowly for 4 seconds' },
      { phase: 'Hold', duration: 4, instruction: 'Hold your breath for 4 seconds' },
      { phase: 'Exhale', duration: 4, instruction: 'Breathe out slowly for 4 seconds' },
      { phase: 'Hold', duration: 4, instruction: 'Stay empty for 4 seconds' },
    ],
  },
  {
    id: 'body-scan',
    name: 'Quick Body Scan',
    description: 'Release tension by systematically scanning through your body.',
    duration: '3-5 min',
    icon: Hand,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10',
    bodyParts: ['Head & face', 'Neck & shoulders', 'Arms & hands', 'Chest & back', 'Stomach', 'Legs & feet'],
  },
  {
    id: 'progressive-relaxation',
    name: 'Progressive Muscle Relaxation',
    description: 'Tense and release muscle groups to release physical stress.',
    duration: '5-10 min',
    icon: Heart,
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-500/10',
    muscleGroups: ['Hands & fists', 'Arms', 'Shoulders', 'Face', 'Stomach', 'Legs', 'Feet'],
  },
  {
    id: 'anchor-breathing',
    name: 'Anchor Breathing',
    description: 'Use your hand as a visual guide for calming breath work.',
    duration: '2-3 min',
    icon: Hand,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-500/10',
  },
  {
    id: 'sound-grounding',
    name: 'Sound Grounding',
    description: 'Focus on sounds to shift attention away from anxious thoughts.',
    duration: '2-3 min',
    icon: Ear,
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-500/10',
  },
];

export default function GroundingPage() {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [breathTimer, setBreathTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [hasFullAccess, setHasFullAccess] = useState(false);

  useEffect(() => {
    const access = localStorage.getItem('verso_full_access');
    setHasFullAccess(access === 'true');
    
    const completed = localStorage.getItem('completedGrounding');
    if (completed) {
      setCompletedExercises(JSON.parse(completed));
    }
  }, []);

  const selectedExerciseData = GROUNDING_EXERCISES.find(e => e.id === selectedExercise);

  const startBreathing = () => {
    setIsActive(true);
    setCurrentStep(0);
    setBreathTimer(0);
    
    const interval = setInterval(() => {
      setBreathTimer(prev => {
        const newTime = prev + 1;
        if (newTime >= 4) {
          setCurrentStep(prevStep => (prevStep + 1) % 4);
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    setTimerInterval(interval);
  };

  const stopBreathing = () => {
    setIsActive(false);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const completeExercise = () => {
    if (selectedExercise && !completedExercises.includes(selectedExercise)) {
      const updated = [...completedExercises, selectedExercise];
      setCompletedExercises(updated);
      localStorage.setItem('completedGrounding', JSON.stringify(updated));
    }
    stopBreathing();
    setSelectedExercise(null);
  };

  const getPhaseName = (step: number) => {
    const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];
    return phases[step];
  };

  return (
    <DashboardLayout title="Grounding Exercises" subtitle="Quick techniques to manage stress">
      <div className="max-w-4xl mx-auto">
        {/* Premium Gate */}
        {!hasFullAccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-2xl border border-green-500/20 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Premium Feature</h3>
                <p className="text-sm text-muted-foreground">
                  Unlock all grounding exercises and guided sessions.
                </p>
              </div>
              <Link href="/pricing">
                <Button size="sm" className="gap-2">
                  Upgrade
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!selectedExercise ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {GROUNDING_EXERCISES.map((exercise, index) => {
                const Icon = exercise.icon;
                const isCompleted = completedExercises.includes(exercise.id);
                
                return (
                  <motion.button
                    key={exercise.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedExercise(exercise.id)}
                    className={cn(
                      'bg-background rounded-2xl border border-border/50 p-5 text-left hover:border-primary/30 transition-all group',
                      isCompleted && 'border-green-500/30'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', exercise.bgColor)}>
                        <Icon className={cn('w-6 h-6 bg-gradient-to-r bg-clip-text', exercise.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{exercise.name}</h3>
                          {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{exercise.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">{exercise.duration}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Back Button */}
              <button
                onClick={() => {
                  stopBreathing();
                  setSelectedExercise(null);
                }}
                className="mb-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to exercises
              </button>

              {selectedExerciseData && (
                <div className="bg-background rounded-2xl border border-border/50 overflow-hidden">
                  {/* Header */}
                  <div className={cn('p-6 bg-gradient-to-r', selectedExerciseData.color)}>
                    <selectedExerciseData.icon className="w-10 h-10 text-white mb-3" />
                    <h2 className="text-2xl font-bold text-white">{selectedExerciseData.name}</h2>
                    <p className="text-white/80">{selectedExerciseData.description}</p>
                  </div>

                  <div className="p-6">
                    {/* Box Breathing Interactive */}
                    {selectedExercise === 'box-breathing' && (
                      <div className="text-center">
                        <div className="relative w-48 h-48 mx-auto mb-8">
                          {/* Animated Box */}
                          <div className="absolute inset-0 border-4 border-primary/30 rounded-xl" />
                          <motion.div
                            className="absolute inset-4 rounded-lg bg-primary/10 flex items-center justify-center"
                            animate={isActive ? { scale: [1, 1.1, 1.1, 1, 1] } : {}}
                            transition={{ duration: 16, repeat: isActive ? Infinity : 0 }}
                          >
                            <div className="text-center">
                              <p className="text-4xl font-bold text-foreground">{breathTimer + 1}</p>
                              <p className="text-sm text-muted-foreground">{getPhaseName(currentStep)}</p>
                            </div>
                          </motion.div>
                        </div>

                        <div className="flex justify-center gap-4 mb-8">
                          {!isActive ? (
                            <Button onClick={startBreathing} className="gap-2">
                              <Play className="w-4 h-4" />
                              Start Exercise
                            </Button>
                          ) : (
                            <>
                              <Button variant="outline" onClick={stopBreathing} className="gap-2">
                                <Pause className="w-4 h-4" />
                                Pause
                              </Button>
                              <Button onClick={completeExercise} className="gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Complete
                              </Button>
                            </>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          {selectedExerciseData.steps?.map((step, index) => (
                            <div
                              key={index}
                              className={cn(
                                'p-4 rounded-xl border-2 transition-colors',
                                currentStep === index
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border/50'
                              )}
                            >
                              <p className="font-semibold text-foreground">{step.phase}</p>
                              <p className="text-sm text-muted-foreground">{step.duration}s</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5-4-3-2-1 Technique */}
                    {selectedExercise === '5-4-3-2-1' && (
                      <div className="space-y-4">
                        {selectedExerciseData.steps?.map((step, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50"
                          >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <span className="text-2xl font-bold text-primary">{step.count}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{step.sense}</p>
                              <p className="text-sm text-muted-foreground">{step.instruction}</p>
                            </div>
                          </div>
                        ))}

                        <Button onClick={completeExercise} className="w-full mt-6 gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Mark as Complete
                        </Button>
                      </div>
                    )}

                    {/* Body Scan */}
                    {selectedExercise === 'body-scan' && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground text-center mb-6">
                          Close your eyes and slowly focus on each body part, noticing any tension and consciously relaxing.
                        </p>
                        
                        {selectedExerciseData.bodyParts?.map((part, index) => (
                          <motion.div
                            key={part}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-4 rounded-xl border border-border/50"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                              {index + 1}
                            </div>
                            <span className="font-medium text-foreground">{part}</span>
                          </motion.div>
                        ))}

                        <Button onClick={completeExercise} className="w-full mt-6 gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Complete Exercise
                        </Button>
                      </div>
                    )}

                    {/* Progressive Relaxation */}
                    {selectedExercise === 'progressive-relaxation' && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground text-center mb-6">
                          Tense each muscle group for 5 seconds, then release and notice the difference.
                        </p>
                        
                        {selectedExerciseData.muscleGroups?.map((group, index) => (
                          <motion.div
                            key={group}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-4 rounded-xl border border-border/50"
                          >
                            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-sm font-semibold text-rose-500">
                              {index + 1}
                            </div>
                            <span className="font-medium text-foreground">{group}</span>
                          </motion.div>
                        ))}

                        <Button onClick={completeExercise} className="w-full mt-6 gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Complete Exercise
                        </Button>
                      </div>
                    )}

                    {/* Other Exercises */}
                    {['anchor-breathing', 'sound-grounding'].includes(selectedExercise) && (
                      <div className="text-center py-8">
                        <selectedExerciseData.icon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-6">
                          {selectedExerciseData.description}
                        </p>
                        <Button onClick={completeExercise} className="gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Mark as Complete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-background rounded-2xl border border-border/50 p-6"
        >
          <h3 className="font-semibold text-foreground mb-4">When to Use Grounding</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { situation: 'Before a big call', tip: 'Take 2 minutes for box breathing' },
              { situation: 'After a rejection', tip: 'Use the 5-4-3-2-1 technique to reset' },
              { situation: 'Feeling overwhelmed', tip: 'Quick body scan to release tension' },
            ].map((item) => (
              <div key={item.situation} className="p-4 rounded-xl bg-secondary/50">
                <p className="font-medium text-foreground">{item.situation}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
