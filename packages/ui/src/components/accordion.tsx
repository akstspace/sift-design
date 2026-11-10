import * as React from "react"
import { cn } from "cn"
import { DisclosureBody } from "./collapsible"
import { IconChevronDown as ChevronDownIcon } from "@tabler/icons-react"
import { Accordion as AccordionPrimitive } from "radix-ui"

const AccordionContext = React.createContext<string | string[]>([])
const AccordionItemContext = React.createContext("")
function Accordion(props: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  const [internal, setInternal] = React.useState<string | string[]>(props.defaultValue ?? (props.type === "multiple" ? [] : ""))
  const value = props.value ?? internal
  const changed = (next: string | string[]) => { setInternal(next); (props.onValueChange as ((value: string | string[]) => void) | undefined)?.(next) }
  return <AccordionContext.Provider value={value}>{props.type === "multiple"
    ? <AccordionPrimitive.Root data-slot="accordion" {...props} value={value as string[]} onValueChange={changed} />
    : <AccordionPrimitive.Root data-slot="accordion" {...props} value={value as string} onValueChange={changed} />}</AccordionContext.Provider>
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionItemContext.Provider value={props.value}><AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    /></AccordionItemContext.Provider>
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  const value = React.useContext(AccordionContext)
  const item = React.useContext(AccordionItemContext)
  const open = Array.isArray(value) ? value.includes(item) : value === item
  return <AccordionPrimitive.Content data-slot="accordion-content" forceMount {...props}>
    <DisclosureBody open={open} className={cn("pb-4 text-sm", className)}>{children}</DisclosureBody>
  </AccordionPrimitive.Content>
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
