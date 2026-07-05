'use client';

import { useEffect, ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import InstallPrompt with no SSR
const InstallPrompt = dynamic(() => import('./InstallPrompt').then(mod => ({ default: mod.InstallPrompt })), {
  ssr: false,
  loading: () => null,
});

interface PWAProviderProps {
  children: ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });
          console.log('[PWA] Service Worker registered:', registration.scope);
        } catch (error) {
          console.error('[PWA] Service Worker registration failed:', error);
        }
      });
    }
  }, []);

  return (
    <>
      {children}
      <InstallPrompt />
    </>
  );
}
