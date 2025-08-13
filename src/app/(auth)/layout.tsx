import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
       <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-background to-background"></div>
       <div className="absolute -top-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-accent/10 blur-3xl"></div>
       <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="container relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
