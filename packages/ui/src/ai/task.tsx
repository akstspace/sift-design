import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { cn } from "cn";
import { IconChevronDown, IconSearch } from "@tabler/icons-react";
import type { ComponentProps } from "react";

export type TaskItemFileProps = ComponentProps<"div">;

export const TaskItemFile = ({ children, className, ...props }: TaskItemFileProps) => (
  <div
    data-slot="task-item-file"
    className={cn(
      "inline-flex h-6 max-w-full items-center gap-1.5 rounded-full bg-tint px-2.5 font-mono text-[12px] text-foreground",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export type TaskItemProps = ComponentProps<"div">;
export const TaskItem = ({ className, ...props }: TaskItemProps) => (
  <div
    data-slot="task-item"
    className={cn("flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground", className)}
    {...props}
  />
);

export type TaskProps = ComponentProps<typeof Collapsible>;
export const Task = ({ defaultOpen = true, className, ...props }: TaskProps) => (
  <Collapsible data-slot="task" className={cn("w-full", className)} defaultOpen={defaultOpen} {...props} />
);

export type TaskTriggerProps = ComponentProps<typeof CollapsibleTrigger> & { title: string };
export const TaskTrigger = ({ children, className, title, ...props }: TaskTriggerProps) => (
  <CollapsibleTrigger
    asChild={children != null}
    data-slot="task-trigger"
    className={cn(
      "group flex min-h-8 w-full items-center gap-2 rounded text-left text-[13px] text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      className,
    )}
    {...props}
  >
    {children ?? (
      <>
        <IconSearch aria-hidden className="size-4 shrink-0" />
        <span className="flex-1">{title}</span>
        <IconChevronDown aria-hidden className="ai-task-chevron size-4 shrink-0" />
      </>
    )}
  </CollapsibleTrigger>
);

export type TaskContentProps = ComponentProps<typeof CollapsibleContent>;
export const TaskContent = ({ children, className, ...props }: TaskContentProps) => (
  <CollapsibleContent data-slot="task-content" className={cn(className)} {...props}>
    <div className="ml-2 mt-2 space-y-3 border-l pl-5 pb-1">{children}</div>
  </CollapsibleContent>
);
