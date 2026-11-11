import { Button } from "@sift-design/ui/button";
import { useInsideDisclosure } from "@sift-design/ui/collapsible";
import { duration, leave, spring } from "@sift-design/tokens/motion";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "cn";
import { AnimatePresence, type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { type ComponentProps, type ReactNode, useState } from "react";

export type AgentBadgeProps = Omit<HTMLMotionProps<"span">, "children"> & {
  /** What a screen reader hears, and the tooltip: "The assistant changed the status. Open the record to review it." */
  label: string;
  /** The visible mark. Defaults to "AI". */
  children?: ReactNode;
};

/**
 * A small quiet mark on a record that an assistant or automation changed and a person has not reviewed.
 * Put it in AnimatePresence: it leaves with a short fade and scale on spring.exit.
 */
export const AgentBadge = ({ label, children = "AI", className, ...props }: AgentBadgeProps) => {
  const reduced = useReducedMotion();
  return (
    <motion.span
      data-slot="agent-badge"
      title={label}
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        scale: reduced ? 1 : 0.8,
        transition: reduced
          ? { duration: duration.instant }
          : { ...spring.exit, opacity: { duration: duration.quick, ease: leave } },
      }}
      transition={reduced ? { duration: duration.quick } : spring.snappy}
      className={cn(
        "inline-flex h-[18px] shrink-0 items-center rounded-full bg-accent-soft px-1.5 text-[12px] leading-none font-semibold tracking-[0.04em] text-link",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true">{children}</span>
      <span className="sr-only">{label}</span>
    </motion.span>
  );
};

export type AgentReviewProps = Omit<ComponentProps<"div">, "children"> & {
  /** Keeps the line on screen. Set it to false after a review or an undo: the line collapses its height and leaves. */
  open?: boolean;
  /** Who made the change: "The assistant", "Nightly watering check". */
  actor: ReactNode;
  /** What they did, after the name: "moved this to Germinating". */
  change: ReactNode;
  /** Why they did it, in their own words. Clamped to two lines. */
  reason?: ReactNode;
  /** An undo control, such as an icon button. It sits before "Looks good". */
  undo?: ReactNode;
  /** Marks the change as reviewed. While the promise runs the button is busy. A rejection shows its message. */
  onReviewed: () => Promise<unknown> | void;
  /** The label of the review button. */
  reviewLabel?: string;
  /** The accessible text of the AI mark at the start of the line. */
  badgeLabel?: string;
};

/**
 * One quiet line that says who changed what, with Undo and "Looks good".
 * When `open` turns false, its height collapses on spring.exit so the content below moves up, not jumps.
 */
export const AgentReview = ({
  open = true,
  actor,
  change,
  reason,
  undo,
  onReviewed,
  reviewLabel = "Looks good",
  badgeLabel = "Changed by an assistant",
  className,
  ...props
}: AgentReviewProps) => {
  const reduced = useReducedMotion();
  // Inside a kit disclosure, the disclosure moves the space; the line only fades.
  const nested = useInsideDisclosure();
  const ownHeight = !reduced && !nested;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function review() {
    setBusy(true);
    setError("");
    try {
      await onReviewed();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="review"
          data-slot="agent-review-presence"
          className="overflow-hidden"
          initial={ownHeight ? { height: 0, opacity: 0 } : { opacity: 0 }}
          animate={ownHeight ? { height: "auto", opacity: 1 } : { opacity: 1 }}
          exit={
            ownHeight
              ? {
                  height: 0,
                  opacity: 0,
                  transition: { height: spring.exit, opacity: { duration: duration.quick, ease: leave } },
                }
              : { opacity: 0, transition: { duration: duration.instant, ease: leave } }
          }
          transition={
            ownHeight
              ? { height: spring.smooth, opacity: { duration: duration.quick, ease: "linear" } }
              : { duration: duration.quick, ease: "linear" }
          }
        >
          <div
            data-slot="agent-review"
            className={cn(
              "flex flex-wrap items-start gap-x-2.5 gap-y-1.5 rounded-lg bg-tint py-[7px] pr-2 pl-2.5 text-[13px]",
              className,
            )}
            {...props}
          >
            {/* Its own presence, so the badge's exit does not hold the line on screen after it fades. */}
            <AnimatePresence initial={false}>
              <AgentBadge key="badge" label={badgeLabel} className="mt-px" initial={false} />
            </AnimatePresence>
            <p className="m-0 min-w-48 flex-1 leading-[1.45] text-muted-foreground">
              <strong className="font-semibold text-foreground">{actor}</strong> {change}
              {reason != null ? (
                <>
                  : <span className="line-clamp-2 text-foreground [overflow-wrap:anywhere]">{reason}</span>
                </>
              ) : (
                "."
              )}
            </p>
            <div className="ml-auto flex items-center gap-0.5 self-center">
              {undo}
              <Button type="button" variant="ghost" size="sm" loading={busy} onClick={review}>
                <IconCheck aria-hidden="true" size={14} />
                {reviewLabel}
              </Button>
            </div>
            <AnimatePresence initial={false}>
              {error && (
                <motion.div
                  key="error"
                  className="-mt-1.5 basis-full overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0, transition: reduced ? { duration: 0 } : spring.exit }}
                  transition={reduced ? { duration: duration.quick } : spring.smooth}
                >
                  <p role="alert" className="m-0 pt-1.5 text-[12px] text-danger">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
