
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowDownRight, ArrowUpRight, Users, Wallet } from "lucide-react";

type StatCardProps = {
  type: 'balance' | 'pnl' | 'referral' | 'total-referrals';
};

export function StatCard({ type }: StatCardProps) {
  const { user, userData, loading, inrBalance, cryptoBalance } = useAuth();
  const [pnl, setPnl] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [pnlLoading, setPnlLoading] = useState(true);
  const [referralLoading, setReferralLoading] = useState(true);

  const totalBalance = inrBalance + cryptoBalance;

  useEffect(() => {
    if (user && userData) {
        const fetchPnl = async () => {
            setPnlLoading(true);
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
            setPnlLoading(false);
        };

        const fetchReferralData = async () => {
            setReferralLoading(true);
            setReferralEarnings(userData?.referralEarnings || 0);

            const referralsQuery = query(collection(db, 'referrals'), where('referrerId', '==', user.uid));
            const referralsSnapshot = await getDocs(referralsQuery);
            setTotalReferrals(referralsSnapshot.size);
            
            setReferralLoading(false);
        }

        if (type === 'pnl') fetchPnl();
        if (type === 'referral' || type === 'total-referrals') fetchReferralData();
    } else {
        if (type === 'pnl') setPnlLoading(false);
        if (type === 'referral' || type === 'total-referrals') setReferralLoading(false);
    }
  }, [user, userData, type]);

  const pnlIsPositive = pnl >= 0;
  
  const cardData = {
      balance: {
          title: "Total Balance",
          value: `₹${totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          icon: Wallet,
          iconClassName: "",
          isLoading: loading,
      },
      pnl: {
          title: "Today's P&L",
          value: `₹${Math.abs(pnl).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          icon: pnlIsPositive ? ArrowUpRight : ArrowDownRight,
          iconClassName: pnlIsPositive ? "text-emerald-500" : "text-red-500",
          isLoading: pnlLoading,
      },
      referral: {
          title: "Referral Earnings",
          value: `₹${referralEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          icon: Wallet,
          iconClassName: "",
          isLoading: referralLoading,
      },
      'total-referrals': {
          title: "Total Referrals",
          value: totalReferrals.toLocaleString(),
          icon: Users,
          iconClassName: "",
          isLoading: referralLoading,
      }
  }

  const currentCard = cardData[type];
  if (!currentCard) return null; // Should not happen with TS, but safe for JS
  
  const { title, value, icon: Icon, iconClassName, isLoading } = currentCard;

  if (isLoading) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                 <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-2/3" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", iconClassName)} />
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold">{user ? value : 'Log in to see'}</div>
      </CardContent>
    </Card>
  );
}
