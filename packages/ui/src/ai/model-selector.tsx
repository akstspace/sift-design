import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@sift-design/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@sift-design/ui/dialog";
import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

export type ModelSelectorProps = ComponentProps<typeof Dialog>;

export const ModelSelector = (props: ModelSelectorProps) => <Dialog {...props} />;

export type ModelSelectorTriggerProps = ComponentProps<typeof DialogTrigger>;

export const ModelSelectorTrigger = (props: ModelSelectorTriggerProps) => <DialogTrigger {...props} />;

export type ModelSelectorContentProps = ComponentProps<typeof DialogContent> & {
  title?: ReactNode;
};

export const ModelSelectorContent = ({
  className,
  children,
  title = "Choose a model",
  ...props
}: ModelSelectorContentProps) => (
  <DialogContent className={cn("ai-model-selector gap-0 overflow-hidden p-0", className)} {...props}>
    <DialogTitle className="sr-only">{title}</DialogTitle>
    <DialogDescription className="sr-only">
      Search models by name or provider. Use arrow keys to choose a model.
    </DialogDescription>
    <Command className="**:data-[slot=command-input-wrapper]:h-auto">{children}</Command>
  </DialogContent>
);

export type ModelSelectorDialogProps = ComponentProps<typeof CommandDialog>;

export const ModelSelectorDialog = (props: ModelSelectorDialogProps) => (
  <CommandDialog title="Choose a model" description="Search models by name or provider." {...props} />
);

export type ModelSelectorInputProps = ComponentProps<typeof CommandInput>;

export const ModelSelectorInput = ({ className, ...props }: ModelSelectorInputProps) => (
  <CommandInput className={cn("h-12 py-3 pr-10 text-[13px]", className)} {...props} />
);

export type ModelSelectorListProps = ComponentProps<typeof CommandList>;

export const ModelSelectorList = (props: ModelSelectorListProps) => <CommandList {...props} />;

export type ModelSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;

export const ModelSelectorEmpty = (props: ModelSelectorEmptyProps) => <CommandEmpty {...props} />;

export type ModelSelectorGroupProps = ComponentProps<typeof CommandGroup>;

export const ModelSelectorGroup = (props: ModelSelectorGroupProps) => <CommandGroup {...props} />;

export type ModelSelectorItemProps = ComponentProps<typeof CommandItem>;

export const ModelSelectorItem = (props: ModelSelectorItemProps) => <CommandItem {...props} />;

export type ModelSelectorShortcutProps = ComponentProps<typeof CommandShortcut>;

export const ModelSelectorShortcut = (props: ModelSelectorShortcutProps) => <CommandShortcut {...props} />;

export type ModelSelectorSeparatorProps = ComponentProps<typeof CommandSeparator>;

export const ModelSelectorSeparator = (props: ModelSelectorSeparatorProps) => <CommandSeparator {...props} />;

/** Local monogram. No image or network request is needed. */
export type ModelSelectorLogoProps = Omit<ComponentProps<"span">, "children"> & {
  provider: string;
};

export const ModelSelectorLogo = ({ provider, className, ...props }: ModelSelectorLogoProps) => (
  <span
    aria-hidden="true"
    data-provider={provider.toLowerCase()}
    className={cn(
      "ai-model-logo inline-flex size-6 shrink-0 items-center justify-center rounded-sm border bg-subtle font-mono text-[12px] font-medium text-foreground",
      className,
    )}
    {...props}
  >
    {provider.trim().slice(0, 1).toUpperCase() || "?"}
  </span>
);

export type ModelSelectorLogoGroupProps = ComponentProps<"div">;

export const ModelSelectorLogoGroup = ({ className, ...props }: ModelSelectorLogoGroupProps) => (
  <div
    className={cn(
      "isolate flex shrink-0 -space-x-1 items-center [&>.ai-model-logo]:rounded-full [&>.ai-model-logo]:ring-2 [&>.ai-model-logo]:ring-card",
      className,
    )}
    {...props}
  />
);

export type ModelSelectorNameProps = ComponentProps<"span">;

export const ModelSelectorName = ({ className, ...props }: ModelSelectorNameProps) => (
  <span className={cn("flex-1 truncate text-left", className)} {...props} />
);
