'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Moon,
  Sun,
  Loader2,
  CheckCircle2,
  Target,
  Lightbulb,
  Users,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSafeUser } from '@/lib/safe-auth';
import { MobileHeader } from '@/components/MobileHeader';
import { cn } from '@/lib/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// 16 Questions from the PDF - 4 for each pattern
const QUESTIONS = [
  // Driver Pattern (Q1-Q4) - Action / Urgency / Discomfort with Inaction
  { id: 1, pattern: 'driver', text: 'When things feel uncertain, I would rather act quickly than spend time trying to fully understand the situation.' },
  { id: 2, pattern: 'driver', text: 'When I feel pressure building, my instinct is to push harder, even if I haven\'t had time to step back and think.' },
  { id: 3, pattern: 'driver', text: 'I feel restless or uneasy if I\'m not actively doing something to move things forward.' },
  { id: 4, pattern: 'driver', text: 'I find it very difficult to fully switch off from work, even when I know I should.' },

  // Strategist Pattern (Q5-Q8) - Clarity / Structure / Mental Processing
  { id: 5, pattern: 'strategist', text: 'When things feel unclear, I would rather delay action than move forward without a clear understanding.' },
  { id: 6, pattern: 'strategist', text: 'I often find myself trying to work out why something happened, even after it\'s been resolved.' },
  { id: 7, pattern: 'strategist', text: 'I prefer to have a clear plan before taking action.' },
  { id: 8, pattern: 'strategist', text: 'It is difficult for me to switch off if I feel something hasn\'t been fully thought through.' },

  // Connector Pattern (Q9-Q12) - Relationships / External Processing / EQ
  { id: 9, pattern: 'connector', text: 'When work feels challenging, I instinctively turn to others rather than working through it alone.' },
  { id: 10, pattern: 'connector', text: 'I find it difficult to move forward with something if I haven\'t talked it through with someone.' },
  { id: 11, pattern: 'connector', text: 'Maintaining trust and connection with others feels as important as achieving the outcome.' },
  { id: 12, pattern: 'connector', text: 'I can feel emotionally drained after interactions with others at work, even when things seem positive on the surface.' },

  // Reactor Pattern (Q13-Q16) - Emotional Sensitivity / Fluctuation
  { id: 13, pattern: 'reactor', text: 'My confidence is strongly influenced by how things are going at work.' },
  { id: 14, pattern: 'reactor', text: 'The outcomes (both the wins and the setbacks) I experience at work can have a noticeable impact on my mood.' },
  { id: 15, pattern: 'reactor', text: 'When things don\'t go well, it can affect my energy or focus more than I would like.' },
  { id: 16, pattern: 'reactor', text: 'When things are not going well, I can react in ways I later wish I had handled differently.' },
];

// Response scale with values as per PDF - Strongly Agree first (5 → 1)
const RESPONSE_SCALE = [
  { value: 5, label: 'Strongly Agree' },
  { value: 4, label: 'Agree' },
  { value: 3, label: 'Neutral' },
  { value: 2, label: 'Disagree' },
  { value: 1, label: 'Strongly Disagree' },
];

const PATTERN_INFO = {
  driver: {
    name: 'Driver',
    icon: Target,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    description: 'Increase momentum and take action',
  },
  strategist: {
    name: 'Strategist',
    icon: Lightbulb,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Regain control through analysis and planning',
  },
  connector: {
    name: 'Connector',
    icon: Users,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    description: 'Stabilise through relationships and communication',
  },
  reactor: {
    name: 'Reactor',
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    description: 'Emotional sensitivity to outcomes',
  },
};

