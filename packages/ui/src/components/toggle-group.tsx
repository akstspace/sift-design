"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"
import { duration, leave, selectionSpring } from "../../../../tokens/motion"
import { toggleVariants } from "./toggle"

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants> & {
  spacing?: number
  selection: string | string[]
  multiple: boolean
}>({ size: "default", variant: "default", spacing: 0, selection: "", multiple: false })

function ToggleGroup({ className, variant, size, spacing = 0, children, ...props }:
  React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants> & { spacing?: number }) {
  const id = React.useId()
  const [local, setLocal] = React.useState<string | string[]>(props.defaultValue ?? (props.type === "multiple" ? [] : ""))
  const selection = props.value ?? local
  const onValueChange = (next: string | string[]) => {
    setLocal(next)
    if (props.type === "multiple") props.onValueChange?.(next as string[])
    else props.onValueChange?.(next as string)
  }
  return (
    <LayoutGroup id={id}>
      <ToggleGroupPrimitive.Root
        data-slot="toggle-group" data-variant={variant} data-size={size} data-spacing={spacing}
        style={{ "--gap": spacing } as React.CSSProperties}
        className={cn("group/toggle-group isolate flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md bg-muted p-0.5", className)}
        {...props} onValueChange={onValueChange}
      >
        <ToggleGroupContext.Provider value={{ variant, size, spacing, selection, multiple: props.type === "multiple" }}>
          {children}
        </ToggleGroupContext.Provider>
      </ToggleGroupPrimitive.Root>
    </LayoutGroup>
  )
}

function ToggleGroupItem({ className, children, variant, size, ...props }:
  React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)
  const reduced = useReducedMotion()
  const selected = Array.isArray(context.selection) ? context.selection.includes(props.value) : context.selection === props.value
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item" data-variant={context.variant || variant} data-size={context.size || size} data-spacing={context.spacing}
      className={cn(toggleVariants({ variant: context.variant || variant, size: context.size || size }),
        "relative w-auto min-w-0 shrink-0 px-3 data-[state=on]:bg-transparent", className)}
      {...props}
    >
      {(selected || context.multiple) && <motion.span aria-hidden="true" data-slot="selection-highlight"
        layoutId={context.multiple || reduced ? undefined : "selection"}
        className="pointer-events-none absolute inset-0 z-0 rounded-[6px] bg-background"
        initial={false} animate={{ opacity: selected ? 1 : 0 }}
        transition={context.multiple
          ? { duration: selected ? duration.quick : duration.instant, ease: selected ? "linear" : leave }
          : reduced ? { duration: 0 } : selectionSpring} />}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </ToggleGroupPrimitive.Item>
  )
}
export { ToggleGroup, ToggleGroupItem }
