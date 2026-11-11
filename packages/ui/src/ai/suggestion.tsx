import { Button } from "@sift-design/ui/button";
import { ScrollArea, ScrollBar } from "@sift-design/ui/scroll-area";
import { cn } from "cn";
import type { ComponentProps } from "react";
import { useCallback } from "react";

export type SuggestionsProps = ComponentProps<typeof ScrollArea>;

export const Suggestions = ({ className, children, ...props }: SuggestionsProps) => (
  <ScrollArea
    data-slot="suggestions"
    className="min-w-0 w-full overflow-hidden whitespace-nowrap"
    aria-label="Suggested messages"
    {...props}
  >
    <div className={cn("flex w-max flex-nowrap items-center gap-2 p-1", className)}>{children}</div>
    <ScrollBar className="hidden" orientation="horizontal" />
  </ScrollArea>
);

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export const Suggestion = ({
  suggestion,
  onClick,
  className,
  variant = "outline",
  size = "sm",
  children,
  ...props
}: SuggestionProps) => {
  const handleClick = useCallback(() => {
    onClick?.(suggestion);
  }, [onClick, suggestion]);

  return (
    <Button
      data-slot="suggestion"
      className={cn("cursor-pointer rounded-full px-4 text-[13px]", className)}
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children || suggestion}
    </Button>
  );
};
