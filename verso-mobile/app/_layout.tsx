// ============================================================================
// Root layout - Clerk + React Query + SafeArea + AuthBridge
// ============================================================================

import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { Slot, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, type ReactNode } from 'react';
import { tokenCache, CLERK_PUBLISHABLE_KEY } from '@/lib/clerk';
import { setTokenGetter } from '@/lib/auth-token';
import { ErrorBoundary } from '@/components/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Bridges Clerk's React-based auth into a module-level token getter
 * so that lib/api.ts can access the session token from non-React code.
 */
function AuthBridge({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(getToken);
    return () => setTokenGetter(null);
  }, [getToken]);

  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    // Hide splash after first paint
    const t = setTimeout(() => SplashScreen.hideAsync(), 300);
    return () => clearTimeout(t);
  }, []);

  if (!CLERK_PUBLISHABLE_KEY) {
    console.warn(
      'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Set it in your .env file.'
    );
  }

  return (
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        tokenCache={tokenCache}
      >
        <AuthBridge>
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              <StatusBar style="dark" />
              <Slot />
            </SafeAreaProvider>
          </QueryClientProvider>
        </AuthBridge>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
