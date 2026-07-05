'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Redirect Component
 * 
 * This is the critical redirect page after Clerk authentication.
 * It reads the user type from the URL (passed from sign-in page) and:
 * 1. Updates the database with the selected type
 * 2. Redirects to the correct dashboard
 */
export function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Loading...');
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (hasRun) return;
    setHasRun(true);

    async function redirect() {
      try {
        // Valid types
        const validUpperTypes = ['INDIVIDUAL', 'SALES_PERSON', 'SALES_MANAGER'];
        
        // Get type from URL - this is set by the sign-in page
        const type = searchParams.get('type');
        const upperType = type?.toUpperCase();
        
        console.log('[REDIRECT PAGE] ========================================');
        console.log('[REDIRECT PAGE] Type from URL:', type);
        console.log('[REDIRECT PAGE] Upper type:', upperType);
        console.log('[REDIRECT PAGE] Full URL:', window.location.href);
        console.log('[REDIRECT PAGE] Search params:', window.location.search);

        // Validate the type
        const isValidType = upperType && validUpperTypes.includes(upperType);
        
        console.log('[REDIRECT PAGE] Is valid type:', isValidType);

        if (isValidType) {
          // We have a valid type from URL — pass it to the server, but
          // let the SERVER decide the redirect. For existing users the
          // server ignores the selected type and uses their persisted DB
          // type (so a manager who signs in again with the landing-page
          // default 'individual' still goes to /manager-dashboard).
          setStatus(`Setting up your profile as ${upperType.replace('_', ' ')}...`);

          console.log('[REDIRECT PAGE] Calling API with type:', upperType);

          const res = await fetch('/api/auth/redirect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedUserType: upperType }),
          });

          const data = await res.json();
          console.log('[REDIRECT PAGE] API response:', data);

          // Trust the server's redirectUrl — it knows the user's actual
          // persisted type. Fall back to the URL type only if the server
          // didn't return a redirect.
          const target = data.redirectUrl
            || (upperType === 'SALES_MANAGER' ? '/manager-dashboard' : '/sales-dashboard');
          console.log('[REDIRECT PAGE] Redirecting to:', target);
          setStatus(`Redirecting to ${target === '/manager-dashboard' ? 'manager dashboard' : 'dashboard'}...`);
          router.push(target);
        } else {
          // No valid type in URL - check storage or database
          console.log('[REDIRECT PAGE] No valid type in URL, checking storage...');

          // Check localStorage/sessionStorage
          const storedType = localStorage.getItem('verso_selected_user_type') ||
                            sessionStorage.getItem('verso_selected_user_type');

          console.log('[REDIRECT PAGE] Stored type:', storedType);

          // Normalize stored type to uppercase
          const normalizedStored = storedType?.toUpperCase();

          if (normalizedStored && validUpperTypes.includes(normalizedStored)) {
            setStatus(`Setting up your profile as ${normalizedStored.replace('_', ' ')}...`);

            const res = await fetch('/api/auth/redirect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ selectedUserType: normalizedStored }),
            });

            const data = await res.json();
            console.log('[REDIRECT PAGE] API response:', data);

            // Same as above — trust the server.
            const target = data.redirectUrl
              || (normalizedStored === 'SALES_MANAGER' ? '/manager-dashboard' : '/sales-dashboard');
            router.push(target);
          } else {
            // No type anywhere - just check database
            console.log('[REDIRECT PAGE] No type in storage, checking database...');
            setStatus('Checking your profile...');

            const res = await fetch('/api/auth/redirect', { method: 'POST' });
            const data = await res.json();
            console.log('[REDIRECT PAGE] API response:', data);

            // Server returns redirectUrl based on the DB type.
            router.push(data.redirectUrl || '/sales-dashboard');
          }
        }
        
        console.log('[REDIRECT PAGE] ========================================');
      } catch (error) {
        console.error('[REDIRECT PAGE] Error:', error);
        // Last resort fallback
        router.push('/sales-dashboard');
      }
    }

    redirect();
  }, [hasRun, router, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse" />
          <div className="absolute inset-2 rounded-xl bg-primary/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="absolute inset-4 rounded-lg bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
        <p className="text-muted-foreground text-sm">{status}</p>
      </div>
    </div>
  );
}
