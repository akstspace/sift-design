"use client"

import * as React from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { cn } from "cn"

/** A real heading, pinned in its own scroll container and continuously sized by
 * scroll progress. The reserved header height does not change while scrolling. */
function ScrollTitle({ children, container, distance = 96, className }: {
  children: React.ReactNode
  container?: React.RefObject<HTMLElement | null>
  distance?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  const { scrollY } = useScroll({ container })
  const scale = useTransform(scrollY, [0, Math.max(1, distance)], [1, 0.72], { clamp: true })
  const opacity = useTransform(scrollY, [0, Math.max(1, distance)], [1, 0.86], { clamp: true })
  return <header data-slot="scroll-title" className={cn("sticky top-0 z-10 flex h-[80px] shrink-0 items-center border-b bg-background px-5", className)}>
    <motion.h2 data-page-heading tabIndex={-1} className="origin-left text-[30px] font-semibold tracking-[-0.02em] outline-none rtl:origin-right" style={{ scale: reduced ? 1 : scale, opacity: reduced ? 1 : opacity }}>{children}</motion.h2>
  </header>
}

export { ScrollTitle }
