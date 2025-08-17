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
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                <div className="relative">
                    <motion.div
                        className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute inset-0 w-20 h-20 border-4 border-transparent border-l-accent rounded-full"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute inset-2 w-16 h-16 border-4 border-transparent border-r-primary/40 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </div>
        );
    }
    
    if (!adminExists) {
        if (isRegisterAdminRoute) {
            return (
                <div className="relative min-h-screen">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {children}
                    </motion.div>
                </div>
            );
        }
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-lg font-medium">Redirecting to admin setup...</p>
                </motion.div>
            </div>
        );
    }

    const pageVariants = {
        initial: { opacity: 0, y: 20, scale: 0.98 },
        in: { opacity: 1, y: 0, scale: 1 },
        out: { opacity: 0, y: -20, scale: 1.02 },
    };

    const pageTransition = {
        type: 'tween',
        ease: [0.25, 0.46, 0.45, 0.94],
        duration: 0.4,
    };

    // Auth routes layout (no sidebar)
    if (isAuthRoute || isRegisterAdminRoute) {
        return (
            <div className="relative min-h-screen">
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
            </div>
        );
    }

    // Main app layout with sidebar
    return (
        <div className="flex h-screen overflow-hidden">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="flex flex-col flex-1 overflow-hidden">
                    <AppHeader />
                    <main className="flex-1 overflow-y-auto">
                        <div className="p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
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
                        </div>
                    </main>
                    {isUserLoggedIn && <MobileBottomNav />}
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", inter.variable)}>
      <head>
        <title>Apex Arena - Your Gateway to Wins</title>
        <meta name="description" content="Experience the thrill of online gaming and betting with Apex Arena. Secure, fair, and exciting games await you." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#059669" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden">
        {/* Enhanced animated background */}
        <div className="fixed inset-0 -z-10">
          {/* Primary gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 opacity-60" />
          
          {/* Animated gradient overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 opacity-30"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '400% 400%',
            }}
          />
          
          {/* Floating orbs */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl"
                animate={{
                  x: [0, 100, 0],
                  y: [0, -50, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 15 + i * 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 2,
                }}
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${10 + i * 20}%`,
                }}
              />
            ))}
          </div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />
        </div>

        <AuthProvider>
            <AppContent>{children}</AppContent>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}