import { CompleteProfileContent } from './CompleteProfileContent';

// Force dynamic rendering - prevent static prerendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// Return empty params to prevent static generation
export async function generateStaticParams() {
  return [];
}

// Server component wrapper - prevents static prerendering issues
export default function CompleteProfilePage() {
  return <CompleteProfileContent />;
}
