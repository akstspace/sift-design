import { Button } from "@sift-design/ui/button";
import { ButtonGroup } from "@sift-design/ui/button-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@sift-design/ui/tooltip";
import { duration, leave, spring } from "@sift-design/tokens/motion";
import { IconChevronLeft, IconChevronRight, IconPaperclip, IconX } from "@tabler/icons-react";
import type { FileUIPart, UIMessage } from "ai";
import { cn } from "cn";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import type { ComponentProps, HTMLAttributes, ReactElement, ReactNode } from "react";
import {
  Children,
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Components, ExtraProps } from "streamdown";
import { defaultComponents, Streamdown, StreamdownContext } from "streamdown";
import { CodeBlock, CodeBlockHeader, CodeBlockLanguage } from "./code-block";

export type MessageProps = HTMLAttributes<HTMLDivElement> & { from: UIMessage["role"] };

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    data-slot="ai-message"
    data-from={from}
    className={cn(
      "group flex w-full min-w-0 flex-col gap-2 text-[14px]",
      from === "user" ? "is-user ml-auto max-w-[80%] items-end" : "is-assistant",
      className,
    )}
    {...props}
  />
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({ children, className, ...props }: MessageContentProps) => (
  <div
    data-slot="ai-message-content"
    className={cn(
      "flex w-fit max-w-full min-w-0 flex-col gap-2 text-[14px] leading-relaxed wrap-break-word text-foreground",
      "group-[.is-user]:ml-auto group-[.is-user]:rounded-[20px] group-[.is-user]:bg-subtle group-[.is-user]:px-[16px] group-[.is-user]:py-[8px]",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export type MessageActionsProps = ComponentProps<"div">;

export const MessageActions = ({ className, children, ...props }: MessageActionsProps) => (
  <div data-slot="ai-message-actions" className={cn("flex flex-wrap items-center gap-1", className)} {...props}>
    {children}
  </div>
);

export type MessageActionProps = ComponentProps<typeof Button> & { tooltip?: string; label?: string };

export const MessageAction = ({
  tooltip,
  children,
  label,
  variant = "ghost",
  size = "icon-sm",
  ...props
}: MessageActionProps) => {
  const button = (
    <Button size={size} type="button" variant={variant} {...props}>
      {children}
      {(label || tooltip) && <span className="sr-only">{label || tooltip}</span>}
    </Button>
  );
  return tooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    button
  );
};

type MessageBranchContextType = {
  currentBranch: number;
  totalBranches: number;
  direction: 1 | -1;
  goToPrevious: () => void;
  goToNext: () => void;
  branches: ReactElement[];
  setBranches: (branches: ReactElement[]) => void;
};
const MessageBranchContext = createContext<MessageBranchContextType | null>(null);
const useMessageBranch = () => {
  const context = useContext(MessageBranchContext);
  if (!context) throw new Error("MessageBranch components must be used within MessageBranch");
  return context;
};

export type MessageBranchProps = HTMLAttributes<HTMLDivElement> & {
  defaultBranch?: number;
  onBranchChange?: (branchIndex: number) => void;
};

export const MessageBranch = ({ defaultBranch = 0, onBranchChange, className, ...props }: MessageBranchProps) => {
  const [currentBranch, setCurrentBranch] = useState(Math.max(0, defaultBranch));
  const [branches, setBranches] = useState<ReactElement[]>([]);
  const [direction, setDirection] = useState<1 | -1>(1);
  // Keep selection valid when an answer is removed, without announcing a user action.
  useEffect(() => {
    if (branches.length) setCurrentBranch((current) => Math.min(current, branches.length - 1));
  }, [branches.length]);
  const change = useCallback(
    (step: 1 | -1) => {
      if (branches.length <= 1) return;
      const next = (currentBranch + step + branches.length) % branches.length;
      setDirection(step);
      setCurrentBranch(next);
      onBranchChange?.(next);
    },
    [branches.length, currentBranch, onBranchChange],
  );
  const goToPrevious = useCallback(() => change(-1), [change]);
  const goToNext = useCallback(() => change(1), [change]);
  const contextValue = useMemo<MessageBranchContextType>(
    () => ({
      currentBranch,
      totalBranches: branches.length,
      direction,
      goToPrevious,
      goToNext,
      branches,
      setBranches,
    }),
    [currentBranch, direction, goToPrevious, goToNext, branches],
  );
  return (
    <MessageBranchContext.Provider value={contextValue}>
      <div data-slot="ai-message-branch" className={cn("grid w-full min-w-0 gap-2", className)} {...props} />
    </MessageBranchContext.Provider>
  );
};

// Keep every answer mounted, including local state. Only the active answer can receive focus.
function BranchPanel({ active, direction, children }: { active: boolean; direction: 1 | -1; children: ReactNode }) {
  const reduced = !!useReducedMotion();
  const controls = useAnimationControls();
  const previous = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    const first = previous.current === null;
    if (previous.current === active && !first) return;
    previous.current = active;
    if (first) {
      controls.set({ opacity: active ? 1 : 0, x: 0, visibility: active ? "visible" : "hidden" });
      return;
    }
    if (active) {
      controls.set({ x: reduced ? 0 : direction * 14, opacity: 0, visibility: "visible" });
      void controls.start({
        opacity: 1,
        x: 0,
        transition: reduced
          ? { duration: duration.quick }
          : {
              ...spring.smooth,
              opacity: { duration: duration.quick, ease: "linear" },
            },
      });
    } else {
      void controls.start({
        opacity: 0,
        x: reduced ? 0 : direction * -10,
        transition: reduced
          ? { duration: duration.instant }
          : {
              ...spring.exit,
              opacity: { duration: duration.instant, ease: leave },
            },
        transitionEnd: { visibility: "hidden" },
      });
    }
  }, [active, direction, reduced, controls]);
  return (
    <div
      data-active={active}
      aria-hidden={!active}
      inert={!active}
      className={active ? "relative min-w-0" : "absolute inset-x-0 top-0 min-w-0"}
    >
      <motion.div initial={false} animate={controls} className="grid min-w-0 gap-2">
        {children}
      </motion.div>
    </div>
  );
}

export type MessageBranchContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageBranchContent = ({ children, className, ...props }: MessageBranchContentProps) => {
  const { currentBranch, direction, setBranches, branches } = useMessageBranch();
  const childrenArray = useMemo(() => Children.toArray(children) as ReactElement[], [children]);
  useEffect(() => {
    if (branches.length !== childrenArray.length) setBranches(childrenArray);
  }, [childrenArray, branches.length, setBranches]);
  return (
    <div data-slot="ai-message-branch-content" className={cn("relative min-w-0 overflow-clip", className)} {...props}>
      {childrenArray.map((branch, index) => (
        <BranchPanel key={branch.key ?? index} active={index === currentBranch} direction={direction}>
          {branch}
        </BranchPanel>
      ))}
    </div>
  );
};

export type MessageBranchSelectorProps = ComponentProps<typeof ButtonGroup> & { from?: UIMessage["role"] };
export const MessageBranchSelector = ({ className, from, ...props }: MessageBranchSelectorProps) => {
  const { totalBranches } = useMessageBranch();
  if (totalBranches <= 1) return null;
  return (
    <ButtonGroup
      data-slot="ai-message-branch-selector"
      data-from={from}
      aria-label="Response versions"
      className={cn("items-center gap-0.5", from === "user" && "ml-auto", className)}
      orientation="horizontal"
      {...props}
    />
  );
};

export type MessageBranchPreviousProps = ComponentProps<typeof Button>;
export const MessageBranchPrevious = ({ children, onClick, ...props }: MessageBranchPreviousProps) => {
  const { goToPrevious, totalBranches } = useMessageBranch();
  return (
    <Button
      aria-label="Previous branch"
      disabled={totalBranches <= 1}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) goToPrevious();
      }}
      size="icon-sm"
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? <IconChevronLeft aria-hidden size={14} />}
    </Button>
  );
};

export type MessageBranchNextProps = ComponentProps<typeof Button>;
export const MessageBranchNext = ({ children, onClick, ...props }: MessageBranchNextProps) => {
  const { goToNext, totalBranches } = useMessageBranch();
  return (
    <Button
      aria-label="Next branch"
      disabled={totalBranches <= 1}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) goToNext();
      }}
      size="icon-sm"
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? <IconChevronRight aria-hidden size={14} />}
    </Button>
  );
};

export type MessageBranchPageProps = HTMLAttributes<HTMLSpanElement>;
export const MessageBranchPage = ({ className, ...props }: MessageBranchPageProps) => {
  const { currentBranch, totalBranches } = useMessageBranch();
  return (
    <span
      data-slot="ai-message-branch-page"
      aria-live="polite"
      aria-atomic="true"
      className={cn("px-2 font-mono text-[12px] tabular-nums text-muted-foreground", className)}
      {...props}
    >
      {totalBranches ? currentBranch + 1 : 0} of {totalBranches}
    </span>
  );
};

export type MessageResponseProps = ComponentProps<typeof Streamdown>;

function codeText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") return String(child);
      return typeof child === "object" && child !== null && "props" in child
        ? codeText((child as ReactElement<{ children?: ReactNode }>).props.children)
        : "";
    })
    .join("");
}

function MessageCode({
  node,
  children,
  className,
  ...props
}: ComponentProps<"code"> & ExtraProps & { "data-block"?: string }) {
  const { lineNumbers, codeBlockMaxHeight } = useContext(StreamdownContext);
  const DefaultCode = defaultComponents.code;
  if (!("data-block" in props))
    return (
      <DefaultCode node={node} className={className} {...props}>
        {children}
      </DefaultCode>
    );
  const language = className?.match(/language-([^\s]+)/)?.[1] || "text";
  const meta = typeof node?.properties.metastring === "string" ? node.properties.metastring : "";
  if (/\bstartLine=\d+/.test(meta))
    return (
      <DefaultCode node={node} className={className} {...props}>
        {children}
      </DefaultCode>
    );
  const code = codeText(children).replace(/\n$/, "");
  return (
    <CodeBlock
      code={code}
      language={language as ComponentProps<typeof CodeBlock>["language"]}
      showLineNumbers={lineNumbers && !/\bnoLineNumbers\b/.test(meta)}
      className="ai-message-code"
      style={
        {
          "--message-code-max-height":
            typeof codeBlockMaxHeight === "number"
              ? codeBlockMaxHeight > 0 && Number.isFinite(codeBlockMaxHeight)
                ? `${codeBlockMaxHeight}px`
                : "none"
              : codeBlockMaxHeight,
        } as import("react").CSSProperties
      }
    >
      <CodeBlockHeader>
        <CodeBlockLanguage>{language}</CodeBlockLanguage>
      </CodeBlockHeader>
    </CodeBlock>
  );
}

// Explicit plugins retain their native renderer. Consumer component overrides always win.
export const MessageResponse = memo(
  ({ className, components, plugins, controls = false, ...props }: MessageResponseProps) => {
    const responseComponents = useMemo<Components>(
      () => ({
        ...(!controls && !plugins?.code && !plugins?.mermaid && !plugins?.renderers?.length
          ? { code: MessageCode }
          : {}),
        ...components,
      }),
      [components, controls, plugins?.code, plugins?.mermaid, plugins?.renderers],
    );
    return (
      <Streamdown
        controls={controls}
        animated={false}
        className={cn("ai-message-response w-full min-w-0", className)}
        components={responseComponents}
        plugins={plugins}
        {...props}
      />
    );
  },
);
MessageResponse.displayName = "MessageResponse";

export type MessageAttachmentProps = HTMLAttributes<HTMLDivElement> & {
  data: FileUIPart;
  className?: string;
  onRemove?: () => void;
};
export function MessageAttachment({ data, className, onRemove, ...props }: MessageAttachmentProps) {
  const isImage = data.mediaType?.startsWith("image/") && !!data.url;
  const label = data.filename || (isImage ? "Image" : "Attachment");
  return (
    <div
      data-slot="ai-message-attachment"
      data-kind={isImage ? "image" : "file"}
      className={cn(
        "relative flex max-w-full items-center gap-2 rounded-lg bg-tint text-[13px] text-foreground",
        isImage ? "size-24" : "rounded-full px-3 py-1",
        className,
      )}
      {...props}
    >
      {isImage ? (
        <img alt={label} className="size-full rounded-lg object-cover" height={96} width={96} src={data.url} />
      ) : (
        <>
          <IconPaperclip aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 break-all">{label}</span>
        </>
      )}
      {onRemove && (
        <Button
          aria-label={`Remove ${label}`}
          size="icon-sm"
          className={cn("size-7 shrink-0 rounded-full p-0", isImage && "absolute top-1 right-1 bg-card")}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          type="button"
          variant="ghost"
        >
          <IconX aria-hidden className="size-3" />
        </Button>
      )}
    </div>
  );
}

export type MessageAttachmentsProps = ComponentProps<"div">;
export function MessageAttachments({ children, className, ...props }: MessageAttachmentsProps) {
  if (!children) return null;
  return (
    <div
      data-slot="ai-message-attachments"
      className={cn("ml-auto flex max-w-full w-fit flex-wrap items-start gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export type MessageToolbarProps = ComponentProps<"div">;
export const MessageToolbar = ({ className, children, ...props }: MessageToolbarProps) => (
  <div
    data-slot="ai-message-toolbar"
    className={cn("mt-3 flex w-full flex-wrap items-center justify-between gap-2", className)}
    {...props}
  >
    {children}
  </div>
);
