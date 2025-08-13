
'use client';

import { SportsBettingUI } from "@/components/sports/sports-betting-ui";
import { Rocket, Terminal } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SportsPage() {
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
          <Rocket className="w-8 h-8 text-primary" />
          <div>
              <h1 className="text-2xl md:text-3xl font-bold">Sports Betting</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Place your bets on live and upcoming matches across the globe.
              </p>
          </div>
      </div>
      <SportsBettingUI />
    </div>
  );
}
