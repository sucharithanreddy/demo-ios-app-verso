import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: 'var(--background, #f8fafc)'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#0891b2', marginBottom: '16px' }}>404</h1>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Page Not Found</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link 
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#0891b2',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              <Home size={16} />
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
