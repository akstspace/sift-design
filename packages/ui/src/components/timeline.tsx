"use client";

import * as React from "react";
import { cn } from "cn";
import { motion, useReducedMotion } from "motion/react";
import { arrivalMotion, reflowTransition } from "@sift-design/tokens/motion";
import {
  Timeline as TimelinePrimitive,
  TimelineConnector as TimelineConnectorPrimitive,
  TimelineDescription as TimelineDescriptionPrimitive,
  TimelineItem as TimelineItemPrimitive,
  TimelineMarker as TimelineMarkerPrimitive,
  TimelineTime as TimelineTimePrimitive,
  TimelineTitle as TimelineTitlePrimitive,
  createTimelineController,
} from "@ui-sdk/react/timeline";

// ui-sdk lets className be a function of the part's state, so a caller's function keeps working.
type ClassName = string | ((state: any) => string | undefined) | undefined;
const withBase = (base: string, className: ClassName): any =>
  typeof className === "function" ? (state: unknown) => cn(base, className(state)) : cn(base, className);

function Timeline({ className, ...props }: React.ComponentProps<typeof TimelinePrimitive>) {
  return (
    <TimelinePrimitive
      className={withBase(
        "group/timeline flex w-full flex-col data-[orientation=horizontal]:grid data-[orientation=horizontal]:grid-cols-[repeat(var(--timeline-count,1),minmax(0,1fr))]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * One event. `arrival` animates an event that was just added; events already in the page never replay it.
 * `reflow` lets the events below move to make room.
 */
function TimelineItem({
  className,
  arrival = false,
  reflow = true,
  ...props
}: Omit<React.ComponentProps<typeof TimelineItemPrimitive>, "render"> & { arrival?: boolean; reflow?: boolean }) {
  const reduced = !!useReducedMotion();
  return (
    <TimelineItemPrimitive
      className={withBase(
        "group/timeline-item relative grid content-start grid-cols-[16px_minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 rounded-md pb-5 outline-none last:pb-0 data-last:pb-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background data-[orientation=horizontal]:grid-cols-[minmax(0,1fr)] data-[orientation=horizontal]:pr-4 data-[orientation=horizontal]:pb-0",
        className,
      )}
      {...props}
      render={({ onAnimationStart: _a, onDrag: _d, onDragStart: _s, onDragEnd: _e, ...partProps }) => (
        <motion.div
          {...partProps}
          data-arrival={arrival || undefined}
          layout={!reduced && reflow ? "position" : false}
          transition={{ layout: reflowTransition(reduced) }}
          {...(arrival ? arrivalMotion(reduced) : { initial: false })}
        />
      )}
    />
  );
}

function TimelineMarker({ className, ...props }: React.ComponentProps<typeof TimelineMarkerPrimitive>) {
  return (
    <TimelineMarkerPrimitive
      className={withBase(
        "relative z-10 col-start-1 row-start-1 mt-[5px] size-[10px] justify-self-center rounded-full border-[1.5px] border-muted-foreground bg-background data-[orientation=horizontal]:justify-self-start",
        className,
      )}
      {...props}
    />
  );
}

function TimelineConnector({ className, ...props }: React.ComponentProps<typeof TimelineConnectorPrimitive>) {
  return (
    <TimelineConnectorPrimitive
      className={withBase(
        "absolute top-[19px] bottom-[2px] start-[7.5px] w-px bg-line group-last/timeline-item:hidden group-data-last/timeline-item:hidden data-[orientation=horizontal]:top-[9.5px] data-[orientation=horizontal]:end-[6px] data-[orientation=horizontal]:bottom-auto data-[orientation=horizontal]:start-[18px] data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-auto",
        className,
      )}
      {...props}
    />
  );
}

function TimelineTitle({ className, ...props }: React.ComponentProps<typeof TimelineTitlePrimitive>) {
  return (
    <TimelineTitlePrimitive
      className={withBase(
        "col-start-2 row-start-1 min-w-0 text-[13px] leading-5 font-medium text-foreground data-upcoming:text-muted-foreground data-[orientation=horizontal]:col-start-1 data-[orientation=horizontal]:row-start-2 data-[orientation=horizontal]:mt-2",
        className,
      )}
      {...props}
    />
  );
}

function TimelineTime({ className, ...props }: React.ComponentProps<typeof TimelineTimePrimitive>) {
  return (
    <TimelineTimePrimitive
      className={withBase(
        "col-start-3 row-start-1 font-mono text-[12px] leading-5 whitespace-nowrap text-muted-foreground tabular-nums data-[orientation=horizontal]:col-start-1 data-[orientation=horizontal]:row-start-3",
        className,
      )}
      {...props}
    />
  );
}

function TimelineDescription({ className, ...props }: React.ComponentProps<typeof TimelineDescriptionPrimitive>) {
  return (
    <TimelineDescriptionPrimitive
      className={withBase(
        "col-span-2 col-start-2 text-[12px] leading-relaxed text-muted-foreground data-[orientation=horizontal]:col-span-1 data-[orientation=horizontal]:col-start-1",
        className,
      )}
      {...props}
    />
  );
}

export {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
  createTimelineController,
};
