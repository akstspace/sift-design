import { Button } from "@sift-design/ui/button";
import { Separator } from "@sift-design/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@sift-design/ui/tooltip";
import { cn } from "cn";
import { IconBookmark, type IconProps } from "@tabler/icons-react";
import type { ComponentProps, HTMLAttributes } from "react";

export type CheckpointProps = HTMLAttributes<HTMLDivElement>;
export const Checkpoint = ({ className, children, ...props }: CheckpointProps) => (
  <div
    data-slot="checkpoint"
    className={cn("flex min-w-0 items-center gap-2 py-2 text-muted-foreground", className)}
    {...props}
  >
    {children}
    <Separator className="min-w-4 flex-1" />
  </div>
);

export type CheckpointIconProps = IconProps;
export const CheckpointIcon = ({ className, children, ...props }: CheckpointIconProps) =>
  children ?? <IconBookmark aria-hidden="true" className={cn("size-4 shrink-0", className)} {...props} />;

export type CheckpointTriggerProps = ComponentProps<typeof Button> & { tooltip?: string };
export const CheckpointTrigger = ({
  children,
  className,
  variant = "ghost",
  size = "sm",
  tooltip,
  ...props
}: CheckpointTriggerProps) => {
  const button = (
    <Button
      data-slot="checkpoint-trigger"
      className={cn("shrink-0 text-[12px]", className)}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );
  return tooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent align="start" side="bottom">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  ) : (
    button
  );
};
