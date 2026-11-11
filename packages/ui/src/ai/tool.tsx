import { Badge } from "@sift-design/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { duration } from "@sift-design/tokens/motion";
import { IconCheck, IconChevronDown, IconCircle, IconClock, IconLock, IconTool, IconX } from "@tabler/icons-react";
import type { DynamicToolUIPart, ToolUIPart } from "ai";
import { cn } from "cn";
import { AnimatePresence, motion } from "motion/react";
import { type ComponentProps, isValidElement, type ReactNode } from "react";
import { CodeBlock } from "./code-block";

export type ToolProps = ComponentProps<typeof Collapsible>;
export const Tool = ({ className, ...props }: ToolProps) => (
  <Collapsible
    data-slot="tool"
    className={cn("ai-tool not-prose w-full min-w-0 overflow-hidden rounded-lg border bg-card", className)}
    {...props}
  />
);

export type ToolPart = ToolUIPart | DynamicToolUIPart;
export type ToolHeaderProps = {
  title?: string;
  className?: string;
} & (
  | { type: ToolUIPart["type"]; state: ToolUIPart["state"]; toolName?: never }
  | { type: DynamicToolUIPart["type"]; state: DynamicToolUIPart["state"]; toolName: string }
);

const statusDetails = {
  "input-streaming": { label: "Preparing", icon: IconCircle, variant: "secondary" },
  "input-available": { label: "Running", icon: IconClock, variant: "secondary" },
  "approval-requested": { label: "Needs approval", icon: IconLock, variant: "warning" },
  "approval-responded": { label: "Responded", icon: IconCheck, variant: "outline" },
  "output-available": { label: "Completed", icon: IconCheck, variant: "good" },
  "output-error": { label: "Error", icon: IconX, variant: "destructive" },
  "output-denied": { label: "Denied", icon: IconLock, variant: "warning" },
} as const;

export const getStatusBadge = (status: ToolPart["state"]) => {
  const { label, icon: Icon, variant } = statusDetails[status];
  return (
    <Badge
      data-slot="tool-status"
      data-tool-state={status}
      className="ai-tool-status gap-1.5 rounded-md text-[12px]"
      variant={variant}
    >
      <Icon aria-hidden="true" className={cn("size-3", status === "input-available" && "ai-tool-running")} />
      {label}
    </Badge>
  );
};

export const ToolHeader = ({ className, title, type, state, toolName, ...props }: ToolHeaderProps) => (
  <CollapsibleTrigger
    data-slot="tool-header"
    className={cn(
      "ai-tool-header flex w-full items-center gap-2.5 px-4 py-3.5 text-left text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
      className,
    )}
    {...props}
  >
    <IconTool aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
    <span className="min-w-0 flex-1 break-all font-mono text-[12px] font-medium">
      {title ?? (type === "dynamic-tool" ? toolName : type.split("-").slice(1).join("-"))}
    </span>
    <span className="ai-tool-status-stack shrink-0" aria-live="polite" aria-atomic="true">
      <AnimatePresence initial={false}>
        <motion.span
          key={state}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: duration.instant } }}
          transition={{ opacity: { duration: duration.quick } }}
        >
          {getStatusBadge(state)}
        </motion.span>
      </AnimatePresence>
    </span>
    <IconChevronDown aria-hidden="true" className="ai-tool-chevron size-3.5 shrink-0 text-muted-foreground" />
  </CollapsibleTrigger>
);

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;
export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent data-slot="tool-content" className={cn("ai-tool-content border-t", className)} {...props} />
);

export type ToolInputProps = ComponentProps<"div"> & { input: ToolPart["input"] };
export const ToolInput = ({ className, input, ...props }: ToolInputProps) => (
  <div data-slot="tool-input" className={cn("space-y-2 overflow-hidden px-4 py-3", className)} {...props}>
    <h4 className="text-[12px] font-medium text-muted-foreground">Parameters</h4>
    <CodeBlock code={JSON.stringify(input, null, 2) ?? "null"} language="json" />
  </div>
);

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ToolPart["output"];
  errorText: ToolPart["errorText"];
};
export const ToolOutput = ({ className, output, errorText, ...props }: ToolOutputProps) => {
  if (output === undefined && !errorText) return null;
  let content: ReactNode;
  if (isValidElement(output)) content = output;
  else
    content = (
      <CodeBlock
        code={typeof output === "string" ? output : (JSON.stringify(output, null, 2) ?? "null")}
        language="json"
      />
    );
  return (
    <div data-slot="tool-output" className={cn("space-y-2 px-4 py-3", className)} {...props}>
      <h4 className={cn("text-[12px] font-medium", errorText ? "text-destructive" : "text-muted-foreground")}>
        {errorText ? "Error" : "Result"}
      </h4>
      {errorText && (
        <p role="alert" className="flex items-start gap-2 text-[13px] text-destructive">
          <IconX aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {errorText}
        </p>
      )}
      {output !== undefined && <div className="min-w-0 overflow-x-auto text-[13px] [&_table]:w-full">{content}</div>}
    </div>
  );
};
