import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { spring } from "@sift-design/tokens/motion";

const tags = {
  div: motion.div,
  h2: motion.h2,
  p: motion.p,
  li: motion.li,
  ol: motion.ol,
} as const;

/**
 * Rises into place the first time it enters the viewport, then stays put. It is not
 * tied to the scroll position, so nothing trails or lags while the page scrolls.
 * Reduced motion keeps a short fade.
 */
export function Reveal({
  as = "div",
  delay = 0,
  y = 22,
  id,
  className,
  focus,
  children,
}: {
  as?: keyof typeof tags;
  delay?: number;
  y?: number;
  id?: string;
  className?: string;
  /** Set as data-focus, for sections that style a highlighted item. */
  focus?: string;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const Tag = tags[as];
  return (
    <Tag
      id={id}
      className={className}
      data-focus={focus}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={reduced ? { duration: 0.14 } : { ...spring.smooth, delay }}
    >
      {children}
    </Tag>
  );
}
