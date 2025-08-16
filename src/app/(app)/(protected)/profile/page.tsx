
'use client';

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shield, BadgeCheck, BarChart, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user, userData } = useAuth();
  
  const getInitials = (name = "") => {
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  }

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
                    <Button variant="outline" size="icon"><Edit className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src="https://placehold.co/100x100" data-ai-hint="avatar placeholder" />
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
                            <p className="font-medium">Coming Soon</p>
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
                            <p className="text-muted-foreground text-sm">Last changed 3 months ago</p>
                        </div>
                        <Button variant="secondary">Change Password</Button>
                    </div>
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg gap-2">
                        <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-muted-foreground text-sm">Enhance your account security.</p>
                        </div>
                        <Button variant="secondary">Enable 2FA</Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BadgeCheck className="w-5 h-5"/> Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <p className="font-medium">KYC Status</p>
                            <Badge variant="destructive">Not Verified</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Complete KYC to unlock higher withdrawal limits and additional features.</p>
                    </div>
                    <Button className="w-full">Complete KYC</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5"/> Player Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                   <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Total Wagered</p>
                        <p className="font-semibold text-primary">Coming Soon</p>
                    </div>
                     <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Total Won</p>
                        <p className="font-semibold text-emerald-500">Coming Soon</p>
                    </div>
                     <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Win Rate</p>
                        <p className="font-semibold">Coming Soon</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
