import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { settle, spring } from "@sift-design/tokens/motion";
const entered = new Set<string>();
export default function SiftDesignMark({
  size = 32,
  className,
  entrance,
}: {
  size?: number;
  className?: string;
  entrance?: "rail" | "hero" | "close";
}) {
  const reduced = !!useReducedMotion();
  const [play] = useState(() => !!entrance && !entered.has(entrance));
  useEffect(() => {
    if (entrance) entered.add(entrance);
  }, [entrance]);
  return (
    <motion.svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      initial={play && reduced ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.14 }}
    >
      <rect width="64" height="64" rx="15" fill="var(--slate)" />
      <motion.path
        d="M45 16 H27.5 A8 8 0 0 0 27.5 32 H36.5 A8 8 0 0 1 36.5 48 H27"
        pathLength="1"
        fill="none"
        stroke="var(--sea)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1"
        initial={play && !reduced ? { strokeDashoffset: 1 } : false}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.7, ease: settle }}
      />
      <motion.circle
        cx="17.5"
        cy="48"
        r="4.6"
        fill="var(--coral)"
        style={{ transformOrigin: "17.5px 48px" }}
        initial={play && !reduced ? { scale: 0 } : false}
        animate={{ scale: 1 }}
        transition={reduced ? { duration: 0 } : { ...spring.lively, delay: play ? 0.56 : 0 }}
      />
    </motion.svg>
  );
}
