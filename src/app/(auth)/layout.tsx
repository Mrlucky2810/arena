
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4">
        <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-r from-primary via-accent to-primary/50 opacity-20 animate-gradient-xy" style={{backgroundSize: '400% 400%'}}/>

        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 max-w-7xl mx-auto">
          <Button asChild variant="ghost" className="backdrop-blur-sm">
              <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
              </Link>
          </Button>
          <div className="absolute left-1/2 -translate-x-1/2">
              <Logo />
          </div>
        </div>
        
        {children}

      </div>
      <style jsx>{`
        @keyframes gradient-xy {
            0%, 100% {
                background-position: 0% 50%;
            }
            50% {
                background-position: 100% 50%;
            }
        }
        .animate-gradient-xy {
            animation: gradient-xy 15s ease infinite;
        }
      `}</style>
    </>
  );
}
