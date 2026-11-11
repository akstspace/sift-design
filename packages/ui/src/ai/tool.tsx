import { Badge } from "@sift-design/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { duration, leave, spring } from "@sift-design/tokens/motion";
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCircle,
  IconClock,
  IconLoader2,
  IconLock,
  IconTool,
  IconX,
} from "@tabler/icons-react";
import type { DynamicToolUIPart, ToolUIPart } from "ai";
import { cn } from "cn";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  type ComponentType,
  createContext,
  isValidElement,
  type ReactNode,
  useContext,
} from "react";
import { CodeBlock } from "./code-block";

/**
 * "card" is a bordered disclosure with a status badge. "compact" is one quiet
 * row for transcripts with many tool calls: a muted verb, a mono target, an
 * icon-only status and a chevron, with the details indented below.
 */
export type ToolVariant = "card" | "compact";
const ToolVariantContext = createContext<ToolVariant>("card");
const useToolVariant = () => useContext(ToolVariantContext);

export type ToolProps = ComponentProps<typeof Collapsible> & { variant?: ToolVariant };
export const Tool = ({ className, variant = "card", ...props }: ToolProps) => (
  <ToolVariantContext.Provider value={variant}>
    <Collapsible
      data-slot="tool"
      data-variant={variant}
      className={cn(
        variant === "compact"
          ? "ai-tool ai-tool-compact not-prose w-full min-w-0"
          : "ai-tool not-prose w-full min-w-0 overflow-hidden rounded-lg border bg-card",
        className,
      )}
      {...props}
    />
  </ToolVariantContext.Provider>
);

