import { IconAlertCircle } from "@tabler/icons-react";
import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { TProps as JsxParserProps } from "react-jsx-parser";
import JsxParser from "react-jsx-parser";

interface JSXPreviewContextValue {
  jsx: string;
  processedJsx: string;
  isStreaming: boolean;
  error: Error | null;
  setError: (error: Error | null) => void;
  setLastGoodJsx: (jsx: string) => void;
  components: JsxParserProps["components"];
  bindings: JsxParserProps["bindings"];
  componentsOnly: boolean;
  allowUnknownElements: boolean;
  onErrorProp?: (error: Error) => void;
}
const JSXPreviewContext = createContext<JSXPreviewContextValue | null>(null);
export const useJSXPreview = () => {
  const context = useContext(JSXPreviewContext);
  if (!context) throw new Error("JSXPreview components must be used within JSXPreview");
  return context;
};

// Ignore angle brackets inside quoted attributes. Partial expressions fall back to the last valid render.
const TAG_REGEX = /<\/?([a-zA-Z][\w.:-]*)(?:\s+(?:[^>"']|"[^"]*"|'[^']*')*)?\s*\/?>/g;
const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);
const completeJsxTag = (code: string) => {
  const stack: string[] = [];
  let lastEnd = 0;
  for (const match of code.matchAll(TAG_REGEX)) {
    const [tag, name] = match;
    lastEnd = (match.index ?? 0) + tag.length;
    if (tag.startsWith("</")) {
      if (stack.at(-1) === name) stack.pop();
    } else if (!tag.endsWith("/>") && !VOID_TAGS.has(name)) {
      stack.push(name);
    }
  }
  const tail = code.slice(lastEnd);
  const partial = tail.lastIndexOf("<");
  const complete = partial >= 0 ? code.slice(0, lastEnd + partial) : code;
  return (
    complete +
    [...stack]
      .reverse()
      .map((tag) => `</${tag}>`)
      .join("")
  );
};

export type JSXPreviewProps = ComponentProps<"div"> & {
  jsx: string;
  isStreaming?: boolean;
  components?: JsxParserProps["components"];
  bindings?: JsxParserProps["bindings"];
  onError?: (error: Error) => void;
  /** Restrict rendering to the explicitly supplied components. This is not an isolation boundary. */
  componentsOnly?: boolean;
  allowUnknownElements?: boolean;
};
export const JSXPreview = memo(
  ({
    jsx,
    isStreaming = false,
    components,
    bindings,
    onError,
    componentsOnly = false,
    allowUnknownElements = true,
    className,
    children,
    ...props
  }: JSXPreviewProps) => {
    const [previous, setPrevious] = useState({ jsx, isStreaming });
    const [error, setError] = useState<Error | null>(null);
    const [, setLastGoodJsx] = useState("");
    if (jsx !== previous.jsx || isStreaming !== previous.isStreaming) {
      setPrevious({ jsx, isStreaming });
      setError(null);
    }
    const processedJsx = useMemo(() => (isStreaming ? completeJsxTag(jsx) : jsx), [jsx, isStreaming]);
    const context = useMemo(
      () => ({
        jsx,
        processedJsx,
        isStreaming,
        error,
        setError,
        setLastGoodJsx,
        components,
        bindings,
        onErrorProp: onError,
        componentsOnly,
        allowUnknownElements,
      }),
      [jsx, processedJsx, isStreaming, error, components, bindings, onError, componentsOnly, allowUnknownElements],
    );
    return (
      <JSXPreviewContext.Provider value={context}>
        <div
          data-slot="jsx-preview"
          data-state={error ? "error" : isStreaming ? "streaming" : "ready"}
          className={cn("relative min-w-0", className)}
          {...props}
        >
          {children}
        </div>
      </JSXPreviewContext.Provider>
    );
  },
);
JSXPreview.displayName = "JSXPreview";

export type JSXPreviewContentProps = Omit<ComponentProps<"div">, "children">;
export const JSXPreviewContent = memo(({ className, ...props }: JSXPreviewContentProps) => {
  const {
    processedJsx,
    isStreaming,
    components,
    bindings,
    setError,
    setLastGoodJsx,
    onErrorProp,
    componentsOnly,
    allowUnknownElements,
  } = useJSXPreview();
  const lastGood = useRef("");
  const parseError = useRef<{ jsx: string; error: Error } | null>(null);
  const reported = useRef<string | null>(null);
  const [attempt, setAttempt] = useState({ jsx: processedJsx, isStreaming, failed: false });
  if (attempt.jsx !== processedJsx || attempt.isStreaming !== isStreaming) {
    setAttempt({ jsx: processedJsx, isStreaming, failed: false });
  }
  // Parser callbacks run while its child renders. Defer parent updates until the commit effect.
  const handleError = useCallback(
    (error: Error) => {
      parseError.current = { jsx: processedJsx, error };
    },
    [processedJsx],
  );
  useEffect(() => {
    const failure = parseError.current?.jsx === processedJsx ? parseError.current : null;
    if (failure) {
      if (isStreaming) setAttempt({ jsx: processedJsx, isStreaming, failed: true });
      else if (reported.current !== processedJsx) {
        reported.current = processedJsx;
        setError(failure.error);
        onErrorProp?.(failure.error);
      }
    } else {
      reported.current = null;
      lastGood.current = processedJsx;
      setLastGoodJsx(processedJsx);
    }
    parseError.current = null;
  }, [processedJsx, isStreaming, onErrorProp, setError, setLastGoodJsx]);
  const displayJsx = isStreaming && attempt.failed ? lastGood.current : processedJsx;
  return (
    <div data-slot="jsx-preview-content" className={cn("jsx-preview-content min-w-0", className)} {...props}>
      <JsxParser
        jsx={displayJsx}
        components={components}
        bindings={bindings}
        componentsOnly={componentsOnly}
        allowUnknownElements={allowUnknownElements}
        onError={handleError}
        showWarnings={false}
        renderError={() => null}
        renderInWrapper={false}
      />
    </div>
  );
});
JSXPreviewContent.displayName = "JSXPreviewContent";

export type JSXPreviewErrorProps = ComponentProps<"div"> & { children?: ReactNode | ((error: Error) => ReactNode) };
export const JSXPreviewError = memo(({ className, children, ...props }: JSXPreviewErrorProps) => {
  const { error } = useJSXPreview();
  if (!error) return null;
  return (
    <div
      data-slot="jsx-preview-error"
      role="alert"
      className={cn("flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-[13px] text-destructive", className)}
      {...props}
    >
      {children ? (
        typeof children === "function" ? (
          children(error)
        ) : (
          children
        )
      ) : (
        <>
          <IconAlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span className="break-words">{error.message}</span>
        </>
      )}
    </div>
  );
});
JSXPreviewError.displayName = "JSXPreviewError";
