import { Button } from "@sift-design/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@sift-design/ui/tooltip";
import { cn } from "cn";
import { IconX, type Icon as TablerIcon } from "@tabler/icons-react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { sheetMotion } from "@sift-design/tokens/motion";
import type { ComponentProps, HTMLAttributes } from "react";

export type ArtifactProps = HTMLAttributes<HTMLDivElement> & { open?: boolean };

function ArtifactPanel({ className, ...props }: Omit<ArtifactProps, "open">) {
  const reduced = !!useReducedMotion();
  const present = useIsPresent();
  return (
    <motion.div
      data-slot="ai-artifact"
      className={cn(
        "ai-artifact flex min-w-0 w-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground",
        className,
      )}
      {...(props as HTMLMotionProps<"div">)}
      {...sheetMotion(reduced, false)}
      inert={!present}
      aria-hidden={!present || undefined}
    />
  );
}

export const Artifact = ({ open = true, ...props }: ArtifactProps) => (
  <AnimatePresence initial={false}>{open && <ArtifactPanel key="artifact" {...props} />}</AnimatePresence>
);

export type ArtifactHeaderProps = HTMLAttributes<HTMLDivElement>;

export const ArtifactHeader = ({ className, ...props }: ArtifactHeaderProps) => (
  <div
    className={cn("flex min-w-0 items-start justify-between gap-3 border-b bg-tint px-4 py-3", className)}
    {...props}
  />
);

export type ArtifactCloseProps = ComponentProps<typeof Button>;

export const ArtifactClose = ({
  className,
  children,
  size = "sm",
  variant = "ghost",
  ...props
}: ArtifactCloseProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label="Close artifact"
          className={cn("size-8 shrink-0 p-0 text-muted-foreground hover:text-foreground", className)}
          size={size}
          type="button"
          variant={variant}
          {...props}
        >
          {children ?? <IconX aria-hidden className="size-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Close artifact</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export type ArtifactTitleProps = HTMLAttributes<HTMLParagraphElement>;

export const ArtifactTitle = ({ className, ...props }: ArtifactTitleProps) => (
  <p className={cn("font-semibold text-[14px] text-foreground", className)} {...props} />
);

export type ArtifactDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const ArtifactDescription = ({ className, ...props }: ArtifactDescriptionProps) => (
  <p className={cn("mt-0.5 text-[12px] text-muted-foreground", className)} {...props} />
);

export type ArtifactActionsProps = HTMLAttributes<HTMLDivElement>;

export const ArtifactActions = ({ className, ...props }: ArtifactActionsProps) => (
  <div className={cn("flex shrink-0 items-center gap-0.5", className)} {...props} />
);

export type ArtifactActionProps = ComponentProps<typeof Button> & {
  tooltip?: string;
  label?: string;
  icon?: TablerIcon;
};

export const ArtifactAction = ({
  tooltip,
  label,
  icon: Icon,
  children,
  className,
  size = "sm",
  variant = "ghost",
  ...props
}: ArtifactActionProps) => {
  const button = (
    <Button
      aria-label={label || tooltip}
      className={cn("size-8 p-0 text-muted-foreground hover:text-foreground", className)}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {Icon ? <Icon aria-hidden className="size-4" /> : children}
      <span className="sr-only">{label || tooltip}</span>
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

export type ArtifactContentProps = HTMLAttributes<HTMLDivElement>;

export const ArtifactContent = ({ className, ...props }: ArtifactContentProps) => (
  <div className={cn("min-h-0 flex-1 overflow-auto p-4 text-[13px]", className)} {...props} />
);
