import { Suspense } from 'react';
import { RedirectContent } from './RedirectContent';

// Force dynamic rendering - prevent static prerendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// Return empty params to prevent static generation
export async function generateStaticParams() {
  return [];
}

// Loading component for Suspense fallback
function RedirectLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse" />
          <div className="absolute inset-2 rounded-xl bg-primary/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="absolute inset-4 rounded-lg bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Server component wrapper with Suspense for useSearchParams
export default function RedirectPage() {
  return (
    <Suspense fallback={<RedirectLoading />}>
      <RedirectContent />
    </Suspense>
  );
}
