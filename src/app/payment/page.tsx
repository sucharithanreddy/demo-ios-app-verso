'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Moon,
  Sun,
  CreditCard,
  Check,
  Sparkles,
  Shield,
  Zap,
  Lock,
  ArrowRight,
  Star,
  Heart,
  Target,
  Key,
  Building2,
  AlertCircle,
  CheckCircle2,
  Gift,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MobileHeader } from '@/components/MobileHeader';
import { SafeSignInButton, SafeUserButton, useSafeUser } from '@/lib/safe-auth';
import { cn } from '@/lib/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Loading fallback component
function PaymentLoading() {
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

// Main payment content component
function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, isLoaded } = useSafeUser();
  
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // B2B Unlock code state
  const [showUnlockCode, setShowUnlockCode] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockSuccess, setUnlockSuccess] = useState<{ planType: string; companyName?: string } | null>(null);

  // Dark mode
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

  // Demo bypass - grants full access without payment
  const handleDemoBypass = () => {
    localStorage.setItem('verso_full_access', 'true');
    router.push('/home');
  };

  // Simulated payment processing (for demo)
  const handlePayment = async () => {
    if (!isSignedIn) {
      router.push('/sign-up?redirect_url=/payment');
      return;
    }
    
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    localStorage.setItem('verso_full_access', 'true');
    router.push('/home');
  };

  // Validate unlock code
  const validateCode = async (code: string) => {
    try {
      const response = await fetch(`/api/unlock-code?code=${encodeURIComponent(code)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return { valid: false, error: 'Unable to validate code' };
    }
  };

  // Redeem unlock code
  const handleRedeemCode = async () => {
    if (!unlockCode.trim()) {
      setUnlockError('Please enter a code');
      return;
    }

    if (!isSignedIn) {
      router.push('/sign-up?redirect_url=/payment');
      return;
    }

    setIsRedeeming(true);
    setUnlockError(null);

    try {
      const response = await fetch('/api/unlock-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: unlockCode.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUnlockSuccess({
          planType: data.planType,
          companyName: data.companyName,
        });
        localStorage.setItem('verso_full_access', 'true');
        
        // Redirect after short delay
        setTimeout(() => {
          router.push('/home');
        }, 2000);
      } else {
        setUnlockError(data.error || 'Invalid code');
      }
    } catch (error) {
      setUnlockError('Failed to redeem code. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (!mounted || !isLoaded) {
    return <PaymentLoading />;
  }

  const features = [
    { icon: Sparkles, text: 'Daily check-ins & pattern insights' },
    { icon: Heart, text: 'Personalized coaching tips' },
    { icon: Target, text: 'Track your wellbeing progress' },
    { icon: Zap, text: 'Access to all premium features' },
  ];

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
        title="Unlock Full Access"
        subtitle="Choose your plan"
        icon="lock"
        onToggleDark={toggleDark}
        isDark={isDark}
      />

      {/* Desktop Header */}
      <header className="sticky top-0 z-50 hide-on-mobile">
        <div className="glass border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/diagnostic/results" className="p-2 rounded-xl hover:bg-secondary/80 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-premium">
                  <img src="/logo.svg" alt="Verso" className="w-6 h-6" style={{ filter: 'brightness(0) invert(1)' }} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Unlock Full Access</h1>
                  <p className="text-xs text-muted-foreground">Choose your plan</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleDark}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                {isSignedIn ? (
                  <SafeUserButton afterSignOutUrl="/" />
                ) : (
                  <SafeSignInButton mode="redirect" redirectUrl="/payment">
                    <Button variant="outline" size="sm" className="border-border/50">
                      Sign In
                    </Button>
                  </SafeSignInButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pb-8 px-4 md:px-6 pt-6 md:pt-10">
        <div className="max-w-2xl mx-auto">
          {/* Pricing Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Continue Your Wellbeing Journey
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Get unlimited access to daily check-ins, coaching tips, and personalized insights.
            </p>
          </motion.div>

          {/* B2B Unlock Code Section - Show first if user might have a code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl border border-green-500/30 p-6 mb-6"
          >
            <button
              onClick={() => setShowUnlockCode(!showUnlockCode)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-teal-500/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Have a Company Code?</h3>
                  <p className="text-sm text-muted-foreground">B2B customers can unlock with their company code</p>
                </div>
              </div>
              <ArrowRight className={cn(
                'w-5 h-5 text-muted-foreground transition-transform',
                showUnlockCode && 'rotate-90'
              )} />
            </button>

            <AnimatePresence>
              {showUnlockCode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 mt-6 border-t border-border/50">
                    {unlockSuccess ? (
                      <div className="text-center py-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4"
                        >
                          <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </motion.div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">Code Redeemed!</h4>
                        <p className="text-muted-foreground">
                          {unlockSuccess.companyName 
                            ? `Welcome! Your ${unlockSuccess.planType} access from ${unlockSuccess.companyName} is now active.`
                            : `Your ${unlockSuccess.planType} access is now active.`
                          }
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">Redirecting to dashboard...</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-3 mb-3">
                          <div className="flex-1 relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                              type="text"
                              value={unlockCode}
                              onChange={(e) => {
                                setUnlockCode(e.target.value.toUpperCase());
                                setUnlockError(null);
                              }}
                              placeholder="Enter your code"
                              className="w-full pl-12 pr-4 py-4 rounded-xl border border-border/50 bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 font-mono tracking-wider uppercase"
                            />
                          </div>
                          <button
                            onClick={handleRedeemCode}
                            disabled={isRedeeming || !unlockCode.trim()}
                            className={cn(
                              'px-6 py-4 rounded-xl font-semibold transition-all flex items-center gap-2',
                              isRedeeming || !unlockCode.trim()
                                ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:opacity-90'
                            )}
                          >
                            {isRedeeming ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Redeeming...
                              </>
                            ) : (
                              <>
                                <Gift className="w-4 h-4" />
                                Redeem
                              </>
                            )}
                          </button>
                        </div>
                        
                        {unlockError && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-red-500 text-sm"
                          >
                            <AlertCircle className="w-4 h-4" />
                            {unlockError}
                          </motion.div>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-3">
                          Company codes are provided by your organization. Contact your HR or manager if you need a code.
                        </p>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-sm text-muted-foreground">or pay individually</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Plan Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex rounded-xl bg-secondary/50 p-1 border border-border/50">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  selectedPlan === 'monthly'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  selectedPlan === 'yearly'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Yearly <span className="text-xs opacity-80">(Save 20%)</span>
              </button>
            </div>
          </motion.div>

          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl border-2 border-primary/30 p-6 md:p-8 shadow-premium mb-6"
          >
            {/* Price */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl md:text-5xl font-bold text-foreground">
                  {selectedPlan === 'monthly' ? '$9.99' : '$95.99'}
                </span>
                <span className="text-muted-foreground">
                  /{selectedPlan === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {selectedPlan === 'yearly' && (
                <p className="text-sm text-primary font-medium">
                  Save $23.89 per year
                </p>
              )}
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Payment Buttons */}
            <div className="space-y-3">
              {/* PayPal Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#0070ba] hover:bg-[#003087] text-white rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.026-2.565 6.082-8.558 6.082h-2.19c-1.727 0-3.193 1.262-3.467 2.97l-1.187 7.516h3.61c.459 0 .85-.334.922-.788l.966-6.121a.946.946 0 0 1 .935-.788h1.758c4.328 0 7.717-1.757 8.712-6.85.293-1.507.163-2.755-.853-3.734z"/>
                </svg>
                {isProcessing ? 'Processing...' : 'Pay with PayPal'}
              </button>

              {/* Credit Card Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
              >
                <CreditCard className="w-5 h-5" />
                {isProcessing ? 'Processing...' : 'Pay with Credit Card'}
              </button>

              {/* Secure Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
                <Shield className="w-4 h-4" />
                <span>Secure payment powered by SSL encryption</span>
              </div>
            </div>
          </motion.div>

          {/* Demo Bypass Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass rounded-2xl border border-amber-500/30 p-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-foreground">Demo Mode</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              For demonstration purposes, you can bypass payment and access all features immediately.
            </p>
            <button
              onClick={handleDemoBypass}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-xl font-medium hover:bg-amber-500/20 transition-all"
            >
              <Zap className="w-4 h-4" />
              Skip Payment (Demo)
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Sign in prompt for non-authenticated users */}
          {!isSignedIn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-muted-foreground mb-3">
                Already have an account?
              </p>
              <SafeSignInButton mode="redirect" redirectUrl="/payment">
                <Button variant="outline" className="border-border/50">
                  Sign In
                </Button>
              </SafeSignInButton>
            </motion.div>
          )}

          {/* Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                30-day money-back guarantee
              </span>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// Main export wrapped in Suspense
export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentContent />
    </Suspense>
  );
}
