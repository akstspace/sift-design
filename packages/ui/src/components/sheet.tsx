"use client"

import * as React from "react"
import { cn } from "cn"
import { useOverlayIsolation } from "./dialog"
import { IconX as XIcon } from "@tabler/icons-react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { Drawer as MobileSheetPrimitive } from "vaul"
import { useReducedMotion } from "motion/react"

const SheetMobile = React.createContext(false)
const mobileQuery = "(max-width: 639px)"
function subscribeMobile(notify: () => void) {
  const media = window.matchMedia(mobileQuery)
  media.addEventListener("change", notify)
  return () => media.removeEventListener("change", notify)
}
function Sheet({ responsive = true, ...props }: React.ComponentProps<typeof SheetPrimitive.Root> & {
  /** Keep edge-attached surfaces, such as navigation, out of the bottom-sheet lifecycle. */
  responsive?: boolean
}) {
  useOverlayIsolation()
  const mobile = React.useSyncExternalStore(subscribeMobile, () => window.matchMedia(mobileQuery).matches, () => false)
  const reduced = useReducedMotion()
  const bottomSheet = responsive && mobile
  return <SheetMobile.Provider value={bottomSheet}>{bottomSheet
    ? <MobileSheetPrimitive.Root direction="bottom" shouldScaleBackground={!reduced} {...props} />
    : <SheetPrimitive.Root data-slot="sheet" {...props} />}</SheetMobile.Provider>
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  const Primitive = React.useContext(SheetMobile) ? MobileSheetPrimitive.Trigger : SheetPrimitive.Trigger
  return <Primitive data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  const Primitive = React.useContext(SheetMobile) ? MobileSheetPrimitive.Close : SheetPrimitive.Close
  return <Primitive data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  const Primitive = React.useContext(SheetMobile) ? MobileSheetPrimitive.Portal : SheetPrimitive.Portal
  return <Primitive data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  const Primitive = React.useContext(SheetMobile) ? MobileSheetPrimitive.Overlay : SheetPrimitive.Overlay
  return (
    <Primitive
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50    ",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  overlayClassName,
  overlay,
  forceMount,
  asChild,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
  overlayClassName?: string
  overlay?: React.ReactNode
}) {
  const mobile = React.useContext(SheetMobile)
  const Content = mobile ? MobileSheetPrimitive.Content : SheetPrimitive.Content
  const Close = mobile ? MobileSheetPrimitive.Close : SheetPrimitive.Close

  return (
    <SheetPortal forceMount={forceMount}>
      <SheetOverlay forceMount={forceMount} asChild={!!overlay} className={overlayClassName}>{overlay}</SheetOverlay>
      <Content
        forceMount={forceMount}
        asChild={asChild}
        data-slot="sheet-content"
        data-side={side}
        data-mobile={mobile || undefined}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background shadow-float outline-none",
          side === "right" &&
            "inset-y-0 right-0 h-full w-[calc(100%-1rem)] border-l sm:max-w-[480px]",
          side === "left" &&
            "inset-y-0 left-0 h-full w-[calc(100%-1rem)] border-r sm:max-w-[480px]",
          side === "top" &&
            "inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {asChild ? children : <>{mobile && <MobileSheetPrimitive.Handle aria-label="Drag sheet" className="mx-auto mt-3" />}{children}
        {showCloseButton && (
          <Close className="absolute top-2 right-2 flex size-[36px] items-center justify-center rounded-md opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </Close>
        )}</>}
      </Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  const Primitive = React.useContext(SheetMobile) ? MobileSheetPrimitive.Title : SheetPrimitive.Title
  return (
    <Primitive
      data-slot="sheet-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  const Primitive = React.useContext(SheetMobile) ? MobileSheetPrimitive.Description : SheetPrimitive.Description
  return (
    <Primitive
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
