'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  ArrowLeft,
  Moon,
  Sun,
  CreditCard,
  Wallet,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MobileHeader } from '@/components/MobileHeader';
import { MobileNav } from '@/components/MobileNav';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Plan definitions
const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    description: 'Get started with basic features',
    icon: Sparkles,
    color: 'from-gray-400 to-gray-500',
    features: [
      { text: '5 reflection sessions per month', included: true },
      { text: 'Basic thought reframing', included: true },
      { text: 'Mood tracking', included: true },
      { text: 'Gratitude journal', included: true },
      { text: 'Lab access', included: false },
      { text: 'Grounding exercises', included: false },
      { text: 'Breathwork tools', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    description: 'Unlock the full experience',
    icon: Zap,
    color: 'from-primary to-primary/80',
    popular: true,
    features: [
      { text: 'Unlimited reflection sessions', included: true },
      { text: 'Advanced thought reframing', included: true },
      { text: 'Mood tracking', included: true },
      { text: 'Gratitude journal', included: true },
      { text: 'Full Lab access', included: true },
      { text: 'Grounding exercises', included: true },
      { text: 'Breathwork tools', included: true },
      { text: 'Priority support', included: true },
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 29.99,
    description: 'For teams and professionals',
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Team management dashboard', included: true },
      { text: 'Therapist collaboration', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'API access', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom branding', included: true },
      { text: '24/7 priority support', included: true },
    ],
  },
};

export default function PricingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  // Test-mode upgrade handler. Calls /api/subscription/upgrade which
  // flips the user's subscriptionPlan + subscriptionStatus to ACTIVE.
  // This is a temporary shortcut until real Stripe + PayPal are wired
  // - see the comment in src/app/api/subscription/upgrade/route.ts.
  const handleUpgrade = async (planKey: 'PRO' | 'ENTERPRISE', redirectTarget?: string) => {
    setUpgradingPlan(planKey);
    setUpgradeError(null);
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Upgrade failed (${res.status})`);
      }
      // Clear any stale client-side subscription cache so the diagnostic
      // page's useSubscription hook refetches from the server.
      localStorage.removeItem('verso_full_access');
      // Redirect to the requested target, or /diagnostic/full by default
      // (since that's the main paid-tier feature being tested).
      router.push(redirectTarget || '/diagnostic/full');
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : 'Upgrade failed');
      setUpgradingPlan(null);
    }
  };

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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden noise pb-mobile">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, oklch(0.45 0.2 270), oklch(0.55 0.22 300))' }}
        />
        <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[40%] rounded-full opacity-15 blur-[100px]" style={{ background: 'linear-gradient(135deg, oklch(0.55 0.18 200), oklch(0.45 0.2 270))' }} />
        <div className="absolute inset-0 dot-pattern opacity-30" />
      </div>

      {/* Mobile Header */}
      <MobileHeader
        title="Pricing"
        icon="sparkles"
        onToggleDark={toggleDark}
        isDark={isDark}
      />

      {/* Desktop Header */}
      <header className="sticky top-0 z-50 hide-on-mobile">
        <div className="glass border-b border-border/50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="p-2 rounded-xl hover:bg-secondary/80 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-premium">
                  <img src="/logo.svg" alt="Verso" className="w-6 h-6" style={{ filter: 'brightness(0) invert(1)' }} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Pricing</h1>
                  <p className="text-xs text-muted-foreground">Choose your plan</p>
                </div>
              </div>
              <button onClick={toggleDark} className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-12 space-y-8 md:space-y-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Invest in Your <span className="gradient-text">Mental Wellness</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your journey. Start free and upgrade anytime to unlock powerful tools for transforming negative thoughts.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {Object.entries(PLANS).map(([key, plan], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'glass rounded-2xl border border-border/50 p-6 shadow-premium relative',
                plan.popular && 'ring-2 ring-primary/50'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-semibold shadow-premium">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-premium', plan.color)}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">
                  ${plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                    )}
                    <span className={cn(
                      'text-sm',
                      feature.included ? 'text-foreground' : 'text-muted-foreground/50'
                    )}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Payment Buttons */}
              {key === 'FREE' ? (
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full border-border/50">
                    Get Started Free
                  </Button>
                </Link>
              ) : (
                <div className="space-y-2">
                  <Button
                    className={cn('w-full shadow-premium', plan.popular && 'glow-primary')}
                    disabled={upgradingPlan === key}
                    onClick={() => handleUpgrade(key)}
                  >
                    {upgradingPlan === key ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    {upgradingPlan === key ? 'Processing...' : 'Pay with Card'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-border/50"
                    disabled={upgradingPlan === key}
                    onClick={() => handleUpgrade(key)}
                  >
                    {upgradingPlan === key ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wallet className="w-4 h-4 mr-2" />
                    )}
                    Pay with PayPal
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Payment Info */}
        {upgradeError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-red-500/30 bg-red-500/5 p-4 mb-4 text-center"
          >
            <p className="text-sm text-red-500 font-medium">{upgradeError}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Make sure you are signed in, then try again. If the problem persists, check the server logs.
            </p>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl border border-border/50 p-6 md:p-8 shadow-premium text-center"
        >
          <h3 className="text-xl font-semibold text-foreground mb-4">Secure Payment Options</h3>
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="w-6 h-6" />
              <span>Credit Card</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="w-6 h-6" />
              <span>PayPal</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            30-day money-back guarantee • Cancel anytime • Secure payment processing
          </p>
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
