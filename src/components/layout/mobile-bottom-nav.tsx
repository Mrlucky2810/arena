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
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="h-16 bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-lg">
        <div className="grid h-full grid-cols-5 mx-auto max-w-md">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            if (item.isCentral) {
              return (
                <div key={item.href} className="flex items-center justify-center">
                  <Button 
                    asChild 
                    size="lg" 
                    className="rounded-full w-14 h-14 -mt-6 shadow-lg shadow-primary/40 bg-gradient-to-tr from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-4 border-background"
                  >
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
                  'inline-flex flex-col items-center justify-center px-2 py-2 hover:bg-muted/50 group transition-all duration-200',
                  isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'p-1 rounded-lg transition-all duration-200',
                  isActive ? 'bg-primary/20 scale-110' : 'group-hover:bg-primary/10 group-hover:scale-105'
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-[10px] font-medium mt-1 transition-colors",
                  isActive ? 'text-primary' : 'group-hover:text-primary'
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}