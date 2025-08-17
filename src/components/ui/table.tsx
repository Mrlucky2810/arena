import * as React from "react"

import { cn } from "@/lib/utils"

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  variant?: "default" | "gaming" | "neon"
  striped?: boolean
  hover?: boolean
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant = "default", striped = false, hover = false, ...props }, ref) => {
    const variants = {
      default: "text-sm",
      gaming: "text-sm bg-slate-800/50 border-purple-500/20 backdrop-blur-sm",
      neon: "text-sm bg-slate-900/50 border-cyan-500/20 backdrop-blur-sm"
    }

    return (
      <div className="relative w-full overflow-auto">
        <table
          ref={ref}
          className={cn(
            "w-full caption-bottom border-separate border-spacing-0 rounded-xl overflow-hidden",
            variants[variant],
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Table.displayName = "Table"

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  variant?: "default" | "gaming" | "neon"
}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "",
      gaming: "bg-gradient-to-r from-purple-500/20 to-pink-500/20",
      neon: "bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
    }

    return (
      <thead 
        ref={ref} 
        className={cn("[&_tr]:border-b", variants[variant], className)} 
        {...props} 
      />
    )
  }
)
TableHeader.displayName = "TableHeader"

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  variant?: "default" | "gaming" | "neon"
  striped?: boolean
  hover?: boolean
}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, variant = "default", striped = false, hover = false, ...props }, ref) => {
    const variants = {
      default: "",
      gaming: striped ? "[&_tr:nth-child(even)]:bg-purple-500/5" : "",
      neon: striped ? "[&_tr:nth-child(even)]:bg-cyan-500/5" : ""
    }

    const hoverStyles = {
      default: hover ? "[&_tr]:hover:bg-muted/50" : "",
      gaming: hover ? "[&_tr]:hover:bg-purple-500/10" : "",
      neon: hover ? "[&_tr]:hover:bg-cyan-500/10" : ""
    }

    return (
      <tbody
        ref={ref}
        className={cn(
          "[&_tr:last-child]:border-0 transition-all duration-200",
          variants[variant],
          hoverStyles[variant],
          className
        )}
        {...props}
      />
    )
  }
)
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  variant?: "default" | "gaming" | "neon"
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "border-b transition-colors data-[state=selected]:bg-muted",
      gaming: "border-b border-purple-500/20 transition-colors data-[state=selected]:bg-purple-500/20",
      neon: "border-b border-cyan-500/20 transition-colors data-[state=selected]:bg-cyan-500/20"
    }

    return (
      <tr
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      />
    )
  }
)
TableRow.displayName = "TableRow"

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  variant?: "default" | "gaming" | "neon"
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "text-muted-foreground",
      gaming: "text-purple-300 font-semibold",
      neon: "text-cyan-300 font-semibold"
    }

    return (
      <th
        ref={ref}
        className={cn(
          "h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
TableHead.displayName = "TableHead"

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  variant?: "default" | "gaming" | "neon"
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "",
      gaming: "text-slate-200",
      neon: "text-cyan-100"
    }

    return (
      <td
        ref={ref}
        className={cn(
          "p-4 align-middle [&:has([role=checkbox])]:pr-0",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}