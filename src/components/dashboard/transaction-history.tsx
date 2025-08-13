
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
import { Lock, History } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface GameHistory {
    id: string;
    game: string;
    betOn?: string | number;
    betAmount: number;
    outcome: 'win' | 'loss';
    payout: number;
    createdAt: any;
}


export function TransactionHistory() {
    const { user } = useAuth();
    const [history, setHistory] = useState<GameHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(user) {
            const fetchHistory = async () => {
                setLoading(true);
                const q = query(
                    collection(db, 'game_history'),
                    where('userId', '==', user.uid),
                    limit(10)
                );
                const querySnapshot = await getDocs(q);
                const fetchedHistory: GameHistory[] = [];
                querySnapshot.forEach(doc => {
                    fetchedHistory.push({ id: doc.id, ...doc.data() } as GameHistory);
                });
                
                // Sort client-side to avoid index requirement
                fetchedHistory.sort((a, b) => {
                    const dateA = a.createdAt?.toDate() || 0;
                    const dateB = b.createdAt?.toDate() || 0;
                    return dateB - dateA;
                });

                setHistory(fetchedHistory);
                setLoading(false);
            }
            fetchHistory();
        } else {
            setLoading(false);
        }
    }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          A log of your recent betting activity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user ? (
            <div className="overflow-x-auto">
                {loading ? <p>Loading history...</p> : history.length > 0 ? (
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Game</TableHead>
                        <TableHead>Bet</TableHead>
                        <TableHead>Stake</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead className="text-right">P/L</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell className="font-medium">{row.game}</TableCell>
                            <TableCell>
                            {row.betOn && (
                                <Badge variant="outline">{row.betOn}</Badge>
                            )}
                            </TableCell>
                            <TableCell>
                                ₹{row.betAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                            <Badge
                                variant={row.outcome === 'win' ? "default" : "destructive"}
                                className={cn(
                                row.outcome === 'win' && "bg-emerald-500/20 text-emerald-700",
                                "dark:bg-opacity-30"
                                )}
                            >
                                {row.outcome}
                            </Badge>
                            </TableCell>
                            <TableCell
                            className={cn(
                                "text-right font-semibold",
                                row.payout > 0 ? "text-emerald-500" : "text-red-500"
                            )}
                            >
                            {row.payout > 0 ? `+₹${row.payout.toLocaleString()}` : `-₹${Math.abs(row.payout).toLocaleString()}`}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                ) : (
                     <div className="flex flex-col items-center justify-center gap-4 text-center p-8 border-2 border-dashed rounded-lg">
                        <History className="w-12 h-12 text-muted-foreground" />
                        <h3 className="text-xl font-semibold">No transactions yet</h3>
                        <p className="text-muted-foreground">Play a game to see your history here.</p>
                    </div>
                )}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center p-8 border-2 border-dashed rounded-lg">
                <Lock className="w-12 h-12 text-muted-foreground" />
                <h3 className="text-xl font-semibold">Content Locked</h3>
                <p className="text-muted-foreground">Please log in to view your transaction history.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
