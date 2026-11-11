import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { cn } from "cn";
import type { Experimental_TranscriptionResult as TranscriptionResult } from "ai";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo } from "react";

type TranscriptionSegment = TranscriptionResult["segments"][number];

interface TranscriptionContextValue {
  segments: TranscriptionSegment[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onSeek?: (time: number) => void;
}

const TranscriptionContext = createContext<TranscriptionContextValue | null>(null);

const useTranscription = () => {
  const context = useContext(TranscriptionContext);
  if (!context) {
    throw new Error("Transcription components must be used within Transcription");
  }
  return context;
};

export type TranscriptionProps = Omit<ComponentProps<"div">, "children"> & {
  segments: TranscriptionSegment[];
  currentTime?: number;
  onSeek?: (time: number) => void;
  children: (segment: TranscriptionSegment, index: number) => ReactNode;
};

export const Transcription = ({
  segments,
  currentTime: externalCurrentTime,
  onSeek,
  className,
  children,
  ...props
}: TranscriptionProps) => {
  const [currentTime, setCurrentTime] = useControllableState({
    defaultProp: 0,
    prop: externalCurrentTime,
  });

  const seekTo = useCallback(
    (time: number) => {
      setCurrentTime(time);
      onSeek?.(time);
    },
    [setCurrentTime, onSeek],
  );
  const contextValue = useMemo(
    () => ({ currentTime, onSeek, onTimeUpdate: seekTo, segments }),
    [currentTime, onSeek, seekTo, segments],
  );

  return (
    <TranscriptionContext.Provider value={contextValue}>
      <div
        className={cn("flex flex-wrap gap-1 text-sm leading-relaxed", className)}
        data-slot="transcription"
        {...props}
      >
        {segments.filter((segment) => segment.text.trim()).map((segment, index) => children(segment, index))}
      </div>
    </TranscriptionContext.Provider>
  );
};

export type TranscriptionSegmentProps = ComponentProps<"button"> & {
  segment: TranscriptionSegment;
  index: number;
  /** Show the segment start time beside its text. */
  showTimestamp?: boolean;
};

export const TranscriptionSegment = ({
  segment,
  index,
  className,
  onClick,
  showTimestamp = false,
  children,
  ...props
}: TranscriptionSegmentProps) => {
  const { currentTime, onSeek, onTimeUpdate } = useTranscription();

  const isActive = currentTime >= segment.startSecond && currentTime < segment.endSecond;
  const isPast = currentTime >= segment.endSecond;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      onTimeUpdate(segment.startSecond);
    },
    [onTimeUpdate, segment.startSecond, onClick],
  );

  return (
    <button
      className={cn(
        "rounded-md px-2 py-1.5 text-left text-[13px] leading-relaxed",
        showTimestamp && "flex w-full items-baseline gap-3",
        isActive ? "bg-accent-soft text-foreground" : "text-muted-foreground",
        onSeek && "cursor-pointer hover:text-foreground",
        !onSeek && "cursor-default",
        className,
      )}
      aria-current={isActive ? "true" : undefined}
      data-active={isActive}
      data-past={isPast}
      data-index={index}
      data-slot="transcription-segment"
      onClick={handleClick}
      type="button"
      {...props}
    >
      {showTimestamp && (
        <span className="shrink-0 font-mono text-[12px] tabular-nums">
          {Math.floor(segment.startSecond / 60)}:{String(Math.floor(segment.startSecond % 60)).padStart(2, "0")}
        </span>
      )}
      <span>{children ?? segment.text}</span>
    </button>
  );
};
