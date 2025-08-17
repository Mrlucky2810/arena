"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "text-foreground",
        gaming: "text-purple-300",
        neon: "text-cyan-300",
        muted: "text-muted-foreground",
        destructive: "text-destructive"
      },
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  gradient?: boolean
  glow?: boolean
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, variant, size, gradient = false, glow = false, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      labelVariants({ variant, size }),
      gradient && "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent",
      glow && variant === "gaming" && "hover:drop-shadow-lg hover:drop-shadow-purple-500/50",
      glow && variant === "neon" && "hover:drop-shadow-lg hover:drop-shadow-cyan-500/50",
      className
    )}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }