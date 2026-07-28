'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  BarChart3,
  MessageCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  Target,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSafeUser, ClerkSignOutButton } from '@/lib/safe-auth';

interface ManagerDashboardLayoutProps {
  children: ReactNode;
}

type UserType = 'INDIVIDUAL' | 'SALES_PERSON' | 'SALES_MANAGER' | null;

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/manager-dashboard',
    icon: LayoutDashboard,
    description: 'Team overview',
  },
  {
    label: 'Team Members',
    href: '/manager-dashboard/team',
    icon: Users,
    description: 'Individual insights',
  },
  {
    label: 'Risk Areas',
    href: '/manager-dashboard/risk',
    icon: AlertTriangle,
    description: 'Stress & confidence alerts',
  },
  {
    label: 'Team Patterns',
    href: '/manager-dashboard/patterns',
    icon: BarChart3,
    description: 'Aggregated insights',
  },
  {
    label: 'Discussions',
    href: '/manager-dashboard/discussions',
    icon: MessageCircle,
    description: 'Communicate with team',
  },
  {
    label: 'Settings',
    href: '/manager-dashboard/settings',
    icon: Settings,
    description: 'Account & preferences',
  },
];

export function ManagerDashboardLayout({ children }: ManagerDashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useSafeUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [managerCode, setManagerCode] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState(0);
  const [copied, setCopied] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [userTypeLoaded, setUserTypeLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');
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
          console.log('[MANAGER LAYOUT] User type from API:', data.userType);
          setUserType(data.userType);
          setUserTypeLoaded(true);

          // Only bounce if we have an AFFIRMATIVE non-manager type.
          // If userType is null/undefined (user row not created yet, DB
          // unavailable, or API error), do NOT bounce - the redirect flow
          // that sent us here already validated the type via
          // POST /api/auth/redirect. Bouncing on null causes the
          // "manager can't reach manager-dashboard" bug when the DB
          // write in the POST handler failed silently.
          if (data.userType === 'INDIVIDUAL' || data.userType === 'SALES_PERSON') {
            console.log('[MANAGER LAYOUT] User is', data.userType, ', redirecting to sales-dashboard');
            router.push('/sales-dashboard');
          }
        } else {
          setUserTypeLoaded(true);
        }
      } catch (error) {
        console.error('[MANAGER LAYOUT] Error fetching user type:', error);
        setUserTypeLoaded(true);
      }
    };

    checkUserType();
  }, [isSignedIn, router]);

  useEffect(() => {
    // Fetch manager code
    const fetchManagerCode = async () => {
      try {
        const res = await fetch('/api/manager/code');
        if (res.ok) {
          const data = await res.json();
          setManagerCode(data.managerCode);
          setTeamSize(data.teamSize || 0);
        }
      } catch (e) {
        console.error('Error fetching manager code:', e);
      }
    };
    fetchManagerCode();
  }, []);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  const copyManagerCode = () => {
    if (managerCode) {
      navigator.clipboard.writeText(managerCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

  // Only block render if we definitively know they're not a manager.
  // If userType is null/unknown, allow render - the redirect flow already
  // validated the role, and bouncing here would trap the user on a
  // spinner forever if the DB row isn't created yet.
  if (userType === 'INDIVIDUAL' || userType === 'SALES_PERSON') {
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
              <Link href="/manager-dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Verso</h1>
                  <p className="text-xs text-muted-foreground">Manager Dashboard</p>
                </div>
              </Link>
            </div>

            {/* Manager Code Section */}
            <div className="p-4 border-b border-border">
              <p className="text-xs text-muted-foreground mb-2">Your Manager Code</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50">
                  <p className="text-sm font-mono font-semibold text-foreground">
                    {managerCode || 'Loading...'}
                  </p>
                </div>
                <button
                  onClick={copyManagerCode}
                  disabled={!managerCode}
                  className="p-2 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors"
                  title="Copy code"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Share this code with your team members
              </p>
            </div>

            {/* Team Size */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{teamSize}</p>
                  <p className="text-xs text-muted-foreground">Team Members</p>
                </div>
              </div>
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
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', isActive && 'text-white')} />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium', isActive && 'text-white')}>
                          {item.label}
                        </p>
                        <p className={cn('text-xs truncate', isActive ? 'text-white/70' : 'text-muted-foreground')}>
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
