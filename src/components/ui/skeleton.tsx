import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gaming" | "neon"
  animated?: boolean
}

function Skeleton({
  className,
  variant = "default",
  animated = true,
  ...props
}: SkeletonProps) {
  const variants = {
    default: "bg-muted",
    gaming: "bg-gradient-to-r from-purple-500/20 to-pink-500/20",
    neon: "bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
  }

  return (
    <div
      className={cn(
        "rounded-md transition-all duration-300",
        animated && "animate-pulse",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }