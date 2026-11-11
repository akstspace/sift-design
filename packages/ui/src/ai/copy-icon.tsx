import { IconCheck, IconCopy, IconX } from "@tabler/icons-react";
import { duration, leave, spring } from "@sift-design/tokens/motion";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "cn";

export type CopyStateIconProps = {
  /** "copied" pops in a check, "failed" an x, and "idle" returns to the copy icon. */
  state: "idle" | "copied" | "failed";
  size?: number;
  className?: string;
};

/**
 * The icon inside every copy button. It swaps in place: the check pops in on
 * spring.lively, and the return to the copy icon settles on spring.snappy. The
 * old icon leaves on spring.exit. Reduced motion keeps only a short fade.
 * Nothing animates on first render.
 */
export function CopyStateIcon({ state, size = 16, className }: CopyStateIconProps) {
  const reduced = useReducedMotion();
  const Icon = state === "copied" ? IconCheck : state === "failed" ? IconX : IconCopy;
  return (
    <span data-slot="copy-state-icon" aria-hidden="true" className={cn("grid place-items-center", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={state}
          className="col-start-1 row-start-1 flex"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: state === "idle" ? 0.94 : 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: reduced ? 1 : 0.94,
            transition: reduced
              ? { duration: duration.instant }
              : { ...spring.exit, opacity: { duration: duration.instant, ease: leave } },
          }}
          transition={
            reduced
              ? { duration: duration.quick }
              : {
                  ...(state === "idle" ? spring.snappy : spring.lively),
                  opacity: { duration: duration.quick, ease: "linear" },
                }
          }
        >
          <Icon size={size} />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
