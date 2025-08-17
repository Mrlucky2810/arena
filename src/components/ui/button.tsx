import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40",
        destructive:
          "bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground hover:from-destructive/90 hover:to-destructive/70 shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/40",
        outline:
          "border-2 border-input bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:shadow-lg",
        secondary:
          "bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/80 hover:to-secondary/60 shadow-md hover:shadow-lg",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-md rounded-lg",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        gradient: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50",
        gaming: "bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white hover:from-emerald-600 hover:via-blue-600 hover:to-purple-600 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50",
        success: "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50",
        warning: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/50",
        neon: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/50 border border-cyan-400/50"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg font-bold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  glow?: boolean
  shimmer?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, glow = false, shimmer = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // When using asChild, we need to pass effects as props to avoid multiple children
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size }), className)}
          ref={ref}
          {...props}
        >
          {React.cloneElement(children as React.ReactElement, {
            children: (
              <>
                {/* Shimmer effect */}
                {shimmer && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                )}
                
                {/* Glow effect */}
                {glow && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                )}
                
                <span className="relative z-10">{(children as React.ReactElement).props.children}</span>
              </>
            )
          })}
        </Comp>
      )
    }
    
    // Regular button rendering
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {/* Shimmer effect */}
        {shimmer && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        )}
        
        {/* Glow effect */}
        {glow && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        )}
        
        <span className="relative z-10">{children}</span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }