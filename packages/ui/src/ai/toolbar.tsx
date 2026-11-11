import { cn } from "cn";
import { NodeToolbar, Position } from "@xyflow/react";
import type { ComponentProps } from "react";

export type ToolbarProps = ComponentProps<typeof NodeToolbar>;

export const Toolbar = ({ className, ...props }: ToolbarProps) => (
  <NodeToolbar
    data-slot="ai-toolbar"
    role="group"
    className={cn("ai-toolbar flex items-center gap-1 rounded-md border bg-card p-1", className)}
    position={Position.Bottom}
    {...props}
  />
);
