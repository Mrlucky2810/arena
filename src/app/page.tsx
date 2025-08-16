
"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { trendingGames, promotions } from "@/lib/mock-data";
import {
  ArrowRight,
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
import { useAuth } from "@/context/auth-context";
import { GuestDashboard } from "@/components/dashboard/guest-dashboard";
import React from "react";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <GuestDashboard />;
  }

  const firstPromo = promotions[0];

  return (
    <div className="flex flex-col gap-8">
      <WelcomeHeader />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard type="balance" />
        <StatCard type="pnl" />
        <StatCard type="referral" />
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Trending Games</h2>
        <Carousel opts={{ align: "start", loop: true }}>
          <CarouselContent className="-ml-2 md:-ml-4">
            {trendingGames.map((game) => (
              <CarouselItem key={game.name} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
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
            {firstPromo && (
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-md bg-muted">
                        {React.createElement(firstPromo.icon, { className: "w-6 h-6 text-primary" })}
                    </div>
                    <div>
                        <CardTitle>{firstPromo.title}</CardTitle>
                        {firstPromo.badge && <span className="text-xs font-semibold text-primary bg-primary/10 py-1 px-2.5 rounded-full whitespace-nowrap">{firstPromo.badge}</span>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm">{firstPromo.description}</p>
                   <Button asChild className="w-full">
                        <Link href="/promotions">
                            View Promotions
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}
