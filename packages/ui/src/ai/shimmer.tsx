import { cn } from "cn";
import { type CSSProperties, type ElementType, memo } from "react";

export type TextShimmerProps = {
  children: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  spread?: number;
};

const ShimmerComponent = ({ children, as: Component = "p", className, duration = 2, spread = 2 }: TextShimmerProps) => (
  <Component
    data-slot="ai-shimmer"
    className={cn("ai-shimmer relative inline-block text-[14px] text-muted-foreground", className)}
    style={
      {
        "--shimmer-duration": `${Math.max(0.1, duration)}s`,
        "--shimmer-spread": `${Math.max(0, children.length * spread)}px`,
      } as CSSProperties
    }
  >
    {children}
  </Component>
);

// The element type remains stable across streamed text updates. No motion.create in render.
export const Shimmer = memo(ShimmerComponent);
