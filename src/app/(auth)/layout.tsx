
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Gamepad2, ShieldCheck, Zap } from 'lucide-react';
import { Logo } from '@/components/logo';

const features = [
    {
        icon: ShieldCheck,
        title: "Secure & Fair",
        description: "Advanced encryption and provably fair algorithms."
    },
    {
        icon: Zap,
        title: "Instant Payouts",
        description: "Lightning-fast deposits and withdrawals."
    },
    {
        icon: Gamepad2,
        title: "Vast Game Selection",
        description: "Casino games, live sports, and more."
    }
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
        <Link href="/" passHref>
          <Button variant="ghost" className="absolute top-4 left-4 z-10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
          </Button>
        </Link>
        <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-r from-primary via-accent to-primary/50 opacity-20 animate-gradient-xy" style={{backgroundSize: '400% 400%'}}/>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center w-full max-w-6xl p-4">
            <div className="flex items-center justify-center">
                {children}
            </div>
            <div className="hidden md:flex flex-col items-center justify-center text-white p-12 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 ml-8">
                <Logo />
                <p className="mt-4 text-center text-lg text-muted-foreground">Your ultimate destination for online gaming and betting.</p>
                <div className="mt-8 space-y-6 self-start w-full">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="p-2 rounded-md bg-primary/20">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
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
    </div>
  );
}
