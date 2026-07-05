'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  Lightbulb,
  Target,
  Zap,
  RefreshCcw,
  ArrowRight,
  Coffee,
  Sunset,
  AlertTriangle,
  Trophy,
  Calendar,
  Clock,
  Video,
  Users,
  Crown,
  CheckCircle2,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const SITUATIONS = [
  { id: 'morning', label: 'Morning boost', icon: Coffee, description: 'Start your day right' },
  { id: 'before_call', label: 'Before a call', icon: Target, description: 'Get focused' },
  { id: 'after_rejection', label: 'After rejection', icon: AlertTriangle, description: 'Stay resilient' },
  { id: 'bad_day', label: 'Rough day', icon: Sunset, description: 'Reset and recover' },
  { id: 'good_win', label: 'After a win', icon: Trophy, description: 'Channel momentum' },
];

const PLATFORMS = [
  { id: 'zoom', name: 'Zoom', icon: Video, color: 'bg-blue-500' },
  { id: 'teams', name: 'Microsoft Teams', icon: Users, color: 'bg-purple-500' },
  { id: 'google', name: 'Google Meet', icon: Video, color: 'bg-green-500' },
  { id: 'facetime', name: 'FaceTime', icon: Phone, color: 'bg-pink-500' },
];

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

const DATES = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i + 1);
  return {
    date: date.toISOString().split('T')[0],
    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    dateNum: date.getDate(),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
  };
});

export default function CoachingPage() {
  const [activeTab, setActiveTab] = useState<'tips' | 'sessions'>('tips');
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);
  const [coachingTip, setCoachingTip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<string | null>(null);
  const [hasFullAccess, setHasFullAccess] = useState(false);

  // Session booking state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [bookingComplete, setBookingComplete] = useState(false);

  useEffect(() => {
    const storedResults = localStorage.getItem('diagnosticResults');
    if (storedResults) {
      const results = JSON.parse(storedResults);
      setProfile(results.primaryProfile);
    }
    
    const access = localStorage.getItem('verso_full_access');
    setHasFullAccess(access === 'true');
  }, []);

  const fetchTip = async (situation: string) => {
    setIsLoading(true);
    setSelectedSituation(situation);
    
    try {
      const response = await fetch(`/api/coaching?situation=${situation}`);
      const data = await response.json();
      setCoachingTip(data.tip);
    } catch (error) {
      console.error('Error fetching tip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSession = () => {
    if (selectedDate && selectedTime && selectedPlatform) {
      setBookingComplete(true);
    }
  };

  return (
    <DashboardLayout title="1:1 Coaching" subtitle="Personalized support for your journey">
      <div className="max-w-3xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('tips')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all',
              activeTab === 'tips'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Micro-Tips
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all',
              activeTab === 'sessions'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Book a Session
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Micro-Tips Tab */}
          {activeTab === 'tips' && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Profile Badge */}
              {profile && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-sm font-medium text-primary">
                      Tips for {profile} profile
                    </span>
                  </div>
                </div>
              )}

              {/* Situation Selection */}
              {!selectedSituation && (
                <div className="bg-background rounded-2xl border border-border/50 p-6">
                  <div className="text-center mb-6">
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
                          onClick={() => fetchTip(situation.id)}
                          className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-secondary/50 transition-all group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-primary" />
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
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="bg-background rounded-2xl border border-border/50 p-8 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse" />
                    <div className="absolute inset-2 rounded-xl bg-primary/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="absolute inset-4 rounded-lg bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <p className="text-muted-foreground">Finding the right tip for you...</p>
                </div>
              )}

              {/* Coaching Tip */}
              {coachingTip && !isLoading && (
                <div className="space-y-6">
                  <div className="bg-background rounded-2xl border-2 border-primary/30 p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Lightbulb className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {coachingTip.actionTitle}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {coachingTip.tip}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setCoachingTip(null);
                        setSelectedSituation(null);
                      }}
                      className="flex-1 py-4 rounded-xl font-medium text-muted-foreground border border-border/50 hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Get Another Tip
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Book a Session Tab */}
          {activeTab === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Premium Gate */}
              {!hasFullAccess ? (
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-8 text-center">
                  <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">Unlock 1:1 Coaching</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Schedule private sessions with certified coaches who understand the unique pressures of sales environments.
                  </p>
                  <Link href="/pricing">
                    <Button className="gap-2">
                      Upgrade to Premium
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ) : bookingComplete ? (
                /* Booking Confirmation */
                <div className="bg-background rounded-2xl border border-green-500/30 p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Session Booked!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your coaching session has been scheduled. You'll receive a confirmation email with the meeting link.
                  </p>
                  <div className="bg-secondary/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
                        <p className="text-sm font-medium text-foreground">
                          {DATES.find(d => d.date === selectedDate)?.day}, {DATES.find(d => d.date === selectedDate)?.month} {DATES.find(d => d.date === selectedDate)?.dateNum}
                        </p>
                      </div>
                      <div className="text-center">
                        <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                        <p className="text-sm font-medium text-foreground">{selectedTime}</p>
                      </div>
                      <div className="text-center">
                        <Video className="w-5 h-5 text-primary mx-auto mb-1" />
                        <p className="text-sm font-medium text-foreground">
                          {PLATFORMS.find(p => p.id === selectedPlatform)?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBookingComplete(false);
                      setSelectedDate(null);
                      setSelectedTime(null);
                      setSelectedPlatform(null);
                      setSessionNotes('');
                    }}
                  >
                    Book Another Session
                  </Button>
                </div>
              ) : (
                /* Booking Form */
                <div className="bg-background rounded-2xl border border-border/50 p-6 space-y-6">
                  {/* Platform Selection */}
                  <div>
                    <Label className="text-base font-semibold text-foreground mb-3 block">
                      Select Platform
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {PLATFORMS.map((platform) => {
                        const Icon = platform.icon;
                        return (
                          <button
                            key={platform.id}
                            onClick={() => setSelectedPlatform(platform.id)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                              selectedPlatform === platform.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border/50 hover:border-primary/30'
                            )}
                          >
                            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', platform.color)}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-medium text-foreground">{platform.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <Label className="text-base font-semibold text-foreground mb-3 block">
                      Select Date
                    </Label>
                    <div className="grid grid-cols-7 gap-2">
                      {DATES.map((date) => (
                        <button
                          key={date.date}
                          onClick={() => setSelectedDate(date.date)}
                          className={cn(
                            'flex flex-col items-center p-3 rounded-xl border-2 transition-all',
                            selectedDate === date.date
                              ? 'border-primary bg-primary/5'
                              : 'border-border/50 hover:border-primary/30'
                          )}
                        >
                          <span className="text-xs text-muted-foreground">{date.day}</span>
                          <span className={cn(
                            'text-lg font-semibold',
                            selectedDate === date.date ? 'text-primary' : 'text-foreground'
                          )}>
                            {date.dateNum}
                          </span>
                          <span className="text-xs text-muted-foreground">{date.month}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <Label className="text-base font-semibold text-foreground mb-3 block">
                      Select Time
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {TIME_SLOTS.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            'p-3 rounded-xl border-2 text-sm font-medium transition-all',
                            selectedTime === time
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border/50 text-foreground hover:border-primary/30'
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label className="text-base font-semibold text-foreground mb-3 block">
                      What would you like to discuss? (optional)
                    </Label>
                    <textarea
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      placeholder="Any specific topics or challenges you'd like to address..."
                      className="w-full p-4 rounded-xl border border-border/50 bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Book Button */}
                  <Button
                    onClick={handleBookSession}
                    disabled={!selectedDate || !selectedTime || !selectedPlatform}
                    className="w-full py-6 gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Confirm Booking
                  </Button>
                </div>
              )}

              {/* Coaching Benefits */}
              {hasFullAccess && !bookingComplete && (
                <div className="mt-6 bg-background rounded-2xl border border-border/50 p-6">
                  <h3 className="font-semibold text-foreground mb-4">What to Expect</h3>
                  <div className="space-y-4">
                    {[
                      { icon: MessageSquare, text: '45-minute private session with a certified coach' },
                      { icon: Target, text: 'Personalized strategies for your unique challenges' },
                      { icon: Zap, text: 'Actionable takeaways you can implement immediately' },
                      { icon: Shield, text: 'Complete confidentiality and judgment-free space' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
