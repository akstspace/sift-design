import { Button } from "@sift-design/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { ScrollArea } from "@sift-design/ui/scroll-area";
import { arrivalMotion, duration, leave, reflowTransition, spring } from "@sift-design/tokens/motion";
import { IconChevronDown, IconPaperclip } from "@tabler/icons-react";
import { cn } from "cn";
import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

export interface QueueMessagePart {
  type: string;
  text?: string;
  url?: string;
  filename?: string;
  mediaType?: string;
}
export interface QueueMessage {
  id: string;
  parts: QueueMessagePart[];
}
export interface QueueTodo {
  id: string;
  title: string;
  description?: string;
  status?: "pending" | "completed";
}

export type QueueItemProps = ComponentProps<"li">;
export const QueueItem = ({ className, ...props }: QueueItemProps) => {
  const reduced = !!useReducedMotion();
  return (
    <motion.li
      data-slot="queue-item"
      layout={!reduced}
      {...arrivalMotion(reduced)}
      exit={{
        opacity: 0,
        scale: reduced ? 1 : 0.98,
        transition: reduced
          ? { duration: duration.instant }
          : { ...spring.exit, opacity: { duration: duration.instant, ease: leave } },
      }}
      transition={{ layout: reflowTransition(reduced) }}
      className={cn(
        "group relative flex flex-col gap-1 rounded px-2 py-2 text-[13px] hover:bg-tint focus-within:bg-tint",
        className,
      )}
      {...(props as HTMLMotionProps<"li">)}
    />
  );
};

export type QueueItemIndicatorProps = ComponentProps<"span"> & { completed?: boolean };
export const QueueItemIndicator = ({ completed = false, className, ...props }: QueueItemIndicatorProps) => (
  <span
    data-slot="queue-item-indicator"
    data-completed={completed}
    aria-hidden="true"
    className={cn(
      "mt-1 inline-block size-2.5 shrink-0 rounded-full border border-muted-foreground data-[completed=true]:bg-accent data-[completed=true]:border-accent",
      className,
    )}
    {...props}
  />
);

export type QueueItemContentProps = ComponentProps<"span"> & { completed?: boolean };
export const QueueItemContent = ({ completed = false, className, children, ...props }: QueueItemContentProps) => (
  <span
    data-slot="queue-item-content"
    data-completed={completed}
    className={cn("min-w-0 grow break-words text-foreground data-[completed=true]:text-muted-foreground", className)}
    {...props}
  >
    <span className="ai-queue-strike">{children}</span>
  </span>
);

export type QueueItemDescriptionProps = ComponentProps<"div"> & { completed?: boolean };
export const QueueItemDescription = ({
  completed = false,
  className,
  children,
  ...props
}: QueueItemDescriptionProps) => (
  <div
    data-slot="queue-item-description"
    data-completed={completed}
    className={cn("ml-6 text-[12px] leading-relaxed text-muted-foreground", className)}
    {...props}
  >
    <span className="ai-queue-strike">{children}</span>
  </div>
);

export type QueueItemActionsProps = ComponentProps<"div">;
export const QueueItemActions = ({ className, ...props }: QueueItemActionsProps) => (
  <div data-slot="queue-item-actions" className={cn("ml-auto flex shrink-0 gap-1", className)} {...props} />
);

export type QueueItemActionProps = Omit<ComponentProps<typeof Button>, "variant" | "size">;
export const QueueItemAction = ({ className, ...props }: QueueItemActionProps) => (
  <Button
    data-slot="queue-item-action"
    className={cn("size-6 shrink-0 text-muted-foreground hover:text-foreground", className)}
    size="icon-xs"
    type="button"
    variant="ghost"
    {...props}
  />
);

export type QueueItemAttachmentProps = ComponentProps<"div">;
export const QueueItemAttachment = ({ className, ...props }: QueueItemAttachmentProps) => (
  <div data-slot="queue-item-attachment" className={cn("ml-6 mt-1 flex flex-wrap gap-2", className)} {...props} />
);

export type QueueItemImageProps = ComponentProps<"img">;
export const QueueItemImage = ({ className, ...props }: QueueItemImageProps) => (
  <img
    data-slot="queue-item-image"
    alt=""
    className={cn("size-8 rounded-md border object-cover", className)}
    height={32}
    width={32}
    {...props}
  />
);

export type QueueItemFileProps = ComponentProps<"span">;
export const QueueItemFile = ({ children, className, ...props }: QueueItemFileProps) => (
  <span
    data-slot="queue-item-file"
    className={cn(
      "inline-flex h-6 max-w-full items-center gap-1.5 rounded-full bg-tint px-2.5 font-mono text-[12px]",
      className,
    )}
    {...props}
  >
    <IconPaperclip aria-hidden className="size-3 shrink-0" />
    <span className="truncate">{children}</span>
  </span>
);

export type QueueListProps = ComponentProps<typeof ScrollArea>;
export const QueueList = ({ children, className, ...props }: QueueListProps) => (
  <ScrollArea data-slot="queue-list" className={cn("ai-queue-list mt-1 max-h-48", className)} {...props}>
    <ul className="relative py-1 pr-3">
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </ul>
  </ScrollArea>
);

export type QueueSectionProps = ComponentProps<typeof Collapsible>;
export const QueueSection = ({ className, defaultOpen = true, ...props }: QueueSectionProps) => (
  <Collapsible data-slot="queue-section" className={cn("min-w-0", className)} defaultOpen={defaultOpen} {...props} />
);

export type QueueSectionTriggerProps = ComponentProps<"button">;
export const QueueSectionTrigger = ({ children, className, ...props }: QueueSectionTriggerProps) => (
  <CollapsibleTrigger asChild>
    <button
      data-slot="queue-section-trigger"
      className={cn(
        "group flex min-h-8 w-full items-center justify-between rounded px-2 py-1 text-left text-[13px] font-medium text-foreground hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  </CollapsibleTrigger>
);

export type QueueSectionLabelProps = ComponentProps<"span"> & { count?: number; label: string; icon?: ReactNode };
export const QueueSectionLabel = ({ count, label, icon, className, ...props }: QueueSectionLabelProps) => (
  <span data-slot="queue-section-label" className={cn("flex items-center gap-2", className)} {...props}>
    <IconChevronDown aria-hidden className="ai-task-chevron size-3.5 shrink-0" />
    {icon}
    <span>{label}</span>
    {count !== undefined && (
      <span className="rounded bg-tint px-1.5 font-mono text-[12px] text-muted-foreground">{count}</span>
    )}
  </span>
);

export type QueueSectionContentProps = ComponentProps<typeof CollapsibleContent>;
export const QueueSectionContent = ({ className, ...props }: QueueSectionContentProps) => (
  <CollapsibleContent data-slot="queue-section-content" className={cn(className)} {...props} />
);

export type QueueProps = ComponentProps<"div">;
export const Queue = ({ className, ...props }: QueueProps) => (
  <div
    data-slot="queue"
    className={cn("flex min-w-0 flex-col gap-2 rounded-lg border bg-card p-2", className)}
    {...props}
  />
);
