"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  variant?: "default" | "gaming" | "neon"
  glow?: boolean
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant = "default", glow = false, ...props }, ref) => {
  const variants = {
    default: {
      track: "bg-secondary",
      range: "bg-primary",
      thumb: "border-primary bg-background"
    },
    gaming: {
      track: "bg-slate-800/50 border border-purple-500/20",
      range: "bg-gradient-to-r from-purple-500 to-pink-500",
      thumb: "border-purple-500 bg-purple-500 shadow-lg shadow-purple-500/50"
    },
    neon: {
      track: "bg-slate-900/50 border border-cyan-500/20",
      range: "bg-gradient-to-r from-cyan-500 to-blue-500",
      thumb: "border-cyan-400 bg-cyan-500 shadow-lg shadow-cyan-500/50"
    }
  }

  const selectedVariant = variants[variant]

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track 
        className={cn(
          "relative h-3 w-full grow overflow-hidden rounded-full",
          selectedVariant.track
        )}
      >
        <SliderPrimitive.Range 
          className={cn(
            "absolute h-full rounded-full transition-all duration-300",
            selectedVariant.range,
            glow && variant === "gaming" && "shadow-md shadow-purple-500/30",
            glow && variant === "neon" && "shadow-md shadow-cyan-500/30"
          )} 
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb 
        className={cn(
          "block h-6 w-6 rounded-full border-2 ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 active:scale-95",
          selectedVariant.thumb,
          glow && "hover:shadow-xl"
        )} 
      />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }