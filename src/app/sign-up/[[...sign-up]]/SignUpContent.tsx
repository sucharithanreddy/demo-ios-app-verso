'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Moon, Sun, User, Briefcase, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';

type UserType = 'individual' | 'sales_person' | 'sales_manager';

const userTypeLabels: Record<UserType, { title: string; icon: typeof User }> = {
  individual: { title: 'Individual', icon: User },
  sales_person: { title: 'Sales Person', icon: Briefcase },
  sales_manager: { title: 'Sales Manager', icon: UserCog },
};

export default function SignUpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [ClerkSignUp, setClerkSignUp] = useState<React.ComponentType<any> | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<UserType>('individual');
  const [typeLoaded, setTypeLoaded] = useState(false);

  // Get type from URL - safe because we're in Suspense
  const typeFromUrl = searchParams.get('type') as UserType | null;

  // Dark mode and mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');
  }, []);

  // Handle user type from URL or storage
  useEffect(() => {
    const validTypes = ['individual', 'sales_person', 'sales_manager'];
    let typeToUse: UserType = 'individual';

    // Priority: URL param > sessionStorage > localStorage
    if (typeFromUrl && validTypes.includes(typeFromUrl)) {
      typeToUse = typeFromUrl;
      console.log('[SIGN-UP] Type from URL:', typeToUse);
    } else {
      const sessionType = sessionStorage.getItem('verso_selected_user_type');
      const localType = localStorage.getItem('verso_selected_user_type');
      
      if (sessionType && validTypes.includes(sessionType)) {
        typeToUse = sessionType as UserType;
        console.log('[SIGN-UP] Type from sessionStorage:', typeToUse);
      } else if (localType && validTypes.includes(localType)) {
        typeToUse = localType as UserType;
        console.log('[SIGN-UP] Type from localStorage:', typeToUse);
      }
    }

    setSelectedUserType(typeToUse);
    // Store for persistence through OAuth
    sessionStorage.setItem('verso_selected_user_type', typeToUse);
    localStorage.setItem('verso_selected_user_type', typeToUse);
    console.log('[SIGN-UP] Final type:', typeToUse);
    
    setTypeLoaded(true);
  }, [typeFromUrl]);

  // Load Clerk SignUp component if available
  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (pk && pk.length > 10 && !pk.includes('placeholder')) {
      import('@clerk/nextjs')
        .then((mod) => {
          setClerkSignUp(() => mod.SignUp);
        })
        .catch(() => {});
    }
  }, []);

  // Build redirect URL with type parameter
  const redirectUrl = `/redirect?type=${selectedUserType}`;

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  // Demo sign-up
  const handleDemoSignUp = () => {
    sessionStorage.setItem('verso_demo_signed_in', 'true');
    router.push(redirectUrl);
  };

  // Handle user type change
  const handleUserTypeChange = (type: UserType) => {
    setSelectedUserType(type);
    sessionStorage.setItem('verso_selected_user_type', type);
    localStorage.setItem('verso_selected_user_type', type);
    console.log('[SIGN-UP] User changed type to:', type);
  };

  if (!mounted) {
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

  // If Clerk is configured and SignUp component is loaded, use it
  if (ClerkSignUp && typeLoaded) {
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
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50">
          <div className="glass border-b border-border/50">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="p-2 rounded-xl hover:bg-secondary/80 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-premium">
                    <img src="/logo.svg" alt="Verso" className="w-6 h-6" style={{ filter: 'brightness(0) invert(1)' }} />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-foreground">Create Account</h1>
                    <p className="text-xs text-muted-foreground">Join Verso today</p>
                  </div>
                </div>
                <button
                  onClick={toggleDark}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 flex flex-col items-center justify-center p-6">
          {/* User Type Selection */}
          <div className="mb-6 w-full max-w-md">
            <p className="text-sm text-muted-foreground mb-3 text-center">I am a...</p>
            <div className="grid grid-cols-3 gap-3">
              {(['individual', 'sales_person', 'sales_manager'] as UserType[]).map((type) => {
                const Icon = userTypeLabels[type].icon;
                return (
                  <button
                    key={type}
                    onClick={() => handleUserTypeChange(type)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      selectedUserType === type
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/30'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${selectedUserType === type ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs font-medium ${selectedUserType === type ? 'text-primary' : 'text-muted-foreground'}`}>
                      {userTypeLabels[type].title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clerk SignUp Component */}
          <ClerkSignUp
            forceRedirectUrl={redirectUrl}
            signInUrl={`/sign-in?type=${selectedUserType}`}
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "glass border border-border/50 shadow-premium",
              },
            }}
          />
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Creating account as: <span className="font-medium text-foreground">{userTypeLabels[selectedUserType].title}</span>
          </p>
        </main>
      </div>
    );
  }

  // Fallback UI when Clerk is not configured
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
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50">
        <div className="glass border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="p-2 rounded-xl hover:bg-secondary/80 transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-premium">
                  <img src="/logo.svg" alt="Verso" className="w-6 h-6" style={{ filter: 'brightness(0) invert(1)' }} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Create Account</h1>
                  <p className="text-xs text-muted-foreground">Join Verso today</p>
                </div>
              </div>
              <button
                onClick={toggleDark}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center p-6 pt-20">
        {/* User Type Selection */}
        <div className="mb-6 w-full max-w-md">
          <p className="text-sm text-muted-foreground mb-3 text-center">I am a...</p>
          <div className="grid grid-cols-3 gap-3">
            {(['individual', 'sales_person', 'sales_manager'] as UserType[]).map((type) => {
              const Icon = userTypeLabels[type].icon;
              return (
                <button
                  key={type}
                  onClick={() => handleUserTypeChange(type)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    selectedUserType === type
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 hover:border-primary/30'
                  }`}
                >
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${selectedUserType === type ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs font-medium ${selectedUserType === type ? 'text-primary' : 'text-muted-foreground'}`}>
                    {userTypeLabels[type].title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl border border-border/50 p-8 max-w-md w-full text-center shadow-premium">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-lg">
            <img src="/logo.svg" alt="Verso" className="w-10 h-10" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Verso</h2>
          <p className="text-muted-foreground mb-6">
            Create an account to unlock personalized reflection tools and track your wellbeing journey.
          </p>

          {/* Demo Mode Notice */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Authentication is not configured. You&apos;re in demo mode.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleDemoSignUp}
              className="w-full bg-gradient-to-r from-primary to-accent text-white shadow-premium"
            >
              Get Started (Demo Mode)
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href={`/sign-in?type=${selectedUserType}`} className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
