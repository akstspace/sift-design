import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Button } from "@sift-design/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { cn } from "cn";
import {
  IconAlertTriangle as AlertTriangleIcon,
  IconChevronDown as ChevronDownIcon,
} from "@tabler/icons-react";
import type { ComponentProps } from "react";
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CopyStateIcon } from "./copy-icon";

// Regex patterns for parsing stack traces
const STACK_FRAME_WITH_PARENS_REGEX = /^at\s+(.+?)\s+\((.+):(\d+):(\d+)\)$/;
const STACK_FRAME_WITHOUT_FN_REGEX = /^at\s+(.+):(\d+):(\d+)$/;
const ERROR_TYPE_REGEX = /^(\w+Error|Error):\s*(.*)$/;
const AT_PREFIX_REGEX = /^at\s+/;

interface StackFrame {
  raw: string;
  functionName: string | null;
  filePath: string | null;
  lineNumber: number | null;
  columnNumber: number | null;
  isInternal: boolean;
}

interface ParsedStackTrace {
  errorType: string | null;
  errorMessage: string;
  frames: StackFrame[];
  raw: string;
}

interface StackTraceContextValue {
  trace: ParsedStackTrace;
  raw: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onFilePathClick?: (filePath: string, line?: number, column?: number) => void;
}

const StackTraceContext = createContext<StackTraceContextValue | null>(null);

const useStackTrace = () => {
  const context = useContext(StackTraceContext);
  if (!context) {
    throw new Error("StackTrace components must be used within StackTrace");
  }
  return context;
};

const parseStackFrame = (line: string): StackFrame => {
  const trimmed = line.trim();

  // Pattern: at functionName (filePath:line:column)
  const withParensMatch = trimmed.match(STACK_FRAME_WITH_PARENS_REGEX);
  if (withParensMatch) {
    const [, functionName, filePath, lineNum, colNum] = withParensMatch;
    const isInternal =
      filePath.includes("node_modules") || filePath.startsWith("node:") || filePath.includes("internal/");
    return {
      columnNumber: colNum ? Number.parseInt(colNum, 10) : null,
      filePath: filePath ?? null,
      functionName: functionName ?? null,
      isInternal,
      lineNumber: lineNum ? Number.parseInt(lineNum, 10) : null,
      raw: trimmed,
    };
  }

  // Pattern: at filePath:line:column (no function name)
  const withoutFnMatch = trimmed.match(STACK_FRAME_WITHOUT_FN_REGEX);
  if (withoutFnMatch) {
    const [, filePath, lineNum, colNum] = withoutFnMatch;
    const isInternal =
      (filePath?.includes("node_modules") ?? false) ||
      (filePath?.startsWith("node:") ?? false) ||
      (filePath?.includes("internal/") ?? false);
    return {
      columnNumber: colNum ? Number.parseInt(colNum, 10) : null,
      filePath: filePath ?? null,
      functionName: null,
      isInternal,
      lineNumber: lineNum ? Number.parseInt(lineNum, 10) : null,
      raw: trimmed,
    };
  }

  // Fallback: unparseable line
  return {
    columnNumber: null,
    filePath: null,
    functionName: null,
    isInternal: trimmed.includes("node_modules") || trimmed.includes("node:"),
    lineNumber: null,
    raw: trimmed,
  };
};

const parseStackTrace = (trace: string): ParsedStackTrace => {
  const lines = trace.split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
    return {
      errorMessage: trace,
      errorType: null,
      frames: [],
      raw: trace,
    };
  }

  const firstLine = lines[0].trim();
  let errorType: string | null = null;
  let errorMessage = firstLine;

  // Try to extract error type from "ErrorType: message" format
  const errorMatch = firstLine.match(ERROR_TYPE_REGEX);
  if (errorMatch) {
    const [, type, msg] = errorMatch;
    errorType = type;
    errorMessage = msg || "";
  }

  // Parse stack frames (lines starting with "at")
  const frames = lines
    .slice(1)
    .filter((line) => line.trim().startsWith("at "))
    .map(parseStackFrame);

  return {
    errorMessage,
    errorType,
    frames,
    raw: trace,
  };
};

export type StackTraceProps = ComponentProps<"div"> & {
  trace: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onFilePathClick?: (filePath: string, line?: number, column?: number) => void;
};

export const StackTrace = memo(
  ({
    trace,
    className,
    open,
    defaultOpen = false,
    onOpenChange,
    onFilePathClick,
    children,
    ...props
  }: StackTraceProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      defaultProp: defaultOpen,
      onChange: onOpenChange,
      prop: open,
    });

    const parsedTrace = useMemo(() => parseStackTrace(trace), [trace]);

    const contextValue = useMemo(
      () => ({
        isOpen,
        onFilePathClick,
        raw: trace,
        setIsOpen,
        trace: parsedTrace,
      }),
      [parsedTrace, trace, isOpen, setIsOpen, onFilePathClick],
    );

    return (
      <StackTraceContext.Provider value={contextValue}>
        <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
          <div
            className={cn(
              "ai-stack-trace not-prose min-w-0 w-full overflow-hidden rounded-lg border bg-card font-mono text-[12px]",
              className,
            )}
            {...props}
          >
            {children}
          </div>
        </Collapsible>
      </StackTraceContext.Provider>
    );
  },
);

export type StackTraceHeaderProps = ComponentProps<typeof CollapsibleTrigger>;

export const StackTraceHeader = memo(({ className, children, asChild, ...props }: StackTraceHeaderProps) => {
  const { isOpen, trace } = useStackTrace();
  const label = `${isOpen ? "Collapse" : "Expand"} ${trace.errorType ?? "error"} stack frames`;
  return (
    <div
      className={cn("ai-stack-header relative flex w-full items-start gap-3 p-4 text-left hover:bg-tint", className)}
    >
      <CollapsibleTrigger
        asChild={asChild}
        className="ai-stack-toggle absolute inset-0 h-full w-full rounded-md"
        aria-label={label}
        {...props}
      >
        {asChild ? (
          <button type="button">
            <span className="sr-only">{label}</span>
          </button>
        ) : (
          <span className="sr-only">{label}</span>
        )}
      </CollapsibleTrigger>
      {children}
    </div>
  );
});

export type StackTraceErrorProps = ComponentProps<"div">;

export const StackTraceError = memo(({ className, children, ...props }: StackTraceErrorProps) => (
  <div
    className={cn("pointer-events-none relative flex min-w-0 flex-1 flex-wrap items-start gap-2", className)}
    {...props}
  >
    <AlertTriangleIcon aria-hidden="true" className="size-4 shrink-0 text-destructive" />
    {children}
  </div>
));

export type StackTraceErrorTypeProps = ComponentProps<"span">;

export const StackTraceErrorType = memo(({ className, children, ...props }: StackTraceErrorTypeProps) => {
  const { trace } = useStackTrace();

  return (
    <span className={cn("shrink-0 font-semibold text-destructive", className)} {...props}>
      {children ?? trace.errorType}
    </span>
  );
});

export type StackTraceErrorMessageProps = ComponentProps<"span">;

export const StackTraceErrorMessage = memo(({ className, children, ...props }: StackTraceErrorMessageProps) => {
  const { trace } = useStackTrace();

  return (
    <span className={cn("break-words text-foreground", className)} {...props}>
      {children ?? trace.errorMessage}
    </span>
  );
});

export type StackTraceActionsProps = ComponentProps<"div">;

const handleActionsClick = (e: React.MouseEvent) => e.stopPropagation();
const handleActionsKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.stopPropagation();
  }
};

export const StackTraceActions = memo(({ className, children, ...props }: StackTraceActionsProps) => (
  <div
    className={cn("pointer-events-auto relative z-10 flex shrink-0 items-center gap-1", className)}
    onClick={handleActionsClick}
    onKeyDown={handleActionsKeyDown}
    role="group"
    {...props}
  >
    {children}
  </div>
));

export type StackTraceCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const StackTraceCopyButton = memo(
  ({ onCopy, onError, timeout = 2000, className, children, ...props }: StackTraceCopyButtonProps) => {
    const [isCopied, setIsCopied] = useState(false);
    const timeoutRef = useRef<number>(0);
    const { raw } = useStackTrace();

    const copyToClipboard = useCallback(async () => {
      if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
        onError?.(new Error("Clipboard API not available"));
        return;
      }

      try {
        await navigator.clipboard.writeText(raw);
        setIsCopied(true);
        onCopy?.();
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setIsCopied(false), timeout);
      } catch (error) {
        onError?.(error as Error);
      }
    }, [raw, onCopy, onError, timeout]);

    useEffect(
      () => () => {
        window.clearTimeout(timeoutRef.current);
      },
      [],
    );

    return (
      <Button
        aria-label={isCopied ? "Stack trace copied" : "Copy stack trace"}
        type="button"
        className={cn("size-8", className)}
        onClick={copyToClipboard}
        size="icon"
        variant="ghost"
        {...props}
      >
        {children ?? <CopyStateIcon state={isCopied ? "copied" : "idle"} />}
      </Button>
    );
  },
);

