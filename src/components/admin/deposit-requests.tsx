
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';

interface DepositRequest {
    id: string;
    userId: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    transactionId: string;
    type: 'inr' | 'crypto';
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
            const requestRef = doc(db, 'deposits', requestId);
            await updateDoc(requestRef, { status: newStatus });

            if (newStatus === 'approved') {
                const userDocRef = doc(db, 'users', request.userId);
                const balanceField = request.type === 'inr' ? 'inrBalance' : 'cryptoBalance';
                await updateDoc(userDocRef, { [balanceField]: increment(request.amount) });
            }
            
            toast({ title: 'Success', description: `Request has been ${newStatus}.` });
            fetchRequests(); // Refresh the list
        } catch (error) {
            console.error(`Failed to ${newStatus} request:`, error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update the request.' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Deposit Requests</CardTitle>
                <CardDescription>Review and approve or reject user deposit requests.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? <p>Loading requests...</p> : (
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
                            {requests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.userEmail || req.userId}</TableCell>
                                    <TableCell>₹{req.amount.toLocaleString()}</TableCell>
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
                            ))}
                        </TableBody>
                    </Table>
                )}
                {requests.length === 0 && !loading && <p className="text-center text-muted-foreground py-4">No pending deposit requests.</p>}
            </CardContent>
        </Card>
    );
}
