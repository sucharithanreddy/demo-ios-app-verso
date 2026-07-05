'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon,
  Sun,
  Home,
  Target,
  Calendar,
  BarChart3,
  Brain,
  Wind,
  Lightbulb,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { useSafeUser, demoSignOut } from '@/lib/safe-auth';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const navigationItems = [
  {
    category: 'Assessment',
    items: [
      {
        name: 'Sales Wellbeing Map',
        href: '/diagnostic',
        icon: Target,
        description: 'Discover your pattern',
        badge: 'Free',
      },
    ],
  },
  {
    category: 'Daily Tools',
    items: [
      {
        name: 'Daily Check-in',
        href: '/checkin',
        icon: Calendar,
        description: 'Track your wellbeing',
      },
      {
        name: 'AI Therapy Engine',
        href: '/reflect',
        icon: Brain,
        description: 'Talk through challenges',
        badge: 'Premium',
      },
      {
        name: 'Grounding Exercises',
        href: '/grounding',
        icon: Wind,
        description: 'Calm stress quickly',
        badge: 'Premium',
      },
      {
        name: 'Reframing Lab',
        href: '/lab',
        icon: Lightbulb,
        description: 'Challenge negative thoughts',
        badge: 'Premium',
      },
    ],
  },
  {
    category: 'Personal Insights',
    items: [
      {
        name: 'My Profile',
        href: '/insights/profile',
        icon: User,
        description: 'Your information',
      },
      {
        name: 'Test Results',
        href: '/insights/results',
        icon: BarChart3,
        description: 'Your pattern analysis',
      },
      {
        name: 'Performance',
        href: '/insights/performance',
        icon: Sparkles,
        description: 'Track your progress',
        badge: 'Premium',
      },
    ],
  },
  {
    category: 'Support',
    items: [
      {
        name: '1:1 Coaching',
        href: '/coaching',
        icon: MessageSquare,
        description: 'Schedule a session',
        badge: 'Premium',
      },
      {
        name: 'Manager Dashboard',
        href: '/manager',
        icon: Users,
        description: 'Team insights',
        badge: 'Manager',
      },
    ],
  },
];

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded, user } = useSafeUser();
  
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');
    
    // Check for sidebar preference
    const sidebarPref = localStorage.getItem('sidebarCollapsed');
    if (sidebarPref) {
      setSidebarCollapsed(sidebarPref === 'true');
    }
  }, []);

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

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  const handleSignOut = () => {
    demoSignOut();
    router.push('/');
  };

  const getUserName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.firstName) return user.firstName;
    const storedName = sessionStorage.getItem('verso_user_name');
    if (storedName) return storedName;
    return 'User';
  };

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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-xl flex items-center justify-center glass border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-background border-r border-border/50 z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img src="/logo.svg" alt="Verso" className="h-8 w-auto" />
                    <span className="text-xl font-semibold text-foreground">Verso</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Mobile Navigation */}
                <nav className="space-y-6">
                  {navigationItems.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                        {category.category}
                      </h3>
                      <div className="space-y-1">
                        {category.items.map((item) => {
                          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                                isActive
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                              )}
                            >
                              <item.icon className="w-5 h-5 flex-shrink-0" />
                              <span className="font-medium">{item.name}</span>
                              {item.badge && (
                                <span className={cn(
                                  'text-xs px-2 py-0.5 rounded-full ml-auto',
                                  item.badge === 'Free' ? 'bg-green-500/10 text-green-600' :
                                  item.badge === 'Manager' ? 'bg-blue-500/10 text-blue-600' :
                                  'bg-primary/10 text-primary'
                                )}>
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300',
          sidebarCollapsed ? 'w-20' : 'w-72'
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-premium flex-shrink-0">
              <img src="/logo.svg" alt="Verso" className="w-6 h-6" style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-foreground truncate">Verso</h1>
                <p className="text-xs text-muted-foreground truncate">Sales Wellbeing</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {navigationItems.map((category) => (
            <div key={category.category}>
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                  {category.category}
                </h3>
              )}
              <div className="space-y-1">
                {category.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                      )}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon className={cn(
                        'w-5 h-5 flex-shrink-0',
                        isActive ? 'text-primary' : 'group-hover:text-foreground'
                      )} />
                      {!sidebarCollapsed && (
                        <>
                          <span className="font-medium flex-1">{item.name}</span>
                          {item.badge && (
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded-full',
                              item.badge === 'Free' ? 'bg-green-500/10 text-green-600' :
                              item.badge === 'Manager' ? 'bg-blue-500/10 text-blue-600' :
                              'bg-primary/10 text-primary'
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-border/50">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{getUserName()}</p>
                <p className="text-xs text-muted-foreground truncate">Free Plan</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={cn('mt-3 flex gap-2', sidebarCollapsed && 'justify-center')}>
            <button
              onClick={toggleDark}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleSignOut}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-background border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors shadow-sm"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 ml-12 lg:ml-0">
                {title && (
                  <div>
                    <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                  </div>
                )}
              </div>
              
              {/* Right side actions */}
              <div className="flex items-center gap-3">
                <Link
                  href="/insights/profile"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">{getUserName()}</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
