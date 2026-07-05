import { Suspense } from 'react';
import SignUpContent from './SignUpContent';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Loading component for Suspense fallback
function SignUpLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse" />
        <div className="absolute inset-2 rounded-xl bg-primary/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="absolute inset-4 rounded-lg bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}

// Server component wrapper with Suspense for useSearchParams
export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpLoading />}>
      <SignUpContent />
    </Suspense>
  );
}
