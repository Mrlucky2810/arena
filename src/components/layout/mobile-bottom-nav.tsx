
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, Coins, Crown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAuth } from '@/context/auth-context';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/games', icon: Gamepad2, label: 'Games' },
  { href: '/deposit', icon: Coins, label: 'Deposit', isCentral: true },
  { href: '/promotions', icon: Crown, label: 'Promos' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full h-16 bg-card/80 backdrop-blur-lg border-t md:hidden">
      <div className="grid h-full grid-cols-5 mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          if (item.isCentral) {
            return (
              <div key={item.href} className="flex items-center justify-center">
                <Button asChild size="lg" className="rounded-full w-16 h-16 -mt-6 shadow-lg shadow-primary/40 bg-gradient-to-tr from-primary to-accent">
                  <Link href={item.href} className="flex flex-col items-center justify-center text-primary-foreground">
                    <item.icon className="w-6 h-6" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </Button>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex flex-col items-center justify-center px-2 hover:bg-muted group transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