export type ToolPart = ToolUIPart | DynamicToolUIPart;
export type ToolHeaderProps = {
  title?: string;
  className?: string;
  /** Replaces the wrench, for example a file icon for a read or a terminal icon for a command. */
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  /** Compact only: a muted action word before the target, such as "Read" or "Searched for". */
  verb?: string;
  /** Compact only: the main argument in mono, such as a file name or a command. Long targets truncate. */
  target?: string;
  /** Compact only: shown after the call ends, and only when it took a second or more. */
  durationMs?: number;
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

/** "0.4s", "12s" or "1m 5s". */
export const formatToolDuration = (ms: number) =>
  ms < 1000
    ? `${(ms / 1000).toFixed(1)}s`
    : ms < 60000
      ? `${Math.round(ms / 1000)}s`
      : `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;

const markDetails = {
  "input-streaming": { label: "Preparing", icon: IconLoader2, tone: "text-muted-foreground" },
  "input-available": { label: "Running", icon: IconLoader2, tone: "text-muted-foreground" },
  "approval-requested": { label: "Needs approval", icon: IconLock, tone: "text-warn" },
  "approval-responded": { label: "Responded", icon: IconCheck, tone: "text-muted-foreground" },
  "output-available": { label: "Completed", icon: IconCheck, tone: "text-good" },
  "output-error": { label: "Error", icon: IconX, tone: "text-danger" },
  "output-denied": { label: "Denied", icon: IconLock, tone: "text-warn" },
} as const;

export type ToolStatusMarkProps = ComponentProps<"span"> & { state: ToolPart["state"] };
/**
 * The compact status: an icon with its label for screen readers. The spinner
 * turns only while the call is running. A new state pops in on spring.snappy,
 * or spring.lively for a finished one, and the old one leaves on spring.exit.
 */
export const ToolStatusMark = ({ state, className, ...props }: ToolStatusMarkProps) => {
  const reduced = useReducedMotion();
  const { label, icon: Icon, tone } = markDetails[state];
  const running = state === "input-streaming" || state === "input-available";
  const finished = state === "output-available" || state === "output-error";
  return (
    <span
      data-slot="tool-status-mark"
      data-tool-state={state}
      className={cn("grid size-4 shrink-0 place-items-center", tone, className)}
      {...props}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          // Preparing and running share the spinner, so it keeps turning between them.
          key={running ? "running" : state}
          aria-hidden="true"
          className="col-start-1 row-start-1 flex"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: reduced ? 1 : 0.6,
            transition: reduced
              ? { duration: duration.instant }
              : { ...spring.exit, opacity: { duration: duration.instant, ease: leave } },
          }}
          transition={
            reduced
              ? { duration: duration.quick }
              : { ...(finished ? spring.lively : spring.snappy), opacity: { duration: duration.quick, ease: "linear" } }
          }
        >
          <Icon className={cn("size-3.5", running && "ai-tool-spin")} />
        </motion.span>
      </AnimatePresence>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {label}
      </span>
    </span>
  );
};

const CompactToolHeader = ({
  className,
  title,
  type,
  state,
  toolName,
  icon: Icon = IconTool,
  verb,
  target,
  durationMs,
  ...props
}: ToolHeaderProps) => {
  const name = title ?? (type === "dynamic-tool" ? toolName : type.split("-").slice(1).join("-"));
  const shown = target ?? (verb ? undefined : name);
  const ended = state === "output-available" || state === "output-error";
  return (
    <CollapsibleTrigger
      data-slot="tool-header"
      title={target && target.length > 48 ? target : undefined}
      className={cn(
        "ai-tool-header -mx-2 flex min-h-[30px] w-[calc(100%+16px)] items-center gap-2 rounded-md px-2 text-left text-[12.5px] outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="flex min-w-0 flex-1 items-baseline gap-1.5 overflow-hidden">
        {verb && <span className="shrink-0 whitespace-nowrap text-muted-foreground">{verb}</span>}
        {shown && <code className="min-w-0 truncate font-mono text-[12px] text-foreground">{shown}</code>}
      </span>
      <span className="flex shrink-0 items-center gap-2 pl-1.5 text-muted-foreground">
        {ended && durationMs !== undefined && durationMs >= 1000 && (
          <span className="font-mono text-[12px] tabular-nums">{formatToolDuration(durationMs)}</span>
        )}
        <ToolStatusMark state={state} />
        <IconChevronRight aria-hidden="true" className="ai-tool-chevron size-3.5 shrink-0" />
      </span>
    </CollapsibleTrigger>
  );
};

export const ToolHeader = (props: ToolHeaderProps) =>
  useToolVariant() === "compact" ? <CompactToolHeader {...props} /> : <CardToolHeader {...props} />;

const CardToolHeader = ({
  className,
  title,
  type,
  state,
  toolName,
  icon: Icon = IconTool,
  verb: _verb,
  target: _target,
  durationMs: _durationMs,
  ...props
}: ToolHeaderProps) => (
  <CollapsibleTrigger
    data-slot="tool-header"
    className={cn(
      "ai-tool-header flex w-full items-center gap-2.5 px-4 py-3.5 text-left text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
      className,
    )}
    {...props}
  >
    <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
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
export const ToolContent = ({ className, children, ...props }: ToolContentProps) =>
  useToolVariant() === "compact" ? (
    <CollapsibleContent data-slot="tool-content" className={cn("ai-tool-content", className)} {...props}>
      {/* Indented past the icon, so details line up with the tool name. */}
      <div className="flex flex-col gap-2 pt-1 pb-2 pl-[22px]">{children}</div>
    </CollapsibleContent>
  ) : (
    <CollapsibleContent data-slot="tool-content" className={cn("ai-tool-content border-t", className)} {...props}>
      {children}
    </CollapsibleContent>
  );

export type ToolTailProps = Omit<ComponentProps<"div">, "children"> & {
  /** Output so far. Only its last lines show. */
  output?: string;
  lines?: number;
};
/**
 * Compact only: the last lines of a running call's output under its row, so
 * people see progress without opening it. Render it while the call runs and
 * its details are closed. The space is reserved at full height, so new lines
 * scroll up without moving the transcript. It opens on spring.smooth and
 * collapses on spring.exit when the call ends.
 */
export const ToolTail = ({ output, lines = 3, className, ...props }: ToolTailProps) => {
  const reduced = useReducedMotion();
  const text = (output ?? "").replace(/\s+$/, "").split("\n").slice(-lines).join("\n");
  return (
    <AnimatePresence initial={false}>
      {text && (
        <motion.div
          key="tail"
          data-slot="tool-tail"
          aria-hidden="true"
          className={cn("overflow-hidden", className)}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{
            height: 0,
            opacity: 0,
            transition: reduced
              ? { duration: duration.instant }
              : { height: spring.exit, opacity: { duration: duration.instant, ease: leave } },
          }}
          transition={
            reduced ? { duration: duration.quick } : { height: spring.smooth, opacity: { duration: duration.quick } }
          }
          {...(props as ComponentProps<typeof motion.div>)}
        >
          <pre className="ai-tool-tail" style={{ height: `${lines * 1.5}em` }}>
            {text}
          </pre>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export type ToolInputProps = ComponentProps<"div"> & { input: ToolPart["input"] };
export const ToolInput = ({ className, input, ...props }: ToolInputProps) => (
  <div
    data-slot="tool-input"
    className={cn("space-y-2 overflow-hidden", useToolVariant() === "compact" ? "space-y-1.5" : "px-4 py-3", className)}
    {...props}
  >
    <h4 className="text-[12px] font-medium text-muted-foreground">Parameters</h4>
    <CodeBlock code={JSON.stringify(input, null, 2) ?? "null"} language="json" />
  </div>
);

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ToolPart["output"];
  errorText: ToolPart["errorText"];
};
export const ToolOutput = ({ className, output, errorText, ...props }: ToolOutputProps) => {
  const variant = useToolVariant();
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
    <div
      data-slot="tool-output"
      className={cn("space-y-2", variant === "compact" ? "space-y-1.5" : "px-4 py-3", className)}
      {...props}
    >
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
