
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider, useAuth } from '@/context/auth-context';
import { Inter } from 'next/font/google';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

function AppContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { loading, adminExists, loadingAdminCheck } = useAuth();
    
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
    const isAdminRoute = pathname.startsWith('/admin');
    const isRegisterAdminRoute = pathname === '/register-admin';

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

    if (isAuthRoute || isAdminRoute || isRegisterAdminRoute) {
        return <>{children}</>;
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="flex flex-col h-full">
                    <AppHeader />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
                        {children}
                    </main>
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
    <html lang="en" className={`dark ${inter.variable}`}>
      <head>
        <title>Apex Arena</title>
        <meta name="description" content="Your Gateway to Wins" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <AuthProvider>
            <AppContent>{children}</AppContent>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
