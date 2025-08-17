
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { Logo } from "../logo";
import { navItems } from "@/lib/mock-data";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, UserPlus, Crown, Zap, Wallet } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../ui/badge";

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout, inrBalance, cryptoBalance, userData } = useAuth();
  const totalBalance = inrBalance + cryptoBalance;
  const userRole = user ? (userData?.role || 'user') : 'guest';

  const getInitials = (name = "") => {
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  }
  
  const filteredNavItems = navItems.filter(item => {
      if (item.role === 'all') return true;
      if (userRole === 'guest') return item.role === 'guest' || !item.role;
      return item.role === userRole;
  });

  const getHomeLink = () => {
    switch(userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'user':
        return '/';
      case 'guest':
      default:
        return '/';
    }
  }

  return (
    <Sidebar className="border-r border-border/50 bg-card/30 backdrop-blur-xl">
      <SidebarHeader className="p-6 border-b border-border/50">
        <Link href={getHomeLink()}>
          <Logo />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        {/* Quick Stats for Users */}
        {user && userRole === 'user' && (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Balance</span>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div className="text-lg font-bold text-primary">
              ₹{totalBalance.toLocaleString()}
            </div>
            <div className="flex gap-2 mt-3">
              <Link href="/deposit" className="flex-1">
                <Button size="sm" className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white h-8 text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Add
                </Button>
              </Link>
              <Link href="/withdraw" className="flex-1">
                <Button size="sm" variant="outline" className="w-full border-primary/20 hover:border-primary/50 hover:bg-primary/10 h-8 text-xs">
                  Withdraw
                </Button>
              </Link>
            </div>
          </div>
        )}

        <SidebarMenu className="space-y-2">
          {filteredNavItems.map((item, index) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.title}
                className="group relative overflow-hidden transition-all duration-300 hover:bg-primary/10 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/20 data-[active=true]:to-accent/20 data-[active=true]:border-primary/30"
              >
                <Link href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg">
                  <div className={`p-1 rounded-md transition-colors ${
                    pathname.startsWith(item.href) 
                      ? 'bg-primary/20 text-primary' 
                      : 'group-hover:bg-primary/10 group-hover:text-primary'
                  }`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className={`font-medium transition-colors ${
                    pathname.startsWith(item.href) 
                      ? 'text-primary' 
                      : 'group-hover:text-primary'
                  }`}>
                    {item.title}
                  </span>
                  
                  {/* Active indicator */}
                  {pathname.startsWith(item.href) && (
                    <div className="absolute right-2 w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {/* Hot Games Section for Guests */}
        {!user && (
          <div className="mt-8 p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <span className="font-semibold text-sm">Hot Games</span>
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs animate-pulse">
                LIVE
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Color Prediction</span>
                <span className="text-emerald-500 font-semibold">1,254 playing</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Crash Game</span>
                <span className="text-emerald-500 font-semibold">987 playing</span>
              </div>
            </div>
            <Link href="/register">
              <Button className="w-full mt-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                Join Now
              </Button>
            </Link>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <AnimatePresence mode="wait">
          {user ? (
            <div className="relative">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-card to-card/50 border border-border/50 backdrop-blur-sm">
                <Avatar className="border-2 border-primary/20">
                  <AvatarImage src="https://placehold.co/40x40" alt="@user" data-ai-hint="avatar placeholder" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                    {getInitials(userData?.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-sm truncate">
                    {userData?.name}
                  </p>
                  <div className="flex items-center gap-2">
                    {userRole === 'admin' ? (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <p className="text-xs text-muted-foreground truncate">
                        ₹{totalBalance.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 transition-colors">
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border border-border/50">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userRole === 'user' && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/profile">Profile Settings</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={logout}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
              
              <Link href="/register">
                <Button variant="outline" className="w-full border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300">
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Sign Up</span>
                </Button>
              </Link>
            </div>
          )}
        </AnimatePresence>
      </SidebarFooter>
    </Sidebar>
  );
}
