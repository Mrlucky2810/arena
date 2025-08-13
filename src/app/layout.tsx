
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-context';
import { Inter } from 'next/font/google';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

// Metadata can't be dynamically changed in a client component, 
// so we define it here statically. For dynamic metadata, a different approach is needed.
// This metadata object is now illustrative, actual metadata should be in a server component.

function AppContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
    const isAdminRoute = pathname.startsWith('/admin');

    if (isAuthRoute || isAdminRoute) {
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
