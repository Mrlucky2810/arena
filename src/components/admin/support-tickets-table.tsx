
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Mail, MessageSquare, User, Clock } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface SupportTicket {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'open' | 'closed';
    createdAt: Timestamp;
}

export function SupportTicketsTable() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const ticketsCollection = collection(db, 'support_tickets');
            const q = query(ticketsCollection, orderBy('createdAt', 'desc'));
            const ticketsSnapshot = await getDocs(q);
            const ticketsList = ticketsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as SupportTicket));
            setTickets(ticketsList);
        } catch (error) {
            console.error("Error fetching support tickets:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch support tickets.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: 'open' | 'closed') => {
        try {
            const ticketRef = doc(db, 'support_tickets', id);
            await updateDoc(ticketRef, { status: newStatus });
            setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
            toast({ title: 'Success', description: `Ticket has been ${newStatus}.` });
        } catch (error) {
            console.error(`Failed to update ticket status:`, error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update ticket status.' });
        }
    };
    
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Support Tickets</CardTitle>
                    <CardDescription>View and manage user support requests.</CardDescription>
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
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>View and manage user support requests.</CardDescription>
            </CardHeader>
            <CardContent>
                {tickets.length > 0 ? (
                    <Accordion type="multiple" className="w-full">
                        {tickets.map((ticket) => (
                            <AccordionItem key={ticket.id} value={ticket.id}>
                                <AccordionTrigger>
                                    <div className="flex justify-between items-center w-full pr-4">
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold">{ticket.subject}</p>
                                            <p className="text-sm text-muted-foreground">{ticket.name} ({ticket.email})</p>
                                        </div>
                                        <Badge variant={ticket.status === 'open' ? 'destructive' : 'default'} className="ml-4">
                                            {ticket.status}
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4">
                                        <p className="text-base whitespace-pre-wrap">{ticket.message}</p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3"/>
                                                <span>Submitted: {ticket.createdAt.toDate().toLocaleString()}</span>
                                            </div>
                                            {ticket.status === 'open' && (
                                                <Button size="sm" onClick={() => handleUpdateStatus(ticket.id, 'closed')}>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Mark as Closed
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        <MessageSquare className="mx-auto h-12 w-12" />
                        <h3 className="mt-2 text-lg font-medium">No support tickets found.</h3>
                        <p className="mt-1 text-sm">When users submit messages, they will appear here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
