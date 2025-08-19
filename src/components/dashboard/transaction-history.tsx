
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Lock, History, Coins, Gem, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "../ui/button";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

type Transaction = {
    id: string;
    type: 'game' | 'deposit' | 'withdrawal' | 'referral';
    description: string;
    amount: number;
    status: 'win' | 'loss' | 'pending' | 'approved' | 'rejected' | 'credited';
    payout?: number;
    createdAt: Timestamp;
};


export function TransactionHistory() {
    const { user } = useAuth();
    const [history, setHistory] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(user) {
            const fetchHistory = async () => {
                setLoading(true);
                
                const collectionsToFetch = [
                    { name: 'game_history', type: 'game' as const },
                    { name: 'deposits', type: 'deposit' as const },
                    { name: 'withdrawals', type: 'withdrawal' as const },
                    { name: 'referrals', type: 'referral' as const }
                ];

                const allTransactions: Transaction[] = [];

                for (const col of collectionsToFetch) {
                    const q = query(
                        collection(db, col.name),
                        where(col.type === 'referral' ? 'referrerId' : 'userId', '==', user.uid),
                        orderBy('createdAt', 'desc'),
                        limit(10)
                    );
                    const querySnapshot = await getDocs(q);

                    querySnapshot.forEach(doc => {
                        const data = doc.data();
                        
                        if (col.type === 'game') {
                            allTransactions.push({
                                id: doc.id,
                                type: 'game',
                                description: data.game || 'Game Bet',
                                amount: data.betAmount,
                                status: data.outcome,
                                payout: data.payout,
                                createdAt: data.createdAt,
                            });
                        } else if (col.type === 'deposit') {
                             allTransactions.push({
                                id: doc.id,
                                type: 'deposit',
                                description: data.type === 'inr' ? 'INR Deposit' : `${data.currency?.toUpperCase()} Deposit`,
                                amount: data.amount,
                                status: data.status,
                                createdAt: data.createdAt,
                            });
                        } else if (col.type === 'withdrawal') {
                             allTransactions.push({
                                id: doc.id,
                                type: 'withdrawal',
                                description: data.type === 'inr' ? 'INR Withdrawal' : `${data.currency?.toUpperCase()} Withdrawal`,
                                amount: data.amount,
                                status: data.status,
                                createdAt: data.createdAt,
                            });
                        } else if (col.type === 'referral') {
                             allTransactions.push({
                                id: doc.id,
                                type: 'referral',
                                description: 'Referral Bonus',
                                amount: data.amount,
                                status: 'credited',
                                createdAt: data.createdAt,
                            });
                        }
                    });
                }
                
                // Sort all combined transactions by date
                allTransactions.sort((a, b) => {
                    const dateA = a.createdAt?.toDate() || 0;
                    const dateB = b.createdAt?.toDate() || 0;
                    return dateB.getTime() - dateA.getTime();
                });

                setHistory(allTransactions.slice(0, 15)); // Limit to the most recent 15 transactions overall
                setLoading(false);
            }
            fetchHistory();
        } else {
            setLoading(false);
        }
    }, [user]);
    
    const renderStatusBadge = (item: Transaction) => {
        const winLossStyles = "dark:bg-opacity-30";
        switch (item.status) {
            case 'win':
                return <Badge variant="default" className={cn("bg-emerald-500/20 text-emerald-700", winLossStyles)}>Win</Badge>;
            case 'loss':
                return <Badge variant="destructive" className={cn(winLossStyles)}>Loss</Badge>;
            case 'approved':
                return <Badge variant="default" className={cn("bg-emerald-500/20 text-emerald-700", winLossStyles)}>Approved</Badge>;
            case 'credited':
                return <Badge variant="default" className={cn("bg-blue-500/20 text-blue-700", winLossStyles)}>Credited</Badge>;
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Pending</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="outline">{item.status}</Badge>;
        }
    };

    const renderPayoutCell = (item: Transaction) => {
        let text, className;

        if (item.type === 'game' && typeof item.payout === 'number') {
            text = item.payout >= 0 ? `+₹${item.payout.toLocaleString()}` : `-₹${Math.abs(item.payout).toLocaleString()}`;
            className = item.payout >= 0 ? "text-emerald-500" : "text-red-500";
        } else if (item.type === 'deposit') {
            text = `+₹${item.amount.toLocaleString()}`;
            className = "text-emerald-500";
        } else if (item.type === 'withdrawal') {
            text = `-₹${item.amount.toLocaleString()}`;
            className = "text-red-500";
        } else if (item.type === 'referral') {
            text = `+₹${item.amount.toLocaleString()}`;
            className = "text-emerald-500";
        } else {
            return <TableCell className="text-right">-</TableCell>;
        }
        
        return (
            <TableCell className={cn("text-right font-semibold", className)}>
                {text}
            </TableCell>
        );
    }

    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                        A log of your recent account activity.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center gap-4 text-center p-8 border-2 border-dashed rounded-lg">
                        <Lock className="w-12 h-12 text-muted-foreground" />
                        <div>
                            <h3 className="text-xl font-semibold">Content Locked</h3>
                            <p className="text-muted-foreground">Please log in to view your transaction history.</p>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/login">
                                <Button>Log In</Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="outline">Sign Up</Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          A log of your recent account activity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            {loading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            ) : history.length > 0 ? (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>
                            <div className="flex items-center gap-2 font-medium">
                                {item.type === 'game' && <History className="w-4 h-4 text-muted-foreground" />}
                                {item.type === 'deposit' && <Coins className="w-4 h-4 text-emerald-500" />}
                                {item.type === 'withdrawal' && <Gem className="w-4 h-4 text-red-500" />}
                                {item.type === 'referral' && <Gift className="w-4 h-4 text-blue-500" />}
                                <span>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            {item.description}
                        </TableCell>
                        <TableCell>
                            {renderStatusBadge(item)}
                        </TableCell>
                        {renderPayoutCell(item)}
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            ) : (
                <div className="flex flex-col items-center justify-center gap-4 text-center p-8 border-2 border-dashed rounded-lg">
                    <History className="w-12 h-12 text-muted-foreground" />
                    <h3 className="text-xl font-semibold">No transactions yet</h3>
                    <p className="text-muted-foreground">Play a game or make a deposit to see your history.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
