import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Button } from "@sift-design/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@sift-design/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@sift-design/ui/popover";
import { IconCheck, IconSelector } from "@tabler/icons-react";
import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const deviceIdRegex = /\(([\da-fA-F]{4}:[\da-fA-F]{4})\)$/;

interface MicSelectorContextType {
  data: MediaDeviceInfo[];
  value: string | undefined;
  onValueChange?: (value: string) => void;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  width: number;
  setWidth?: (width: number) => void;
  loading: boolean;
  error: string | null;
  loadDevices?: () => Promise<void>;
}

const MicSelectorContext = createContext<MicSelectorContextType>({
  data: [],
  open: false,
  value: undefined,
  width: 200,
  loading: false,
  error: null,
});

export type AudioDevicesOptions = {
  /** Supplied devices bypass all media APIs, including permission requests. */
  devices?: MediaDeviceInfo[];
};

export const useAudioDevices = ({ devices: suppliedDevices }: AudioDevicesOptions = {}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [loading, setLoading] = useState(suppliedDevices === undefined);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(false);
  const generation = useRef(0);

  const readDevices = useCallback(
    async (requestPermission: boolean) => {
      if (suppliedDevices !== undefined || busy.current) return;
      const currentGeneration = generation.current;
      const isCurrent = () => mounted.current && currentGeneration === generation.current;
      busy.current = true;
      setLoading(true);
      setError(null);
      try {
        if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
          throw new Error("Microphone access is unavailable in this browser.");
        }
        if (requestPermission) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Permission reveals labels. No track remains active after this request.
          for (const track of stream.getTracks()) track.stop();
        }
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        if (isCurrent()) {
          const inputs = allDevices.filter((device) => device.kind === "audioinput");
          setDevices(inputs);
          setHasPermission(requestPermission || inputs.some((device) => !!device.label));
        }
      } catch (caughtError) {
        if (isCurrent()) {
          const denied = caughtError instanceof Error && caughtError.name === "NotAllowedError";
          setError(
            denied
              ? "Microphone permission was denied. Allow access in your browser, then try again."
              : "Microphones are unavailable. Check your connection, then try again.",
          );
        }
      } finally {
        if (currentGeneration === generation.current) busy.current = false;
        if (isCurrent()) setLoading(false);
      }
    },
    [suppliedDevices],
  );

  const loadDevices = useCallback(() => readDevices(true), [readDevices]);

  useEffect(() => {
    mounted.current = true;
    generation.current += 1;
    busy.current = false;
    if (suppliedDevices !== undefined) {
      setLoading(false);
      setError(null);
    } else {
      void readDevices(false);
    }
    const media =
      suppliedDevices === undefined && typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
    const refresh = () => {
      void readDevices(false);
    };
    if (suppliedDevices === undefined) media?.addEventListener?.("devicechange", refresh);
    return () => {
      mounted.current = false;
      generation.current += 1;
      media?.removeEventListener?.("devicechange", refresh);
    };
  }, [readDevices, suppliedDevices]);

  return {
    devices: suppliedDevices ?? devices,
    error: suppliedDevices === undefined ? error : null,
    hasPermission: suppliedDevices !== undefined || hasPermission,
    loadDevices,
    loading: suppliedDevices === undefined && loading,
  };
};

export type MicSelectorProps = ComponentProps<typeof Popover> & {
  defaultValue?: string;
  value?: string | undefined;
  onValueChange?: (value: string | undefined) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Optional fixtures or application-managed devices. Never requests permission when supplied. */
  devices?: MediaDeviceInfo[];
};

export const MicSelector = ({
  defaultValue,
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  devices: suppliedDevices,
  ...props
}: MicSelectorProps) => {
  const [value, onValueChange] = useControllableState<string | undefined>({
    defaultProp: defaultValue,
    onChange: controlledOnValueChange,
    prop: controlledValue,
  });
  const [open, onOpenChange] = useControllableState({
    defaultProp: defaultOpen,
    onChange: controlledOnOpenChange,
    prop: controlledOpen,
  });
  const [width, setWidth] = useState(200);
  const { devices, loading, hasPermission, loadDevices, error } = useAudioDevices({ devices: suppliedDevices });
  const requested = useRef(false);

  useEffect(() => {
    if (!open) requested.current = false;
    if (open && !hasPermission && !loading && !requested.current && suppliedDevices === undefined) {
      requested.current = true;
      void loadDevices();
    }
  }, [open, hasPermission, loading, loadDevices, suppliedDevices]);

  const contextValue = useMemo(
    () => ({
      data: devices,
      onOpenChange,
      onValueChange,
      open,
      setWidth,
      value,
      width,
      loading,
      error,
      loadDevices,
    }),
    [devices, onOpenChange, onValueChange, open, value, width, loading, error, loadDevices],
  );

  return (
    <MicSelectorContext.Provider value={contextValue}>
      <Popover {...props} onOpenChange={onOpenChange} open={open} />
    </MicSelectorContext.Provider>
  );
};

export type MicSelectorTriggerProps = ComponentProps<typeof Button>;
export const MicSelectorTrigger = ({ children, className, ...props }: MicSelectorTriggerProps) => {
  const { setWidth } = useContext(MicSelectorContext);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = (entry.target as HTMLElement).offsetWidth;
        if (width) setWidth?.(width);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [setWidth]);
  return (
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        data-voice-part="mic-trigger"
        className={cn(
          "min-w-0 justify-between gap-3 text-[13px] [&>[data-slot=button-label]]:w-full [&>[data-slot=button-label]]:justify-between",
          className,
        )}
        {...props}
        ref={ref}
      >
        {children}
        <IconSelector aria-hidden="true" className="shrink-0 text-muted-foreground" size={16} />
      </Button>
    </PopoverTrigger>
  );
};

export type MicSelectorContentProps = ComponentProps<typeof Command> & {
  popoverOptions?: ComponentProps<typeof PopoverContent>;
};
export const MicSelectorContent = ({ className, popoverOptions, children, ...props }: MicSelectorContentProps) => {
  const { width, value, loading, error, loadDevices } = useContext(MicSelectorContext);
  return (
    <PopoverContent
      aria-label="Choose microphone"
      aria-labelledby={undefined}
      aria-describedby={undefined}
      data-voice-part="mic-content"
      className={cn("overflow-hidden p-0", className)}
      style={{ width, maxWidth: "calc(100vw - 32px)" }}
      {...popoverOptions}
    >
      <Command defaultValue={value} label="Search microphones" {...props}>
        {children}
      </Command>
      {loading && (
        <p role="status" className="border-t px-3 py-2 text-[12px] text-muted-foreground">
          Loading microphones…
        </p>
      )}
      {error && (
        <div className="border-t p-3 text-[12px]">
          <p role="status" className="mb-2 text-muted-foreground">
            {error}
          </p>
          <Button size="sm" variant="outline" onClick={() => void loadDevices?.()}>
            Try again
          </Button>
        </div>
      )}
    </PopoverContent>
  );
};

export type MicSelectorInputProps = ComponentProps<typeof CommandInput> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};
export const MicSelectorInput = (props: MicSelectorInputProps) => (
  <CommandInput aria-label="Search microphones" placeholder="Search microphones…" {...props} />
);

export type MicSelectorListProps = Omit<ComponentProps<typeof CommandList>, "children"> & {
  children: (devices: MediaDeviceInfo[]) => ReactNode;
};
export const MicSelectorList = ({ children, className, ...props }: MicSelectorListProps) => {
  const { data, loading } = useContext(MicSelectorContext);
  return (
    <CommandList label="Microphones" aria-busy={loading} className={cn("p-1", className)} {...props}>
      {children(data)}
    </CommandList>
  );
};

export type MicSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;
export const MicSelectorEmpty = ({ children = "No microphones found.", ...props }: MicSelectorEmptyProps) => (
  <CommandEmpty {...props}>{children}</CommandEmpty>
);

export type MicSelectorItemProps = ComponentProps<typeof CommandItem>;
export const MicSelectorItem = ({ children, className, onSelect, ...props }: MicSelectorItemProps) => {
  const { onValueChange, onOpenChange, value } = useContext(MicSelectorContext);
  const selected = props.value !== undefined && props.value === value;
  const handleSelect = useCallback(
    (currentValue: string) => {
      onValueChange?.(currentValue);
      onOpenChange?.(false);
      onSelect?.(currentValue);
    },
    [onValueChange, onOpenChange, onSelect],
  );
  return (
    <CommandItem
      {...props}
      data-voice-part="mic-item"
      data-current={selected ? "true" : "false"}
      onSelect={handleSelect}
      className={cn("min-h-9 gap-3 text-[13px]", className)}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <IconCheck aria-hidden="true" size={16} data-voice-part="mic-check" />
      {selected && <span className="sr-only">Selected</span>}
    </CommandItem>
  );
};

export type MicSelectorLabelProps = ComponentProps<"span"> & { device: MediaDeviceInfo };
export const MicSelectorLabel = ({ device, className, ...props }: MicSelectorLabelProps) => {
  const matches = device.label.match(deviceIdRegex);
  if (!matches)
    return (
      <span className={className} {...props}>
        {device.label || "Microphone"}
      </span>
    );
  return (
    <span className={className} {...props}>
      <span>{device.label.replace(deviceIdRegex, "").trim()}</span>
      <span className="font-mono text-[12px] text-muted-foreground"> ({matches[1]})</span>
    </span>
  );
};

export type MicSelectorValueProps = ComponentProps<"span">;
export const MicSelectorValue = ({ className, ...props }: MicSelectorValueProps) => {
  const { data, value } = useContext(MicSelectorContext);
  const currentDevice = data.find((device) => device.deviceId === value);
  return currentDevice ? (
    <MicSelectorLabel
      className={cn("min-w-0 flex-1 truncate text-left", className)}
      device={currentDevice}
      {...props}
    />
  ) : (
    <span className={cn("min-w-0 flex-1 truncate text-left", className)} {...props}>
      Select microphone…
    </span>
  );
};
