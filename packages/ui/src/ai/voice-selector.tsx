import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Button } from "@sift-design/ui/button";
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
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@sift-design/ui/dialog";
import { Spinner } from "@sift-design/ui/spinner";
import { cn } from "cn";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo } from "react";

interface VoiceSelectorContextValue {
  value: string | undefined;
  setValue: (value: string | undefined) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const VoiceSelectorContext = createContext<VoiceSelectorContextValue | null>(null);

export const useVoiceSelector = () => {
  const context = useContext(VoiceSelectorContext);
  if (!context) {
    throw new Error("VoiceSelector components must be used within VoiceSelector");
  }
  return context;
};

export type VoiceSelectorProps = ComponentProps<typeof Dialog> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
};

export const VoiceSelector = ({
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: VoiceSelectorProps) => {
  const [value, setValue] = useControllableState({
    defaultProp: defaultValue,
    onChange: onValueChange,
    prop: valueProp,
  });

  const [open, setOpen] = useControllableState({
    defaultProp: defaultOpen,
    onChange: onOpenChange,
    prop: openProp,
  });

  const voiceSelectorContext = useMemo(() => ({ open, setOpen, setValue, value }), [value, setValue, open, setOpen]);

  return (
    <VoiceSelectorContext.Provider value={voiceSelectorContext}>
      <Dialog onOpenChange={setOpen} open={open} {...props}>
        {children}
      </Dialog>
    </VoiceSelectorContext.Provider>
  );
};

export type VoiceSelectorTriggerProps = ComponentProps<typeof DialogTrigger>;

export const VoiceSelectorTrigger = (props: VoiceSelectorTriggerProps) => <DialogTrigger {...props} />;

export type VoiceSelectorContentProps = ComponentProps<typeof DialogContent> & {
  title?: ReactNode;
};

export const VoiceSelectorContent = ({
  className,
  children,
  title = "Choose a voice",
  ...props
}: VoiceSelectorContentProps) => (
  <DialogContent
    aria-describedby={undefined}
    data-voice-part="content"
    className={cn("gap-0 overflow-hidden bg-card p-0", className)}
    {...props}
  >
    <DialogTitle className="sr-only">{title}</DialogTitle>
    <Command label="Search voices" className="**:data-[slot=command-input-wrapper]:h-auto">
      {children}
    </Command>
  </DialogContent>
);

export type VoiceSelectorDialogProps = ComponentProps<typeof CommandDialog>;

export const VoiceSelectorDialog = (props: VoiceSelectorDialogProps) => <CommandDialog {...props} />;

export type VoiceSelectorInputProps = ComponentProps<typeof CommandInput>;

export const VoiceSelectorInput = ({ className, ...props }: VoiceSelectorInputProps) => (
  <CommandInput
    aria-label="Search voices"
    placeholder="Search voices…"
    className={cn("h-auto py-3.5 pr-10 text-[13px]", className)}
    {...props}
  />
);

export type VoiceSelectorListProps = ComponentProps<typeof CommandList>;

export const VoiceSelectorList = (props: VoiceSelectorListProps) => <CommandList label="Voices" {...props} />;

export type VoiceSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;

export const VoiceSelectorEmpty = (props: VoiceSelectorEmptyProps) => <CommandEmpty {...props} />;

export type VoiceSelectorGroupProps = ComponentProps<typeof CommandGroup>;

export const VoiceSelectorGroup = (props: VoiceSelectorGroupProps) => <CommandGroup {...props} />;

export type VoiceSelectorItemProps = ComponentProps<typeof CommandItem>;

export const VoiceSelectorItem = ({ className, ...props }: VoiceSelectorItemProps) => (
  <CommandItem data-voice-part="item" className={cn("min-h-14 gap-3 px-3 py-2 text-[13px]", className)} {...props} />
);

export type VoiceSelectorShortcutProps = ComponentProps<typeof CommandShortcut>;

export const VoiceSelectorShortcut = (props: VoiceSelectorShortcutProps) => <CommandShortcut {...props} />;

export type VoiceSelectorSeparatorProps = ComponentProps<typeof CommandSeparator>;

export const VoiceSelectorSeparator = (props: VoiceSelectorSeparatorProps) => (
  <CommandSeparator aria-hidden="true" {...props} />
);

export type VoiceSelectorGenderProps = ComponentProps<"span"> & {
  value?: "male" | "female" | "transgender" | "androgyne" | "non-binary" | "intersex";
};

export const VoiceSelectorGender = ({ className, value, children, ...props }: VoiceSelectorGenderProps) => {
  return (
    <span data-voice-part="gender" className={cn("text-[12px] text-muted-foreground", className)} {...props}>
      {children ?? value ?? "Unspecified"}
    </span>
  );
};

export type VoiceSelectorAccentProps = ComponentProps<"span"> & {
  value?:
    | "american"
    | "british"
    | "australian"
    | "canadian"
    | "irish"
    | "scottish"
    | "indian"
    | "south-african"
    | "new-zealand"
    | "spanish"
    | "french"
    | "german"
    | "italian"
    | "portuguese"
    | "brazilian"
    | "mexican"
    | "argentinian"
    | "japanese"
    | "chinese"
    | "korean"
    | "russian"
    | "arabic"
    | "dutch"
    | "swedish"
    | "norwegian"
    | "danish"
    | "finnish"
    | "polish"
    | "turkish"
    | "greek"
    | string;
};

export const VoiceSelectorAccent = ({ className, value, children, ...props }: VoiceSelectorAccentProps) => {
  return (
    <span data-voice-part="accent" className={cn("text-[12px] text-muted-foreground", className)} {...props}>
      {children ?? value?.replaceAll("-", " ") ?? "Unspecified"}
    </span>
  );
};

export type VoiceSelectorAgeProps = ComponentProps<"span">;

export const VoiceSelectorAge = ({ className, ...props }: VoiceSelectorAgeProps) => (
  <span className={cn("font-mono text-[12px] text-muted-foreground tabular-nums", className)} {...props} />
);

export type VoiceSelectorNameProps = ComponentProps<"span">;

export const VoiceSelectorName = ({ className, ...props }: VoiceSelectorNameProps) => (
  <span className={cn("min-w-0 flex-1 truncate text-left text-[13px] font-medium", className)} {...props} />
);

export type VoiceSelectorDescriptionProps = ComponentProps<"span">;

export const VoiceSelectorDescription = ({ className, ...props }: VoiceSelectorDescriptionProps) => (
  <span className={cn("text-[12px] text-muted-foreground", className)} {...props} />
);

export type VoiceSelectorAttributesProps = ComponentProps<"div">;

export const VoiceSelectorAttributes = ({ className, children, ...props }: VoiceSelectorAttributesProps) => (
  <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px]", className)} {...props}>
    {children}
  </div>
);

