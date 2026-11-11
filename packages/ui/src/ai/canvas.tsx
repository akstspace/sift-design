import { Background, ReactFlow, type ReactFlowProps, type Node, type Edge } from "@xyflow/react";
import { cn } from "cn";
import type { ReactNode } from "react";
import "@xyflow/react/dist/style.css";

export type CanvasProps<NodeType extends Node = Node, EdgeType extends Edge = Edge> = ReactFlowProps<
  NodeType,
  EdgeType
> & {
  children?: ReactNode;
};

const deleteKeyCode = ["Backspace", "Delete"];

export const Canvas = <NodeType extends Node = Node, EdgeType extends Edge = Edge>({
  children,
  className,
  ...props
}: CanvasProps<NodeType, EdgeType>) => (
  <ReactFlow<NodeType, EdgeType>
    data-slot="ai-canvas"
    className={cn("ai-canvas", className)}
    deleteKeyCode={deleteKeyCode}
    fitView
    panOnDrag={false}
    panOnScroll
    selectionOnDrag={true}
    zoomOnDoubleClick={false}
    {...props}
  >
    <Background color="var(--line)" bgColor="var(--ground)" gap={20} size={1} />
    {children}
  </ReactFlow>
);
