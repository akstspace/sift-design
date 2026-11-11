import { Badge } from "@sift-design/ui/badge";
import { Button } from "@sift-design/ui/button";
import { Switch } from "@sift-design/ui/switch";
import { cn } from "cn";
import {
  IconEye as EyeIcon,
  IconEyeOff as EyeOffIcon,
} from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { duration, spring } from "@sift-design/tokens/motion";
import type { ComponentProps, HTMLAttributes } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CopyStateIcon } from "./copy-icon";

interface EnvironmentVariablesContextType {
  showValues: boolean;
  setShowValues: (show: boolean) => void;
}

// Default noop for context default value
// oxlint-disable-next-line eslint(no-empty-function)
const noop = () => {};

const EnvironmentVariablesContext = createContext<EnvironmentVariablesContextType>({
  setShowValues: noop,
  showValues: false,
});

export type EnvironmentVariablesProps = HTMLAttributes<HTMLDivElement> & {
  showValues?: boolean;
  defaultShowValues?: boolean;
  onShowValuesChange?: (show: boolean) => void;
};

export const EnvironmentVariables = ({
  showValues: controlledShowValues,
  defaultShowValues = false,
  onShowValuesChange,
  className,
  children,
  ...props
}: EnvironmentVariablesProps) => {
  const [internalShowValues, setInternalShowValues] = useState(defaultShowValues);
  const showValues = controlledShowValues ?? internalShowValues;

  const setShowValues = useCallback(
    (show: boolean) => {
      setInternalShowValues(show);
      onShowValuesChange?.(show);
    },
    [onShowValuesChange],
  );

  const contextValue = useMemo(() => ({ setShowValues, showValues }), [setShowValues, showValues]);

  return (
    <EnvironmentVariablesContext.Provider value={contextValue}>
      <div className={cn("rounded-lg border bg-card", className)} {...props}>
        {children}
      </div>
    </EnvironmentVariablesContext.Provider>
  );
};

export type EnvironmentVariablesHeaderProps = HTMLAttributes<HTMLDivElement>;

export const EnvironmentVariablesHeader = ({ className, children, ...props }: EnvironmentVariablesHeaderProps) => (
  <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3", className)} {...props}>
    {children}
  </div>
);

export type EnvironmentVariablesTitleProps = HTMLAttributes<HTMLHeadingElement>;

export const EnvironmentVariablesTitle = ({ className, children, ...props }: EnvironmentVariablesTitleProps) => (
  <h3 className={cn("font-medium text-[13px]", className)} {...props}>
    {children ?? "Environment variables"}
  </h3>
);

export type EnvironmentVariablesToggleProps = ComponentProps<typeof Switch>;

export const EnvironmentVariablesToggle = ({ className, ...props }: EnvironmentVariablesToggleProps) => {
  const { showValues, setShowValues } = useContext(EnvironmentVariablesContext);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <StateIcon
        active={showValues}
        on={<EyeIcon aria-hidden size={16} />}
        off={<EyeOffIcon aria-hidden size={16} />}
      />
      <span className="text-[12px] text-muted-foreground">Show values</span>
      <Switch aria-label="Toggle value visibility" checked={showValues} onCheckedChange={setShowValues} {...props} />
    </div>
  );
};

export type EnvironmentVariablesContentProps = HTMLAttributes<HTMLDivElement>;

export const EnvironmentVariablesContent = ({ className, children, ...props }: EnvironmentVariablesContentProps) => (
  <div className={cn("divide-y", className)} {...props}>
    {children}
  </div>
);

interface EnvironmentVariableContextType {
  name: string;
  value: string;
}

const EnvironmentVariableContext = createContext<EnvironmentVariableContextType>({
  name: "",
  value: "",
});

export type EnvironmentVariableGroupProps = HTMLAttributes<HTMLDivElement>;

export const EnvironmentVariableGroup = ({ className, children, ...props }: EnvironmentVariableGroupProps) => (
  <div className={cn("flex items-center gap-2", className)} {...props}>
    {children}
  </div>
);

export type EnvironmentVariableNameProps = HTMLAttributes<HTMLSpanElement>;

export const EnvironmentVariableName = ({ className, children, ...props }: EnvironmentVariableNameProps) => {
  const { name } = useContext(EnvironmentVariableContext);

  return (
    <span className={cn("min-w-0 break-all font-mono text-[12px]", className)} {...props}>
      {children ?? name}
    </span>
  );
};

