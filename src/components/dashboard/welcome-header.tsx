
"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

export function WelcomeHeader({ name }: { name: string }) {
  const { user, userData, loading } = useAuth();
  const displayName = userData?.name || name;

  if (loading) {
      return (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                  <Skeleton className="h-9 w-64 mb-2" />
                  <Skeleton className="h-5 w-80" />
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {user ? `Welcome back, ${displayName}!` : "Welcome to Apex Arena"}
        </h1>
        <p className="text-muted-foreground">
          {user ? "Here's your gaming and betting summary." : "Your gateway to wins. Login to get started."}
        </p>
      </div>
      {user && (
         <div className="flex gap-2">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link href="/deposit">Deposit</Link>
            </Button>
            <Button asChild variant="secondary">
                <Link href="/withdraw">Withdraw</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
