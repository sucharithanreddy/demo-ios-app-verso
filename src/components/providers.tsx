'use client'

import { ReactNode } from 'react'

interface ClerkProviderWrapperProps {
  children: ReactNode
}

// Empty wrapper for when Clerk is not available
function NoClerkProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

// During build time, use the empty wrapper
// At runtime, if Clerk is configured, the actual ClerkProvider will be used
let ClerkProviderComponent: React.ComponentType<{ children: ReactNode }> = NoClerkProvider

// Check if we're in a browser environment and Clerk is configured
if (typeof window !== 'undefined') {
  // Only try to use Clerk if the publishable key is set
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    // Dynamic import will be handled by the bundler
    import('@clerk/nextjs').then((mod) => {
      ClerkProviderComponent = mod.ClerkProvider as React.ComponentType<{ children: ReactNode }>
    }).catch(() => {
      // Clerk not available, use empty wrapper
      ClerkProviderComponent = NoClerkProvider
    })
  }
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  return <ClerkProviderComponent>{children}</ClerkProviderComponent>
}
