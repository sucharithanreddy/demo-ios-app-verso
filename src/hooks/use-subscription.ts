/**
 * useSubscription Hook
 * 
 * React hook for managing subscription state in client components
 * Provides subscription status checking and upgrade prompt functionality
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
// Use the safe wrapper instead of Clerk's useUser directly.
// Clerk's useUser throws "useUser can only be used within the <ClerkProvider />
// component" when called during SSR or outside ClerkProvider — which crashes
// prerendering for any page that imports this hook (e.g. /diagnostic/full).
// useSafeUser returns { isLoaded: false, isSignedIn: false, user: null } in
// those contexts, which is the correct "not yet loaded" state.
import { useSafeUser } from '@/lib/safe-auth';

export interface SubscriptionData {
  status: 'FREE' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  currentPeriodEnd: string | null;
  isActive: boolean;
  isPro: boolean;
  isEnterprise: boolean;
}

export interface UseSubscriptionReturn {
  subscription: SubscriptionData | null;
  isLoading: boolean;
  error: string | null;
  isPro: boolean;
  isEnterprise: boolean;
  isActive: boolean;
  canAccessProFeatures: boolean;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { isSignedIn, isLoaded } = useSafeUser();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!isSignedIn) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/subscription/status');
      
      if (!res.ok) {
        throw new Error('Failed to fetch subscription status');
      }

      const data = await res.json();
      setSubscription(data.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      fetchSubscription();
    }
  }, [isLoaded, fetchSubscription]);

  return {
    subscription,
    isLoading,
    error,
    isPro: subscription?.isPro ?? false,
    isEnterprise: subscription?.isEnterprise ?? false,
    isActive: subscription?.isActive ?? false,
    canAccessProFeatures: (subscription?.isPro ?? false) || (subscription?.isEnterprise ?? false),
    refetch: fetchSubscription,
  };
}

/**
 * Hook for checking if user can access a specific feature
 */
export function useFeatureAccess(feature: 'lab' | 'grounding' | 'breathwork' | 'reality-check' | 'distortion-spotter') {
  const { canAccessProFeatures, isLoading, subscription } = useSubscription();
  
  // All these features require Pro subscription
  const proFeatures = ['lab', 'grounding', 'breathwork', 'reality-check', 'distortion-spotter'];
  
  const hasAccess = proFeatures.includes(feature) ? canAccessProFeatures : true;
  
  return {
    hasAccess,
    isLoading,
    requiresUpgrade: !hasAccess && !isLoading,
    currentPlan: subscription?.plan ?? 'FREE',
  };
}
