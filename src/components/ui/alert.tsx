import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border/50 shadow-md",
        destructive:
          "border-destructive/50 text-destructive bg-destructive/10 backdrop-blur-sm shadow-lg shadow-destructive/10 [&>svg]:text-destructive",
        warning: 
          "border-yellow-500/50 text-yellow-800 bg-yellow-50 dark:bg-yellow-500/10 dark:text-yellow-400 shadow-lg shadow-yellow-500/10 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400",
        success:
          "border-emerald-500/50 text-emerald-800 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 shadow-lg shadow-emerald-500/10 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400",
        info:
          "border-blue-500/50 text-blue-800 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 shadow-lg shadow-blue-500/10 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
        gaming:
          "border-purple-500/50 text-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 dark:text-purple-300 shadow-lg shadow-purple-500/10 backdrop-blur-sm [&>svg]:text-purple-600 dark:[&>svg]:text-purple-400",
        neon:
          "border-cyan-500/50 text-cyan-800 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-500/10 dark:to-blue-500/10 dark:text-cyan-300 shadow-lg shadow-cyan-500/10 backdrop-blur-sm [&>svg]:text-cyan-600 dark:[&>svg]:text-cyan-400"
      },
      size: {
        default: "p-4",
        sm: "p-3 text-sm",
        lg: "p-6 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  glow?: boolean
  animate?: boolean
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, size, glow = false, animate = false, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        alertVariants({ variant, size }),
        glow && "hover:shadow-xl transition-shadow duration-300",
        animate && "animate-pulse",
        className
      )}
      {...props}
    />
  )
)
Alert.displayName = "Alert"

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  gradient?: boolean
}

const AlertTitle = React.forwardRef<HTMLParagraphElement, AlertTitleProps>(
  ({ className, gradient = false, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn(
        "mb-1 font-medium leading-none tracking-tight",
        gradient && "bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent",
        className
      )}
      {...props}
    />
  )
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed opacity-90", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }