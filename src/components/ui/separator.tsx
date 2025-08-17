"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  variant?: "default" | "gaming" | "neon" | "gradient"
  glow?: boolean
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    { className, orientation = "horizontal", decorative = true, variant = "default", glow = false, ...props },
    ref
  ) => {
    const variants = {
      default: "bg-border",
      gaming: "bg-gradient-to-r from-purple-500/50 to-pink-500/50",
      neon: "bg-gradient-to-r from-cyan-500/50 to-blue-500/50",
      gradient: "bg-gradient-to-r from-emerald-500/50 via-blue-500/50 to-purple-500/50"
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0 transition-all duration-300",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          variants[variant],
          glow && variant === "gaming" && "shadow-lg shadow-purple-500/25",
          glow && variant === "neon" && "shadow-lg shadow-cyan-500/25",
          glow && variant === "gradient" && "shadow-lg shadow-blue-500/25",
          className
        )}
        {...props}
      />
    )
  }
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }