
"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { motion } from "framer-motion";
import { Zap, Wallet, LogIn, UserPlus } from "lucide-react";

export function WelcomeHeader() {
  const { user, userData, loading } = useAuth();
  const displayName = userData?.name || "";

  if (loading) {
      return (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                  <Skeleton className="h-9 w-64 mb-2" />
                  <Skeleton className="h-5 w-80" />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
              </div>
          </div>
      )
  }

  return (
    <motion.div 
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-1">
        <motion.h1 
          className="text-2xl md:text-3xl font-bold tracking-tight mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
            {user ? (
              <>
                Welcome back, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{displayName}</span>!
              </>
            ) : (
              "Welcome to Apex Arena"
            )}
        </motion.h1>
        <motion.p 
          className="text-muted-foreground text-sm md:text-base"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {user ? "Here's your gaming and betting summary." : "Your gateway to wins. Login to get started."}
        </motion.p>
      </div>
      
        <motion.div 
          className="flex gap-3 w-full sm:w-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {user ? (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 sm:flex-none"
              >
                <Link href="/deposit">
                  <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 w-full sm:w-auto">
                    <Zap className="mr-2 h-4 w-4" />
                    Deposit
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 sm:flex-none"
              >
                <Link href="/withdraw">
                  <Button variant="outline" className="border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 w-full sm:w-auto">
                    <Wallet className="mr-2 h-4 w-4" />
                    Withdraw
                  </Button>
                </Link>
              </motion.div>
            </>
          ) : (
            <>
               <Link href="/login">
                <Button className="w-full sm:w-auto">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" className="w-full sm:w-auto">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </motion.div>
    </motion.div>
  );
}
