"use client"

import * as React from "react"
import { cn } from "cn"
import { motion, useReducedMotion } from "motion/react"
import { spring } from "@sift-design/tokens/motion"
import { Progress as ProgressPrimitive } from "radix-ui"

function Progress({ className, value, max = 100, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const reduced = useReducedMotion()
  const previous = React.useRef(value ?? 0)
  const backwards = value != null && value < previous.current
  React.useEffect(() => { previous.current = value ?? 0 }, [value])
  const limit = max > 0 ? max : 100
  const percent = Math.min(100, Math.max(0, ((value ?? 0) / limit) * 100))
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      max={limit}
      className={cn("relative h-[4px] w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        data-backwards={backwards || undefined}
        asChild
      ><motion.div
          className="h-full w-full origin-left rounded-full bg-good"
          initial={false}
          animate={{ scaleX: percent / 100 }}
          transition={reduced || backwards ? { duration: 0 } : spring.smooth}
        /></ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