export type StackTraceExpandButtonProps = ComponentProps<"div">;

export const StackTraceExpandButton = memo(({ className, ...props }: StackTraceExpandButtonProps) => {
  const { isOpen } = useStackTrace();

  return (
    <div className={cn("pointer-events-none relative flex size-7 items-center justify-center", className)} {...props}>
      <ChevronDownIcon
        aria-hidden="true"
        className={cn("ai-terminal-chevron size-4 text-muted-foreground", isOpen ? "rotate-180" : "rotate-0")}
      />
    </div>
  );
});

export type StackTraceContentProps = ComponentProps<typeof CollapsibleContent> & {
  maxHeight?: number;
};

export const StackTraceContent = memo(({ className, maxHeight = 400, children, ...props }: StackTraceContentProps) => {
  return (
    <CollapsibleContent className={cn("border-t bg-tint", className)} {...props}>
      <div className="overflow-auto" style={{ maxHeight }}>
        {children}
      </div>
    </CollapsibleContent>
  );
});

export type StackTraceFramesProps = ComponentProps<"div"> & {
  showInternalFrames?: boolean;
};

interface FilePathButtonProps {
  frame: StackFrame;
  onFilePathClick?: (filePath: string, lineNumber?: number, columnNumber?: number) => void;
}

const FilePathButton = memo(({ frame, onFilePathClick }: FilePathButtonProps) => {
  const handleClick = useCallback(() => {
    if (frame.filePath) {
      onFilePathClick?.(frame.filePath, frame.lineNumber ?? undefined, frame.columnNumber ?? undefined);
    }
  }, [frame, onFilePathClick]);

  if (!onFilePathClick)
    return (
      <span>
        {frame.filePath}
        {frame.lineNumber !== null && `:${frame.lineNumber}`}
        {frame.columnNumber !== null && `:${frame.columnNumber}`}
      </span>
    );
  return (
    <button
      className={cn(
        "rounded-sm text-left break-all underline decoration-dotted underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-ring",
        "cursor-pointer",
      )}
      disabled={!onFilePathClick}
      onClick={handleClick}
      type="button"
    >
      {frame.filePath}
      {frame.lineNumber !== null && `:${frame.lineNumber}`}
      {frame.columnNumber !== null && `:${frame.columnNumber}`}
    </button>
  );
});

FilePathButton.displayName = "FilePathButton";

export const StackTraceFrames = memo(({ className, showInternalFrames = true, ...props }: StackTraceFramesProps) => {
  const { trace, onFilePathClick } = useStackTrace();

  const framesToShow = showInternalFrames ? trace.frames : trace.frames.filter((f) => !f.isInternal);

  return (
    <div className={cn("space-y-1 p-3", className)} {...props}>
      {framesToShow.map((frame, index) => (
        <div
          className={cn(
            "break-words text-[12px] leading-6",
            frame.isInternal ? "text-muted-foreground" : "text-foreground",
          )}
          key={`${index}-${frame.raw}`}
        >
          <span className="text-muted-foreground">at </span>
          {frame.functionName && (
            <span className={frame.isInternal ? "" : "text-foreground"}>{frame.functionName} </span>
          )}
          {frame.filePath && (
            <>
              <span className="text-muted-foreground">(</span>
              <FilePathButton frame={frame} onFilePathClick={onFilePathClick} />
              <span className="text-muted-foreground">)</span>
            </>
          )}
          {!(frame.filePath || frame.functionName) && <span>{frame.raw.replace(AT_PREFIX_REGEX, "")}</span>}
        </div>
      ))}
      {framesToShow.length === 0 && <div className="text-muted-foreground text-xs">No stack frames</div>}
    </div>
  );
});

StackTrace.displayName = "StackTrace";
StackTraceHeader.displayName = "StackTraceHeader";
StackTraceError.displayName = "StackTraceError";
StackTraceErrorType.displayName = "StackTraceErrorType";
StackTraceErrorMessage.displayName = "StackTraceErrorMessage";
StackTraceActions.displayName = "StackTraceActions";
StackTraceCopyButton.displayName = "StackTraceCopyButton";
StackTraceExpandButton.displayName = "StackTraceExpandButton";
StackTraceContent.displayName = "StackTraceContent";
StackTraceFrames.displayName = "StackTraceFrames";
