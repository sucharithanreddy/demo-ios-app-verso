'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// Types matching Clerk's interface
interface User {
  id: string;
  emailAddresses: Array<{ emailAddress: string; id: string }>;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  fullName: string;
}

interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({
  isLoaded: false,
  isSignedIn: false,
  user: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

// Safe wrapper for Clerk's useUser
// Returns context values (populated by ClerkAuthProvider when Clerk is available)
export function useSafeUser() {
  return useContext(AuthContext);
}

// Component to safely render Clerk's SignInButton
export function SafeSignInButton({ children, mode = 'redirect', redirectUrl = '/' }: { 
  children: React.ReactNode; 
  mode?: 'redirect' | 'modal';
  redirectUrl?: string;
}) {
  const [ClerkComponent, setClerkComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (pk && pk.length > 10 && !pk.includes('placeholder')) {
      import('@clerk/nextjs')
        .then((mod) => {
          setClerkComponent(() => mod.SignInButton);
        })
        .catch(() => {});
    }
  }, []);

  if (ClerkComponent) {
    return <ClerkComponent mode={mode} forceRedirectUrl={redirectUrl}>{children}</ClerkComponent>;
  }

  // Fallback - link to sign-in page
  return (
    <a href="/sign-in" className="cursor-pointer">
      {children}
    </a>
  );
}

// Component to safely render Clerk's SignUpButton
export function SafeSignUpButton({ children, mode = 'redirect', redirectUrl = '/' }: { 
  children: React.ReactNode; 
  mode?: 'redirect' | 'modal';
  redirectUrl?: string;
}) {
  const [ClerkComponent, setClerkComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (pk && pk.length > 10 && !pk.includes('placeholder')) {
      import('@clerk/nextjs')
        .then((mod) => {
          setClerkComponent(() => mod.SignUpButton);
        })
        .catch(() => {});
    }
  }, []);

  if (ClerkComponent) {
    return <ClerkComponent mode={mode} forceRedirectUrl={redirectUrl}>{children}</ClerkComponent>;
  }

  // Fallback - link to sign-up page
  return (
    <a href="/sign-up" className="cursor-pointer">
      {children}
    </a>
  );
}

// Demo mode sign-in/out functions
// Uses sessionStorage so demo sign-in clears when browser is closed
export function demoSignIn() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('verso_demo_signed_in', 'true');
    window.location.reload();
  }
}

export function demoSignOut() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('verso_demo_signed_in');
    sessionStorage.removeItem('verso_full_access');
    sessionStorage.removeItem('diagnosticResults');
    window.location.reload();
  }
}

// Component to safely render Clerk's UserButton
export function SafeUserButton({ afterSignOutUrl = '/' }: { afterSignOutUrl?: string }) {
  const [ClerkComponent, setClerkComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (pk && pk.length > 10 && !pk.includes('placeholder')) {
      import('@clerk/nextjs')
        .then((mod) => {
          setClerkComponent(() => mod.UserButton);
        })
        .catch(() => {});
    }
  }, []);

  if (ClerkComponent) {
    return <ClerkComponent afterSignOutUrl={afterSignOutUrl} />;
  }

  // Demo mode - show sign out button
  return (
    <button
      onClick={() => demoSignOut()}
      className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      Sign Out
    </button>
  );
}

// Component to safely handle sign out
export function SafeSignOutButton({ children, redirectUrl = '/' }: { 
  children: React.ReactNode; 
  redirectUrl?: string;
}) {
  const [signOutFn, setSignOutFn] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (pk && pk.length > 10 && !pk.includes('placeholder')) {
      // Clerk is configured - we'll use the signOut from useClerk hook
      // This is handled by ClerkSignOutHandler component
      setSignOutFn(() => null); // Placeholder, actual function provided by ClerkSignOutHandler
    }
  }, []);

  const handleSignOut = async () => {
    const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (pk && pk.length > 10 && !pk.includes('placeholder')) {
      // Clerk is configured - use Clerk's signOut
      try {
        const { useClerk } = await import('@clerk/nextjs');
        // This won't work outside of ClerkProvider context, so we need a different approach
      } catch (e) {
        console.error('Failed to sign out with Clerk:', e);
      }
    }
    // Fallback to demo sign out
    demoSignOut();
    window.location.href = redirectUrl;
  };

  return (
    <div onClick={handleSignOut} className="cursor-pointer">
      {children}
    </div>
  );
}

