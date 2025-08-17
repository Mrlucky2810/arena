"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  variant?: "default" | "gaming" | "neon"
  size?: "sm" | "default" | "lg"
  glow?: boolean
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, variant = "default", size = "default", glow = false, ...props }, ref) => {
  const variants = {
    default: {
      checked: "data-[state=checked]:bg-primary",
      unchecked: "data-[state=unchecked]:bg-input"
    },
    gaming: {
      checked: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500",
      unchecked: "data-[state=unchecked]:bg-slate-700"
    },
    neon: {
      checked: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-500 data-[state=checked]:to-blue-500",
      unchecked: "data-[state=unchecked]:bg-slate-800"
    }
  }

  const sizes = {
    sm: {
      root: "h-5 w-9",
      thumb: "h-4 w-4 data-[state=checked]:translate-x-4"
    },
    default: {
      root: "h-6 w-11",
      thumb: "h-5 w-5 data-[state=checked]:translate-x-5"
    },
    lg: {
      root: "h-7 w-13",
      thumb: "h-6 w-6 data-[state=checked]:translate-x-6"
    }
  }

  const selectedVariant = variants[variant]
  const selectedSize = sizes[size]

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        selectedSize.root,
        selectedVariant.checked,
        selectedVariant.unchecked,
        glow && variant === "gaming" && "data-[state=checked]:shadow-lg data-[state=checked]:shadow-purple-500/50",
        glow && variant === "neon" && "data-[state=checked]:shadow-lg data-[state=checked]:shadow-cyan-500/50",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-all duration-300 data-[state=unchecked]:translate-x-0",
          selectedSize.thumb
        )}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }