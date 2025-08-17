import * as React from 'react';

import {cn} from '@/lib/utils';

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  variant?: "default" | "gaming" | "neon"
  glow?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({className, variant = "default", glow = false, ...props}, ref) => {
    const variants = {
      default: "border-input bg-background focus:border-primary focus:ring-primary/20",
      gaming: "border-purple-500/30 bg-slate-800/50 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20 backdrop-blur-sm",
      neon: "border-cyan-500/30 bg-slate-900/50 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400 focus:ring-cyan-400/20 backdrop-blur-sm shadow-lg shadow-cyan-500/10"
    }

    return (
      <div className="relative group">
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-xl border-2 bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300 resize-none',
            variants[variant],
            glow && "focus:shadow-lg focus:shadow-primary/25",
            className
          )}
          ref={ref}
          {...props}
        />
        {/* Glow effect for gaming/neon variants */}
        {(variant === "gaming" || variant === "neon") && (
          <div className={cn(
            "absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl",
            variant === "gaming" ? "bg-purple-500/20" : "bg-cyan-500/20"
          )} />
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};