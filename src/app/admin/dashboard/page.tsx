
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Wallet, Hourglass, Inbox, type LucideIcon } from 'lucide-react';

interface AdminStat {
    totalBets: number;
    totalRevenue: number;
    pendingDeposits: number;
    pendingPayouts: number;
}

const AdminStatCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: LucideIcon, description: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStat | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Fetch game history for bets and revenue
                const gameHistorySnapshot = await getDocs(collection(db, 'game_history'));
                const totalBets = gameHistorySnapshot.size;
                let totalRevenue = 0;
                
                gameHistorySnapshot.forEach(doc => {
                    const data = doc.data();
                    // Revenue is the sum of all lost bets (negative payouts)
                    if (data.payout < 0) {
                        totalRevenue += Math.abs(data.payout);
                    }
                });

                // Fetch pending deposits
                const depositsQuery = query(collection(db, 'deposits'), where('status', '==', 'pending'));
                const depositsSnapshot = await getDocs(depositsQuery);
                const pendingDeposits = depositsSnapshot.size;

                // Fetch pending withdrawals for payouts
                const withdrawalsQuery = query(collection(db, 'withdrawals'), where('status', '==', 'pending'));
                const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
                const pendingPayouts = withdrawalsSnapshot.size;
                
                setStats({
                    totalBets,
                    totalRevenue,
                    pendingDeposits,
                    pendingPayouts
                });

            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div>
                <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader><CardContent><div className="h-10 w-full bg-muted rounded animate-pulse" /></CardContent></Card>
                    <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader><CardContent><div className="h-10 w-full bg-muted rounded animate-pulse" /></CardContent></Card>
                    <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader><CardContent><div className="h-10 w-full bg-muted rounded animate-pulse" /></CardContent></Card>
                    <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader><CardContent><div className="h-10 w-full bg-muted rounded animate-pulse" /></CardContent></Card>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome, Admin! Here's an overview of your platform's performance.</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <AdminStatCard 
                    title="Total Revenue" 
                    value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} 
                    icon={Wallet} 
                    description="Platform earnings from lost bets."
                />
                <AdminStatCard 
                    title="Total Bets Placed" 
                    value={(stats?.totalBets || 0).toLocaleString()}
                    icon={Activity}
                    description="Total number of bets made all time."
                />
                <AdminStatCard 
                    title="Pending Deposit Request" 
                    value={(stats?.pendingDeposits || 0).toLocaleString()}
                    icon={Inbox}
                    description="Deposit requests awaiting approval."
                />
                <AdminStatCard 
                    title="Pending Payouts" 
                    value={(stats?.pendingPayouts || 0).toLocaleString()}
                    icon={Hourglass}
                    description="Withdrawal requests awaiting approval."
                />
            </div>
            <div className="grid gap-6 md:grid-cols-1">
                 <Card>
                    <CardHeader>
                        <CardTitle>Live Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Live bets, winners/losers breakdown, and other real-time stats will be implemented here.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
