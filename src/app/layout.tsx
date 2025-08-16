
'use client';

import './globals.css';
import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider, useAuth } from '@/context/auth-context';
import { Inter } from 'next/font/google';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

function AppContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, adminExists, loadingAdminCheck, userData } = useAuth();
    
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
    const isAdminRoute = pathname.startsWith('/admin');
    const isRegisterAdminRoute = pathname === '/register-admin';
    const isUserLoggedIn = !!user && userData?.role !== 'admin';

    useEffect(() => {
        if (!loadingAdminCheck && !adminExists && !isRegisterAdminRoute) {
            router.replace('/register-admin');
        }
    }, [adminExists, loadingAdminCheck, isRegisterAdminRoute, router]);

    if (loading || loadingAdminCheck) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Loading...
            </div>
        );
    }
    
    if (!adminExists) {
        if (isRegisterAdminRoute) {
            return <>{children}</>;
        }
        return (
            <div className="flex items-center justify-center min-h-screen">
                Redirecting to admin setup...
            </div>
        );
    }

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 },
    };

    const pageTransition = {
        type: 'tween',
        ease: 'anticipate',
        duration: 0.5,
    };

    const mainContent = (
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );

    if (isAuthRoute || isRegisterAdminRoute) {
        return mainContent;
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="flex flex-col h-full">
                    <AppHeader />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
                        {mainContent}
                    </main>
                    {isUserLoggedIn && <MobileBottomNav />}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", inter.variable)}>
      <head>
        <title>Apex Arena</title>
        <meta name="description" content="Your Gateway to Wins" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-br from-primary/10 via-background to-accent/10 opacity-50 animate-gradient-xy" style={{backgroundSize: '400% 400%'}}/>
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
        <AuthProvider>
            <AppContent>{children}</AppContent>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
