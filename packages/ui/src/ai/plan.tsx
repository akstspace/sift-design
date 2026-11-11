import { Button } from "@sift-design/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sift-design/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sift-design/ui/collapsible";
import { cn } from "cn";
import { IconChevronDown } from "@tabler/icons-react";
import type { ComponentProps } from "react";
import { createContext, useContext, useMemo } from "react";
import { Shimmer } from "./shimmer";

interface PlanContextValue {
  isStreaming: boolean;
}

const PlanContext = createContext<PlanContextValue | null>(null);

const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("Plan components must be used within Plan");
  }
  return context;
};

export type PlanProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
};

export const Plan = ({ className, isStreaming = false, children, ...props }: PlanProps) => {
  const contextValue = useMemo(() => ({ isStreaming }), [isStreaming]);

  return (
    <PlanContext.Provider value={contextValue}>
      <Collapsible asChild data-slot="plan" data-streaming={isStreaming} aria-busy={isStreaming} {...props}>
        <Card className={cn("gap-4 rounded-lg py-4 shadow-none", className)}>{children}</Card>
      </Collapsible>
    </PlanContext.Provider>
  );
};

export type PlanHeaderProps = ComponentProps<typeof CardHeader>;

export const PlanHeader = ({ className, ...props }: PlanHeaderProps) => (
  <CardHeader className={cn("grid gap-1.5 px-4", className)} data-slot="plan-header" {...props} />
);

export type PlanTitleProps = Omit<ComponentProps<typeof CardTitle>, "children"> & {
  children: string;
};

export const PlanTitle = ({ children, className, ...props }: PlanTitleProps) => {
  const { isStreaming } = usePlan();

  return (
    <CardTitle
      className={cn("text-[14px] leading-snug font-semibold tracking-[-0.01em]", className)}
      data-slot="plan-title"
      {...props}
    >
      {isStreaming ? <Shimmer>{children}</Shimmer> : children}
    </CardTitle>
  );
};

export type PlanDescriptionProps = Omit<ComponentProps<typeof CardDescription>, "children"> & {
  children: string;
};

export const PlanDescription = ({ className, children, ...props }: PlanDescriptionProps) => {
  const { isStreaming } = usePlan();

  return (
    <CardDescription className={cn("text-[13px] leading-relaxed", className)} data-slot="plan-description" {...props}>
      {isStreaming ? <Shimmer>{children}</Shimmer> : children}
    </CardDescription>
  );
};

export type PlanActionProps = ComponentProps<typeof CardAction>;

export const PlanAction = (props: PlanActionProps) => <CardAction data-slot="plan-action" {...props} />;

export type PlanContentProps = ComponentProps<typeof CardContent>;

export const PlanContent = ({ className, ...props }: PlanContentProps) => (
  <CollapsibleContent>
    <CardContent className={cn("px-4 text-[13px]", className)} data-slot="plan-content" {...props} />
  </CollapsibleContent>
);

export type PlanFooterProps = ComponentProps<"div">;

export const PlanFooter = ({ className, ...props }: PlanFooterProps) => (
  <CardFooter className={cn("gap-2 px-4", className)} data-slot="plan-footer" {...props} />
);

export type PlanTriggerProps = ComponentProps<typeof CollapsibleTrigger>;

export const PlanTrigger = ({ className, children, ...props }: PlanTriggerProps) => (
  <CollapsibleTrigger asChild>
    <Button className={cn("size-8", className)} data-slot="plan-trigger" size="icon" variant="ghost" {...props}>
      {children ?? (
        <>
          <IconChevronDown aria-hidden className="ai-task-chevron size-4" />
          <span className="sr-only">Toggle plan</span>
        </>
      )}
    </Button>
  </CollapsibleTrigger>
);
