"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

export interface SheetOverlayProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay> {
  variant?: "default" | "gaming" | "blur"
}

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  SheetOverlayProps
>(({ className, variant = "default", ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-all duration-300",
      variant === "default" && "bg-black/80",
      variant === "gaming" && "bg-black/80 backdrop-blur-sm",
      variant === "blur" && "bg-black/50 backdrop-blur-md",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
      variant: {
        default: "bg-background border",
        gaming: "bg-slate-800/95 border-purple-500/20 backdrop-blur-xl shadow-2xl shadow-purple-500/20",
        glass: "bg-white/10 border-white/20 backdrop-blur-xl shadow-2xl"
      }
    },
    defaultVariants: {
      side: "right",
      variant: "default"
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", variant = "default", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay variant={variant === "gaming" ? "gaming" : variant === "glass" ? "blur" : "default"} />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side, variant }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close 
        className={cn(
          "absolute right-4 top-4 rounded-lg opacity-70 ring-offset-background transition-all duration-200 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary hover:bg-white/10 p-1",
          variant === "gaming" && "hover:bg-purple-500/20 focus:ring-purple-500/50 text-purple-200",
          variant === "glass" && "hover:bg-white/20 text-white"
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "gaming" | "glass"
}) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      variant === "gaming" && "border-b border-purple-500/20 pb-4",
      variant === "glass" && "border-b border-white/20 pb-4",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title> & {
    variant?: "default" | "gaming" | "glass"
    gradient?: boolean
  }
>(({ className, variant = "default", gradient = false, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold text-foreground transition-all duration-300",
      gradient && "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent",
      variant === "gaming" && !gradient && "text-purple-200",
      variant === "glass" && !gradient && "text-white",
      className
    )}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description> & {
    variant?: "default" | "gaming" | "glass"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground",
      variant === "gaming" && "text-slate-300",
      variant === "glass" && "text-white/80",
      className
    )}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}