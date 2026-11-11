import { cn } from "cn";
import { Panel as PanelPrimitive } from "@xyflow/react";
import type { ComponentProps } from "react";

export type PanelProps = ComponentProps<typeof PanelPrimitive>;

export const Panel = ({ className, ...props }: PanelProps) => (
  <PanelPrimitive
    data-slot="ai-panel"
    className={cn("ai-panel m-3 rounded-md border bg-card p-2 text-[13px]", className)}
    {...props}
  />
);
