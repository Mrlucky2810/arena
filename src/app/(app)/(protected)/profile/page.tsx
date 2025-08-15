
'use client';

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
            <User className="w-8 h-8 text-primary" />
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    View and manage your account details.
                </p>
            </div>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User profile, security settings, and KYC verification will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
