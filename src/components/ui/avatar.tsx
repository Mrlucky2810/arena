"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  variant?: "default" | "gaming" | "neon"
  size?: "sm" | "default" | "lg" | "xl"
  glow?: boolean
  status?: "online" | "offline" | "away" | "busy"
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, variant = "default", size = "default", glow = false, status, ...props }, ref) => {
  const variants = {
    default: "border-border",
    gaming: "border-purple-500 ring-2 ring-purple-500/20",
    neon: "border-cyan-500 ring-2 ring-cyan-500/20"
  }

  const sizes = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  }

  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-500",
    away: "bg-yellow-500",
    busy: "bg-red-500"
  }

  return (
    <div className="relative">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full border-2 transition-all duration-300",
          sizes[size],
          variants[variant],
          glow && variant === "gaming" && "shadow-lg shadow-purple-500/50",
          glow && variant === "neon" && "shadow-lg shadow-cyan-500/50",
          className
        )}
        {...props}
      />
      
      {/* Status indicator */}
      {status && (
        <div className={cn(
          "absolute bottom-0 right-0 rounded-full border-2 border-background",
          statusColors[status],
          size === "sm" ? "h-2.5 w-2.5" :
          size === "lg" ? "h-4 w-4" :
          size === "xl" ? "h-5 w-5" : "h-3 w-3"
        )} />
      )}
    </div>
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

export interface AvatarImageProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  variant?: "default" | "gaming" | "neon"
}

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, variant = "default", ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn(
      "aspect-square h-full w-full transition-all duration-300",
      variant === "gaming" && "hover:scale-105",
      variant === "neon" && "hover:scale-105",
      className
    )}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

export interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  variant?: "default" | "gaming" | "neon"
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-muted text-muted-foreground",
    gaming: "bg-gradient-to-br from-purple-500 to-pink-500 text-white",
    neon: "bg-gradient-to-br from-cyan-500 to-blue-500 text-white"
  }

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full font-semibold",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }