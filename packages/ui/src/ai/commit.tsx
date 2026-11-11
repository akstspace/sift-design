import { Avatar, AvatarFallback } from "@sift-design/ui/avatar";
import { Button } from "@sift-design/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { cn } from "cn";
import {
  IconChevronDown,
  IconArrowsExchange,
  IconPencil,
  IconFile as FileIcon,
  IconGitCommit as GitCommitIcon,
  IconMinus as MinusIcon,
  IconPlus as PlusIcon,
} from "@tabler/icons-react";
import type { ComponentProps, HTMLAttributes } from "react";
import { useCallback, useEffect, useRef, useState, useId } from "react";
import { CopyStateIcon } from "./copy-icon";

export type CommitProps = ComponentProps<typeof Collapsible>;

export const Commit = ({ className, children, ...props }: CommitProps) => (
  <Collapsible
    data-slot="commit"
    className={cn("overflow-hidden rounded-lg border bg-card text-foreground", className)}
    {...props}
  >
    {children}
  </Collapsible>
);

export type CommitHeaderProps = ComponentProps<typeof CollapsibleTrigger>;

export const CommitHeader = ({ className, children, asChild = true, ...props }: CommitHeaderProps) => {
  const labelId = useId();
  const triggerProps = {
    className:
      "commit-trigger absolute inset-0 z-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
    "aria-labelledby": props["aria-label"] ? undefined : labelId,
    ...props,
  };
  return (
    <div data-slot="commit-header" className={cn("relative flex items-start gap-3 p-4", className)}>
      <CollapsibleTrigger asChild={asChild} {...triggerProps}>
        {asChild ? <button type="button" /> : null}
      </CollapsibleTrigger>
      <div id={labelId} className="pointer-events-none relative flex min-w-0 flex-1 items-start gap-3">
        {children}
      </div>
      <IconChevronDown
        aria-hidden="true"
        className="commit-chevron pointer-events-none relative mt-1 size-4 shrink-0 text-muted-foreground"
      />
    </div>
  );
};

export type CommitHashProps = HTMLAttributes<HTMLSpanElement>;

export const CommitHash = ({ className, children, ...props }: CommitHashProps) => (
  <span
    className={cn("inline-flex items-center gap-1.5 font-mono text-[12px] text-muted-foreground", className)}
    {...props}
  >
    <GitCommitIcon aria-hidden="true" className="size-3.5" />
    {children}
  </span>
);

export type CommitMessageProps = HTMLAttributes<HTMLSpanElement>;

export const CommitMessage = ({ className, children, ...props }: CommitMessageProps) => (
  <span className={cn("text-[14px] font-medium leading-snug", className)} {...props}>
    {children}
  </span>
);

export type CommitMetadataProps = HTMLAttributes<HTMLDivElement>;

export const CommitMetadata = ({ className, children, ...props }: CommitMetadataProps) => (
  <div
    className={cn("mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground", className)}
    {...props}
  >
    {children}
  </div>
);

export type CommitSeparatorProps = HTMLAttributes<HTMLSpanElement>;

export const CommitSeparator = ({ className, children, ...props }: CommitSeparatorProps) => (
  <span aria-hidden="true" className={className} {...props}>
    {children ?? "•"}
  </span>
);

export type CommitInfoProps = HTMLAttributes<HTMLDivElement>;

export const CommitInfo = ({ className, children, ...props }: CommitInfoProps) => (
  <div className={cn("flex min-w-0 flex-1 flex-col gap-1.5", className)} {...props}>
    {children}
  </div>
);

export type CommitAuthorProps = HTMLAttributes<HTMLDivElement>;

export const CommitAuthor = ({ className, children, ...props }: CommitAuthorProps) => (
  <div className={cn("flex items-center gap-2", className)} {...props}>
    {children}
  </div>
);

export type CommitAuthorAvatarProps = ComponentProps<typeof Avatar> & {
  initials: string;
};

export const CommitAuthorAvatar = ({ initials, className, ...props }: CommitAuthorAvatarProps) => (
  <Avatar className={cn("size-8 bg-accent-soft", className)} {...props}>
    <AvatarFallback className="bg-accent-soft text-[12px] text-link">{initials}</AvatarFallback>
  </Avatar>
);

export type CommitTimestampProps = HTMLAttributes<HTMLTimeElement> & {
  date: Date;
  /** Reference date for deterministic examples. Defaults to the current time. */
  now?: Date;
};

const relativeTimeFormat = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

const formatRelativeDate = (date: Date, now: Date) => {
  const day = (value: Date) => Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  return relativeTimeFormat.format(Math.round((day(date) - day(now)) / 86400000), "day");
};

export const CommitTimestamp = ({ date, now = new Date(), className, children, ...props }: CommitTimestampProps) => (
  <time
    className={cn("text-[12px] tabular-nums", className)}
    dateTime={date.toISOString()}
    title={date.toLocaleString("en-GB")}
    {...props}
  >
    {children ?? formatRelativeDate(date, now)}
  </time>
);

export type CommitActionsProps = HTMLAttributes<HTMLDivElement>;

const handleActionsClick = (e: React.MouseEvent) => e.stopPropagation();
const handleActionsKeyDown = (e: React.KeyboardEvent) => e.stopPropagation();

export const CommitActions = ({ className, children, ...props }: CommitActionsProps) => (
  <div
    className={cn("pointer-events-auto relative z-10 flex items-center gap-1", className)}
    onClick={handleActionsClick}
    onKeyDown={handleActionsKeyDown}
    role="group"
    {...props}
  >
    {children}
  </div>
);

export type CommitCopyButtonProps = ComponentProps<typeof Button> & {
  hash: string;
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const CommitCopyButton = ({
  hash,
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CommitCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number>(0);

  const copyToClipboard = useCallback(async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }

    try {
      if (!isCopied) {
        await navigator.clipboard.writeText(hash);
        setIsCopied(true);
        onCopy?.();
        timeoutRef.current = window.setTimeout(() => setIsCopied(false), timeout);
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }, [hash, onCopy, onError, timeout, isCopied]);

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  return (
    <Button
      type="button"
      aria-label={isCopied ? "Commit hash copied" : "Copy commit hash"}
      title={isCopied ? "Commit hash copied" : "Copy commit hash"}
      data-copied={isCopied}
      className={cn("commit-copy size-8 shrink-0", className)}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <CopyStateIcon state={isCopied ? "copied" : "idle"} size={15} />}
      <span className="sr-only" role="status">
        {isCopied ? "Commit hash copied" : ""}
      </span>
    </Button>
  );
};

export type CommitContentProps = ComponentProps<typeof CollapsibleContent>;

export const CommitContent = ({ className, children, ...props }: CommitContentProps) => (
  <CollapsibleContent data-slot="commit-content" className={cn("border-t px-2 py-2", className)} {...props}>
    {children}
  </CollapsibleContent>
);

export type CommitFilesProps = HTMLAttributes<HTMLDivElement>;

export const CommitFiles = ({ className, children, ...props }: CommitFilesProps) => (
  <div className={cn("space-y-1", className)} {...props}>
    {children}
  </div>
);

export type CommitFileProps = HTMLAttributes<HTMLDivElement>;

export const CommitFile = ({ className, children, ...props }: CommitFileProps) => (
  <div
    className={cn(
      "commit-file flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-[13px] hover:bg-tint",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export type CommitFileInfoProps = HTMLAttributes<HTMLDivElement>;

export const CommitFileInfo = ({ className, children, ...props }: CommitFileInfoProps) => (
  <div className={cn("flex min-w-0 items-center gap-2", className)} {...props}>
    {children}
  </div>
);

const fileStatusStyles = {
  added: "text-good",
  deleted: "text-danger",
  modified: "text-warn",
  renamed: "text-link",
};

const fileStatusLabels = {
  added: "Added",
  deleted: "Deleted",
  modified: "Modified",
  renamed: "Renamed",
};

export type CommitFileStatusProps = HTMLAttributes<HTMLSpanElement> & {
  status: "added" | "modified" | "deleted" | "renamed";
};

export const CommitFileStatus = ({ status, className, children, ...props }: CommitFileStatusProps) => {
  const Icon = { added: PlusIcon, deleted: MinusIcon, modified: IconPencil, renamed: IconArrowsExchange }[status];
  return (
    <span
      data-slot="commit-file-status"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-[12px] font-medium",
        fileStatusStyles[status],
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="size-3" />
      {children ?? fileStatusLabels[status]}
    </span>
  );
};

export type CommitFileIconProps = ComponentProps<typeof FileIcon>;

export const CommitFileIcon = ({ className, ...props }: CommitFileIconProps) => (
  <FileIcon aria-hidden="true" className={cn("size-3.5 shrink-0 text-muted-foreground", className)} {...props} />
);

export type CommitFilePathProps = HTMLAttributes<HTMLSpanElement>;

export const CommitFilePath = ({ className, children, ...props }: CommitFilePathProps) => (
  <span className={cn("min-w-0 break-all font-mono text-[12px]", className)} {...props}>
    {children}
  </span>
);

export type CommitFileChangesProps = HTMLAttributes<HTMLDivElement>;

export const CommitFileChanges = ({ className, children, ...props }: CommitFileChangesProps) => (
  <div className={cn("flex shrink-0 items-center gap-2 font-mono text-[12px]", className)} {...props}>
    {children}
  </div>
);

export type CommitFileAdditionsProps = HTMLAttributes<HTMLSpanElement> & {
  count: number;
};

export const CommitFileAdditions = ({ count, className, children, ...props }: CommitFileAdditionsProps) => {
  if (count <= 0) {
    return null;
  }

  return (
    <span aria-label={`${count} additions`} className={cn("text-good", className)} {...props}>
      {children ?? (
        <>
          <PlusIcon aria-hidden="true" className="inline-block size-3" />
          {count}
        </>
      )}
    </span>
  );
};

export type CommitFileDeletionsProps = HTMLAttributes<HTMLSpanElement> & {
  count: number;
};

export const CommitFileDeletions = ({ count, className, children, ...props }: CommitFileDeletionsProps) => {
  if (count <= 0) {
    return null;
  }

  return (
    <span aria-label={`${count} deletions`} className={cn("text-danger", className)} {...props}>
      {children ?? (
        <>
          <MinusIcon aria-hidden="true" className="inline-block size-3" />
          {count}
        </>
      )}
    </span>
  );
};
