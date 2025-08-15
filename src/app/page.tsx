
"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { trendingGames, allGames } from "@/lib/mock-data";
import {
  ArrowDownRight,
  ArrowUpRight,
  Users,
  Wallet,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { GameCard } from "@/components/dashboard/game-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
import Link from "next/link";
import { CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, Timestamp, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GuestDashboard } from "@/components/dashboard/guest-dashboard";

export default function DashboardPage() {
    const { user, userData, loading, inrBalance, cryptoBalance } = useAuth();
    const [pnl, setPnl] = useState(0);
    const [referralEarnings, setReferralEarnings] = useState(0);

    const totalBalance = inrBalance + cryptoBalance;

    useEffect(() => {
        if (user) {
            const fetchPnl = async () => {
                const now = new Date();
                const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                
                const q = query(
                    collection(db, "game_history"),
                    where("userId", "==", user.uid),
                    limit(50) // Fetch recent 50 transactions to calculate P&L from
                );
                
                const querySnapshot = await getDocs(q);
                let totalPayout = 0;
                querySnapshot.forEach(doc => {
                    const docData = doc.data();
                    const docTimestamp = docData.createdAt?.toDate();
                    if (docTimestamp && docTimestamp >= twentyFourHoursAgo) {
                       totalPayout += doc.data().payout;
                    }
                });
                setPnl(totalPayout);
            };

            const fetchReferralEarnings = async () => {
                // This is a placeholder for a real referral earnings calculation
                // For now, we'll just set it to 0 or a value from the user document if it exists
                setReferralEarnings(userData?.referralEarnings || 0);
            }

            fetchPnl();
            fetchReferralEarnings();
        }
    }, [user, userData]);


  const pnlIsPositive = pnl >= 0;

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <GuestDashboard />;
  }

  return (
    <div className="flex flex-col gap-8">
      <WelcomeHeader name={userData?.name || ""} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Balance"
          value={user ? `₹${totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Log in to see"}
          icon={Wallet}
        />
        <StatCard
          title="Today's P&L"
          value={user ? `₹${Math.abs(pnl).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Log in to see"}
          icon={pnlIsPositive ? ArrowUpRight : ArrowDownRight}
          iconClassName={user ? (pnlIsPositive ? "text-emerald-500" : "text-red-500") : ""}
        />
        <StatCard
          title="Referral Earnings"
          value={user ? `₹${referralEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Log in to see"}
          icon={Users}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Trending Games</h2>
        <Carousel opts={{ align: "start", loop: true }}>
          <CarouselContent>
            {trendingGames.map((game) => (
              <CarouselItem key={game.name} className="basis-full md:basis-1/2 xl:basis-1/3">
                <GameCard game={game} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
      
      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TransactionHistory />
        </div>
        <div className="space-y-8">
             <Card className="text-center bg-gradient-to-r from-primary/10 to-accent/10">
                <CardHeader>
                    <CardTitle className="text-xl">Stay Tuned for More!</CardTitle>
                    <CardDescription>We are always adding new and exciting promotions. Follow us on social media or check back regularly to not miss out!</CardDescription>
                </CardHeader>
            </Card>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Games</CardTitle>
            <Button asChild variant="ghost">
                <Link href="/games">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {allGames.slice(0, 4).map((game) => (
                <GameCard key={game.name} game={game} />
            ))}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
