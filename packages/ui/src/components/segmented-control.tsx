"use client";

import * as React from "react";
import { cn } from "cn";
import {
  SegmentedControl as SegmentedControlPrimitive,
  SegmentedControlIndicator as SegmentedControlIndicatorPrimitive,
  SegmentedControlItem as SegmentedControlItemPrimitive,
  createSegmentedControlController,
} from "@ui-sdk/react/segmented-control";

// ui-sdk lets className be a function of the part's state, so a caller's function keeps working.
type ClassName = string | ((state: any) => string | undefined) | undefined;
const withBase = (base: string, className: ClassName): any =>
  typeof className === "function" ? (state: unknown) => cn(base, className(state)) : cn(base, className);

function SegmentedControl({ className, ...props }: React.ComponentProps<typeof SegmentedControlPrimitive>) {
  return (
    <SegmentedControlPrimitive
      className={withBase(
        "relative isolate inline-flex h-[32px] w-fit max-w-full items-center rounded-md bg-muted p-0.5 text-muted-foreground data-disabled:opacity-65 data-[orientation=vertical]:h-fit data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        className,
      )}
      {...props}
    />
  );
}

function SegmentedControlItem({ className, ...props }: React.ComponentProps<typeof SegmentedControlItemPrimitive>) {
  return (
    <SegmentedControlItemPrimitive
      className={withBase(
        "relative z-10 inline-flex h-full min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[6px] px-3 py-1 text-[13px] font-medium whitespace-nowrap outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-checked:text-foreground data-disabled:pointer-events-none data-disabled:opacity-65 data-readonly:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The indicator sits behind the checked item. ui-sdk writes the item's box into CSS variables, and the kit motion
 * CSS moves it there on --spring-smooth. Transitions start after the first frame, so the page loads without a slide.
 */
function SegmentedControlIndicator({
  className,
  ...props
}: React.ComponentProps<typeof SegmentedControlIndicatorPrimitive>) {
  const [placed, setPlaced] = React.useState(false);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setPlaced(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <SegmentedControlIndicatorPrimitive
      data-placed={placed || undefined}
      className={withBase("pointer-events-none absolute top-0 left-0 z-0 rounded-[6px] bg-background", className)}
      {...props}
    />
  );
}

export { SegmentedControl, SegmentedControlIndicator, SegmentedControlItem, createSegmentedControlController };
