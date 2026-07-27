'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Moon, 
  Sun, 
  TrendingUp, 
  ChevronRight,
  Crown,
  Zap,
  Target,
  Brain,
  Shield,
} from 'lucide-react';
import { SafeUserButton } from '@/lib/safe-auth';
import Link from 'next/link';
import { MobileHeader } from '@/components/MobileHeader';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Demo mode: Check localStorage for access (bypass payment)
function useDemoAccess() {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const access = localStorage.getItem('verso_full_access');
    const demoEmail = localStorage.getItem('verso_demo_email');
    setHasAccess(access === 'true');
    setEmail(demoEmail);
    setIsLoaded(true);
  }, []);

  return { hasAccess, isLoaded, email };
}

export default function ProfilePage() {
  const { hasAccess, isLoaded, email } = useDemoAccess();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  if (!isLoaded || !mounted) {
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

  // Get plan display info
  const getPlanInfo = () => {
    if (hasAccess) {
      return {
        name: 'Premium',
        icon: Crown,
        color: 'from-amber-500 to-orange-500',
        badge: 'bg-amber-500/20 text-amber-500',
      };
    }
    return {
      name: 'Free',
      icon: User,
      color: 'from-gray-400 to-gray-500',
      badge: 'bg-secondary text-muted-foreground',
    };
  };

  const planInfo = getPlanInfo();
  const PlanIcon = planInfo.icon;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden noise">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, oklch(0.45 0.2 270), oklch(0.55 0.22 300))' }}
        />
        <div className="absolute inset-0 dot-pattern opacity-30" />
      </div>

      {/* Mobile Header */}
      <MobileHeader
        title="Profile"
        subtitle="Your account"
        icon="user"
        onToggleDark={toggleDark}
        isDark={isDark}
        rightAction={
          hasAccess ? (
            <SafeUserButton afterSignOutUrl="/" />
          ) : null
        }
      />

      <main className="relative z-10 px-4 py-6 space-y-6">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-premium">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground truncate">
                {email || 'Demo User'}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {email || 'Sign up to save your progress'}
              </p>
            </div>
            {hasAccess && <SafeUserButton afterSignOutUrl="/" />}
          </div>
        </motion.div>

        {/* Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Subscription</h3>
            <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', planInfo.badge)}>
              {planInfo.name}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-premium', planInfo.color)}>
              <PlanIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {hasAccess ? 'Premium Plan' : 'Free Plan'}
              </p>
              {hasAccess && (
                <p className="text-xs text-muted-foreground">
                  Full access to all features
                </p>
              )}
              {!hasAccess && (
                <p className="text-xs text-muted-foreground">
                  Upgrade for full access to all features
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 pt-4 border-t border-border/50">
            {hasAccess ? (
              <Link href="/reflect" className="block">
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-premium">
                  <Zap className="w-4 h-4 mr-2" />
                  Go to Reflect
                </Button>
              </Link>
            ) : (
              <Link href="/payment" className="block">
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-premium glow-primary">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Link href="/diagnostic">
            <div className="glass rounded-xl border border-border/50 p-4 flex items-center justify-between ios-tap cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Take Diagnostic</p>
                  <p className="text-xs text-muted-foreground">Discover your pattern</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>

          <Link href="/lab">
            <div className="glass rounded-xl border border-border/50 p-4 flex items-center justify-between ios-tap cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">The Lab</p>
                  <p className="text-xs text-muted-foreground">Train your mind</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>

          {/* Privacy Settings Link */}
          <Link href="/profile/privacy">
            <div className="glass rounded-xl border border-border/50 p-4 flex items-center justify-between ios-tap cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Privacy &amp; Manager Visibility</p>
                  <p className="text-xs text-muted-foreground">Control how your manager sees your data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>

          {/* Dark Mode Toggle */}
          <div 
            onClick={toggleDark}
            className="glass rounded-xl border border-border/50 p-4 flex items-center justify-between ios-tap cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                {isDark ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-accent" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-xs text-muted-foreground">
                  {isDark ? 'Currently on' : 'Currently off'}
                </p>
              </div>
            </div>
            <div className={`
              w-12 h-7 rounded-full transition-colors relative
              ${isDark ? 'bg-primary' : 'bg-secondary'}
            `}>
              <motion.div
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                animate={{ left: isDark ? '26px' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center pt-4"
        >
          <p className="text-xs text-muted-foreground">
            Verso v1.0
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Anti-Hallucination Architecture with AI Safety Layer.
          </p>
        </motion.div>
      </main>

      <MobileNav />
    </div>
  );
}
