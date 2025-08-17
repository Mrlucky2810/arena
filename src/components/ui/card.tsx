import * as React from "react"

import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  hover?: boolean
  glass?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = false, hover = false, glass = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-lg transition-all duration-300",
        glass && "bg-card/80 backdrop-blur-sm border-white/10",
        hover && "hover:shadow-xl hover:-translate-y-1",
        glow && "hover:shadow-2xl hover:shadow-primary/20",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 md:p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  gradient?: boolean
  glow?: boolean
}

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, gradient = false, glow = false, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight md:text-xl transition-all duration-300",
        gradient && "bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent",
        glow && "hover:drop-shadow-lg",
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 md:p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 md:p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }