import { Button } from "@sift-design/ui/button";
import { IconArrowDown, IconDownload } from "@tabler/icons-react";
import type { UIMessage } from "ai";
import { cn } from "cn";
import { useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export const Conversation = ({ className, initial = "smooth", resize = "smooth", ...props }: ConversationProps) => {
  const reduced = useReducedMotion();
  return (
    <StickToBottom
      data-slot="conversation"
      className={cn("relative min-h-0 min-w-0 flex-1 overflow-hidden", className)}
      initial={reduced ? "instant" : initial}
      resize={reduced ? "instant" : resize}
      role="log"
      aria-label="Conversation"
      aria-live="polite"
      aria-relevant="additions text"
      {...props}
    />
  );
};

export type ConversationContentProps = ComponentProps<typeof StickToBottom.Content>;

export const ConversationContent = ({ className, scrollClassName, ...props }: ConversationContentProps) => (
  <StickToBottom.Content
    data-slot="conversation-content"
    className={cn("flex min-h-full min-w-0 flex-col gap-5 p-4 text-[14px] outline-none", className)}
    scrollClassName={cn("conversation-viewport overscroll-contain", scrollClassName)}
    tabIndex={0}
    {...props}
  />
);

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: ReactNode;
};

export const ConversationEmptyState = ({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here.",
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    data-slot="conversation-empty-state"
    className={cn("flex min-h-48 w-full flex-1 flex-col items-center justify-center gap-3 p-6 text-center", className)}
    {...props}
  >
    {children ?? (
      <>
        {icon && (
          <div className="text-muted-foreground" aria-hidden="true">
            {icon}
          </div>
        )}
        <div className="max-w-[32ch] space-y-1">
          <h3 className="text-[14px] font-medium">{title}</h3>
          {description && <p className="text-[13px] leading-relaxed text-muted-foreground">{description}</p>}
        </div>
      </>
    )}
  </div>
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({
  className,
  onClick,
  children,
  tabIndex,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  const reduced = useReducedMotion();

  return (
    <div
      data-slot="conversation-scroll-button-container"
      data-active={!isAtBottom}
      aria-hidden={isAtBottom || undefined}
      inert={isAtBottom || undefined}
      className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2"
    >
      <Button
        data-slot="conversation-scroll-button"
        className={cn("rounded-full border bg-card text-foreground shadow-sm", className)}
        size="icon"
        type="button"
        variant="outline"
        aria-label="Scroll to latest message"
        {...props}
        tabIndex={isAtBottom ? -1 : tabIndex}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) void scrollToBottom(reduced ? "instant" : "smooth");
        }}
      >
        {children ?? <IconArrowDown aria-hidden="true" className="size-4" />}
      </Button>
    </div>
  );
};

/** The text-bearing parts of a message. Other parts remain available to a custom formatter. */
export type ConversationMessage = Pick<UIMessage, "role" | "parts">;

export type MessagesToMarkdownOptions<Message extends ConversationMessage = ConversationMessage> = {
  formatMessage?: (message: Message, index: number) => string;
};

const defaultFormatMessage = (message: ConversationMessage): string => {
  const role = message.role.charAt(0).toUpperCase() + message.role.slice(1);
  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
  return `**${role}:** ${text}`;
};

/** Export visible text only by default. Tool payloads and hidden reasoning are not included. */
export const messagesToMarkdown = <Message extends ConversationMessage>(
  messages: Message[],
  formatter: ((message: Message, index: number) => string) | MessagesToMarkdownOptions<Message> = defaultFormatMessage,
): string => {
  const formatMessage = typeof formatter === "function" ? formatter : (formatter.formatMessage ?? defaultFormatMessage);
  return messages.map((message, index) => formatMessage(message, index)).join("\n\n");
};

export type ConversationDownloadProps<Message extends ConversationMessage = UIMessage> = ComponentProps<typeof Button> &
  MessagesToMarkdownOptions<Message> & {
    messages: Message[];
    filename?: string;
  };

export const ConversationDownload = <Message extends ConversationMessage>({
  messages,
  filename = "conversation.md",
  formatMessage,
  onClick,
  children,
  className,
  ...props
}: ConversationDownloadProps<Message>) => (
  <Button
    data-slot="conversation-download"
    type="button"
    variant="outline"
    size="icon"
    className={cn("absolute top-4 right-4 rounded-full bg-card text-foreground", className)}
    aria-label="Download transcript"
    {...props}
    onClick={(event) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      const url = URL.createObjectURL(
        new Blob([messagesToMarkdown(messages, { formatMessage })], { type: "text/markdown;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      // Give the browser time to consume the object URL before releasing it.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }}
  >
    {children ?? <IconDownload aria-hidden="true" className="size-4" />}
  </Button>
);
