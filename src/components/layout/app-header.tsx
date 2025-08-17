
"use client";

import { Bell, Search, User, LogIn, UserPlus, Wallet, Crown, Zap } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SidebarTrigger } from "../ui/sidebar";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import React from "react";

export function AppHeader() {
    const { user, logout, inrBalance, cryptoBalance, userData } = useAuth();
    const totalBalance = inrBalance + cryptoBalance;
    const isAdmin = userData?.role === 'admin';

    const getInitials = (name = "") => {
      return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-xl px-4 md:px-6 shadow-sm border-border/50">
      <SidebarTrigger className="md:hidden hover:bg-primary/10 transition-colors" />
      
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="search"
            placeholder="Search games, sports..."
            className="w-full pl-10 pr-4 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {user && !isAdmin && (
          <>
            {/* Balance Display */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm">
                ₹{totalBalance.toLocaleString()}
              </span>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10 transition-colors">
              <Bell className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
              <span className="sr-only">Notifications</span>
            </Button>
          </>
        )}

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {user ? (
              <div className="flex items-center gap-3">
                {!isAdmin && (
                  <span className="font-semibold text-sm hidden lg:inline-block px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 border border-emerald-500/20">
                    ₹{totalBalance.toLocaleString()}
                  </span>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-primary/20 hover:border-primary/50 transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/40x40" alt="@user" data-ai-hint="avatar placeholder" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                          {getInitials(userData?.name)}
                        </AvatarFallback>
                      </Avatar>
                      {!isAdmin && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 bg-card/95 backdrop-blur-xl border border-border/50">
                    <DropdownMenuLabel className="flex items-center gap-3 p-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="https://placehold.co/40x40" alt="@user" data-ai-hint="avatar placeholder" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                          {getInitials(userData?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{userData?.name}</p>
                        <p className="text-xs text-muted-foreground">{userData?.email}</p>
                        {isAdmin ? (
                          <Badge className="mt-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Administrator
                          </Badge>
                        ) : (
                          <Badge className="mt-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            ₹{totalBalance.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10 transition-colors">
                      <Link href={isAdmin ? "/admin/dashboard" : "/profile"} className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {isAdmin ? 'Dashboard' : 'Profile'}
                      </Link>
                    </DropdownMenuItem>
                    
                    {!isAdmin && (
                      <>
                        <DropdownMenuItem asChild className="cursor-pointer hover:bg-emerald-500/10 transition-colors">
                          <Link href="/deposit" className="flex items-center gap-2 text-emerald-600">
                            <Wallet className="h-4 w-4" />
                            Deposit Funds
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer hover:bg-blue-500/10 transition-colors">
                          <Link href="/withdraw" className="flex items-center gap-2 text-blue-600">
                            <Wallet className="h-4 w-4" />
                            Withdraw
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer hover:bg-purple-500/10 transition-colors">
                          <Link href="/referrals" className="flex items-center gap-2 text-purple-600">
                            <Crown className="h-4 w-4" />
                            Referrals
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={logout}
                      className="cursor-pointer hover:bg-red-500/10 text-red-600 transition-colors"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" passHref>
                  <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white">
                    <LogIn className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                </Link>
                
                <Link href="/register" passHref>
                  <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Sign Up</span>
                  </Button>
                </Link>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
