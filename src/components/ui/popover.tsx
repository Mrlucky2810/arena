"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

export interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  variant?: "default" | "gaming" | "neon"
  glow?: boolean
}

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, align = "center", sideOffset = 4, variant = "default", glow = false, ...props }, ref) => {
  const variants = {
    default: "bg-popover text-popover-foreground border",
    gaming: "bg-slate-800/90 text-slate-100 border-purple-500/20 backdrop-blur-xl shadow-2xl shadow-purple-500/20",
    neon: "bg-slate-900/90 text-cyan-100 border-cyan-500/20 backdrop-blur-xl shadow-2xl shadow-cyan-500/20"
  }

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-xl p-4 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          variants[variant],
          glow && variant === "gaming" && "shadow-2xl shadow-purple-500/30",
          glow && variant === "neon" && "shadow-2xl shadow-cyan-500/30",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }