'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Heart, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Reflect', href: '/reflect', icon: Heart },
  { name: 'Lab', href: '/lab', icon: Sparkles },
  { name: 'Profile', href: '/profile', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleTabClick = (href: string) => {
    router.push(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href ||
              (tab.href !== '/' && pathname.startsWith(tab.href));

            const Icon = tab.icon;

            return (
              <button
                key={tab.name}
                onClick={() => handleTabClick(tab.href)}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 py-2 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-6 h-6" />
                <span className={cn(
                  'text-[10px] mt-1',
                  isActive ? 'font-semibold' : 'font-medium'
                )}>
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
