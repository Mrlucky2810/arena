
"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { trendingGames, promotions } from "@/lib/mock-data";
import {
  ArrowRight,
  TrendingUp,
  Zap,
  Crown,
  Activity,
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
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-l-accent rounded-full animate-spin animation-delay-150"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <GuestDashboard />;
  }

  const firstPromo = promotions[0];

  return (
    <motion.div 
      className="flex flex-col gap-8 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <WelcomeHeader />
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        variants={itemVariants}
      >
        <StatCard type="balance" />
        <StatCard type="pnl" />
        <StatCard type="referral" />
      </motion.div>

      {/* Live Activity Banner */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 animate-pulse"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Activity className="w-8 h-8 text-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Live Activity</h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-semibold">42,891</span> players online • 
                    <span className="text-emerald-500 font-semibold"> ₹2.4M</span> won in last hour
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-500">LIVE</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trending Games Section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Trending Games</h2>
              <p className="text-sm text-muted-foreground">Most popular games right now</p>
            </div>
          </div>
          <Link href="/games">
            <Button variant="outline" className="hidden sm:flex">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {trendingGames.map((game, index) => (
              <CarouselItem key={game.name} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <GameCard game={game} />
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </motion.div>

      {/* Hot Picks Section */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-pink-500/10"></div>
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Hot Picks
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse">
                    <Zap className="w-3 h-3 mr-1" />
                    LIVE
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Games with the biggest wins today</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trendingGames.slice(0, 4).map((game, index) => (
                <motion.div
                  key={game.name}
                  className="group cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href={game.href}>
                    <div className="relative p-4 rounded-lg border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                      <div className="text-center">
                        <div className="text-2xl mb-2">{game.name === 'Color Prediction' ? '🎨' : game.name === 'Crash' ? '🚀' : game.name === 'Dice' ? '🎲' : '🎯'}</div>
                        <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{game.name}</h4>
                        <p className="text-xs text-muted-foreground">{game.livePlayers} playing</p>
                        {game.winMultiplier && (
                          <Badge variant="secondary" className="mt-1 text-xs bg-emerald-500/20 text-emerald-600">
                            {game.winMultiplier}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Main Content Grid */}
      <motion.div 
        className="grid gap-8 xl:grid-cols-3"
        variants={itemVariants}
      >
        <div className="xl:col-span-2">
          <TransactionHistory />
        </div>
        <div className="space-y-6">
          {/* Featured Promotion */}
          {firstPromo && (
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-primary/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    {React.createElement(firstPromo.icon, { className: "w-6 h-6 text-primary" })}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {firstPromo.title}
                      {firstPromo.badge && (
                        <Badge className="bg-gradient-to-r from-primary to-accent text-white text-xs">
                          {firstPromo.badge}
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{firstPromo.description}</p>
                <Link href="/promotions">
                  <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-primary/20 transition-all duration-300">
                    <Crown className="mr-2 h-4 w-4" />
                    View Promotions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/deposit">
                <Button variant="outline" className="w-full justify-start hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950 dark:hover:border-emerald-800 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mr-3">
                    💰
                  </div>
                  Add Funds
                </Button>
              </Link>
              <Link href="/referrals">
                <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950 dark:hover:border-blue-800 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                    👥
                  </div>
                  Invite Friends
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="outline" className="w-full justify-start hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950 dark:hover:border-purple-800 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                    💬
                  </div>
                  Get Help
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
