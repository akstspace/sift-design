import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { cn } from "cn";
import { at } from "./base";

/**
 * A real-time motion recording. `src` is the clip's path under /raw/screenshots
 * without an extension; each clip ships as an H.264 MP4 with a JPEG poster.
 * It plays muted and looped only while on screen, never autoplays with reduced
 * motion, and always has a pause control.
 */
export function Clip({
  src,
  label,
  width = 1440,
  height = 900,
  className,
}: {
  src: string;
  label: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(true);
  const [held, setHeld] = useState(false);
  const base = at(`/raw/screenshots/${src}`);

  useEffect(() => {
    const node = video.current;
    if (!node || reduced || held) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.preload = "auto";
          void node.play().catch(() => setPaused(true));
        } else node.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, held]);

  const toggle = () => {
    const node = video.current;
    if (!node) return;
    if (node.paused) {
      setHeld(false);
      void node.play();
    } else {
      setHeld(true);
      node.pause();
    }
  };

  return (
    <span className={cn("clip", className)}>
      <video
        ref={video}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="none"
        poster={`${base}.jpg`}
        aria-label={label}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
      >
        <source src={`${base}.mp4`} type="video/mp4" />
      </video>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="clip-toggle"
        aria-label={paused ? `Play: ${label}` : `Pause: ${label}`}
        onClick={toggle}
      >
        {paused ? <IconPlayerPlayFilled aria-hidden /> : <IconPlayerPauseFilled aria-hidden />}
      </Button>
    </span>
  );
}
