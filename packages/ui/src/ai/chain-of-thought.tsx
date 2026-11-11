import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { arrivalMotion, reflowTransition } from "@sift-design/tokens/motion";
import { Badge } from "@sift-design/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { IconBrain, IconCheck, IconChevronDown, IconCircle } from "@tabler/icons-react";
import { cn } from "cn";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ElementType, ReactNode } from "react";
import { createContext, memo, useContext, useMemo } from "react";

type ChainOfThoughtContextValue = { isOpen: boolean; setIsOpen: (open: boolean) => void };
const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue | null>(null);
const useChainOfThought = () => {
  const context = useContext(ChainOfThoughtContext);
  if (!context) throw new Error("ChainOfThought components must be used within ChainOfThought");
  return context;
};

export type ChainOfThoughtProps = ComponentProps<"div"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const ChainOfThought = memo(
  ({ className, open, defaultOpen = false, onOpenChange, children, ...props }: ChainOfThoughtProps) => {
    const [isOpen, setIsOpen] = useControllableState({ prop: open, defaultProp: defaultOpen, onChange: onOpenChange });
    const context = useMemo(() => ({ isOpen, setIsOpen }), [isOpen, setIsOpen]);
    return (
      <ChainOfThoughtContext.Provider value={context}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
          <div data-slot="chain-of-thought" className={cn("not-prose w-full text-[13px]", className)} {...props}>
            {children}
          </div>
        </Collapsible>
      </ChainOfThoughtContext.Provider>
    );
  },
);

export type ChainOfThoughtHeaderProps = ComponentProps<typeof CollapsibleTrigger>;
export const ChainOfThoughtHeader = memo(({ className, children, ...props }: ChainOfThoughtHeaderProps) => {
  const { isOpen } = useChainOfThought();
  return (
    <CollapsibleTrigger
      data-slot="chain-of-thought-header"
      className={cn(
        "ai-reasoning-trigger flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] text-muted-foreground hover:bg-tint hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      <IconBrain aria-hidden="true" className="size-4 shrink-0" stroke={1.6} />
      <span className="flex-1">{children ?? "Chain of thought"}</span>
      <IconChevronDown
        aria-hidden="true"
        className="ai-reasoning-chevron size-4 shrink-0"
        data-open={isOpen}
        stroke={1.6}
      />
    </CollapsibleTrigger>
  );
});

export type ChainOfThoughtStepProps = ComponentProps<"div"> & {
  icon?: ElementType;
  label: ReactNode;
  description?: ReactNode;
  status?: "complete" | "active" | "pending";
};

export const ChainOfThoughtStep = memo(
  ({ className, icon, label, description, status = "complete", children, ...props }: ChainOfThoughtStepProps) => {
    const reduced = !!useReducedMotion();
    const Icon = icon ?? (status === "complete" ? IconCheck : IconCircle);
    return (
      <div
        data-slot="chain-of-thought-step"
        data-status={status}
        className={cn(
          "ai-chain-step relative text-[13px]",
          status === "active" ? "text-foreground" : "text-muted-foreground",
          className,
        )}
        {...props}
      >
        <motion.div layout={reduced ? false : "position"} transition={reflowTransition(reduced)}>
          <motion.div
            {...arrivalMotion(reduced)}
            initial={status === "active" ? arrivalMotion(reduced).initial : false}
            className="relative flex gap-3"
          >
            <span
              className="ai-chain-indicator relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-card"
              aria-hidden="true"
            >
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 space-y-2 pb-5">
              <div
                className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", status === "active" && "font-medium")}
              >
                <span>{label}</span>
                <span className="font-normal text-[12px] text-muted-foreground">
                  {status === "active" ? "In progress" : status === "pending" ? "Pending" : "Complete"}
                </span>
              </div>
              {description && <div className="text-[12px] leading-relaxed text-muted-foreground">{description}</div>}
              {children}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  },
);

export type ChainOfThoughtSearchResultsProps = ComponentProps<"div">;
export const ChainOfThoughtSearchResults = memo(({ className, ...props }: ChainOfThoughtSearchResultsProps) => (
  <div
    data-slot="chain-of-thought-search-results"
    className={cn("flex flex-wrap items-center gap-1.5", className)}
    {...props}
  />
));

export type ChainOfThoughtSearchResultProps = ComponentProps<typeof Badge>;
export const ChainOfThoughtSearchResult = memo(({ className, children, ...props }: ChainOfThoughtSearchResultProps) => (
  <Badge
    data-slot="chain-of-thought-search-result"
    variant="secondary"
    className={cn(
      "max-w-full gap-1 rounded-md bg-tint px-2 py-1 text-[12px] font-normal whitespace-normal text-foreground",
      className,
    )}
    {...props}
  >
    {children}
  </Badge>
));

export type ChainOfThoughtContentProps = ComponentProps<typeof CollapsibleContent>;
export const ChainOfThoughtContent = memo(({ className, children, ...props }: ChainOfThoughtContentProps) => (
  <CollapsibleContent
    data-slot="chain-of-thought-content"
    className={cn("px-2 pt-3 text-foreground", className)}
    {...props}
  >
    <AnimatePresence initial={false}>{children}</AnimatePresence>
  </CollapsibleContent>
));

export type ChainOfThoughtImageProps = ComponentProps<"div"> & { caption?: string };
export const ChainOfThoughtImage = memo(({ className, children, caption, ...props }: ChainOfThoughtImageProps) => (
  <div data-slot="chain-of-thought-image" className={cn("mt-2 space-y-2", className)} {...props}>
    <div className="relative flex max-h-[22rem] items-center justify-center overflow-hidden rounded-md bg-subtle [&_img]:max-h-[22rem] [&_img]:max-w-full [&_img]:object-contain">
      {children}
    </div>
    {caption && <p className="text-[12px] leading-relaxed text-muted-foreground">{caption}</p>}
  </div>
));

ChainOfThought.displayName = "ChainOfThought";
ChainOfThoughtHeader.displayName = "ChainOfThoughtHeader";
ChainOfThoughtStep.displayName = "ChainOfThoughtStep";
ChainOfThoughtSearchResults.displayName = "ChainOfThoughtSearchResults";
ChainOfThoughtSearchResult.displayName = "ChainOfThoughtSearchResult";
ChainOfThoughtContent.displayName = "ChainOfThoughtContent";
ChainOfThoughtImage.displayName = "ChainOfThoughtImage";
