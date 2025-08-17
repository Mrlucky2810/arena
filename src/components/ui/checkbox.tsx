"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  variant?: "default" | "gaming" | "neon"
  size?: "sm" | "default" | "lg"
  glow?: boolean
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant = "default", size = "default", glow = false, ...props }, ref) => {
  const variants = {
    default: {
      border: "border-primary",
      checked: "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
    },
    gaming: {
      border: "border-purple-500",
      checked: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500 data-[state=checked]:text-white data-[state=checked]:border-purple-400"
    },
    neon: {
      border: "border-cyan-500",
      checked: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-500 data-[state=checked]:to-blue-500 data-[state=checked]:text-white data-[state=checked]:border-cyan-400"
    }
  }

  const sizes = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5"
  }

  const selectedVariant = variants[variant]
  const selectedSize = sizes[size]

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer shrink-0 rounded-lg border-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
        selectedSize,
        selectedVariant.border,
        selectedVariant.checked,
        glow && variant === "gaming" && "data-[state=checked]:shadow-lg data-[state=checked]:shadow-purple-500/50",
        glow && variant === "neon" && "data-[state=checked]:shadow-lg data-[state=checked]:shadow-cyan-500/50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className={cn(
          size === "sm" ? "h-2.5 w-2.5" :
          size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"
        )} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }