
'use client';

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shield, BadgeCheck, BarChart, KeyRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AvatarSelectionDialog } from "@/components/profile/avatar-selection-dialog";
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PlayerStats {
    totalWagered: number;
    totalWon: number;
    winRate: string;
}

export default function ProfilePage() {
  const { user, userData } = useAuth();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const getInitials = (name = "") => {
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  }

  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        setLoadingStats(true);
        const q = query(collection(db, 'game_history'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        let totalWagered = 0;
        let totalWon = 0;
        let gamesWon = 0;
        const gamesPlayed = querySnapshot.size;

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const betAmount = data.betAmount || 0;
            totalWagered += betAmount;

            if (data.outcome === 'win') {
                gamesWon++;
                // Payout is net winnings, so add back the bet amount for gross winnings
                totalWon += (data.payout || 0) + betAmount;
            }
        });

        setStats({
            totalWagered,
            totalWon,
            winRate: gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(2) + '%' : '0.00%',
        });
        setLoadingStats(false);
      }
      fetchStats();
    }
  }, [user]);

  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
            <User className="w-8 h-8 text-primary" />
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    View and manage your account details.
                </p>
            </div>
        </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Account Information</CardTitle>
                    <AvatarSelectionDialog />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={userData?.avatarUrl || '/user.jpg'} data-ai-hint="avatar placeholder" />
                            <AvatarFallback>{getInitials(userData?.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-xl font-bold">{userData?.name}</p>
                            <p className="text-muted-foreground">{userData?.email}</p>
                        </div>
                    </div>
                    <Separator />
                     <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">User ID</p>
                            <p className="font-mono text-xs break-all">{user?.uid}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Join Date</p>
                            <p className="font-medium">{user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5"/> Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg gap-2">
                        <div>
                            <p className="font-medium">Password</p>
                            <p className="text-muted-foreground text-sm">Change your account password.</p>
                        </div>
                        <ChangePasswordDialog />
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5"/> Player Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                   <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Total Wagered</p>
                        <p className="font-semibold text-primary">{loadingStats ? 'Loading...' : `₹${stats?.totalWagered.toLocaleString()}`}</p>
                    </div>
                     <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Total Won</p>
                        <p className="font-semibold text-emerald-500">{loadingStats ? 'Loading...' : `₹${stats?.totalWon.toLocaleString()}`}</p>
                    </div>
                     <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Win Rate</p>
                        <p className="font-semibold">{loadingStats ? 'Loading...' : stats?.winRate}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
