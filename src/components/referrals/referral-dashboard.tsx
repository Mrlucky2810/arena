
'use client';

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Copy, Users, Wallet } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { StatCard } from "../dashboard/stat-card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

interface ReferredUser {
    name: string;
    dateJoined: string;
    status: 'Active' | 'Inactive' | 'Banned'; // Assuming status comes from user doc
    earnings: number;
}

export function ReferralDashboard() {
  const { toast } = useToast();
  const { user, userData, loading } = useAuth();
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [referredUsersList, setReferredUsersList] = useState<ReferredUser[]>([]);

  const referralLink = `https://apexarena.com/register?ref=${userData?.referralCode || ''}`;
  const referralCode = userData?.referralCode || '';
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied!",
        description: "Copied to clipboard.",
    });
  }

  useEffect(() => {
    if (user && userData) {
        const fetchReferralData = async () => {
            // Fetch total earnings from user data
            setTotalEarnings(userData.referralEarnings || 0);

            // Fetch referred users
            const referralsQuery = query(collection(db, 'referrals'), where('referrerId', '==', user.uid));
            const referralsSnapshot = await getDocs(referralsQuery);
            
            setTotalReferrals(referralsSnapshot.size);

            const usersList: ReferredUser[] = [];
            for (const referralDoc of referralsSnapshot.docs) {
                const referralData = referralDoc.data();
                const userDocRef = doc(db, 'users', referralData.referredId);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const referredUserData = userDocSnap.data();
                    usersList.push({
                        name: referredUserData.name,
                        dateJoined: referredUserData.createdAt?.toDate().toLocaleDateString() || 'N/A',
                        status: referredUserData.status || 'Active',
                        earnings: referralData.amount,
                    });
                }
            }
            setReferredUsersList(usersList);
        };

        fetchReferralData();
    }
  }, [user, userData]);
  
  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Total Referrals" value={totalReferrals.toString()} icon={Users} />
        <StatCard title="Total Earnings" value={`₹${totalEarnings.toLocaleString()}`} icon={Wallet} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link & Code</CardTitle>
          <CardDescription>Share your referral code. When your friends sign up using it, you both get ₹150!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 p-3 rounded-lg bg-muted">
            <p className="text-sm font-mono text-muted-foreground flex-1 truncate">{referralLink}</p>
            <Button onClick={() => copyToClipboard(referralLink)} size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          </div>
           <div className="flex flex-col sm:flex-row items-center gap-2 p-3 rounded-lg bg-muted">
            <p className="text-sm font-mono text-muted-foreground flex-1 truncate">{referralCode}</p>
            <Button onClick={() => copyToClipboard(referralCode)} size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
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
              {referredUsersList.length > 0 ? (
                referredUsersList.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.dateJoined}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === "Active" ? "default" : "secondary"} className={user.status === 'Active' ? 'bg-emerald-500/20 text-emerald-600' : ''}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-500">{`₹${user.earnings.toLocaleString()}`}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">You haven't referred anyone yet.</TableCell>
                </TableRow>
              )}
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
                <h3 className="font-semibold">Share Your Code</h3>
                <p className="text-sm text-muted-foreground">Copy your unique referral code and share it with friends.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">2</div>
                <h3 className="font-semibold">Friend Signs Up</h3>
                <p className="text-sm text-muted-foreground">Your friend registers on Apex Arena and enters your code.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">3</div>
                <h3 className="font-semibold">You Both Earn Rewards</h3>
                <p className="text-sm text-muted-foreground">You both get ₹150! It's that simple!</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
