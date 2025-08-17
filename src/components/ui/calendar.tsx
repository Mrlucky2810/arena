"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  variant?: "default" | "gaming" | "neon"
  glow?: boolean
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  variant = "default",
  glow = false,
  ...props
}: CalendarProps) {
  const variants = {
    default: {
      bg: "",
      selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
      today: "bg-accent text-accent-foreground"
    },
    gaming: {
      bg: "bg-slate-800/50 border border-purple-500/20 backdrop-blur-sm",
      selected: "bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 focus:from-purple-600 focus:to-pink-600",
      today: "bg-purple-500/20 text-purple-300"
    },
    neon: {
      bg: "bg-slate-900/50 border border-cyan-500/20 backdrop-blur-sm",
      selected: "bg-gradient-to-br from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 focus:from-cyan-600 focus:to-blue-600",
      today: "bg-cyan-500/20 text-cyan-300"
    }
  }

  const selectedVariant = variants[variant]

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3 rounded-xl",
        selectedVariant.bg,
        glow && variant === "gaming" && "shadow-lg shadow-purple-500/25",
        glow && variant === "neon" && "shadow-lg shadow-cyan-500/25",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: cn(
          "text-sm font-medium",
          variant === "gaming" && "text-purple-200",
          variant === "neon" && "text-cyan-200"
        ),
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          variant === "gaming" && "border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500",
          variant === "neon" && "border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: cn(
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          variant === "gaming" && "text-purple-300",
          variant === "neon" && "text-cyan-300"
        ),
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 transition-all duration-200",
          variant === "gaming" && "hover:bg-purple-500/20",
          variant === "neon" && "hover:bg-cyan-500/20"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          selectedVariant.selected,
          glow && variant === "gaming" && "shadow-lg shadow-purple-500/50",
          glow && variant === "neon" && "shadow-lg shadow-cyan-500/50"
        ),
        day_today: selectedVariant.today,
        day_outside: cn(
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
          variant === "gaming" && "text-purple-400/50",
          variant === "neon" && "text-cyan-400/50"
        ),
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }