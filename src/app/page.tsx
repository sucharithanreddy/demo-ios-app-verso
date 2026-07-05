'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Moon,
  Sun,
  Brain,
  Target,
  Users,
  Shield,
  CheckCircle2,
  User,
  Briefcase,
  UserCog,
  Sparkles,
  MessageSquare,
  Calendar,
  BarChart3,
  BookOpen,
  Lightbulb,
  Wind,
  X,
  Crown,
} from 'lucide-react';
import { useSafeUser } from '@/lib/safe-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

type UserType = 'individual' | 'sales_person' | 'sales_manager';

const coreFeatures = [
  {
    icon: Target,
    title: 'Sales Wellbeing Map',
    description: 'Our signature 16-question assessment that reveals your instinctive response pattern to sales pressure.',
    highlights: ['4 unique patterns', 'Personalized insights', 'Quick 3-minute assessment'],
  },
  {
    icon: Brain,
    title: 'AI Therapy Engine',
    description: 'Have confidential conversations with our AI trained to help you reframe negative thoughts.',
    highlights: ['24/7 availability', 'Judgment-free conversations', 'Cognitive reframing'],
  },
  {
    icon: Wind,
    title: 'Grounding Techniques',
    description: 'Quick, effective exercises to manage stress and anxiety in the moment.',
    highlights: ['5-4-3-2-1 technique', 'Box breathing', 'Quick stress relief'],
  },
  {
    icon: Lightbulb,
    title: 'Reframing Lab',
    description: 'Learn to identify cognitive distortions and practice replacing negative thought patterns.',
    highlights: ['Identify distortions', 'Practice reframing', 'Build mental flexibility'],
  },
];

const planComparison = [
  { feature: 'Sales Wellbeing Map Assessment', free: true, premium: true },
  { feature: 'Basic Pattern Results', free: true, premium: true },
  { feature: 'Detailed Analysis & Recommendations', free: false, premium: true },
  { feature: 'AI Therapy Engine', free: false, premium: true },
  { feature: 'Grounding Techniques Library', free: false, premium: true },
  { feature: 'Daily Mood Check-in', free: false, premium: true },
  { feature: 'Manager Team Dashboard', free: false, premium: true },
];

const services = [
  { icon: BookOpen, title: 'Workshops', description: 'Interactive sessions to build resilience for sales teams.' },
  { icon: MessageSquare, title: 'Coaching Sessions', description: 'One-on-one coaching with certified professionals.' },
  { icon: Brain, title: 'Digital Tools', description: 'Self-paced assessments and AI-powered insights.' },
];

const userTypeOptions = [
  { id: 'individual', title: 'Individual', subtitle: 'Personal use', icon: User },
  { id: 'sales_person', title: 'Sales Person', subtitle: 'Part of organization', icon: Briefcase },
  { id: 'sales_manager', title: 'Sales Manager', subtitle: 'Team leader', icon: UserCog },
];

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useSafeUser();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType>('individual');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
      setIsDark(shouldBeDark);
      if (shouldBeDark) document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
    }
    document.documentElement.classList.toggle('dark', newDark);
  };

  // SIMPLE NAVIGATION - Update DB then redirect directly
  const navigateToDashboard = async () => {
    setIsRedirecting(true);
    
    const upperType = selectedUserType.toUpperCase();
    console.log('[LANDING] Selected type:', upperType);
    
    try {
      // Update database first
      const response = await fetch('/api/auth/redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedUserType: upperType }),
      });
      
      const data = await response.json();
      console.log('[LANDING] API response:', data);
      
      // Redirect based on the database response
      if (data.userType === 'SALES_MANAGER') {
        router.push('/manager-dashboard');
      } else {
        router.push('/sales-dashboard');
      }
    } catch (error) {
      console.error('[LANDING] Error:', error);
      // Fallback - redirect based on selected type
      if (upperType === 'SALES_MANAGER') {
        router.push('/manager-dashboard');
      } else {
        router.push('/sales-dashboard');
      }
    }
  };

  // Sign in - go to sign in page with type
  const handleSignIn = () => {
    // Store the type for persistence through OAuth flow
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('verso_selected_user_type', selectedUserType);
      localStorage.setItem('verso_selected_user_type', selectedUserType);
    }
    // Pass lowercase type in URL (consistent with sign-in page expectations)
    router.push(`/sign-in?type=${selectedUserType}`);
    console.log('[LANDING] Navigating to sign-in with type:', selectedUserType);
  };

  // Sign up - go to sign up page with type  
  const handleSignUp = () => {
    // Store the type for persistence through OAuth flow
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('verso_selected_user_type', selectedUserType);
      localStorage.setItem('verso_selected_user_type', selectedUserType);
    }
    // Pass lowercase type in URL
    router.push(`/sign-up?type=${selectedUserType}`);
    console.log('[LANDING] Navigating to sign-up with type:', selectedUserType);
  };

  if (!mounted || !isLoaded) {
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

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse" />
            <div className="absolute inset-2 rounded-xl bg-primary/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="absolute inset-4 rounded-lg bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-muted-foreground">Setting up your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, oklch(0.45 0.2 270), oklch(0.55 0.22 300))' }} />
        <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[40%] rounded-full opacity-20 blur-[100px]"
          style={{ background: 'linear-gradient(135deg, oklch(0.55 0.18 200), oklch(0.45 0.2 270))' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Verso" className="h-8 w-auto" />
              <span className="text-xl font-semibold text-foreground">Verso</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleDark} className="w-10 h-10 rounded-xl flex items-center justify-center glass border border-border/50">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {isSignedIn ? (
                <button onClick={navigateToDashboard} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg">
                  Go to Dashboard
                </button>
              ) : (
                <button onClick={handleSignIn} className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Sales Wellbeing Platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Understand Your Mind.
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Transform Your Performance.
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                AI-powered mental wellbeing tools designed for sales professionals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button 
                  onClick={isSignedIn ? navigateToDashboard : handleSignUp}
                  whileHover={{ scale: 1.02 }}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
                  {isSignedIn ? 'Go to Dashboard' : 'Start Free Assessment'}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Value Proposition Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                { icon: Brain, title: 'AI-Powered Support', highlight: 'Like having a therapist in your pocket' },
                { icon: Target, title: '4 Response Patterns', highlight: 'Driver, Strategist, Connector, Reactor' },
                { icon: Wind, title: '10+ Grounding Tools', highlight: 'Quick relief when you need it' },
                { icon: Shield, title: '24/7 Confidential', highlight: 'Private, no appointments needed' },
              ].map((stat) => (
                <div key={stat.title} className="text-center p-6 rounded-2xl bg-secondary/50 border border-border/50">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{stat.title}</h3>
                  <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">{stat.highlight}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-secondary/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {coreFeatures.map((feature, i) => (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-background rounded-2xl border border-border/50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {feature.highlights.map((h) => (
                          <span key={h} className="text-xs px-3 py-1 rounded-full bg-secondary">{h}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Comparison */}
        <section className="py-20 px-4 bg-secondary/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Free vs Premium</h2>
            <div className="bg-background rounded-2xl border border-border/50 overflow-hidden">
              <div className="grid grid-cols-3 border-b border-border/50">
                <div className="p-4 font-semibold">Features</div>
                <div className="p-4 text-center border-x border-border/50 font-semibold">Free</div>
                <div className="p-4 text-center bg-primary/5 font-semibold">Premium</div>
              </div>
              {planComparison.map((row, i) => (
                <div key={row.feature} className={cn("grid grid-cols-3", i % 2 === 0 ? "bg-secondary/30" : "")}>
                  <div className="p-4 text-sm">{row.feature}</div>
                  <div className="p-4 text-center border-x border-border/50">
                    {row.free ? <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />}
                  </div>
                  <div className="p-4 text-center bg-primary/5">
                    <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, i) => (
                <div key={service.title} className="bg-background rounded-2xl border border-border/50 p-6">
                  <service.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Signup Section */}
        <section className="py-20 px-4 bg-secondary/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">
              {isSignedIn ? 'Select Your Role' : 'Create Your Account'}
            </h2>

            {/* User Type Selection */}
            <div className="mb-8">
              <div className="grid sm:grid-cols-3 gap-4">
                {userTypeOptions.map((option) => (
                  <button key={option.id} onClick={() => setSelectedUserType(option.id as UserType)}
                    className={cn('p-4 rounded-xl border-2 transition-all text-left',
                      selectedUserType === option.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30')}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center',
                        selectedUserType === option.id ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold">{option.title}</div>
                        <div className="text-xs text-muted-foreground">{option.subtitle}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="bg-background rounded-2xl border border-border/50 p-8 text-center">
              <Button 
                onClick={isSignedIn ? navigateToDashboard : handleSignUp}
                className="w-full py-6 text-base">
                <div className="flex items-center justify-center gap-2">
                  {isSignedIn ? 'Go to Dashboard' : 'Create Free Account'}
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-border/50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Verso" className="h-6 w-auto" />
              <span className="text-sm text-muted-foreground">© 2026 Verso</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://versonow.com" className="text-sm text-muted-foreground hover:text-foreground">Website</a>
              <a href="mailto:support@versonow.com" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
