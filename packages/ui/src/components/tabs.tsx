"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Tabs as TabsPrimitive } from "radix-ui"
import { AnimatePresence, LayoutGroup, motion, useIsPresent, useReducedMotion } from "motion/react"
import { selectionSpring, spring } from "../../../../tokens/motion"

const TabsContext = React.createContext({ value: "", direction: 1 })
const MotionTabsContent = motion.create(TabsPrimitive.Content)
const PresencePanel = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof MotionTabsContent>>(
  function PresencePanel({ inert, "aria-hidden": ariaHidden, tabIndex, ...props }, ref) {
    const present = useIsPresent()
    return <MotionTabsContent {...props} ref={ref} inert={!present || inert}
      aria-hidden={!present || ariaHidden || undefined} tabIndex={present ? tabIndex : -1} />
  }
)
const ListContext = React.createContext<"default" | "line">("default")

function Tabs({ className, orientation = "horizontal", value, defaultValue, onValueChange, children, ...props }:
  React.ComponentProps<typeof TabsPrimitive.Root>) {
  const id = React.useId()
  const root = React.useRef<HTMLDivElement>(null)
  const [local, setLocal] = React.useState(defaultValue ?? "")
  const [direction, setDirection] = React.useState(1)
  const selected = value ?? local
  function change(next: string) {
    const items = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-slot="tabs-trigger"]') ?? []).map(el => el.dataset.value)
    setDirection(items.indexOf(next) >= items.indexOf(selected) ? 1 : -1)
    setLocal(next)
    onValueChange?.(next)
  }
  return <LayoutGroup id={id}>
    <TabsContext.Provider value={{ value: selected, direction }}>
      <TabsPrimitive.Root ref={root} data-slot="tabs" data-orientation={orientation} orientation={orientation}
        value={selected} onValueChange={change}
        className={cn("group/tabs flex gap-3 data-[orientation=horizontal]:flex-col", className)} {...props}>
        {children}
      </TabsPrimitive.Root>
    </TabsContext.Provider>
  </LayoutGroup>
}

const tabsListVariants = cva(
  "group/tabs-list isolate inline-flex w-fit items-center justify-center rounded-md p-0.5 text-muted-foreground group-data-[orientation=horizontal]/tabs:h-[32px] group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  { variants: { variant: { default: "bg-muted", line: "gap-3 rounded-none bg-transparent p-0" } }, defaultVariants: { variant: "default" } }
)
function TabsList({ className, variant = "default", children, ...props }:
  React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return <ListContext.Provider value={variant ?? "default"}>
    <TabsPrimitive.List data-slot="tabs-list" data-variant={variant} className={cn(tabsListVariants({ variant }), className)} {...props}>{children}</TabsPrimitive.List>
  </ListContext.Provider>
}
function TabsTrigger({ className, children, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const context = React.useContext(TabsContext)
  const variant = React.useContext(ListContext)
  const reduced = useReducedMotion()
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" data-value={props.value}
    className={cn("relative inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-[6px] px-3 py-1 text-[13px] font-medium whitespace-nowrap outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-65 data-[state=active]:text-foreground group-data-[orientation=vertical]/tabs:w-full [&_svg]:size-4", className)} {...props}>
    {context.value === props.value && <motion.span aria-hidden="true" data-slot="tabs-indicator"
      layoutId={reduced ? undefined : "indicator"} initial={false} transition={reduced ? { duration: 0.14 } : selectionSpring}
      className={cn("pointer-events-none absolute z-0", variant === "line"
        ? "inset-x-0 bottom-0 h-0.5 bg-primary group-data-[orientation=vertical]/tabs:inset-y-0 group-data-[orientation=vertical]/tabs:left-auto group-data-[orientation=vertical]/tabs:h-auto group-data-[orientation=vertical]/tabs:w-0.5"
        : "inset-0 rounded-[6px] bg-background")} />}
    <span className="relative z-10 inline-flex items-center gap-1.5">{children}</span>
  </TabsPrimitive.Trigger>
}
function TabsContent({ className, children, forceMount, asChild, ...props }: Omit<React.ComponentProps<typeof TabsPrimitive.Content>, "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd">) {
  const { value, direction } = React.useContext(TabsContext)
  const reduced = useReducedMotion()
  return <AnimatePresence initial={false} mode="popLayout" custom={direction}>
    {(value === props.value || forceMount) && <PresencePanel {...props} forceMount={true} asChild={asChild} key={props.value}
      data-slot="tabs-content" className={cn("min-w-0 flex-1 outline-none", className)}
      inert={value !== props.value}
      aria-hidden={value !== props.value || undefined}
      tabIndex={value === props.value ? props.tabIndex ?? 0 : -1}
      custom={direction} initial="enter" animate="visible" exit="exit"
      variants={{
        enter: (sign: number) => ({ opacity: 0, x: reduced ? 0 : sign * 6 }),
        visible: { opacity: 1, x: 0, transition: reduced ? { duration: 0.14 } : { ...spring.smooth, opacity: { duration: 0.14, ease: "linear" } } },
        exit: (sign: number) => ({ opacity: 0, x: reduced ? 0 : sign * -4, transition: reduced ? { duration: 0.08 } : { ...spring.snappy, opacity: { duration: 0.08, ease: "linear" } } }),
      }}>
      {children}
    </PresencePanel>}
  </AnimatePresence>
}
export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
