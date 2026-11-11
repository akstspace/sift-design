import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { IconAlertCircle, IconAlertTriangle, IconChevronRight, IconInfoCircle } from "@tabler/icons-react";
import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

export type ConversationNoticeTone = "info" | "warning" | "error";

const toneIcon = {
  info: IconInfoCircle,
  warning: IconAlertTriangle,
  error: IconAlertCircle,
} as const;

export type ConversationNoticeProps = ComponentProps<"div"> & {
  /** "info" is a quiet line, "warning" uses the warn color, and "error" sits in a soft danger well. */
  tone?: ConversationNoticeTone;
  /** Replaces the tone icon. */
  icon?: ReactNode;
};

/**
 * A line inside a conversation that is not a message: a new conversation, a
 * limit that is near, or a request that failed. Errors use role="alert".
 */
export const ConversationNotice = ({
  tone = "info",
  icon,
  role,
  className,
  children,
  ...props
}: ConversationNoticeProps) => {
  const Icon = toneIcon[tone];
  return (
    <div
      data-slot="conversation-notice"
      data-tone={tone}
      role={role ?? (tone === "error" ? "alert" : undefined)}
      className={cn(
        "ai-notice flex min-w-0 items-start gap-2 text-[12.5px] leading-normal wrap-anywhere",
        tone === "info" && "text-muted-foreground",
        // The icon carries the warning color; the sentence stays muted and easy to read.
        tone === "warning" && "text-muted-foreground [&>[data-slot=conversation-notice-icon]]:text-warn",
        tone === "error" && "rounded-lg bg-danger/9 px-3 py-2 text-danger",
        className,
      )}
      {...props}
    >
      <span data-slot="conversation-notice-icon" aria-hidden="true" className="mt-[2px] flex shrink-0">
        {icon ?? <Icon className="size-[14px]" />}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};

export type ConversationNoticeDetailProps = Omit<ComponentProps<typeof Collapsible>, "children"> & {
  /** The trigger text. */
  label?: ReactNode;
  /** The provider's own words, shown in mono type. */
  children: ReactNode;
};

/** The exact message from the provider, collapsed behind "Details". It keeps the notice color. */
export const ConversationNoticeDetail = ({
  label = "Details",
  className,
  children,
  ...props
}: ConversationNoticeDetailProps) => (
  <Collapsible data-slot="conversation-notice-detail" className={cn("mt-1", className)} {...props}>
    <CollapsibleTrigger className="ai-notice-toggle -ml-0.5 inline-flex items-center gap-1 rounded-sm px-0.5 text-[12px] text-inherit outline-none hover:underline hover:underline-offset-2 focus-visible:ring-2 focus-visible:ring-ring">
      <IconChevronRight aria-hidden="true" className="ai-notice-chevron size-3" />
      {label}
    </CollapsibleTrigger>
    <CollapsibleContent className="text-inherit">
      <code className="mt-1 block font-mono text-[12px] leading-normal whitespace-pre-wrap wrap-anywhere">
        {children}
      </code>
    </CollapsibleContent>
  </Collapsible>
);
