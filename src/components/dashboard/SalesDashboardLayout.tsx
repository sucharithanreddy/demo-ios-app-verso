'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Heart,
  User,
  TrendingUp,
  Lightbulb,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  Target,
  Flame,
  Calendar,
  Award,
  Sparkles,
  Brain,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSafeUser, ClerkSignOutButton } from '@/lib/safe-auth';

interface SalesDashboardLayoutProps {
  children: ReactNode;
}

type UserType = 'INDIVIDUAL' | 'SALES_PERSON' | 'SALES_MANAGER' | null;

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/sales-dashboard',
    icon: LayoutDashboard,
    description: 'Overview & quick actions',
  },
  {
    label: 'Daily Check-in',
    href: '/sales-dashboard/checkin',
    icon: Heart,
    description: 'Log your mood & energy',
  },
  {
    label: 'Reflect AI',
    href: '/sales-dashboard/reflect',
    icon: Sparkles,
    description: 'AI thought companion',
  },
  {
    label: 'The Lab',
    href: '/sales-dashboard/lab',
    icon: Brain,
    description: 'Mental fitness tools',
  },
  {
    label: 'My Profile',
    href: '/sales-dashboard/profile',
    icon: User,
    description: 'Your archetype & strengths',
  },
  {
    label: 'Progress',
    href: '/sales-dashboard/progress',
    icon: TrendingUp,
    description: 'Track your journey',
  },
  {
    label: 'Coaching',
    href: '/sales-dashboard/coaching',
    icon: Lightbulb,
    description: 'Personalized tips',
  },
  {
    label: 'Settings',
    href: '/sales-dashboard/settings',
    icon: Settings,
    description: 'Account & preferences',
  },
];

export function SalesDashboardLayout({ children }: SalesDashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useSafeUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [archetype, setArchetype] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [userType, setUserType] = useState<UserType>(null);
  const [userTypeLoaded, setUserTypeLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');

    // Get archetype from localStorage — wrap in try/catch because a malformed
    // value would crash every sales-dashboard page (this layout wraps them all)
    // and surface as a "client-side exception" error.
    const results = localStorage.getItem('diagnosticResults');
    if (results) {
      try {
        const parsed = JSON.parse(results);
        if (parsed && typeof parsed.primaryProfile === 'string') {
          setArchetype(parsed.primaryProfile);
        }
      } catch (err) {
        console.error('[SALES LAYOUT] failed to parse diagnosticResults', err);
        localStorage.removeItem('diagnosticResults');
      }
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch user type and redirect if wrong dashboard
  useEffect(() => {
    if (!isSignedIn) return;

    const checkUserType = async () => {
      try {
        const res = await fetch('/api/auth/redirect');
        if (res.ok) {
          const data = await res.json();
          console.log('[SALES LAYOUT] User type from API:', data.userType);
          setUserType(data.userType);
          setUserTypeLoaded(true);

          // If user is a SALES_MANAGER, redirect to manager dashboard
          if (data.userType === 'SALES_MANAGER') {
            console.log('[SALES LAYOUT] User is SALES_MANAGER, redirecting to manager-dashboard');
            router.push('/manager-dashboard');
          }
        } else {
          setUserTypeLoaded(true);
        }
      } catch (error) {
        console.error('[SALES LAYOUT] Error fetching user type:', error);
        setUserTypeLoaded(true);
      }
    };

    checkUserType();
  }, [isSignedIn, router]);

  useEffect(() => {
    // Fetch streak
    const fetchStreak = async () => {
      try {
        const res = await fetch('/api/streak');
        const data = await res.json();
        if (data.streak) {
          setStreak(data.streak.currentStreak || 0);
        }
      } catch (e) {
        // Use localStorage fallback — guard against malformed JSON
        const stored = localStorage.getItem('userStreak');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setStreak(parsed?.currentStreak || 0);
          } catch (err) {
            console.error('[SALES LAYOUT] failed to parse userStreak', err);
            localStorage.removeItem('userStreak');
          }
        }
      }
    };
    fetchStreak();
  }, []);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  // Show loading while checking auth and user type
  if (!mounted || !isLoaded || !isSignedIn || !userTypeLoaded) {
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

  // Don't render if user is a SALES_MANAGER (they'll be redirected)
  if (userType === 'SALES_MANAGER') {
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || mobileMenuOpen) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed md:sticky top-0 left-0 h-screen w-72 bg-card border-r border-border z-40 flex flex-col',
              'md:translate-x-0'
            )}
          >
            {/* Logo & Brand */}
            <div className="p-6 border-b border-border">
              <Link href="/sales-dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Verso</h1>
                  <p className="text-xs text-muted-foreground">Sales Wellbeing</p>
                </div>
              </Link>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">Sales Person</p>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs text-muted-foreground">{streak} day streak</span>
                  </div>
                </div>
              </div>
              {archetype && (
                <div className="mt-3 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-muted-foreground">Your Archetype</p>
                  <p className="text-sm font-semibold text-primary capitalize">{archetype}</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
                Main Menu
              </p>
              <div className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-xl transition-all group',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', isActive && 'text-primary-foreground')} />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium', isActive && 'text-primary-foreground')}>
                          {item.label}
                        </p>
                        <p className={cn('text-xs truncate', isActive ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-border space-y-2">
              <button
                onClick={toggleDark}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <ClerkSignOutButton redirectUrl="/">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </ClerkSignOutButton>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar Toggle (Desktop) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden md:flex absolute top-6 z-30 w-6 h-6 items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-all"
        style={{ left: sidebarOpen ? '276px' : '16px' }}
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-x-hidden">
        {/* Content Container */}
        <div className="p-4 md:p-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
