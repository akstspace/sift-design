import { cn } from "cn";
import type { Experimental_SpeechResult as SpeechResult } from "ai";
import {
  MediaControlBar,
  MediaController,
  MediaDurationDisplay,
  MediaMuteButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconRewindBackward10,
  IconRewindForward10,
  IconVolume,
  IconVolume2,
  IconVolumeOff,
} from "@tabler/icons-react";
import type { ComponentProps, ComponentRef } from "react";
import { useEffect, useImperativeHandle, useRef } from "react";

export type AudioPlayerProps = Omit<ComponentProps<typeof MediaController>, "audio">;

export const AudioPlayer = ({ className, ...props }: AudioPlayerProps) => (
  <MediaController audio data-slot="audio-player" className={cn("w-full text-foreground", className)} {...props} />
);

export type AudioPlayerElementProps = Omit<ComponentProps<"audio">, "src"> &
  ({ data: SpeechResult["audio"] } | { src: string });

export const AudioPlayerElement = (props: AudioPlayerElementProps) => {
  const { data, src, ...audioProps } = props as Omit<ComponentProps<"audio">, "src"> & {
    data?: SpeechResult["audio"];
    src?: string;
  };
  return (
    <audio
      data-slot="audio-player-element"
      slot="media"
      src={src ?? (data ? `data:${data.mediaType};base64,${data.base64}` : undefined)}
      {...audioProps}
    />
  );
};

export type AudioPlayerControlBarProps = ComponentProps<typeof MediaControlBar>;
export const AudioPlayerControlBar = ({ className, ...props }: AudioPlayerControlBarProps) => (
  <MediaControlBar data-slot="audio-player-control-bar" className={cn("w-full", className)} {...props} />
);

export type AudioPlayerPlayButtonProps = ComponentProps<typeof MediaPlayButton>;
export const AudioPlayerPlayButton = ({ children, ...props }: AudioPlayerPlayButtonProps) => (
  <MediaPlayButton data-slot="audio-player-play-button" {...props}>
    {children ?? (
      <>
        <span slot="play">
          <IconPlayerPlay aria-hidden />
        </span>
        <span slot="pause">
          <IconPlayerPause aria-hidden />
        </span>
      </>
    )}
  </MediaPlayButton>
);

export type AudioPlayerSeekBackwardButtonProps = ComponentProps<typeof MediaSeekBackwardButton>;
export const AudioPlayerSeekBackwardButton = ({
  seekOffset = 10,
  children,
  ...props
}: AudioPlayerSeekBackwardButtonProps) => (
  <MediaSeekBackwardButton data-slot="audio-player-seek-backward-button" seekOffset={seekOffset} {...props}>
    {children ?? (
      <span slot="icon">
        <IconRewindBackward10 aria-hidden />
      </span>
    )}
  </MediaSeekBackwardButton>
);

export type AudioPlayerSeekForwardButtonProps = ComponentProps<typeof MediaSeekForwardButton>;
export const AudioPlayerSeekForwardButton = ({
  seekOffset = 10,
  children,
  ...props
}: AudioPlayerSeekForwardButtonProps) => (
  <MediaSeekForwardButton data-slot="audio-player-seek-forward-button" seekOffset={seekOffset} {...props}>
    {children ?? (
      <span slot="icon">
        <IconRewindForward10 aria-hidden />
      </span>
    )}
  </MediaSeekForwardButton>
);

export type AudioPlayerTimeDisplayProps = ComponentProps<typeof MediaTimeDisplay>;
export const AudioPlayerTimeDisplay = ({
  className,
  ref,
  "aria-label": label,
  ...props
}: AudioPlayerTimeDisplayProps) => {
  const elementRef = useRef<ComponentRef<typeof MediaTimeDisplay>>(null);
  useImperativeHandle(ref, () => elementRef.current!);
  useEffect(() => {
    const element = elementRef.current;
    if (!element?.shadowRoot) return;
    const updateName = () => {
      const visibleTime = element.shadowRoot?.querySelector("slot")?.textContent?.trim() ?? "";
      const nextLabel = `${label ?? "Playback time"} ${visibleTime}`.trim();
      if (element.getAttribute("aria-label") !== nextLabel) element.setAttribute("aria-label", nextLabel);
    };
    const observer = new MutationObserver(updateName);
    observer.observe(element.shadowRoot, { childList: true, characterData: true, subtree: true });
    observer.observe(element, { attributes: true, attributeFilter: ["aria-label"] });
    updateName();
    return () => observer.disconnect();
  }, [label]);
  return (
    <MediaTimeDisplay
      ref={elementRef}
      data-slot="audio-player-time-display"
      className={cn("font-mono tabular-nums", className)}
      {...props}
    />
  );
};

export type AudioPlayerTimeRangeProps = ComponentProps<typeof MediaTimeRange>;
export const AudioPlayerTimeRange = ({ className, ...props }: AudioPlayerTimeRangeProps) => (
  <MediaTimeRange data-slot="audio-player-time-range" className={cn("min-w-0 flex-1", className)} {...props} />
);

export type AudioPlayerDurationDisplayProps = ComponentProps<typeof MediaDurationDisplay>;
export const AudioPlayerDurationDisplay = ({ className, ...props }: AudioPlayerDurationDisplayProps) => (
  <MediaDurationDisplay
    data-slot="audio-player-duration-display"
    className={cn("font-mono tabular-nums", className)}
    {...props}
  />
);

export type AudioPlayerMuteButtonProps = ComponentProps<typeof MediaMuteButton>;
export const AudioPlayerMuteButton = ({ children, ...props }: AudioPlayerMuteButtonProps) => (
  <MediaMuteButton data-slot="audio-player-mute-button" {...props}>
    {children ?? (
      <>
        <span slot="off">
          <IconVolumeOff aria-hidden />
        </span>
        <span slot="low">
          <IconVolume2 aria-hidden />
        </span>
        <span slot="medium">
          <IconVolume2 aria-hidden />
        </span>
        <span slot="high">
          <IconVolume aria-hidden />
        </span>
      </>
    )}
  </MediaMuteButton>
);

export type AudioPlayerVolumeRangeProps = ComponentProps<typeof MediaVolumeRange>;
export const AudioPlayerVolumeRange = ({ className, ...props }: AudioPlayerVolumeRangeProps) => (
  <MediaVolumeRange data-slot="audio-player-volume-range" className={cn("w-20", className)} {...props} />
);
