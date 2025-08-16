
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { AdminDashboardLayout } from '@/components/admin/admin-dashboard-layout';
import { SidebarProvider } from '@/components/ui/sidebar';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || userData?.role !== 'admin')) {
            router.replace('/login');
        }
    }, [user, userData, loading, router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || userData?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Alert variant="destructive" className="max-w-md">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You do not have permission to view this page. Please <Link href="/login" className="font-bold hover:underline">log in</Link> as an administrator.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    return (
        <SidebarProvider>
            <AdminDashboardLayout>
                {children}
            </AdminDashboardLayout>
        </SidebarProvider>
    );
}
