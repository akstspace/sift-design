import { Button } from "@sift-design/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@sift-design/ui/hover-card";
import { spring } from "@sift-design/tokens/motion";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "cn";
import type { LanguageModelUsage } from "ai";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

/** Rates in US dollars per million tokens. Cached and reasoning tokens are subsets, not extra tokens. */
export type ContextPricing = {
  input: number;
  output: number;
  cachedInput?: number;
  reasoning?: number;
};

export type ContextUsage = Partial<LanguageModelUsage> & {
  /** Compatibility with earlier usage objects. Prefer outputTokenDetails.reasoningTokens. */
  reasoningTokens?: number;
  /** Compatibility with earlier usage objects. Prefer inputTokenDetails.cacheReadTokens. */
  cachedInputTokens?: number;
};

type ContextSchema = {
  usedTokens: number;
  maxTokens: number;
  usage?: ContextUsage;
  modelId?: string;
  pricing?: ContextPricing;
};

type ContextValue = ContextSchema & {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
};
const ContextContext = createContext<ContextValue | null>(null);
const useContextValue = () => {
  const value = useContext(ContextContext);
  if (!value) throw new Error("Context components must be used within Context");
  return value;
};
const safeCount = (value = 0) => (Number.isFinite(value) ? Math.max(0, value) : 0);
const fraction = (used: number, max: number) => (max > 0 ? Math.min(1, safeCount(used) / max) : 0);
const percent = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(value);
const count = (value: number) => new Intl.NumberFormat("en-US").format(safeCount(value));
const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 4 }).format(value);

export type ContextProps = ComponentProps<typeof HoverCard> & ContextSchema;
export const Context = ({
  usedTokens,
  maxTokens,
  usage,
  modelId,
  pricing,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  ...props
}: ContextProps) => {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? localOpen;
  const contentId = useId();
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setLocalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );
  const contextValue = useMemo(
    () => ({ usedTokens, maxTokens, usage, modelId, pricing, open, setOpen, contentId }),
    [usedTokens, maxTokens, usage, modelId, pricing, open, setOpen, contentId],
  );
  return (
    <ContextContext.Provider value={contextValue}>
      <HoverCard openDelay={150} closeDelay={100} {...props} open={open} onOpenChange={setOpen} />
    </ContextContext.Provider>
  );
};

const ContextIcon = () => {
  const { usedTokens, maxTokens } = useContextValue();
  const reduced = useReducedMotion();
  const circumference = 2 * Math.PI * 10;
  return (
    <svg aria-hidden="true" height="22" width="22" viewBox="0 0 24 24" className="size-5 shrink-0">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.18" />
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={false}
        animate={{ strokeDashoffset: circumference * (1 - fraction(usedTokens, maxTokens)) }}
        transition={reduced ? { duration: 0 } : spring.smooth}
        style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
      />
    </svg>
  );
};

const wholePercent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });

/** The percentage counts on the same spring as the ring, so the number and the arc move together. */
const ContextPercent = ({ value }: { value: number }) => {
  const reduced = useReducedMotion();
  const current = useMotionValue(value);
  // Whole percents while counting, so the label does not change width on every frame.
  const text = useTransform(current, (latest) => wholePercent.format(latest));
  useEffect(() => {
    if (reduced) {
      current.jump(value);
      return;
    }
    const controls = animate(current, value, spring.smooth);
    return () => controls.stop();
  }, [current, value, reduced]);
  return <motion.span className="text-foreground">{text}</motion.span>;
};

export type ContextTriggerProps = ComponentProps<typeof Button>;
export const ContextTrigger = ({ children, className, onClick, onKeyDown, ...props }: ContextTriggerProps) => {
  const { usedTokens, maxTokens, open, setOpen, contentId } = useContextValue();
  const value = fraction(usedTokens, maxTokens);
  return (
    <HoverCardTrigger asChild>
      {children ?? (
        <Button
          type="button"
          variant="ghost"
          className={cn("ai-context-trigger gap-2 font-mono text-[13px] tabular-nums", className)}
          data-warning={value >= 0.9 || undefined}
          aria-label={`Context usage: ${percent(value)}. Show token details.`}
          aria-expanded={open}
          aria-controls={open ? contentId : undefined}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) setOpen(!open);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (!event.defaultPrevented && event.key === "Escape") setOpen(false);
          }}
          {...props}
        >
          <ContextIcon />
          <ContextPercent value={value} />
        </Button>
      )}
    </HoverCardTrigger>
  );
};

export type ContextContentProps = ComponentProps<typeof HoverCardContent>;
export const ContextContent = ({ className, ...props }: ContextContentProps) => {
  const { contentId } = useContextValue();
  return (
    <HoverCardContent
      id={contentId}
      className={cn(
        "ai-context-content w-80 max-w-[calc(100vw-2rem)] divide-y overflow-hidden p-0 text-[13px]",
        className,
      )}
      {...props}
    />
  );
};

export type ContextContentHeaderProps = ComponentProps<"div">;
export const ContextContentHeader = ({ children, className, ...props }: ContextContentHeaderProps) => {
  const { usedTokens, maxTokens } = useContextValue();
  const value = fraction(usedTokens, maxTokens);
  const warning = value >= 0.9;
  return (
    <div className={cn("space-y-3 p-4", className)} {...props}>
      {children ?? (
        <>
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium">Context window</span>
            <span className="font-mono tabular-nums">{percent(value)}</span>
          </div>
          <p className="font-mono text-[12px] text-muted-foreground tabular-nums">
            {count(usedTokens)} / {count(maxTokens)} tokens
          </p>
          <div className="ai-context-status flex items-center gap-2 text-[12px]" data-warning={warning || undefined}>
            {warning ? (
              <IconAlertTriangle aria-hidden className="size-4" />
            ) : (
              <IconCircleCheck aria-hidden className="size-4" />
            )}
            <span className="text-foreground">{warning ? "Near the context limit" : "Context space available"}</span>
          </div>
        </>
      )}
    </div>
  );
};

export type ContextContentBodyProps = ComponentProps<"div">;
export const ContextContentBody = ({ className, ...props }: ContextContentBodyProps) => (
  <div className={cn("space-y-2.5 p-4", className)} {...props} />
);

const usageValues = (usage?: ContextUsage) => ({
  input: usage?.inputTokens,
  output: usage?.outputTokens,
  reasoning: usage?.outputTokenDetails?.reasoningTokens ?? usage?.reasoningTokens,
  cache: usage?.inputTokenDetails?.cacheReadTokens ?? usage?.cachedInputTokens,
});
const calculateCosts = (usage?: ContextUsage, pricing?: ContextPricing) => {
  const values = usageValues(usage);
  if (!pricing) return undefined;
  const input = safeCount(values.input);
  const output = safeCount(values.output);
  const cache = Math.min(input, safeCount(values.cache));
  const reasoning = Math.min(output, safeCount(values.reasoning));
  const cacheCost = (cache * safeCount(pricing.cachedInput ?? pricing.input)) / 1e6;
  const reasoningCost = (reasoning * safeCount(pricing.reasoning ?? pricing.output)) / 1e6;
  // Input and output totals include their cached and reasoning subsets.
  const inputCost = ((input - cache) * safeCount(pricing.input)) / 1e6 + cacheCost;
  const outputCost = ((output - reasoning) * safeCount(pricing.output)) / 1e6 + reasoningCost;
  return {
    input: inputCost,
    output: outputCost,
    cache: cacheCost,
    reasoning: reasoningCost,
    total: inputCost + outputCost,
  };
};

export type ContextContentFooterProps = ComponentProps<"div">;
export const ContextContentFooter = ({ children, className, ...props }: ContextContentFooterProps) => {
  const { usage, pricing } = useContextValue();
  const costs = calculateCosts(usage, pricing);
  if (children == null && (!costs || (usage?.inputTokens == null && usage?.outputTokens == null))) return null;
  return (
    <div className={cn("flex items-center justify-between gap-3 bg-tint px-4 py-3 text-[12px]", className)} {...props}>
      {children ?? (
        <>
          <span className="text-muted-foreground">Estimated cost (USD)</span>
          <span className="font-mono tabular-nums">{money(costs!.total)}</span>
        </>
      )}
    </div>
  );
};

type UsageRowProps = ComponentProps<"div"> & { kind: "input" | "output" | "reasoning" | "cache"; label: string };
const UsageRow = ({ kind, label, children, className, ...props }: UsageRowProps) => {
  const { usage, pricing } = useContextValue();
  const tokens = usageValues(usage)[kind];
  const costs = calculateCosts(usage, pricing);
  if (children != null)
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  if (tokens == null) return null;
  return (
    <div className={cn("flex items-center justify-between gap-3 text-[12px]", className)} {...props}>
      <span className="text-muted-foreground">{label}</span>
      <span className="shrink-0 whitespace-nowrap font-mono tabular-nums">
        {count(tokens)}
        {costs && <span className="ml-2 text-muted-foreground">/ {money(costs[kind])}</span>}
      </span>
    </div>
  );
};
export type ContextInputUsageProps = ComponentProps<"div">;
export const ContextInputUsage = (props: ContextInputUsageProps) => <UsageRow kind="input" label="Input" {...props} />;
export type ContextOutputUsageProps = ComponentProps<"div">;
export const ContextOutputUsage = (props: ContextOutputUsageProps) => (
  <UsageRow kind="output" label="Output" {...props} />
);
export type ContextReasoningUsageProps = ComponentProps<"div">;
export const ContextReasoningUsage = (props: ContextReasoningUsageProps) => (
  <UsageRow kind="reasoning" label="Reasoning (within output)" {...props} />
);
export type ContextCacheUsageProps = ComponentProps<"div">;
export const ContextCacheUsage = (props: ContextCacheUsageProps) => (
  <UsageRow kind="cache" label="Cache (within input)" {...props} />
);
