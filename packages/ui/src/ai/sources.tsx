import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { IconChevronDown } from "@tabler/icons-react";
import { cn } from "cn";
import type { ComponentProps } from "react";

export type SourcesProps = ComponentProps<"div">;

export const Sources = ({ className, ...props }: SourcesProps) => (
  <Collapsible data-slot="sources" className={cn("not-prose text-[13px] text-foreground", className)} {...props} />
);

export type SourcesTriggerProps = ComponentProps<typeof CollapsibleTrigger> & { count: number };

export const SourcesTrigger = ({ className, count, children, ...props }: SourcesTriggerProps) => (
  <CollapsibleTrigger
    data-slot="sources-trigger"
    className={cn(
      "inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-muted-foreground hover:bg-tint hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      className,
    )}
    {...props}
  >
    {children ?? (
      <>
        <span>
          Used <span className="font-mono tabular-nums">{count}</span> {count === 1 ? "source" : "sources"}
        </span>
        <IconChevronDown aria-hidden className="size-3.5" />
      </>
    )}
  </CollapsibleTrigger>
);

export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export const SourcesContent = ({ className, ...props }: SourcesContentProps) => (
  <CollapsibleContent className={cn("flex flex-col gap-1 pt-2", className)} {...props} />
);

export type SourceProps = ComponentProps<"a">;

export const Source = ({ href, title, children, className, ...props }: SourceProps) => (
  <a
    data-slot="source"
    className={cn(
      "flex min-h-10 items-center gap-3 rounded-md px-2 py-1.5 text-[13px] text-foreground hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      className,
    )}
    href={href}
    rel="noreferrer"
    target="_blank"
    {...props}
  >
    {children ?? (
      <>
        <span
          aria-hidden
          className="flex size-6 shrink-0 items-center justify-center rounded bg-subtle font-mono text-[12px] text-muted-foreground"
        >
          {(title?.trim().charAt(0) || "S").toUpperCase()}
        </span>
        <span className="min-w-0 break-words font-medium">{title ?? href}</span>
      </>
    )}
  </a>
);
