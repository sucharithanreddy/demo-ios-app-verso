/**
 * UpgradePrompt Component
 * 
 * Displays an upgrade prompt for users trying to access Pro features
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Crown, X, Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  message?: string;
}

const FEATURES = {
  lab: {
    name: 'The Lab',
    description: 'Train your mind with interactive exercises',
    icon: Sparkles,
  },
  grounding: {
    name: 'Grounding Exercise',
    description: '5-4-3-2-1 technique for anxiety relief',
    icon: Sparkles,
  },
  breathwork: {
    name: 'Breathwork',
    description: 'Box breathing for calm and focus',
    icon: Sparkles,
  },
  'reality-check': {
    name: 'Reality Check',
    description: 'Challenge anxious thoughts with evidence',
    icon: Sparkles,
  },
  'distortion-spotter': {
    name: 'Distortion Spotter',
    description: 'Train your pattern recognition skills',
    icon: Sparkles,
  },
};

export function UpgradePrompt({
  isOpen,
  onClose,
  featureName = 'lab',
  message,
}: UpgradePromptProps) {
  const feature = FEATURES[featureName as keyof typeof FEATURES] || FEATURES.lab;
  const Icon = feature.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass rounded-2xl border border-border/50 p-6 shadow-premium relative"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-secondary/80 text-muted-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto shadow-premium">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>

              {/* Title */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Unlock {feature.name}
                </h3>
                <p className="text-muted-foreground">
                  {message || `${feature.description} is available with a Pro subscription.`}
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-2 text-left">
                <p className="text-sm font-medium text-foreground">Pro includes:</p>
                <div className="space-y-2">
                  {[
                    'Unlimited reflection sessions',
                    'Full Lab access',
                    'Grounding exercises',
                    'Breathwork tools',
                    'Priority support',
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="py-4 border-t border-b border-border/50">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold text-foreground">$9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  30-day money-back guarantee
                </p>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <Link href="/pricing" className="block">
                  <Button className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-premium glow-primary">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </Link>
                <Button variant="ghost" onClick={onClose} className="w-full">
                  Maybe Later
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Mini upgrade banner for inline use
 */
export function UpgradeBanner({ onUpgrade }: { onUpgrade?: () => void }) {
  return (
    <div className="glass rounded-xl border border-border/50 p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
          <Lock className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Pro Feature</p>
          <p className="text-xs text-muted-foreground">Upgrade to unlock</p>
        </div>
      </div>
      <Link href="/pricing">
        <Button size="sm" className="bg-primary text-primary-foreground shadow-premium">
          Upgrade
        </Button>
      </Link>
    </div>
  );
}
