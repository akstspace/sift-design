import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sift-design/ui/card";
import { cn } from "cn";
import { Handle, Position } from "@xyflow/react";
import type { ComponentProps } from "react";

export type NodeProps = ComponentProps<typeof Card> & {
  handles: { target: boolean; source: boolean };
};

export const Node = ({ handles, className, children, ...props }: NodeProps) => (
  <Card data-slot="ai-node" className={cn("ai-node relative h-auto w-sm gap-0 rounded-md p-0", className)} {...props}>
    {handles.target && <Handle title="Input connection" position={Position.Left} type="target" />}
    {handles.source && <Handle title="Output connection" position={Position.Right} type="source" />}
    {children}
  </Card>
);

export type NodeHeaderProps = ComponentProps<typeof CardHeader>;
export const NodeHeader = ({ className, ...props }: NodeHeaderProps) => (
  <CardHeader
    data-slot="ai-node-header"
    className={cn("gap-1 rounded-t-md border-b bg-tint p-3!", className)}
    {...props}
  />
);
export type NodeTitleProps = ComponentProps<typeof CardTitle>;
export const NodeTitle = ({ className, ...props }: NodeTitleProps) => (
  <CardTitle data-slot="ai-node-title" className={cn("text-[14px] leading-5", className)} {...props} />
);
export type NodeDescriptionProps = ComponentProps<typeof CardDescription>;
export const NodeDescription = ({ className, ...props }: NodeDescriptionProps) => (
  <CardDescription data-slot="ai-node-description" className={cn("text-[13px] leading-5", className)} {...props} />
);
export type NodeActionProps = ComponentProps<typeof CardAction>;
export const NodeAction = (props: NodeActionProps) => <CardAction data-slot="ai-node-action" {...props} />;
export type NodeContentProps = ComponentProps<typeof CardContent>;
export const NodeContent = ({ className, ...props }: NodeContentProps) => (
  <CardContent data-slot="ai-node-content" className={cn("p-3 text-[13px]", className)} {...props} />
);
export type NodeFooterProps = ComponentProps<typeof CardFooter>;
export const NodeFooter = ({ className, ...props }: NodeFooterProps) => (
  <CardFooter
    data-slot="ai-node-footer"
    className={cn("gap-2 rounded-b-md border-t bg-tint p-3! text-[12px]", className)}
    {...props}
  />
);
