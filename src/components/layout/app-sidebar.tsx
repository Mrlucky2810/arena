
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
import { LogIn, LogOut, UserPlus } from "lucide-react";
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

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout, balance, userData } = useAuth();
  const userRole = userData?.role || 'user';

  const getInitials = (name = "") => {
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  }
  
  const filteredNavItems = navItems.filter(item => {
      if (item.role === 'all') return true;
      return item.role === userRole;
  });


  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.title}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40" alt="@shadcn" data-ai-hint="avatar placeholder" />
              <AvatarFallback>
                {getInitials(userData?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-sm truncate">
                {userData?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userRole === 'admin' ? 'Administrator' : `₹${balance.toLocaleString()}`}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <LogOut className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userRole === 'user' && (
                    <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/login">
                  <LogIn />
                  <span>Login</span>
              </Link>
            </Button>
            <Button asChild variant="secondary" className="flex-1">
              <Link href="/register">
                  <UserPlus />
                  <span>Sign Up</span>
              </Link>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