export type VoiceSelectorBulletProps = ComponentProps<"span">;

export const VoiceSelectorBullet = ({ className, ...props }: VoiceSelectorBulletProps) => (
  <span aria-hidden="true" className={cn("select-none text-muted-foreground", className)} {...props}>
    &bull;
  </span>
);

export type VoiceSelectorPreviewProps = Omit<ComponentProps<"button">, "children"> & {
  playing?: boolean;
  loading?: boolean;
  onPlay?: () => void;
};

export const VoiceSelectorPreview = ({
  className,
  playing,
  loading,
  onPlay,
  onClick,
  onKeyDown,
  disabled,
  ...props
}: VoiceSelectorPreviewProps) => {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onClick?.(event);
      if (!event.defaultPrevented) onPlay?.();
    },
    [onClick, onPlay],
  );

  let icon = <IconPlayerPlay aria-hidden="true" className="size-3.5" />;

  if (loading) {
    icon = <Spinner aria-hidden="true" className="size-3.5" />;
  } else if (playing) {
    icon = <IconPlayerPause aria-hidden="true" className="size-3.5" />;
  }

  return (
    <Button
      aria-label={loading ? "Loading preview" : playing ? "Pause preview" : "Play preview"}
      aria-pressed={!!playing}
      aria-busy={!!loading}
      data-voice-part="preview"
      data-playing={playing ? "true" : "false"}
      className={cn("size-8 shrink-0", className)}
      disabled={loading || disabled}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") event.stopPropagation();
        onKeyDown?.(event);
      }}
      size="icon-sm"
      type="button"
      variant="outline"
      {...props}
    >
      {icon}
    </Button>
  );
};
