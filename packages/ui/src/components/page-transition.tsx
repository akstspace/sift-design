"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion, useIsPresent, type TargetAndTransition, type Variants } from "motion/react"
import { pageMotion, pushMotion, type Direction } from "@sift-design/tokens/motion"
import { cn } from "cn"
import { useIsMobile } from "../hooks/use-mobile"

type TransitionProps = {
  /** Stable destination identity, never a streaming token or update timestamp. */
  pageKey: string
  /** 1 moves forward in reading order; -1 returns to the previous destination. */
  direction?: Direction
  /** Override the document's reading direction for a local subtree. */
  dir?: "ltr" | "rtl"
  className?: string
  pageClassName?: string
  children: React.ReactNode
  /** Move focus on navigation, but not on the initial render. */
  focusHeading?: boolean
}

function ActivePage({ children, pageKey }: { children: React.ReactNode; pageKey: string }) {
  const present = useIsPresent()
  return <div data-transition-page={present ? "current" : "leaving"} data-page-key={pageKey} inert={!present} aria-hidden={!present}>{children}</div>
}

function TransitionFrame({ pageKey, direction = 1, dir, className, pageClassName, children, focusHeading = true, hierarchy }: TransitionProps & { hierarchy: boolean }) {
  const reduced = !!useReducedMotion()
  const mobile = useIsMobile()
  const root = React.useRef<HTMLDivElement>(null)
  const lastKey = React.useRef(pageKey)
  const [readingDirection, setReadingDirection] = React.useState<"ltr" | "rtl">(dir ?? "ltr")
  React.useLayoutEffect(() => {
    setReadingDirection(dir ?? (root.current && getComputedStyle(root.current).direction === "rtl" ? "rtl" : "ltr"))
  }, [dir])
  React.useLayoutEffect(() => {
    if (lastKey.current === pageKey) return
    lastKey.current = pageKey
    if (!focusHeading) return
    const page = root.current?.querySelector<HTMLElement>('[data-transition-page="current"]')
    const heading = page?.querySelector<HTMLElement>("[data-page-heading], h1, h2, h3, h4, h5, h6") ?? page
    if (heading) {
      if (!heading.hasAttribute("tabindex")) heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  }, [pageKey, focusHeading])
  const sign = (direction * (readingDirection === "rtl" ? -1 : 1)) as Direction
  const base = hierarchy ? pushMotion(reduced, mobile) : pageMotion(reduced)
  const mirror = (value: TargetAndTransition) => {
    if (readingDirection !== "rtl" || !hierarchy || value.x === undefined) return value
    const x = value.x
    return { ...value, x: typeof x === "number" ? -x : typeof x === "string" ? `${-parseFloat(x)}%` : x }
  }
  const variants: Variants = { ...base, enter: (value: Direction) => ({ ...mirror(base.enter(value)), zIndex: hierarchy && value < 0 ? 0 : 2 }), exit: (value: Direction) => ({ ...mirror(base.exit(value)), zIndex: hierarchy && value < 0 ? 2 : 0 }) }
  // The tokens' sign describes physical travel; reading order is resolved once here.
  return <div ref={root} dir={dir} data-slot={hierarchy ? "push-stack" : "sibling-transition"} className={cn("relative isolate grid min-w-0 overflow-hidden", className)}>
    <AnimatePresence initial={false} custom={hierarchy ? direction : sign} mode="sync">
      <motion.div
        key={pageKey}
        data-slot="transition-page"
        tabIndex={-1}
        custom={hierarchy ? direction : sign}
        variants={variants}
        initial="enter"
        animate="visible"
        exit="exit"
        className={cn("col-start-1 row-start-1 min-w-0 bg-background outline-none", pageClassName)}
      ><ActivePage pageKey={pageKey}>{children}</ActivePage></motion.div>
    </AnimatePresence>
  </div>
}

/** Cross-fading sibling destinations with a small direction-aware drift. */
function SiblingTransition(props: TransitionProps) { return <TransitionFrame {...props} hierarchy={false} /> }
/** A hierarchy push/pop with trailing-edge travel and a dimmed previous page. */
function PushStack(props: TransitionProps) { return <TransitionFrame {...props} hierarchy /> }

export { SiblingTransition, PushStack }
export type { TransitionProps }
