
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, increment, writeBatch, Timestamp, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface UserData {
    name: string;
    email: string;
    inrBalance: number;
    wallets: { [key: string]: number };
    role?: 'user' | 'admin';
    status?: 'active' | 'blocked';
    referralCode?: string;
    referralEarnings?: number;
    referredBy?: string;
    avatarUrl?: string;
    firstDepositMade?: boolean;
}

interface DepositRequest {
    id: string;
    userId: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    transactionId: string;
    type: 'inr' | 'crypto';
    currency?: string;
    createdAt: any;
    userEmail?: string;
}

export function DepositRequests() {
    const [requests, setRequests] = useState<DepositRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'deposits'), where('status', '==', 'pending'));
            const querySnapshot = await getDocs(q);
            const reqs: DepositRequest[] = [];
            for (const docSnap of querySnapshot.docs) {
                const data = docSnap.data();
                const userDoc = await getDoc(doc(db, 'users', data.userId));
                reqs.push({
                    id: docSnap.id,
                    ...data,
                    userEmail: userDoc.data()?.email,
                } as DepositRequest);
            }
            setRequests(reqs);
        } catch (error) {
            console.error("Error fetching deposit requests:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch deposit requests.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleRequest = async (requestId: string, newStatus: 'approved' | 'rejected') => {
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        try {
            if (newStatus === 'approved') {
                const userDocRef = doc(db, 'users', request.userId);
                const userDocSnap = await getDoc(userDocRef);

                const batch = writeBatch(db);
                const requestRef = doc(db, 'deposits', requestId);
                batch.update(requestRef, { status: newStatus });

                // Update user's balance
                if (request.type === 'inr') {
                    batch.update(userDocRef, { 'inrBalance': increment(request.amount) });
                } else if (request.type === 'crypto' && request.currency) {
                    const walletField = `wallets.${request.currency}`;
                    batch.update(userDocRef, { [walletField]: increment(request.amount) });
                }

                // Referral reward logic
                if (request.type === 'inr' && userDocSnap.exists()) {
                    const userData = userDocSnap.data() as UserData;
                    if (!userData.firstDepositMade && userData.referredBy) {
                        const referrerDocRef = doc(db, 'users', userData.referredBy);
                        const rewardAmount = request.amount * 0.0010; // 0.10%

                        if (rewardAmount > 0) {
                            batch.update(referrerDocRef, {
                                inrBalance: increment(rewardAmount),
                                referralEarnings: increment(rewardAmount)
                            });
                            const referralLogRef = doc(collection(db, "referrals"));
                            batch.set(referralLogRef, {
                                referrerId: userData.referredBy,
                                referredId: request.userId,
                                amount: rewardAmount,
                                depositId: requestId,
                                createdAt: serverTimestamp(),
                            });
                        }
                        batch.update(userDocRef, { firstDepositMade: true });
                    }
                }
                
                await batch.commit();

            } else { // For 'rejected' status
                const requestRef = doc(db, 'deposits', requestId);
                await updateDoc(requestRef, { status: newStatus });
            }
            
            toast({ title: 'Success', description: `Request has been ${newStatus}.` });
            fetchRequests(); // Refresh the list
        } catch (error) {
            console.error(`Failed to ${newStatus} request:`, error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update the request.' });
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Manage Deposit Requests</CardTitle>
                    <CardDescription>Review and approve or reject user deposit requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Deposit Requests</CardTitle>
                <CardDescription>Review and approve or reject user deposit requests.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User Email</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length > 0 ? requests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell>{req.userEmail || req.userId}</TableCell>
                                <TableCell>{req.type === 'inr' ? `₹${req.amount.toLocaleString()}` : `${req.amount} ${req.currency?.toUpperCase()}`}</TableCell>
                                <TableCell><Badge variant="outline">{req.type.toUpperCase()}</Badge></TableCell>
                                <TableCell className="font-mono text-xs">{req.transactionId}</TableCell>
                                <TableCell><Badge>{req.status}</Badge></TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="icon" variant="outline" className="text-emerald-500 hover:text-emerald-600" onClick={() => handleRequest(req.id, 'approved')}>
                                        <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="text-red-500 hover:text-red-600" onClick={() => handleRequest(req.id, 'rejected')}>
                                        <XCircle className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">No pending deposit requests.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
