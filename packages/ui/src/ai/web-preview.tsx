import { Button } from "@sift-design/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { Input } from "@sift-design/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@sift-design/ui/tooltip";
import { cn } from "cn";
import { IconChevronDown } from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { arrivalMotion, reflowTransition } from "@sift-design/tokens/motion";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

export interface WebPreviewContextValue {
  url: string;
  setUrl: (url: string) => void;
  consoleOpen: boolean;
  setConsoleOpen: (open: boolean) => void;
}

const WebPreviewContext = createContext<WebPreviewContextValue | null>(null);

const useWebPreview = () => {
  const context = useContext(WebPreviewContext);
  if (!context) {
    throw new Error("WebPreview components must be used within a WebPreview");
  }
  return context;
};

export type WebPreviewProps = ComponentProps<"div"> & {
  defaultUrl?: string;
  url?: string;
  onUrlChange?: (url: string) => void;
};

export const WebPreview = ({
  className,
  children,
  defaultUrl = "",
  url: controlledUrl,
  onUrlChange,
  ...props
}: WebPreviewProps) => {
  const [internalUrl, setUrl] = useState(defaultUrl);
  const url = controlledUrl ?? internalUrl;
  const [consoleOpen, setConsoleOpen] = useState(false);

  const handleUrlChange = useCallback(
    (newUrl: string) => {
      setUrl(newUrl);
      onUrlChange?.(newUrl);
    },
    [onUrlChange],
  );

  const contextValue = useMemo<WebPreviewContextValue>(
    () => ({ url, setUrl: handleUrlChange, consoleOpen, setConsoleOpen }),
    [url, handleUrlChange, consoleOpen],
  );

  return (
    <WebPreviewContext.Provider value={contextValue}>
      <div
        data-slot="ai-web-preview"
        className={cn(
          "ai-web-preview flex min-w-0 w-full flex-col overflow-hidden rounded-xl border bg-card",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </WebPreviewContext.Provider>
  );
};

export type WebPreviewNavigationProps = ComponentProps<"div">;

export const WebPreviewNavigation = ({ className, children, ...props }: WebPreviewNavigationProps) => (
  <div className={cn("flex min-w-0 flex-wrap items-center gap-1 border-b bg-tint p-2", className)} {...props}>
    {children}
  </div>
);

export type WebPreviewNavigationButtonProps = ComponentProps<typeof Button> & {
  tooltip?: string;
};

export const WebPreviewNavigationButton = ({
  onClick,
  disabled,
  tooltip,
  children,
  ...props
}: WebPreviewNavigationButtonProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={tooltip}
          type="button"
          className="size-8 shrink-0 p-0 text-muted-foreground hover:text-foreground"
          disabled={disabled}
          onClick={onClick}
          size="sm"
          variant="ghost"
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export type WebPreviewUrlProps = ComponentProps<typeof Input>;

export const WebPreviewUrl = ({ value, onChange, onKeyDown, ...props }: WebPreviewUrlProps) => {
  const { url, setUrl } = useWebPreview();
  const [prevUrl, setPrevUrl] = useState(url);
  const [inputValue, setInputValue] = useState(url);

  // Synchronize before commit so external navigation cannot paint a stale address.
  if (url !== prevUrl) {
    setPrevUrl(url);
    setInputValue(url);
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    onChange?.(event);
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        const target = event.target as HTMLInputElement;
        setUrl(target.value);
      }
      onKeyDown?.(event);
    },
    [setUrl, onKeyDown],
  );

  return (
    <Input
      aria-label="Preview URL"
      className="h-8 min-w-0 flex-1 font-mono text-[12px]"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="Enter a preview address"
      value={value ?? inputValue}
      {...props}
    />
  );
};

export type WebPreviewBodyProps = ComponentProps<"iframe"> & {
  loading?: ReactNode;
};

export const WebPreviewBody = ({ className, loading, src, srcDoc, ...props }: WebPreviewBodyProps) => {
  const { url } = useWebPreview();

  return (
    <div data-slot="ai-web-preview-body" className="relative min-h-72 flex-1">
      <iframe
        className={cn("block size-full min-h-72 border-0 bg-card", className)}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
        src={srcDoc ? undefined : (src ?? url) || undefined}
        srcDoc={srcDoc}
        title="Preview"
        {...props}
      />
      {loading}
    </div>
  );
};

export type WebPreviewConsoleProps = ComponentProps<"div"> & {
  logs?: Array<{
    id?: string;
    level: "log" | "warn" | "error";
    message: string;
    timestamp: Date;
  }>;
};

export const WebPreviewConsole = ({ className, logs = [], children, ...props }: WebPreviewConsoleProps) => {
  const { consoleOpen, setConsoleOpen } = useWebPreview();
  const reduced = !!useReducedMotion();

  return (
    <Collapsible
      className={cn("ai-web-preview-console border-t bg-tint text-[12px]", className)}
      onOpenChange={setConsoleOpen}
      open={consoleOpen}
      {...props}
    >
      <CollapsibleTrigger asChild>
        <Button
          className="flex h-10 w-full items-center justify-between rounded-none px-3 text-left text-[12px] font-medium"
          variant="ghost"
        >
          <span>
            Console <span className="ml-1 font-mono text-muted-foreground">{logs.length}</span>
          </span>
          <IconChevronDown aria-hidden className={cn("ai-preview-chevron size-4", consoleOpen && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        <div
          role="log"
          aria-label="Preview console output"
          aria-live="polite"
          aria-relevant="additions"
          className="max-h-40 space-y-1 overflow-y-auto font-mono"
        >
          {logs.length === 0 ? (
            <p className="text-muted-foreground">No console output</p>
          ) : (
            <AnimatePresence initial={false}>
              {logs.map((log) => (
                <motion.div
                  {...arrivalMotion(reduced)}
                  layout={reduced ? false : "position"}
                  transition={{ layout: reflowTransition(reduced) }}
                  className={cn(
                    "flex items-start gap-2 py-1 text-[12px]",
                    log.level === "error" && "text-danger",
                    log.level === "warn" && "text-warn",
                    log.level === "log" && "text-foreground",
                  )}
                  key={log.id ?? `${log.timestamp.getTime()}-${log.level}-${log.message}`}
                >
                  <span className="shrink-0 text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>{" "}
                  <span className="shrink-0">{log.level}</span>
                  <span className="break-words min-w-0">{log.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
