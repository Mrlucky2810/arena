"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

export interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  variant?: "default" | "gaming" | "neon"
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  variant?: "default" | "gaming" | "neon"
  size?: "sm" | "default" | "lg"
  glow?: boolean
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, variant = "default", size = "default", glow = false, ...props }, ref) => {
  const variants = {
    default: {
      border: "border-primary text-primary",
      indicator: "text-current"
    },
    gaming: {
      border: "border-purple-500 text-purple-500",
      indicator: "text-purple-500"
    },
    neon: {
      border: "border-cyan-500 text-cyan-500",
      indicator: "text-cyan-500"
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
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square rounded-full border-2 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
        selectedSize,
        selectedVariant.border,
        glow && variant === "gaming" && "focus-visible:shadow-lg focus-visible:shadow-purple-500/50",
        glow && variant === "neon" && "focus-visible:shadow-lg focus-visible:shadow-cyan-500/50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className={cn(
          "fill-current",
          size === "sm" ? "h-1.5 w-1.5" :
          size === "lg" ? "h-3 w-3" : "h-2.5 w-2.5",
          selectedVariant.indicator
        )} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }