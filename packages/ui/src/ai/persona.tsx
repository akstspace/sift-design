import { cn } from "cn";
import { memo, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { duration, spring } from "@sift-design/tokens/motion";

export type PersonaState = "idle" | "listening" | "thinking" | "speaking" | "asleep";
export type PersonaVariant = "command" | "glint" | "halo" | "mana" | "obsidian" | "opal";

/** Local lifecycle events. No animation player or remote asset is created. */
export interface PersonaEvent {
  type: "load" | "play" | "pause" | "stop";
  data?: PersonaState;
}

export interface PersonaProps {
  state: PersonaState;
  variant?: PersonaVariant;
  className?: string;
  /** Input amplitude, clamped to 0–1. Omit to use the speaking pulse. */
  level?: number;
  "aria-label"?: string;
  onLoad?: (event: PersonaEvent) => void;
  onLoadError?: (error: Error) => void;
  onReady?: () => void;
  onPause?: (event: PersonaEvent) => void;
  onPlay?: (event: PersonaEvent) => void;
  onStop?: (event: PersonaEvent) => void;
}

const variants = {
  command: { radius: 13, rotation: 0, innerRotation: 0, inset: 23 },
  glint: { radius: 18, rotation: 45, innerRotation: 0, inset: 25 },
  halo: { radius: 38, rotation: 0, innerRotation: 0, inset: 23 },
  mana: { radius: 25, rotation: 0, innerRotation: 45, inset: 22 },
  obsidian: { radius: 24, rotation: -12, innerRotation: 24, inset: 23 },
  opal: { radius: 38, rotation: 0, innerRotation: -30, inset: 19 },
} as const;

export const Persona = memo(function Persona({
  state = "idle",
  variant = "obsidian",
  className,
  level,
  "aria-label": label,
  onLoad,
  onLoadError,
  onReady,
  onPause,
  onPlay,
  onStop,
}: PersonaProps) {
  const reduced = !!useReducedMotion();
  const shape = variants[variant];
  const amplitude = Number.isFinite(level) ? Math.min(1, Math.max(0, level!)) : 0;
  const listening = state === "listening";
  const speaking = state === "speaking";
  const thinking = state === "thinking";
  const asleep = state === "asleep";
  const active = listening || speaking || thinking;
  const callbacks = useRef({ onLoad, onLoadError, onReady, onPause, onPlay, onStop });

  useEffect(() => {
    callbacks.current = { onLoad, onLoadError, onReady, onPause, onPlay, onStop };
  }, [onLoad, onLoadError, onReady, onPause, onPlay, onStop]);

  useEffect(() => {
    // The canceled first frame also avoids duplicate initialization in strict mode.
    const frame = requestAnimationFrame(() => {
      callbacks.current.onLoad?.({ type: "load" });
      callbacks.current.onReady?.();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (asleep || (active && reduced)) callbacks.current.onPause?.({ type: "pause", data: state });
      else if (active) callbacks.current.onPlay?.({ type: "play", data: state });
      else callbacks.current.onStop?.({ type: "stop", data: state });
    });
    return () => cancelAnimationFrame(frame);
  }, [state, active, asleep, reduced]);

  if (!shape) throw new Error(`Invalid variant: ${variant}`);

  const transition = reduced ? { duration: 0 } : spring.smooth;
  const fade = { duration: duration.quick, ease: "linear" as const };
  const liveScale = listening || speaking ? 1 + amplitude * 0.1 : asleep ? 0.92 : 1;

  return (
    <motion.div
      data-slot="persona"
      data-state={state}
      data-variant={variant}
      role="img"
      aria-label={label ?? `Assistant: ${state}`}
      className={cn("relative inline-flex size-16 shrink-0 items-center justify-center", className)}
      initial={false}
      animate={{ opacity: asleep ? 0.45 : 1 }}
      transition={fade}
    >
      <svg viewBox="0 0 100 100" className="size-full overflow-visible" aria-hidden="true" focusable="false">
        <motion.g
          initial={false}
          animate={{ scale: reduced ? 1 : liveScale, rotate: reduced ? 0 : shape.rotation }}
          transition={transition}
          className="ai-persona-origin"
        >
          <rect x="14" y="14" width="72" height="72" rx={shape.radius} className="ai-persona-shell" />
          <motion.g
            initial={false}
            animate={{ rotate: reduced ? 0 : shape.innerRotation, scale: asleep && !reduced ? 0.88 : 1 }}
            transition={transition}
            className="ai-persona-origin"
          >
            <rect
              x={shape.inset}
              y={shape.inset}
              width={100 - shape.inset * 2}
              height={100 - shape.inset * 2}
              rx={Math.max(10, shape.radius - 7)}
              className="ai-persona-inner"
            />
          </motion.g>
        </motion.g>
        <motion.g
          initial={false}
          animate={{ rotate: thinking && !reduced ? 360 : 0, opacity: thinking || listening ? 1 : 0 }}
          transition={{
            rotate: thinking && !reduced ? { duration: 8, repeat: Infinity, ease: "linear" } : transition,
            opacity: fade,
          }}
          className="ai-persona-origin"
        >
          <circle cx="50" cy="11" r={thinking ? 3 : 2} className="ai-persona-satellite" />
          <circle cx="50" cy="89" r="2" className="ai-persona-satellite" />
        </motion.g>
        <motion.g
          initial={false}
          animate={{ scale: speaking && level === undefined && !reduced ? [1, 1.08, 1] : 1 }}
          transition={speaking && level === undefined && !reduced ? { duration: 1.4, repeat: Infinity } : transition}
          className="ai-persona-origin"
        >
          <circle cx="50" cy="50" r="18" className="ai-persona-core" />
        </motion.g>
        <motion.g initial={false} animate={{ opacity: state === "idle" ? 1 : 0 }} transition={fade}>
          <rect x="46" y="46" width="8" height="8" rx="3" className="ai-persona-glyph" />
        </motion.g>
        <motion.g initial={false} animate={{ opacity: listening ? 1 : 0 }} transition={fade}>
          <circle cx="50" cy="50" r="7" className="ai-persona-listening" />
        </motion.g>
        <motion.g initial={false} animate={{ opacity: thinking ? 1 : 0 }} transition={fade}>
          {[43, 50, 57].map((x) => (
            <circle key={x} cx={x} cy="50" r="2" className="ai-persona-glyph" />
          ))}
        </motion.g>
        <motion.g initial={false} animate={{ opacity: speaking ? 1 : 0 }} transition={fade}>
          {[0.55, 1, 0.75, 0.45].map((height, index) => (
            <motion.rect
              key={index}
              x={40 + index * 6}
              y="42"
              width="4"
              height="16"
              rx="2"
              className="ai-persona-glyph ai-persona-bar"
              initial={false}
              animate={{ scaleY: reduced ? height : height * (0.45 + amplitude * 0.55) }}
              transition={transition}
            />
          ))}
        </motion.g>
        <motion.g initial={false} animate={{ opacity: asleep ? 1 : 0 }} transition={fade}>
          <path d="M43 50h14" className="ai-persona-listening" />
        </motion.g>
      </svg>
    </motion.div>
  );
});

Persona.displayName = "Persona";
