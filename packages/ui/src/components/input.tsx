import * as React from "react"
import { cn } from "cn"

function Input({ className, type, controlSize = "default", ...props }: React.ComponentProps<"input"> & { controlSize?: "sm" | "default" | "lg" }) {
  return (
    <input
      type={type}
      data-control-size={controlSize}
      data-slot="input"
      className={cn(
        "h-[32px] w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-none transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-[28px] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-65 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
