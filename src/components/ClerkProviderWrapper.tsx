'use client';

import { ReactNode, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ClerkAuthProvider } from '@/lib/safe-auth';

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

// Dynamically import ClerkProvider to avoid build-time initialization
const ClerkProvider = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.ClerkProvider),
  { ssr: false }
);

// Wrapper that provides ClerkProvider when configured, or just renders children otherwise
export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [isClerkConfigured, setIsClerkConfigured] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if Clerk is configured
    const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (pk && pk.length > 10 && !pk.includes('placeholder')) {
      setIsClerkConfigured(true);
    }
  }, []);

  // During SSR and initial render, just render children to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  // If Clerk is configured, wrap with ClerkProvider and ClerkAuthProvider
  if (isClerkConfigured) {
    return (
      <ClerkProvider>
        <ClerkAuthProvider>
          {children}
        </ClerkAuthProvider>
      </ClerkProvider>
    );
  }

  // If Clerk is not configured, use just ClerkAuthProvider (demo mode)
  return (
    <ClerkAuthProvider>
      {children}
    </ClerkAuthProvider>
  );
}
