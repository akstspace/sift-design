"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { duration, leave, spring } from "@sift-design/tokens/motion"
import { cn } from "cn"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

const DisclosureContext = React.createContext(false)
function Collapsible({ open: controlled, defaultOpen = false, onOpenChange, children, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  const [internal, setInternal] = React.useState(defaultOpen)
  const open = controlled ?? internal
  return <DisclosureContext.Provider value={open}><CollapsiblePrimitive.Root data-slot="collapsible" open={open} onOpenChange={value => { setInternal(value); onOpenChange?.(value) }} {...props}>{children}</CollapsiblePrimitive.Root></DisclosureContext.Provider>
}
function CollapsibleTrigger(props: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
}

/** Shared measured disclosure body: the wrapper's height springs; inner text never scales. */
export function DisclosureBody({ open, className, children }: { open: boolean; className?: string; children: React.ReactNode }) {
  const reduced = !!useReducedMotion()
  const content = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState(0)
  const [settled, setSettled] = React.useState(false)
  React.useLayoutEffect(() => { setSettled(false) }, [open, height])
  React.useLayoutEffect(() => {
    if (!content.current) return
    const measure = () => setHeight(content.current?.getBoundingClientRect().height ?? 0)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(content.current)
    return () => observer.disconnect()
  }, [])
  return <motion.div data-slot="disclosure-body" initial={false} animate={{ height: open ? height : 0, opacity: open ? 1 : 0 }} transition={{ height: reduced ? { duration: 0 } : open ? spring.smooth : spring.exit, opacity: { duration: open ? duration.quick : duration.instant, ease: open ? "linear" : leave } }} onAnimationComplete={() => setSettled(true)} style={{ overflow: open && settled ? "visible" : "hidden" }} inert={!open} aria-hidden={!open}>
    <div ref={content} className={className}>{children}</div>
  </motion.div>
}
function CollapsibleContent({ className, children, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  const open = React.useContext(DisclosureContext)
  return <CollapsiblePrimitive.Content data-slot="collapsible-content" forceMount {...props}><DisclosureBody open={open} className={cn("text-sm", className)}>{children}</DisclosureBody></CollapsiblePrimitive.Content>
}
export { Collapsible, CollapsibleTrigger, CollapsibleContent }
