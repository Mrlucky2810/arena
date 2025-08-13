
'use client';

import { DepositForm } from "@/components/deposit/deposit-form";
import { Coins, Terminal } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DepositPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
        <Card>
            <CardContent className="pt-6">
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                You have to <Link href="/login" className="font-bold text-primary hover:underline">login</Link> to access this page.
                </AlertDescription>
            </Alert>
            </CardContent>
        </Card>
    );
  }
  
  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
            <Coins className="w-8 h-8" />
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Deposit Funds</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    Choose your preferred deposit method.
                </p>
            </div>
        </div>
        <DepositForm />
    </div>
  );
}
