
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, orderBy, limit, increment } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';

interface WithdrawalRequest {
    id: string;
    userId: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    type: 'inr' | 'crypto';
    details: any;
    createdAt: any;
    userEmail?: string;
}

export function WithdrawalRequests() {
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'withdrawals'), where('status', '==', 'pending'), limit(50));
            const querySnapshot = await getDocs(q);
            const reqs: WithdrawalRequest[] = [];
            for (const docSnap of querySnapshot.docs) {
                const data = docSnap.data();
                const userDoc = await getDoc(doc(db, 'users', data.userId));
                reqs.push({
                    id: docSnap.id,
                    ...data,
                    userEmail: userDoc.data()?.email,
                } as WithdrawalRequest);
            }
            setRequests(reqs);
        } catch (error) {
            console.error("Error fetching withdrawal requests:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch requests.' });
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
            const requestRef = doc(db, 'withdrawals', requestId);
            await updateDoc(requestRef, { status: newStatus });

            if (newStatus === 'rejected') {
                // If rejected, refund the amount to the user's balance
                const userDocRef = doc(db, 'users', request.userId);
                const balanceField = request.type === 'inr' ? 'inrBalance' : 'cryptoBalance';
                await updateDoc(userDocRef, { [balanceField]: increment(request.amount) });
            }
            // If approved, the amount is already deducted when the request was made.
            
            toast({ title: 'Success', description: `Request has been ${newStatus}.` });
            fetchRequests(); // Refresh the list
        } catch (error) {
            console.error(`Failed to ${newStatus} request:`, error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update the request.' });
        }
    };
    
    const renderDetails = (details: any, type: string) => {
        if (type === 'inr') {
            return `Name: ${details.accountHolderName}, A/C: ${details.accountNumber}, IFSC: ${details.ifscCode}`;
        }
        if (type === 'crypto') {
            return `Network: ${details.network}, Address: ${details.walletAddress}`;
        }
        return 'N/A';
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Withdrawal Requests</CardTitle>
                <CardDescription>Review and approve or reject user withdrawal requests.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? <p>Loading requests...</p> : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User Email</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Details</TableHead>
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
                                    <TableCell className="text-xs">{renderDetails(req.details, req.type)}</TableCell>
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
                {requests.length === 0 && !loading && <p className="text-center text-muted-foreground py-4">No pending withdrawal requests.</p>}
            </CardContent>
        </Card>
    );
}
