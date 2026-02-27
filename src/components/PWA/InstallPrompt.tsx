'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Listen for beforeinstallprompt (Android/Desktop)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay (don't spam immediately)
      setTimeout(() => {
        // Check if user hasn't dismissed before
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // For iOS, show prompt after delay if not installed
    if (iOS && !standalone) {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 10000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS - show instructions
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm"
        >
          <div className="glass rounded-2xl border border-border/50 p-4 shadow-premium">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-premium">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Install App</h3>
                  <button
                    onClick={handleDismiss}
                    className="p-1 rounded-lg hover:bg-secondary/80 text-muted-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Add Optimism Engine to your home screen for quick access
                </p>
              </div>
            </div>

            {/* iOS Instructions or Install Button */}
            {isIOS ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 text-sm">
                  <span className="text-muted-foreground">1.</span>
                  <span>Tap</span>
                  <Smartphone className="w-4 h-4 mx-1" />
                  <span className="font-medium">Share</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 text-sm">
                  <span className="text-muted-foreground">2.</span>
                  <span>Tap</span>
                  <span className="font-medium mx-1">"Add to Home Screen"</span>
                </div>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="w-full"
                >
                  Got it!
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="flex-1"
                >
                  Not now
                </Button>
                <Button
                  onClick={handleInstall}
                  className="flex-1 bg-primary text-primary-foreground shadow-premium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
