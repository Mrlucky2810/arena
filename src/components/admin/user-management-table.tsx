
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Ban, CheckCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface User {
    uid: string;
    name: string;
    email: string;
    balance: number;
    status: 'active' | 'blocked';
    inrBalance?: number;
    cryptoBalance?: number;
}

export function UserManagementTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            const usersList = usersSnapshot.docs.map(doc => {
                const data = doc.data();
                const totalBalance = (data.inrBalance || 0) + (data.cryptoBalance || 0);
                return {
                    uid: doc.id,
                    balance: totalBalance,
                    ...data
                } as User;
            });
            setUsers(usersList);
            setFilteredUsers(usersList);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch user data.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    
    useEffect(() => {
        const results = users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    const handleUpdateStatus = async (uid: string, newStatus: 'active' | 'blocked') => {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { status: newStatus });
            setUsers(users.map(u => u.uid === uid ? { ...u, status: newStatus } : u));
            toast({ title: 'Success', description: `User has been ${newStatus}.` });
        } catch (error) {
            console.error(`Failed to update user status:`, error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update user status.' });
        }
    };
    
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Manage Users</CardTitle>
                    <CardDescription>View, filter, and manage user accounts.</CardDescription>
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
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>View, filter, and manage user accounts.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Input
                        placeholder="Filter by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <TableRow key={user.uid}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>₹{(user.balance || 0).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge variant={user.status === 'blocked' ? 'destructive' : 'default'} className={user.status === 'active' ? 'bg-emerald-500/20 text-emerald-700' : ''}>
                                        {user.status || 'active'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {user.status === 'blocked' ? (
                                        <Button size="sm" variant="outline" className="text-emerald-500 hover:text-emerald-600" onClick={() => handleUpdateStatus(user.uid, 'active')}>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Unblock
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(user.uid, 'blocked')}>
                                            <Ban className="w-4 h-4 mr-2" />
                                            Block
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        )) : (
                           <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">No users found.</TableCell>
                           </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
