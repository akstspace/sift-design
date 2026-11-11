import { BaseEdge, type EdgeProps, getBezierPath, getSimpleBezierPath } from "@xyflow/react";
import { useReducedMotion } from "motion/react";

const Temporary = ({ id, style, markerStart, markerEnd, interactionWidth, ...props }: EdgeProps) => {
  const [path] = getSimpleBezierPath(props);
  return (
    <BaseEdge
      id={id}
      className="ai-edge ai-edge-temporary"
      path={path}
      markerStart={markerStart}
      markerEnd={markerEnd}
      interactionWidth={interactionWidth}
      style={{ ...style, strokeDasharray: "5 5" }}
    />
  );
};

export type AnimatedEdgeProps = EdgeProps & {
  /** Set while work is active. Also accepts data.running or the native animated flag. */
  running?: boolean;
};

const Animated = ({
  id,
  style,
  markerStart,
  markerEnd,
  interactionWidth,
  data,
  animated,
  running = Boolean(data?.running ?? animated),
  ...props
}: AnimatedEdgeProps) => {
  const reduced = useReducedMotion();
  const [path, markerX, markerY] = getBezierPath(props);
  return (
    <>
      <BaseEdge
        id={id}
        className="ai-edge"
        path={path}
        style={style}
        markerStart={markerStart}
        markerEnd={markerEnd}
        interactionWidth={interactionWidth}
      />
      {running && (
        <circle
          data-slot="ai-edge-activity"
          aria-hidden="true"
          pointerEvents="none"
          fill="var(--accent)"
          stroke="var(--surface)"
          strokeWidth={2}
          r={5}
          cx={reduced ? markerX : 0}
          cy={reduced ? markerY : 0}
        >
          {!reduced && <animateMotion dur="2s" path={path} repeatCount="indefinite" />}
        </circle>
      )}
    </>
  );
};

export const Edge = { Temporary, Animated };
