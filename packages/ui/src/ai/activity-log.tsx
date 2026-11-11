import { arrivalMotion, duration, leave, reflowTransition, spring } from "@sift-design/tokens/motion";
import { IconClockPlay, IconMessage2, IconRobot, IconSparkles } from "@tabler/icons-react";
import { cn } from "cn";
import { AnimatePresence, type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { type ComponentProps, type ReactNode, useState } from "react";

/** Who made a change: a person, the in-app assistant, a scheduled automation, or an outside agent. */
export type ActivityActorKind = "person" | "assistant" | "automation" | "agent";

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "Just now", "12 min ago", "Today, 21:57", "Yesterday, 09:10", "3 Nov, 21:57". */
export function formatActivityTime(at: string | Date, now = new Date()): string {
  const d = new Date(at);
  if (Number.isNaN(d.valueOf())) return String(at);
  const seconds = (now.valueOf() - d.valueOf()) / 1000;
  if (seconds >= 0 && seconds < 60) return "Just now";
  if (seconds >= 0 && seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  const time = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(d);
  if (sameDay(d, now)) return `Today, ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return `Yesterday, ${time}`;
  const date = new Intl.DateTimeFormat(
    undefined,
    d.getFullYear() === now.getFullYear()
      ? { day: "numeric", month: "short" }
      : { day: "numeric", month: "short", year: "numeric" },
  ).format(d);
  return `${date}, ${time}`;
}

export type ActivityLogProps = ComponentProps<"ol">;

/**
 * A record's history, newest first. Give each ActivityEntry a stable `key`.
 * Entries present on first render stay still. A new entry opens its height and arrives.
 */
export const ActivityLog = ({ className, children, ...props }: ActivityLogProps) => (
  <ol
    data-slot="activity-log"
    aria-label="Activity"
    className={cn("m-0 flex list-none flex-col p-0", className)}
    {...props}
  >
    <AnimatePresence initial={false}>{children}</AnimatePresence>
  </ol>
);

export type ActivityAvatarProps = ComponentProps<"span"> & { kind?: ActivityActorKind; name: string };

/** A 24px round mark: a person's initial, the assistant mark, a clock for an automation, a robot for an agent. */
export const ActivityAvatar = ({ kind = "person", name, className, ...props }: ActivityAvatarProps) => (
  <span
    data-slot="activity-avatar"
    data-kind={kind}
    aria-hidden="true"
    className={cn(
      "grid size-6 shrink-0 place-items-center rounded-full text-[12px] font-semibold",
      kind === "person" && "bg-tint-strong text-muted-foreground",
      kind === "assistant" && "bg-accent-soft text-link",
      kind === "automation" && "bg-subtle text-foreground",
      kind === "agent" && "bg-tint-strong text-foreground",
      className,
    )}
    {...props}
  >
    {kind === "assistant" ? (
      <IconSparkles size={14} />
    ) : kind === "automation" ? (
      <IconClockPlay size={14} />
    ) : kind === "agent" ? (
      <IconRobot size={14} />
    ) : (
      (name.trim()[0] ?? "?").toUpperCase()
    )}
  </span>
);

export type ActivityEntryProps = Omit<HTMLMotionProps<"li">, "children"> & {
  /** The name shown in bold: "Jane Doe", "Assistant", "Nightly watering check". */
  actor: string;
  actorKind?: ActivityActorKind;
  /** A short phrase after the name: "Created this record". */
  summary?: ReactNode;
  /** When it happened. It becomes the `dateTime` of a `<time>` element. */
  at: string | Date;
  /** The visible time. Defaults to formatActivityTime(at, now). */
  timeLabel?: ReactNode;
  /** The clock for relative times. Pass a fixed value in tests and demos. */
  now?: Date;
  /** What changed, as short phrases. Six show as pills, the rest as "+N more". */
  changes?: ReactNode[];
  /** The most change pills to show. */
  maxChanges?: number;
  /** Why the change was made, in the actor's words. */
  reason?: ReactNode;
  /** Makes the entry a comment: a "Comment" pill and the text in a note. */
  comment?: ReactNode;
  /** An undo control. On a pointer device it shows when the entry is hovered or focused. */
  undo?: ReactNode;
};

/**
 * One line of history. A new entry opens its height on the reflow spring, so older entries move down
 * smoothly, while its content arrives with arrivalMotion. Removal is the reverse on spring.exit.
 */
export const ActivityEntry = ({
  actor,
  actorKind = "person",
  summary,
  at,
  timeLabel,
  now,
  changes = [],
  maxChanges = 6,
  reason,
  comment,
  undo,
  className,
  ...props
}: ActivityEntryProps) => {
  const reduced = !!useReducedMotion();
  const arrival = arrivalMotion(reduced);
  const date = new Date(at);
  const valid = !Number.isNaN(date.valueOf());
  const shown = changes.slice(0, maxChanges);
  const isComment = comment != null;
  // Clip only while the height moves, so focus rings show once the entry has settled.
  const [moving, setMoving] = useState(false);
  return (
    <motion.li
      data-slot="activity-entry"
      data-kind={isComment ? "comment" : "change"}
      className="ai-activity-entry"
      style={{ overflow: moving ? "hidden" : "visible" }}
      onAnimationStart={() => setMoving(true)}
      onAnimationComplete={() => setMoving(false)}
      initial={{ height: 0 }}
      animate={{ height: "auto" }}
      exit={{
        height: 0,
        transition: reduced ? { duration: 0, delay: 0.06 } : { ...spring.exit, delay: 0.04 },
      }}
      transition={{ height: reflowTransition(reduced) }}
      {...props}
    >
      <motion.div
        initial={arrival.initial}
        animate={arrival.animate}
        exit={
          reduced ? arrival.exit : { opacity: 0, scale: 0.98, transition: { duration: duration.quick, ease: leave } }
        }
        className={cn("flex min-w-0 origin-top items-start gap-2.5 py-2", className)}
      >
        <ActivityAvatar kind={actorKind} name={actor} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex min-h-6 flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px]">
            <strong className="min-w-0 truncate font-semibold text-foreground">{actor}</strong>
            {isComment ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-tint px-2 py-0.5 text-[12px] text-muted-foreground">
                <IconMessage2 aria-hidden="true" size={12} />
                Comment
              </span>
            ) : (
              summary != null && <span className="text-muted-foreground">{summary}</span>
            )}
            {/* The time and Undo share one slot, so every time lines up on the right edge. */}
            <span className="ai-activity-when ml-auto">
              <time
                dateTime={valid ? date.toISOString() : undefined}
                title={
                  valid
                    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)
                    : undefined
                }
                className="ai-activity-time font-mono text-[12px] whitespace-nowrap text-muted-foreground tabular-nums"
              >
                {timeLabel ?? formatActivityTime(at, now)}
              </time>
              {undo != null && <span className="ai-activity-undo">{undo}</span>}
            </span>
          </div>
          {shown.length > 0 && (
            <ul aria-label="Changes" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {shown.map((change, i) => (
                <li
                  key={i}
                  className="rounded-full bg-tint-strong px-2.5 py-0.5 text-[12px] whitespace-nowrap text-foreground"
                >
                  {change}
                </li>
              ))}
              {changes.length > shown.length && (
                <li className="px-0.5 py-0.5 font-mono text-[12px] text-muted-foreground tabular-nums">
                  +{changes.length - shown.length} more
                </li>
              )}
            </ul>
          )}
          {isComment ? (
            <div className="min-w-0 rounded-[4px_12px_12px_12px] bg-tint px-3 py-2 text-[13px] leading-normal text-foreground [overflow-wrap:anywhere]">
              {comment}
            </div>
          ) : (
            reason != null && (
              <p className="m-0 text-[13px] whitespace-pre-wrap text-muted-foreground [overflow-wrap:anywhere]">
                {reason}
              </p>
            )
          )}
        </div>
      </motion.div>
    </motion.li>
  );
};
