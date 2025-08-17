"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: "default" | "gaming" | "neon"
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-muted text-muted-foreground",
    gaming: "bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 text-slate-300",
    neon: "bg-slate-900/50 backdrop-blur-sm border border-cyan-500/20 text-cyan-100"
  }

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl p-1 transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  variant?: "default" | "gaming" | "neon"
  glow?: boolean
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant = "default", glow = false, ...props }, ref) => {
  const variants = {
    default: {
      base: "text-muted-foreground",
      active: "bg-background text-foreground shadow-sm"
    },
    gaming: {
      base: "text-slate-400 hover:text-purple-300",
      active: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/20"
    },
    neon: {
      base: "text-cyan-400/60 hover:text-cyan-300",
      active: "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
    }
  }

  const selectedVariant = variants[variant]

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
        selectedVariant.base,
        `data-[state=active]:${selectedVariant.active}`,
        glow && "hover:shadow-lg",
        className
      )}
      {...props}
    >
      {/* Hover shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      <span className="relative z-10">{props.children}</span>
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-300",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }