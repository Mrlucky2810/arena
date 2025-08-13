"use client";

import { referralData } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Copy, Users, Wallet, TrendingUp, Gift } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { StatCard } from "../dashboard/stat-card";
import { useToast } from "@/hooks/use-toast";

export function ReferralDashboard() {
  const { toast } = useToast();
  // Use a generic referral link instead of depending on userAccount
  const referralLink = `https://apexarena.com/register?ref=user123`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
        title: "Copied!",
        description: "Referral link copied to clipboard.",
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Referrals" value={referralData.totalReferrals.toString()} icon={Users} />
        <StatCard title="Total Earnings" value={`₹${referralData.totalEarnings.toLocaleString()}`} icon={Wallet} />
        <StatCard title="Active Referrals" value={referralData.activeReferrals.toString()} icon={TrendingUp} />
        <StatCard title="Pending Rewards" value={`₹${referralData.pendingRewards.toLocaleString()}`} icon={Gift} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>Share this link with your friends. You'll earn a commission when they sign up and play.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-2 p-3 rounded-lg bg-muted">
            <p className="text-sm font-mono text-muted-foreground flex-1 truncate">{referralLink}</p>
            <Button onClick={copyToClipboard} size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referred Users</CardTitle>
          <CardDescription>Track the status of your referrals and your earnings from them.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Date Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referralData.referredUsers.map((user) => (
                <TableRow key={user.name}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.dateJoined}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Active" ? "default" : "secondary"} className={user.status === 'Active' ? 'bg-emerald-500/20 text-emerald-600' : ''}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-emerald-500">{`₹${user.earnings.toLocaleString()}`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="text-center bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle>How it Works</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6 text-center p-4 md:p-6">
            <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">1</div>
                <h3 className="font-semibold">Share Your Link</h3>
                <p className="text-sm text-muted-foreground">Copy your unique referral link and share it with friends.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">2</div>
                <h3 className="font-semibold">Friend Signs Up</h3>
                <p className="text-sm text-muted-foreground">Your friend registers on Apex Arena using your link.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">3</div>
                <h3 className="font-semibold">You Earn Rewards</h3>
                <p className="text-sm text-muted-foreground">You get a commission for the bets they place. It's that simple!</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}