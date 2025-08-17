import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-md hover:shadow-lg",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-md hover:shadow-lg",
        outline: "text-foreground border-border hover:bg-accent/50",
        success: "border-transparent bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/40",
        warning: "border-transparent bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md shadow-yellow-500/25 hover:shadow-lg hover:shadow-yellow-500/40",
        info: "border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40",
        gaming: "border-transparent bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/40",
        neon: "border-cyan-400/50 bg-cyan-500/10 text-cyan-400 shadow-md shadow-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/40 backdrop-blur-sm",
        streak: "border-transparent bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/40 animate-pulse"
      },
      size: {
        default: "text-xs px-2.5 py-0.5",
        sm: "text-xs px-2 py-0.5 rounded-md",
        lg: "text-sm px-3 py-1 rounded-lg",
        xl: "text-base px-4 py-1.5 rounded-xl font-bold"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  glow?: boolean
  pulse?: boolean
}

function Badge({ className, variant, size, glow = false, pulse = false, ...props }: BadgeProps) {
  return (
    <div 
      className={cn(
        badgeVariants({ variant, size }), 
        glow && "hover:shadow-2xl",
        pulse && "animate-pulse",
        className
      )} 
      {...props} 
    />
  )
}

export { Badge, badgeVariants }