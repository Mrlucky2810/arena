"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

export interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  variant?: "default" | "gaming" | "neon"
}

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border-b",
    gaming: "border-b border-purple-500/20 bg-slate-800/30 rounded-lg mb-2 overflow-hidden",
    neon: "border-b border-cyan-500/20 bg-slate-900/30 rounded-lg mb-2 overflow-hidden"
  }

  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(variants[variant], className)}
      {...props}
    />
  )
})
AccordionItem.displayName = "AccordionItem"

export interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  variant?: "default" | "gaming" | "neon"
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, variant = "default", ...props }, ref) => {
  const variants = {
    default: "hover:underline",
    gaming: "hover:bg-purple-500/10 text-purple-200 hover:text-purple-100",
    neon: "hover:bg-cyan-500/10 text-cyan-200 hover:text-cyan-100"
  }

  const iconVariants = {
    default: "",
    gaming: "text-purple-400",
    neon: "text-cyan-400"
  }

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 px-4 font-medium transition-all duration-300 [&[data-state=open]>svg]:rotate-180",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-300",
          iconVariants[variant]
        )} />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

export interface AccordionContentProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
  variant?: "default" | "gaming" | "neon"
}

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, variant = "default", ...props }, ref) => {
  const variants = {
    default: "",
    gaming: "text-slate-300 bg-purple-500/5",
    neon: "text-cyan-100 bg-cyan-500/5"
  }

  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn(
        "pb-4 pt-0 px-4",
        variants[variant],
        className
      )}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
})
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }