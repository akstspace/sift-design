import { getBezierPath, type ConnectionLineComponentProps, type Node } from "@xyflow/react";

export const Connection = <NodeType extends Node = Node>({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  connectionStatus,
}: ConnectionLineComponentProps<NodeType>) => {
  const [path] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
    sourcePosition: fromPosition,
    targetPosition: toPosition,
  });
  return (
    <g data-slot="ai-connection" data-state={connectionStatus ?? "pending"} aria-hidden="true">
      <path d={path} fill="none" stroke="var(--focus-ring)" strokeWidth={2} strokeDasharray="5 5" />
      <circle cx={toX} cy={toY} fill="var(--surface)" r={4} stroke="var(--focus-ring)" strokeWidth={2} />
    </g>
  );
};
