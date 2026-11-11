import { Button } from "@sift-design/ui/button";
import { cn } from "cn";
import { IconTerminal2 as TerminalIcon, IconTrash as Trash2Icon } from "@tabler/icons-react";
import type { ComponentProps, CSSProperties, HTMLAttributes } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CopyStateIcon } from "./copy-icon";

// Only SGR styles are interpreted. Other escape sequences have no executable effect.
const ANSI_ESCAPE = /\u001b(?:\[([0-9;]*)m|\[[0-?]*[ -/]*[@-~]|\][^\u0007\u001b]*(?:\u0007|\u001b\\))/g;
const stripAnsi = (text: string) =>
  text
    .replace(ANSI_ESCAPE, "")
    .replace(/\u001b[^]*$/, "")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "");

function AnsiOutput({ output }: { output: string }) {
  const segments = useMemo(() => {
    const result: { text: string; style: CSSProperties; dim: boolean }[] = [];
    let style: CSSProperties = {};
    let dim = false;
    let offset = 0;
    const append = (text: string) => {
      if (text) result.push({ text: stripAnsi(text), style: { ...style }, dim });
    };
    for (const match of output.matchAll(ANSI_ESCAPE)) {
      append(output.slice(offset, match.index));
      offset = match.index! + match[0].length;
      if (match[1] === undefined) continue;
      const codes = (match[1] || "0").split(";").map((code) => Number(code || 0));
      for (let index = 0; index < codes.length; index++) {
        const code = codes[index];
        if (code === 0) {
          style = {};
          dim = false;
        } else if (code === 1) style.fontWeight = 600;
        else if (code === 2) dim = true;
        else if (code === 3) style.fontStyle = "italic";
        else if (code === 4) style.textDecoration = "underline";
        else if (code === 22) {
          delete style.fontWeight;
          dim = false;
        } else if (code === 23) delete style.fontStyle;
        else if (code === 24) delete style.textDecoration;
        else if (code === 39) delete style.color;
        else if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97))
          style.color = `var(--terminal-color-${code})`;
        // Ignore extended foreground/background colors as one instruction.
        else if (code === 38 || code === 48 || code === 58)
          index += codes[index + 1] === 2 ? 4 : codes[index + 1] === 5 ? 2 : 0;
      }
    }
    append(output.slice(offset));
    return result;
  }, [output]);
  return (
    <>
      {segments.map((segment, index) => (
        <span key={index} className={segment.dim ? "ai-terminal-dim" : undefined} style={segment.style}>
          {segment.text}
        </span>
      ))}
    </>
  );
}

interface TerminalContextType {
  output: string;
  isStreaming: boolean;
  autoScroll: boolean;
  onClear?: () => void;
}

const TerminalContext = createContext<TerminalContextType>({
  autoScroll: true,
  isStreaming: false,
  output: "",
});

export type TerminalHeaderProps = HTMLAttributes<HTMLDivElement>;

export const TerminalHeader = ({ className, children, ...props }: TerminalHeaderProps) => (
  <div className={cn("flex items-center justify-between flex-wrap gap-2 border-b px-4 py-2", className)} {...props}>
    {children}
  </div>
);

export type TerminalTitleProps = HTMLAttributes<HTMLDivElement>;

export const TerminalTitle = ({ className, children, ...props }: TerminalTitleProps) => (
  <div className={cn("flex items-center gap-2 text-[13px] text-muted-foreground", className)} {...props}>
    <TerminalIcon aria-hidden="true" className="size-4" />
    {children ?? "Terminal"}
  </div>
);

export type TerminalStatusProps = HTMLAttributes<HTMLDivElement>;

export const TerminalStatus = ({ className, children, ...props }: TerminalStatusProps) => {
  const { isStreaming } = useContext(TerminalContext);

  if (!isStreaming) {
    return null;
  }

  return (
    <div
      role="status"
      className={cn("flex items-center gap-2 text-[12px] text-muted-foreground", className)}
      {...props}
    >
      {children ?? "Running"}
    </div>
  );
};

export type TerminalActionsProps = HTMLAttributes<HTMLDivElement>;

export const TerminalActions = ({ className, children, ...props }: TerminalActionsProps) => (
  <div className={cn("flex items-center gap-1", className)} {...props}>
    {children}
  </div>
);

export type TerminalCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const TerminalCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: TerminalCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number>(0);
  const { output } = useContext(TerminalContext);

  const copyToClipboard = useCallback(async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }

    try {
      await navigator.clipboard.writeText(stripAnsi(output));
      setIsCopied(true);
      onCopy?.();
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [output, onCopy, onError, timeout]);

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  return (
    <Button
      className={cn("size-8 shrink-0 text-muted-foreground", className)}
      aria-label={isCopied ? "Output copied" : "Copy terminal output"}
      type="button"
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <CopyStateIcon state={isCopied ? "copied" : "idle"} />}
    </Button>
  );
};

export type TerminalClearButtonProps = ComponentProps<typeof Button>;

export const TerminalClearButton = ({ children, className, ...props }: TerminalClearButtonProps) => {
  const { onClear } = useContext(TerminalContext);

  if (!onClear) {
    return null;
  }

  return (
    <Button
      className={cn("size-8 shrink-0 text-muted-foreground", className)}
      aria-label="Clear terminal output"
      type="button"
      onClick={onClear}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Trash2Icon aria-hidden="true" size={16} />}
    </Button>
  );
};

export type TerminalContentProps = HTMLAttributes<HTMLDivElement>;

export const TerminalContent = ({ className, children, ...props }: TerminalContentProps) => {
  const { output, isStreaming, autoScroll } = useContext(TerminalContext);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [output, autoScroll]);

  return (
    <div
      className={cn("ai-terminal-content max-h-96 overflow-auto p-4 font-mono text-[12px] leading-6", className)}
      role="region"
      aria-label="Terminal output"
      tabIndex={0}
      ref={containerRef}
      {...props}
    >
      {children ?? (
        <pre className="whitespace-pre-wrap break-words">
          <AnsiOutput output={output} />
          {isStreaming && <span aria-hidden="true" className="ai-terminal-cursor" />}
        </pre>
      )}
    </div>
  );
};

export type TerminalProps = HTMLAttributes<HTMLDivElement> & {
  output: string;
  isStreaming?: boolean;
  autoScroll?: boolean;
  onClear?: () => void;
};

export const Terminal = ({
  output,
  isStreaming = false,
  autoScroll = true,
  onClear,
  className,
  children,
  ...props
}: TerminalProps) => {
  const contextValue = useMemo(
    () => ({ autoScroll, isStreaming, onClear, output }),
    [autoScroll, isStreaming, onClear, output],
  );

  return (
    <TerminalContext.Provider value={contextValue}>
      <div
        className={cn(
          "ai-terminal flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card text-foreground",
          className,
        )}
        {...props}
      >
        {children ?? (
          <>
            <TerminalHeader>
              <TerminalTitle />
              <div className="flex items-center gap-1">
                <TerminalStatus />
                <TerminalActions>
                  <TerminalCopyButton />
                  {onClear && <TerminalClearButton />}
                </TerminalActions>
              </div>
            </TerminalHeader>
            <TerminalContent />
          </>
        )}
      </div>
    </TerminalContext.Provider>
  );
};
