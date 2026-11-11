import { Button } from "@sift-design/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sift-design/ui/dropdown-menu";
import { IconChevronDown, IconExternalLink } from "@tabler/icons-react";
import { cn } from "cn";
import { type ComponentProps, type ReactNode, createContext, useContext, useMemo } from "react";

const OpenInContext = createContext<{ query: string } | undefined>(undefined);
const useOpenInContext = () => {
  const value = useContext(OpenInContext);
  if (!value) throw new Error("OpenIn components must be used within OpenIn");
  return value;
};
export type OpenInProps = ComponentProps<typeof DropdownMenu> & { query: string };
export const OpenIn = ({ query, ...props }: OpenInProps) => {
  const contextValue = useMemo(() => ({ query }), [query]);
  return (
    <OpenInContext.Provider value={contextValue}>
      <DropdownMenu {...props} />
    </OpenInContext.Provider>
  );
};

export type OpenInContentProps = ComponentProps<typeof DropdownMenuContent>;
export const OpenInContent = ({ className, ...props }: OpenInContentProps) => (
  <DropdownMenuContent
    align="start"
    className={cn("ai-open-in-content w-64 max-w-[calc(100vw-2rem)]", className)}
    {...props}
  />
);
export type OpenInItemProps = ComponentProps<typeof DropdownMenuItem>;
export const OpenInItem = (props: OpenInItemProps) => <DropdownMenuItem {...props} />;
export type OpenInLabelProps = ComponentProps<typeof DropdownMenuLabel>;
export const OpenInLabel = (props: OpenInLabelProps) => <DropdownMenuLabel {...props} />;
export type OpenInSeparatorProps = ComponentProps<typeof DropdownMenuSeparator>;
export const OpenInSeparator = (props: OpenInSeparatorProps) => <DropdownMenuSeparator {...props} />;
export type OpenInTriggerProps = ComponentProps<typeof DropdownMenuTrigger>;
export const OpenInTrigger = ({ children, ...props }: OpenInTriggerProps) => (
  <DropdownMenuTrigger {...props} asChild>
    {children ?? (
      <Button type="button" variant="outline">
        Open in
        <IconChevronDown aria-hidden className="size-4" />
      </Button>
    )}
  </DropdownMenuTrigger>
);

export type OpenInDestinationProps = Omit<OpenInItemProps, "title" | "children" | "asChild"> & {
  title: string;
  href: (query: string) => string;
  icon?: ReactNode;
  /** Defaults to a new tab. Links always include noopener and noreferrer. */
  target?: ComponentProps<"a">["target"];
};

/** Connects the shared query to a caller-defined destination. */
export const OpenInDestination = ({
  title,
  href,
  icon,
  target = "_blank",
  disabled,
  ...props
}: OpenInDestinationProps) => {
  const { query } = useOpenInContext();
  return (
    <OpenInItem {...props} disabled={disabled} asChild>
      <a
        href={disabled ? undefined : href(query)}
        target={target}
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 text-[13px]"
      >
        {icon && (
          <span aria-hidden className="flex size-5 shrink-0 items-center justify-center [&>svg]:size-4">
            {icon}
          </span>
        )}
        <span className="flex-1">{title}</span>
        {target === "_blank" && (
          <>
            <IconExternalLink aria-hidden className="size-4 text-muted-foreground" />
            <span className="sr-only"> (opens in a new tab)</span>
          </>
        )}
      </a>
    </OpenInItem>
  );
};