export default function DiagnosticPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useSafeUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Randomize questions once on mount using Fisher-Yates shuffle
  const randomizedQuestions = useMemo(() => {
    const shuffled = [...QUESTIONS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Dark mode
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');
  }, []);

  // Redirect if not signed in - LOGIN FIRST
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  // Show loading while checking auth or redirecting
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

  const question = randomizedQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / randomizedQuestions.length) * 100;
  const patternInfo = PATTERN_INFO[question.pattern as keyof typeof PATTERN_INFO];
  const PatternIcon = patternInfo.icon;

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    // Auto-advance after selection
    setTimeout(() => {
      if (currentQuestion < randomizedQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Calculate scores using PDF formula: (Raw Score - 4) / 16 * 100
  const calculateScores = () => {
    const rawScores = {
      driver: 0,
      strategist: 0,
      connector: 0,
      reactor: 0,
    };

    // Sum scores for each pattern using the actual question values
    QUESTIONS.forEach((q) => {
      rawScores[q.pattern as keyof typeof rawScores] += answers[q.id] || 0;
    });

    // Calculate normalized percentages: (Raw Score - 4) / 16 * 100
    const percentages = {
      driver: Math.round(((rawScores.driver - 4) / 16) * 100),
      strategist: Math.round(((rawScores.strategist - 4) / 16) * 100),
      connector: Math.round(((rawScores.connector - 4) / 16) * 100),
      reactor: Math.round(((rawScores.reactor - 4) / 16) * 100),
    };

    return { rawScores, percentages };
  };

  // Tie-break logic as per PDF
  const determinePrimaryProfile = (rawScores: Record<string, number>) => {
    // Sort profiles by score descending
    const sorted = Object.entries(rawScores).sort(([, a], [, b]) => b - a);
    
    const highestScore = sorted[0][1];
    const secondHighestScore = sorted[1][1];
    
    // Check for ties
    const tiedProfiles = sorted.filter(([, score]) => score === highestScore).map(([profile]) => profile);

    let primaryProfile: string;

    if (tiedProfiles.length > 1) {
      // Tie-break logic
      // Step 1: Compare highest individual question score among tied profiles
      let maxQuestionScore = 0;
      let profilesAfterStep1 = [...tiedProfiles];

      for (const profile of tiedProfiles) {
        const profileQuestions = QUESTIONS.filter(q => q.pattern === profile);
        const questionScores = profileQuestions.map(q => answers[q.id] || 0);
        const highestQScore = Math.max(...questionScores);
        
        if (highestQScore > maxQuestionScore) {
          maxQuestionScore = highestQScore;
          profilesAfterStep1 = [profile];
        } else if (highestQScore === maxQuestionScore) {
          if (!profilesAfterStep1.includes(profile)) {
            profilesAfterStep1.push(profile);
          }
        }
      }

      if (profilesAfterStep1.length === 1) {
        primaryProfile = profilesAfterStep1[0];
      } else {
        // Step 2: Compare number of responses scored 5
        let maxFives = 0;
        let profilesAfterStep2 = [...profilesAfterStep1];

        for (const profile of profilesAfterStep1) {
          const profileQuestions = QUESTIONS.filter(q => q.pattern === profile);
          const fives = profileQuestions.filter(q => answers[q.id] === 5).length;
          
          if (fives > maxFives) {
            maxFives = fives;
            profilesAfterStep2 = [profile];
          } else if (fives === maxFives) {
            if (!profilesAfterStep2.includes(profile)) {
              profilesAfterStep2.push(profile);
            }
          }
        }

        if (profilesAfterStep2.length === 1) {
          primaryProfile = profilesAfterStep2[0];
        } else {
          // Step 3: Compare number of responses scored 4
          let maxFours = 0;
          let profilesAfterStep3 = [...profilesAfterStep2];

          for (const profile of profilesAfterStep2) {
            const profileQuestions = QUESTIONS.filter(q => q.pattern === profile);
            const fours = profileQuestions.filter(q => answers[q.id] === 4).length;
            
            if (fours > maxFours) {
              maxFours = fours;
              profilesAfterStep3 = [profile];
            } else if (fours === maxFours) {
              if (!profilesAfterStep3.includes(profile)) {
                profilesAfterStep3.push(profile);
              }
            }
          }

          if (profilesAfterStep3.length === 1) {
            primaryProfile = profilesAfterStep3[0];
          } else {
            // Step 4: Fixed precedence
            const precedence = ['driver', 'strategist', 'connector', 'reactor'];
            primaryProfile = precedence.find(p => profilesAfterStep3.includes(p)) || 'driver';
          }
        }
      }
    } else {
      primaryProfile = sorted[0][0];
    }

    // Calculate confidence based on gap between 1st and 2nd
    const gap = highestScore - secondHighestScore;
    let confidence: 'strong' | 'moderate' | 'blended';
    
    if (gap >= 4) {
      confidence = 'strong';
    } else if (gap >= 2) {
      confidence = 'moderate';
    } else {
      confidence = 'blended';
    }

    const secondaryProfile = sorted[1][0];

    return { primaryProfile, secondaryProfile, confidence, gap };
  };

  const generateReport = (rawScores: Record<string, number>, percentages: Record<string, number>) => {
    const { primaryProfile, secondaryProfile, confidence } = determinePrimaryProfile(rawScores);

    // Generate strengths based on primary profile
    const strengthsMap: Record<string, string[]> = {
      driver: [
        'Strong drive to move things forward',
        'Ability to create momentum quickly',
        'Resilience in fast-paced or high-demand situations',
        'Willingness to take ownership and responsibility',
      ],
      strategist: [
        'Thoughtful and considered decision-making',
        'Strong planning and problem-solving capability',
        'Ability to identify patterns and make sense of complexity',
        'Maintaining perspective in uncertain situations',
      ],
      connector: [
        'Strong emotional intelligence and empathy',
        'Ability to build trust and maintain relationships',
        'Collaborative approach to challenges',
        'Positive influence on team morale and cohesion',
      ],
      reactor: [
        'Strong sense of accountability and ownership',
        'High levels of engagement and care for outcomes',
        'Responsiveness and awareness of changing situations',
        'Energy and passion in performance-driven environments',
      ],
    };

    // Generate wellbeing risks
    const risksMap: Record<string, string[]> = {
      driver: [
        'Difficulty switching off or recovering outside of work',
        'Sustained mental and physical fatigue over time',
        'Impatience when progress is slower than expected',
        'Tendency to prioritise output over personal wellbeing',
      ],
      strategist: [
        'Overthinking or difficulty switching off mentally',
        'Reduced confidence when clarity is lacking',
        'Hesitation when quick decisions are required',
        'Mental fatigue from sustained cognitive load',
      ],
      connector: [
        'Absorbing emotional stress from others',
        'Difficulty maintaining boundaries between work and personal life',
        'Avoidance of difficult or uncomfortable conversations',
        'Emotional fatigue from sustained interpersonal demands',
      ],
      reactor: [
        'Fluctuations in confidence, focus and motivation',
        'Difficulty maintaining perspective during setbacks',
        'Emotional exhaustion over prolonged periods',
        'Reactive patterns that affect consistency',
      ],
    };

    // Reflection questions
    const reflectionMap: Record<string, string> = {
      driver: 'What would happen if you paused before pushing forward? What might you notice?',
      strategist: 'What would it feel like to trust your instincts without having all the answers?',
      connector: 'What would change if you prioritised your own needs alongside others?',
      reactor: 'What small ritual could help you stabilise when things feel uncertain?',
    };

    // Pattern descriptions for the report
    const descriptionMap: Record<string, string> = {
      driver: 'When work becomes demanding, you instinctively respond by pushing forward. You increase activity, accelerate progress and focus on moving outcomes forward. You can be highly effective in maintaining momentum and generating results. However, sustained intensity can make it difficult to step back, recover or switch off, which may impact longer-term wellbeing and decision-making.',
      strategist: 'You respond to challenge by stepping back and seeking to understand the situation more clearly. You analyse information, reassess approach and aim to regain clarity before acting. This can bring strong judgement and structured thinking. However, prolonged uncertainty may lead to over-analysis or difficulty disengaging from work outside of working hours.',
      connector: 'You respond by focusing on people. You prioritise communication, trust and collaboration, often helping to stabilise both client relationships and team dynamics. This relational strength is highly valuable. However, sustained emotional engagement can sometimes lead to fatigue or difficulty maintaining personal boundaries.',
      reactor: 'You experience the emotional impact of sales more strongly. Your confidence and energy can fluctuate in response to wins, setbacks and changing circumstances. You often bring passion and accountability to your work. However, without strategies for stabilisation, these emotional shifts can affect confidence, focus and consistency over time.',
    };

    return {
      strengths: strengthsMap[primaryProfile] || [],
      wellbeingRisks: risksMap[primaryProfile] || [],
      primaryProfile,
      secondaryProfile,
      confidence,
      reflectionQuestion: reflectionMap[primaryProfile] || 'What patterns do you notice in your responses?',
      description: descriptionMap[primaryProfile] || '',
      rawScores,
      percentages,
    };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const { rawScores, percentages } = calculateScores();
    const report = generateReport(rawScores, percentages);

    // Store results in localStorage (kept for offline / fallback UX)
    const results = {
      ...report,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem('diagnosticResults', JSON.stringify(results));

    // Persist to DB so manager dashboards + AI engine can read it.
    // Best-effort — if the API is unreachable or returns an error,
    // we still navigate to the results page (localStorage has the data).
    const primaryProfileTitleCase = report.primaryProfile
      ? report.primaryProfile.charAt(0).toUpperCase() + report.primaryProfile.slice(1)
      : '';
    const secondaryProfileTitleCase = report.secondaryProfile
      ? report.secondaryProfile.charAt(0).toUpperCase() + report.secondaryProfile.slice(1)
      : null;

    const answersArray = QUESTIONS.map((q) => ({
      questionId: q.id,
      score: answers[q.id] ?? 0,
    })).filter((a) => a.score > 0);

    try {
      await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverScore: percentages.driver,
          strategistScore: percentages.strategist,
          connectorScore: percentages.connector,
          reactorScore: percentages.reactor,
          primaryProfile: primaryProfileTitleCase,
          secondaryProfile: secondaryProfileTitleCase,
          answers: answersArray,
          strengths: report.strengths || [],
          wellbeingRisks: report.risks || [],
          recommendations: report.recommendations || [],
          isPaid: false,
          attemptSource: 'snapshot',
        }),
      });
    } catch (err) {
      // Non-fatal — localStorage already has the result
      console.warn('Failed to persist diagnostic result to DB:', err);
    }

    // Navigate to results page
    router.push('/diagnostic/results');
  };

  const allAnswered = Object.keys(answers).length === QUESTIONS.length;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden noise">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, oklch(0.45 0.2 270), oklch(0.55 0.22 300))' }}
        />
        <div
          className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[40%] rounded-full opacity-15 blur-[100px]"
          style={{ background: 'linear-gradient(135deg, oklch(0.55 0.18 200), oklch(0.45 0.2 270))' }}
        />
        <div className="absolute inset-0 dot-pattern opacity-30" />
      </div>

      {/* Mobile Header */}
      <MobileHeader
        title="Verso Sales Wellbeing Map"
        subtitle="Discover your pattern in 3-5 minutes"
        icon="target"
        onToggleDark={toggleDark}
        isDark={isDark}
      />

      {/* Desktop Header */}
      <header className="sticky top-0 z-50 hide-on-mobile">
        <div className="glass border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="p-2 rounded-xl hover:bg-secondary/80 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-premium">
                  <img src="/logo.svg" alt="Verso" className="w-6 h-6" style={{ filter: 'brightness(0) invert(1)' }} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Verso Sales Wellbeing Map</h1>
                  <p className="text-xs text-muted-foreground">Discover your Sales Wellbeing Pattern in 3-5 minutes</p>
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

      {/* Main Content */}
      <main className="relative z-10 pb-8 px-4 md:px-6 pt-6 md:pt-10">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {randomizedQuestions.length}
              </span>
              <span className="text-sm font-medium text-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="glass rounded-2xl border border-border/50 p-6 md:p-8 shadow-premium"
            >
              {/* Pattern Badge */}
              <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6', patternInfo.bgColor)}>
                <PatternIcon className={cn('w-4 h-4', patternInfo.color)} />
                <span className={cn('text-sm font-medium', patternInfo.color)}>{patternInfo.name}</span>
              </div>

              {/* Question Text */}
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-8">
                {question.text}
              </h2>

              {/* Response Options */}
              <div className="space-y-3">
                {RESPONSE_SCALE.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={cn(
                      'w-full text-left px-5 py-4 rounded-xl border-2 transition-all',
                      answers[question.id] === option.value
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border/50 hover:border-primary/30 hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                          answers[question.id] === option.value
                            ? 'border-primary bg-primary'
                            : 'border-border/50'
                        )}
                      >
                        {answers[question.id] === option.value && (
                          <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                        )}
                      </div>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all',
                currentQuestion === 0
                  ? 'opacity-50 cursor-not-allowed text-muted-foreground'
                  : 'text-foreground hover:bg-secondary/80'
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {currentQuestion === randomizedQuestions.length - 1 && allAnswered ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all shadow-premium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    View Results
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                disabled={!answers[question.id]}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all',
                  answers[question.id]
                    ? 'text-primary hover:bg-primary/10'
                    : 'opacity-50 cursor-not-allowed text-muted-foreground'
                )}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Pattern Legend */}
          <div className="mt-10 glass rounded-xl border border-border/50 p-4">
            <p className="text-xs text-muted-foreground mb-3 font-medium">Patterns being measured:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(PATTERN_INFO).map(([key, info]) => {
                const Icon = info.icon;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', info.bgColor)}>
                      <Icon className={cn('w-4 h-4', info.color)} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{info.name}</p>
                      <p className="text-[10px] text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Assessment Upsell */}
          <div className="mt-6 glass rounded-xl border border-primary/20 p-4 bg-primary/5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">
                  Want to go deeper?
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  This 16-question Snapshot reveals your primary pattern. The full 64-question Sales Wellbeing Map adds 8 sub-dimension scores, 4 cross-archetype wellbeing indicators, and an overall wellbeing index — your AI Companion uses all of it to personalize advice.
                </p>
                <Link
                  href="/diagnostic/full"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  Take the Full Assessment (64 questions)
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
