import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sift-design/ui/tabs";
import { IconChevronDown, IconCode } from "@tabler/icons-react";
import type { ToolUIPart } from "ai";
import { cn } from "cn";
import type { ComponentProps } from "react";

import { getStatusBadge } from "./tool";

export type SandboxRootProps = ComponentProps<typeof Collapsible>;
export const Sandbox = ({ className, ...props }: SandboxRootProps) => (
  <Collapsible
    data-slot="sandbox"
    className={cn(
      "not-prose group/sandbox w-full min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground",
      className,
    )}
    defaultOpen
    {...props}
  />
);

export interface SandboxHeaderProps {
  title?: string;
  state: ToolUIPart["state"];
  className?: string;
}
export const SandboxHeader = ({ className, title, state, ...props }: SandboxHeaderProps) => (
  <CollapsibleTrigger
    data-slot="sandbox-header"
    className={cn(
      "flex w-full items-center justify-between gap-3 px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
      className,
    )}
    {...props}
  >
    <span className="flex min-w-0 flex-wrap items-center gap-2">
      <IconCode aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      <span className="font-mono text-[13px] font-medium">{title ?? "Sandbox"}</span>
      <span aria-live="polite" aria-atomic="true">
        {getStatusBadge(state)}
      </span>
    </span>
    <IconChevronDown aria-hidden="true" className="sandbox-chevron size-4 shrink-0 text-muted-foreground" />
  </CollapsibleTrigger>
);

export type SandboxContentProps = ComponentProps<typeof CollapsibleContent>;
export const SandboxContent = ({ className, ...props }: SandboxContentProps) => (
  <CollapsibleContent className={cn("min-w-0 outline-none", className)} {...props} />
);
export type SandboxTabsProps = ComponentProps<typeof Tabs>;
export const SandboxTabs = ({ className, ...props }: SandboxTabsProps) => (
  <Tabs className={cn("w-full gap-0", className)} {...props} />
);
export type SandboxTabsBarProps = ComponentProps<"div">;
export const SandboxTabsBar = ({ className, ...props }: SandboxTabsBarProps) => (
  <div data-slot="sandbox-tabs-bar" className={cn("flex w-full items-center border-y px-4", className)} {...props} />
);
export type SandboxTabsListProps = ComponentProps<typeof TabsList>;
export const SandboxTabsList = ({ className, ...props }: SandboxTabsListProps) => (
  <TabsList variant="line" className={cn("h-auto bg-transparent", className)} {...props} />
);
export type SandboxTabsTriggerProps = ComponentProps<typeof TabsTrigger>;
export const SandboxTabsTrigger = ({ className, ...props }: SandboxTabsTriggerProps) => (
  <TabsTrigger className={cn("px-1 py-2.5 text-[13px]", className)} {...props} />
);
export type SandboxTabContentProps = ComponentProps<typeof TabsContent>;
export const SandboxTabContent = ({ className, ...props }: SandboxTabContentProps) => (
  <TabsContent className={cn("mt-0 min-w-0 text-[13px]", className)} {...props} />
);
