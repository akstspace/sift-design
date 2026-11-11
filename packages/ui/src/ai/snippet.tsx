import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@sift-design/ui/input-group";
import { cn } from "cn";
import { type ComponentProps, createContext, useContext, useMemo } from "react";
import { CodeCopyFeedback, useCodeClipboard } from "./code-block";

const SnippetContext = createContext({ code: "" });
export type SnippetProps = ComponentProps<typeof InputGroup> & { code: string };
export const Snippet = ({ code, className, children, ...props }: SnippetProps) => {
  const contextValue = useMemo(() => ({ code }), [code]);
  return (
    <SnippetContext.Provider value={contextValue}>
      <InputGroup data-slot="snippet" className={cn("ai-snippet bg-card font-mono", className)} {...props}>
        {children}
      </InputGroup>
    </SnippetContext.Provider>
  );
};
export type SnippetAddonProps = ComponentProps<typeof InputGroupAddon>;
export const SnippetAddon = (props: SnippetAddonProps) => <InputGroupAddon {...props} />;
export type SnippetTextProps = ComponentProps<typeof InputGroupText>;
export const SnippetText = ({ className, ...props }: SnippetTextProps) => (
  <InputGroupText className={cn("font-mono text-[12px] font-normal text-muted-foreground", className)} {...props} />
);
export type SnippetInputProps = Omit<ComponentProps<typeof InputGroupInput>, "readOnly" | "value">;
export const SnippetInput = ({ className, ...props }: SnippetInputProps) => {
  const { code } = useContext(SnippetContext);
  return (
    <InputGroupInput
      aria-label="Command"
      className={cn("min-w-0 font-mono text-[12px] text-foreground", className)}
      readOnly
      value={code}
      {...props}
    />
  );
};
export type SnippetCopyButtonProps = ComponentProps<typeof InputGroupButton> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};
export const SnippetCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  onClick,
  ...props
}: SnippetCopyButtonProps) => {
  const { code } = useContext(SnippetContext);
  const { state, copy } = useCodeClipboard(code, { onCopy, onError, timeout });
  return (
    <InputGroupButton
      data-slot="snippet-copy-button"
      data-copy-state={state}
      aria-label={
        state === "copied" ? "Copied command" : state === "failed" ? "Copy failed. Try again" : "Copy command"
      }
      className={cn("ai-snippet-copy", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) void copy();
      }}
      size="icon-sm"
      title={state === "copied" ? "Copied" : "Copy command"}
      {...props}
    >
      <CodeCopyFeedback state={state}>
        {children ?? <span className="sr-only">{state === "copied" ? "Copied" : "Copy command"}</span>}
      </CodeCopyFeedback>
      <span className="sr-only" role="status">
        {state === "copied" ? "Command copied to clipboard" : state === "failed" ? "Could not copy command" : ""}
      </span>
    </InputGroupButton>
  );
};
