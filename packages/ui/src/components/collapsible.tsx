"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { spring } from "@sift-design/tokens/motion"
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
  React.useLayoutEffect(() => {
    if (!content.current) return
    const measure = () => setHeight(content.current?.getBoundingClientRect().height ?? 0)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(content.current)
    return () => observer.disconnect()
  }, [])
  return <motion.div data-slot="disclosure-body" initial={false} animate={{ height: open ? height : 0, opacity: open ? 1 : 0 }} transition={reduced ? { height: { duration: 0 }, opacity: { duration: 0.1 } } : { ...spring.smooth, opacity: { duration: open ? 0.14 : 0.08 } }} className="overflow-hidden" inert={!open} aria-hidden={!open}>
    <div ref={content} className={className}>{children}</div>
  </motion.div>
}
function CollapsibleContent({ className, children, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  const open = React.useContext(DisclosureContext)
  return <CollapsiblePrimitive.Content data-slot="collapsible-content" forceMount {...props}><DisclosureBody open={open} className={cn("text-sm", className)}>{children}</DisclosureBody></CollapsiblePrimitive.Content>
}
export { Collapsible, CollapsibleTrigger, CollapsibleContent }