export type EnvironmentVariableValueProps = HTMLAttributes<HTMLSpanElement>;

export const EnvironmentVariableValue = ({ className, children, ...props }: EnvironmentVariableValueProps) => {
  const { value } = useContext(EnvironmentVariableContext);
  const { showValues } = useContext(EnvironmentVariablesContext);

  const displayValue = showValues ? value : "•".repeat(Math.min(value.length, 20));

  return (
    <span
      className={cn(
        "min-w-0 break-all font-mono text-muted-foreground text-[12px]",
        !showValues && "select-none",
        className,
      )}
      aria-label={showValues ? undefined : "Value hidden"}
      {...props}
    >
      {children ?? displayValue}
    </span>
  );
};

export type EnvironmentVariableProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  value: string;
};

export const EnvironmentVariable = ({ name, value, className, children, ...props }: EnvironmentVariableProps) => {
  const envVarContextValue = useMemo(() => ({ name, value }), [name, value]);

  return (
    <EnvironmentVariableContext.Provider value={envVarContextValue}>
      <div className={cn("flex flex-wrap items-center justify-between gap-3 px-4 py-3", className)} {...props}>
        {children ?? (
          <>
            <div className="flex items-center gap-2">
              <EnvironmentVariableName />
            </div>
            <EnvironmentVariableValue />
          </>
        )}
      </div>
    </EnvironmentVariableContext.Provider>
  );
};

export type EnvironmentVariableCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
  copyFormat?: "name" | "value" | "export";
};

export const EnvironmentVariableCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  copyFormat = "value",
  children,
  className,
  ...props
}: EnvironmentVariableCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const mounted = useRef(true);
  const timeoutRef = useRef<number>(0);
  const { name, value } = useContext(EnvironmentVariableContext);

  const getTextToCopy = useCallback((): string => {
    const formatMap = {
      export: () => `export ${name}='${value.replaceAll("'", "'\\''")}'`,
      name: () => name,
      value: () => value,
    };
    return formatMap[copyFormat]();
  }, [name, value, copyFormat]);

  const copyToClipboard = useCallback(async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      setCopyError(true);
      onError?.(new Error("Clipboard API not available"));
      return;
    }

    try {
      await navigator.clipboard.writeText(getTextToCopy());
      if (!mounted.current) return;
      window.clearTimeout(timeoutRef.current);
      setCopyError(false);
      setIsCopied(true);
      onCopy?.();
      timeoutRef.current = window.setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      if (!mounted.current) return;
      setCopyError(true);
      onError?.(error as Error);
    }
  }, [getTextToCopy, onCopy, onError, timeout]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <Button
        aria-label={isCopied ? `Copied ${name}` : `Copy ${copyFormat} for ${name}`}
        title={isCopied ? "Copied" : "Copy value"}
        className={cn("size-8 shrink-0", isCopied && "text-good", className)}
        onClick={copyToClipboard}
        size="icon"
        variant="ghost"
        {...props}
      >
        {children ?? <CopyStateIcon state={isCopied ? "copied" : "idle"} />}
      </Button>
      <span role="status" className="sr-only">
        {isCopied ? `Copied ${name}.` : copyError ? `Could not copy ${name}.` : ""}
      </span>
    </>
  );
};

export type EnvironmentVariableRequiredProps = ComponentProps<typeof Badge>;

export const EnvironmentVariableRequired = ({ className, children, ...props }: EnvironmentVariableRequiredProps) => (
  <Badge className={cn("bg-tint text-warn text-[12px]", className)} variant="secondary" {...props}>
    {children ?? "Required"}
  </Badge>
);

function StateIcon({ active, on, off }: { active: boolean; on: React.ReactNode; off: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <span aria-hidden="true" className="relative inline-flex size-4 shrink-0 items-center justify-center">
      <AnimatePresence initial={false}>
        <motion.span
          key={String(active)}
          className="absolute inline-flex"
          initial={{ opacity: 0, scale: reduced ? 1 : 0.75, rotate: reduced ? 0 : -25 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{
            opacity: 0,
            scale: reduced ? 1 : 0.85,
            transition: reduced
              ? { duration: duration.instant }
              : { ...spring.exit, opacity: { duration: duration.instant } },
          }}
          transition={{
            ...(reduced ? { duration: duration.instant } : spring.snappy),
            opacity: { duration: duration.instant },
          }}
        >
          {active ? on : off}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