// Component that uses Clerk's useClerk hook to get signOut function
// Must be used inside ClerkProvider
export function ClerkSignOutButton({ children, redirectUrl = '/' }: { 
  children: React.ReactNode; 
  redirectUrl?: string;
}) {
  const [clerkModule, setClerkModule] = useState<any>(null);

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (pk && pk.length > 10 && !pk.includes('placeholder')) {
      import('@clerk/nextjs')
        .then((mod) => {
          setClerkModule(mod);
        })
        .catch(() => {});
    }
  }, []);

  if (!clerkModule) {
    // Clerk not loaded yet or not configured - show fallback
    const handleFallbackSignOut = () => {
      demoSignOut();
      window.location.href = redirectUrl;
    };
    return (
      <div onClick={handleFallbackSignOut} className="cursor-pointer">
        {children}
      </div>
    );
  }

  // Render the component that uses useClerk hook
  return <ClerkSignOutInner clerkModule={clerkModule} redirectUrl={redirectUrl}>{children}</ClerkSignOutInner>;
}

// Inner component that can safely use Clerk hooks
function ClerkSignOutInner({ children, redirectUrl, clerkModule }: { 
  children: React.ReactNode; 
  redirectUrl: string;
  clerkModule: any;
}) {
  const { signOut } = clerkModule.useClerk();

  const handleSignOut = async () => {
    try {
      await signOut({ redirectUrl });
    } catch (e) {
      console.error('Sign out error:', e);
      // Fallback
      demoSignOut();
      window.location.href = redirectUrl;
    }
  };

  return (
    <div onClick={handleSignOut} className="cursor-pointer">
      {children}
    </div>
  );
}

// Provider that bridges Clerk's auth state to our context
// This must be used INSIDE ClerkProvider
export function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthContextType>({
    isLoaded: false,
    isSignedIn: false,
    user: null,
  });
  const [clerkModule, setClerkModule] = useState<any>(null);

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    
    // Clear old localStorage demo sign-in data (we now use sessionStorage)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('verso_demo_signed_in');
      localStorage.removeItem('verso_full_access');
    }
    
    if (!pk || pk.length < 10 || pk.includes('placeholder')) {
      // Clerk not configured - check for demo mode sign-in (session-based)
      const demoSignedIn = sessionStorage.getItem('verso_demo_signed_in');
      if (demoSignedIn === 'true') {
        setAuthState({ 
          isLoaded: true, 
          isSignedIn: true, 
          user: {
            id: 'demo-user',
            emailAddresses: [{ emailAddress: 'demo@verso.app', id: 'demo-email' }],
            firstName: 'Demo',
            lastName: 'User',
            imageUrl: '',
            fullName: 'Demo User',
          }
        });
      } else {
        setAuthState({ isLoaded: true, isSignedIn: false, user: null });
      }
      return;
    }

    // Load Clerk module
    import('@clerk/nextjs')
      .then((mod) => {
        setClerkModule(mod);
      })
      .catch((err) => {
        console.error('Failed to load Clerk:', err);
        setAuthState({ isLoaded: true, isSignedIn: false, user: null });
      });
  }, []);

  // This component must be inside ClerkProvider for useUser to work
  // We'll render a component that uses useUser when clerk module is loaded
  if (clerkModule && typeof window !== 'undefined') {
    return (
      <ClerkAuthBridge clerkModule={clerkModule}>
        {children}
      </ClerkAuthBridge>
    );
  }

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

// Internal component that uses Clerk's useUser hook
function ClerkAuthBridge({ children, clerkModule }: { children: ReactNode; clerkModule: any }) {
  // Use Clerk's useUser hook
  const { isLoaded, isSignedIn, user } = clerkModule.useUser();
  
  const authState: AuthContextType = {
    isLoaded,
    isSignedIn: isSignedIn ?? false,
    user: user ? {
      id: user.id,
      emailAddresses: user.emailAddresses?.map(e => ({ emailAddress: e.emailAddress, id: e.id })) || [],
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    } : null,
  };

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

// Legacy export for backwards compatibility
export const SafeAuthProvider = ClerkAuthProvider;
