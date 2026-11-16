"use client";

import * as React from "react";
import { cn } from "cn";
import { motion, useReducedMotion } from "motion/react";
import { spring } from "@sift-design/tokens/motion";
import {
  Meter as MeterPrimitive,
  MeterIndicator as MeterIndicatorPrimitive,
  MeterLabel as MeterLabelPrimitive,
  MeterTrack as MeterTrackPrimitive,
  MeterValue as MeterValuePrimitive,
} from "@ui-sdk/react/meter";

// ui-sdk lets className be a function of the part's state, so a caller's function keeps working.
type ClassName = string | ((state: any) => string | undefined) | undefined;
const withBase = (base: string, className: ClassName): any =>
  typeof className === "function" ? (state: unknown) => cn(base, className(state)) : cn(base, className);

function Meter({ className, ...props }: React.ComponentProps<typeof MeterPrimitive>) {
  return (
    <MeterPrimitive
      className={withBase("grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-2", className)}
      {...props}
    />
  );
}

function MeterLabel({ className, ...props }: React.ComponentProps<typeof MeterLabelPrimitive>) {
  return (
    <MeterLabelPrimitive
      className={withBase("min-w-0 truncate text-[13px] font-medium text-foreground", className)}
      {...props}
    />
  );
}

function MeterValue({ className, ...props }: React.ComponentProps<typeof MeterValuePrimitive>) {
  return (
    <MeterValuePrimitive
      className={withBase("font-mono text-[12px] whitespace-nowrap text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

function MeterTrack({ className, ...props }: React.ComponentProps<typeof MeterTrackPrimitive>) {
  return (
    <MeterTrackPrimitive
      className={withBase("relative col-span-full h-[6px] w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    />
  );
}

/** The fill scales from the track's start, so a new reading moves on a spring instead of resizing the bar. */
function MeterIndicator({ className, ...props }: Omit<React.ComponentProps<typeof MeterIndicatorPrimitive>, "render">) {
  return (
    <MeterIndicatorPrimitive
      className={withBase("h-full w-full origin-left rounded-full bg-primary rtl:origin-right", className)}
      {...props}
      render={(partProps, state) => <MeterFill {...partProps} percent={state.percent} />}
    />
  );
}

function MeterFill({ percent, style, ...props }: Record<string, any> & { percent: number }) {
  const reduced = useReducedMotion();
  const previous = React.useRef(percent);
  const falling = percent < previous.current;
  React.useEffect(() => {
    previous.current = percent;
  }, [percent]);
  return (
    <motion.div
      {...props}
      data-falling={falling || undefined}
      // ui-sdk sets the width as a percentage. The fill keeps the full width and scales instead.
      style={{ ...style, width: "100%" }}
      initial={false}
      animate={{ scaleX: percent / 100 }}
      transition={reduced ? { duration: 0 } : falling ? spring.exit : spring.smooth}
    />
  );
}

export { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue };
