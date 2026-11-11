import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { duration as motionDuration } from "@sift-design/tokens/motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { IconBrain, IconChevronDown } from "@tabler/icons-react";
import { cn } from "cn";
import { AnimatePresence, motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { Shimmer } from "./shimmer";

type ReasoningContextValue = {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration: number | undefined;
};

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

export const useReasoning = () => {
  const context = useContext(ReasoningContext);
  if (!context) throw new Error("Reasoning components must be used within Reasoning");
  return context;
};

export type ReasoningProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
};

const AUTO_CLOSE_DELAY = 1000;

export const Reasoning = memo(
  ({
    className,
    isStreaming = false,
    open,
    defaultOpen,
    onOpenChange,
    duration: durationProp,
    children,
    ...props
  }: ReasoningProps) => {
    const isExplicitlyClosed = defaultOpen === false;
    const [isOpen, setIsOpen] = useControllableState({
      prop: open,
      defaultProp: defaultOpen ?? isStreaming,
      onChange: onOpenChange,
    });
    const [duration, setDuration] = useControllableState<number | undefined>({
      prop: durationProp,
      defaultProp: undefined,
    });
    const [hasAutoClosed, setHasAutoClosed] = useState(false);
    const startTime = useRef<number | null>(null);
    const hasEverStreamed = useRef(isStreaming);

    useEffect(() => {
      if (isStreaming) {
        hasEverStreamed.current = true;
        if (startTime.current === null) startTime.current = Date.now();
        setHasAutoClosed(false);
      } else if (startTime.current !== null) {
        setDuration(Math.ceil((Date.now() - startTime.current) / 1000));
        startTime.current = null;
      }
    }, [isStreaming, setDuration]);

    useEffect(() => {
      if (isStreaming && !isOpen && !isExplicitlyClosed) setIsOpen(true);
    }, [isStreaming, isOpen, isExplicitlyClosed, setIsOpen]);

    useEffect(() => {
      if (hasEverStreamed.current && !isStreaming && isOpen && !hasAutoClosed) {
        const timer = setTimeout(() => {
          setIsOpen(false);
          setHasAutoClosed(true);
        }, AUTO_CLOSE_DELAY);
        return () => clearTimeout(timer);
      }
    }, [isStreaming, isOpen, hasAutoClosed, setIsOpen]);

    const contextValue = useMemo(
      () => ({ isStreaming, isOpen, setIsOpen, duration }),
      [isStreaming, isOpen, setIsOpen, duration],
    );

    return (
      <ReasoningContext.Provider value={contextValue}>
        <Collapsible
          data-slot="reasoning"
          data-streaming={isStreaming}
          className={cn("not-prose w-full text-[13px]", className)}
          onOpenChange={setIsOpen}
          open={isOpen}
          {...props}
        >
          {children}
        </Collapsible>
      </ReasoningContext.Provider>
    );
  },
);

export type ReasoningTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode;
};

const defaultGetThinkingMessage = (isStreaming: boolean, duration?: number) => {
  if (isStreaming || duration === 0)
    return (
      <Shimmer as="span" duration={1}>
        Thinking…
      </Shimmer>
    );
  if (duration === undefined) return <span>Thought for a few seconds</span>;
  return (
    <span>
      Thought for <span className="font-mono tabular-nums">{duration}</span> {duration === 1 ? "second" : "seconds"}
    </span>
  );
};

export const ReasoningTrigger = memo(
  ({ className, children, getThinkingMessage = defaultGetThinkingMessage, ...props }: ReasoningTriggerProps) => {
    const { isStreaming, isOpen, duration } = useReasoning();
    return (
      <CollapsibleTrigger
        data-slot="reasoning-trigger"
        className={cn(
          "ai-reasoning-trigger flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] text-muted-foreground hover:bg-tint hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        {...props}
      >
        {children ?? (
          <>
            <IconBrain aria-hidden="true" className="size-4 shrink-0" stroke={1.6} />
            <span className="grid flex-1" aria-live="polite" aria-atomic="true">
              <AnimatePresence initial={false}>
                <motion.span
                  key={isStreaming ? "thinking" : "thought"}
                  className="col-start-1 row-start-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: motionDuration.quick } }}
                  exit={{ opacity: 0, transition: { duration: motionDuration.instant } }}
                >
                  {getThinkingMessage(isStreaming, duration)}
                </motion.span>
              </AnimatePresence>
            </span>
            <IconChevronDown
              aria-hidden="true"
              className="ai-reasoning-chevron size-4 shrink-0"
              data-open={isOpen}
              stroke={1.6}
            />
          </>
        )}
      </CollapsibleTrigger>
    );
  },
);

export type ReasoningContentProps = ComponentProps<typeof CollapsibleContent> & {
  children: string;
  plugins?: ComponentProps<typeof Streamdown>["plugins"];
};

export const ReasoningContent = memo(({ className, children, plugins, ...props }: ReasoningContentProps) => {
  const { isStreaming } = useReasoning();
  return (
    <CollapsibleContent
      data-slot="reasoning-content"
      className={cn(
        "ml-4 border-l border-border py-3 pl-4 pr-2 text-[13px] leading-relaxed text-muted-foreground",
        className,
      )}
      {...props}
    >
      <Streamdown isAnimating={isStreaming} plugins={plugins}>
        {children}
      </Streamdown>
    </CollapsibleContent>
  );
});

Reasoning.displayName = "Reasoning";
ReasoningTrigger.displayName = "ReasoningTrigger";
ReasoningContent.displayName = "ReasoningContent";
