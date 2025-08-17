"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

export interface ProgressProps 
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "gaming" | "neon" | "gradient"
  animated?: boolean
  glow?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", animated = false, glow = false, ...props }, ref) => {
  const variants = {
    default: {
      bg: "bg-secondary",
      indicator: "bg-primary"
    },
    gaming: {
      bg: "bg-slate-800/50 border border-purple-500/20",
      indicator: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    neon: {
      bg: "bg-slate-900/50 border border-cyan-500/20",
      indicator: "bg-gradient-to-r from-cyan-500 to-blue-500"
    },
    gradient: {
      bg: "bg-slate-800/50",
      indicator: "bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"
    }
  }

  const selectedVariant = variants[variant]

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full",
        selectedVariant.bg,
        glow && "shadow-lg",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full relative overflow-hidden",
          selectedVariant.indicator,
          animated && "animate-pulse",
          glow && variant === "gaming" && "shadow-lg shadow-purple-500/50",
          glow && variant === "neon" && "shadow-lg shadow-cyan-500/50",
          glow && variant === "gradient" && "shadow-lg shadow-blue-500/50"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      >
        {/* Animated shimmer effect */}
        {animated && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
               style={{ 
                 animation: "shimmer 2s infinite",
                 backgroundSize: "200% 100%"
               }} />
        )}
      </ProgressPrimitive.Indicator>
      
      {/* Glow effect overlay */}
      {glow && (
        <div className={cn(
          "absolute inset-0 rounded-full opacity-50 blur-sm",
          selectedVariant.indicator
        )} style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
      )}
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }