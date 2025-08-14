
"use client";

import { Bell, Search, User, LogIn, UserPlus } from "lucide-react";
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

export function AppHeader() {
    const { user, logout, inrBalance, cryptoBalance, userData } = useAuth();
    const totalBalance = inrBalance + cryptoBalance;
    const isAdmin = userData?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search games, sports..."
            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {user && !isAdmin && (
            <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Toggle notifications</span>
            </Button>
        )}
        <div className="flex items-center gap-2">
            {user ? (
                 <>
                    {!isAdmin && (
                        <span className="font-semibold text-sm hidden sm:inline">
                            ₹{totalBalance.toLocaleString()}
                        </span>
                    )}
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hi, {userData?.name}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={isAdmin ? "/admin/dashboard" : "/profile"}>
                              {isAdmin ? 'Dashboard' : 'Profile'}
                            </Link>
                        </DropdownMenuItem>
                        {!isAdmin && (
                            <>
                                <DropdownMenuItem asChild>
                                    <Link href="/deposit">Deposit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/withdraw">Withdraw</Link>
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </>
            ) : (
                <div className="flex items-center gap-2">
                    <Button asChild size="sm">
                        <Link href="/login">
                            <LogIn className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Login</span>
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/register">
                            <UserPlus className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Sign Up</span>
                        </Link>
                    </Button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
}
