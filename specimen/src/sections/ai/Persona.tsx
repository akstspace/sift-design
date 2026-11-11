import { useEffect, useRef, useState } from "react";
import { IconPlayerPlay, IconPlayerStop } from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { duration, leave, settle } from "@sift-design/tokens/motion";
import { Persona, type PersonaState, type PersonaVariant } from "@sift-design/ui/ai/persona";
import { Button } from "@sift-design/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@sift-design/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@sift-design/ui/select";
import { Message, MessageContent, MessageHeader } from "@sift-design/ui/message";
import { SpecimenItem } from "../../frame";

const states: PersonaState[] = ["idle", "listening", "thinking", "speaking", "asleep"];
const variants: { value: PersonaVariant; label: string }[] = [
  { value: "command", label: "Rounded square" },
  { value: "glint", label: "Soft diamond" },
  { value: "halo", label: "Concentric rings" },
  { value: "mana", label: "Nested shapes" },
  { value: "obsidian", label: "Offset squares" },
  { value: "opal", label: "Wide rings" },
];
const status: Record<PersonaState, string> = {
  idle: "Ready for your next question.",
  listening: "Listening to your greenhouse question.",
  thinking: "Checking the propagation house notes.",
  speaking: "Reading the greenhouse update.",
  asleep: "Paused until you need help.",
};

export default function PersonaExamples() {
  const [state, setState] = useState<PersonaState>("idle");
  const reduced = useReducedMotion();
  const [variant, setVariant] = useState<PersonaVariant>("obsidian");
  const [level, setLevel] = useState(0.35);
  const [simulating, setSimulating] = useState(false);
  const frame = useRef(0);

  const stop = () => {
    cancelAnimationFrame(frame.current);
    setSimulating(false);
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const simulate = () => {
    stop();
    setState("speaking");
    setSimulating(true);
    const start = performance.now();
    const tick = (now: number) => {
      const time = (now - start) / 1000;
      if (time >= 5) {
        setLevel(0);
        setSimulating(false);
        setState("idle");
        return;
      }
      const envelope = Math.sin((Math.min(1, time / 0.3) * Math.PI) / 2) * Math.min(1, (5 - time) / 0.5);
      const syllable = Math.abs(Math.sin(time * 8.2) * Math.cos(time * 3.4));
      setLevel(Math.min(1, (0.1 + syllable * 0.9) * envelope));
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };

  return (
    <>
      <SpecimenItem
        name="Persona"
        note="Show the assistant state without remote assets. Shapes settle on springs, and activity stops when the state changes."
        wide
      >
        <div className="flex w-full min-w-0 flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ToggleGroup
              type="single"
              value={state}
              aria-label="Assistant state"
              className="ai-persona-state-controls max-w-full bg-tint"
              onValueChange={(next) => {
                if (!next) return;
                stop();
                setState(next as PersonaState);
              }}
            >
              {states.map((value) => (
                <ToggleGroupItem value={value} key={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Select value={variant} onValueChange={(next) => setVariant(next as PersonaVariant)}>
              <SelectTrigger aria-label="Persona variant" className="min-w-40 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {variants.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="ai-persona-demo-stage flex min-h-72 flex-col items-center justify-center gap-5 rounded-lg px-4 py-7">
            <Persona state={state} variant={variant} level={level} className="size-40" />
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-[14px] font-medium">Fernbrook assistant</p>
              <p role="status" className="grid text-[13px] text-muted-foreground">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={state}
                    className="col-start-1 row-start-1"
                    initial={{ opacity: 0, y: reduced ? 0 : 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduced ? 0 : -2, transition: { duration: duration.instant, ease: leave } }}
                    transition={{ duration: duration.quick, ease: "linear", y: { duration: 0.2, ease: settle } }}
                  >
                    {status[state]}
                  </motion.span>
                </AnimatePresence>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <label className="flex min-w-0 items-center gap-3 text-[13px]">
              Input level
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={level}
                disabled={simulating}
                aria-label="Input level"
                className="w-24 accent-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                onChange={(event) => setLevel(Number(event.target.value))}
              />
              <span aria-hidden="true" className="w-9 font-mono text-[12px] text-muted-foreground">
                {level.toFixed(2)}
              </span>
            </label>
            <Button
              variant="outline"
              onClick={
                simulating
                  ? () => {
                      stop();
                      setState("idle");
                    }
                  : simulate
              }
            >
              {simulating ? <IconPlayerStop aria-hidden="true" /> : <IconPlayerPlay aria-hidden="true" />}
              {simulating ? "Stop simulation" : "Simulate speaking"}
            </Button>
          </div>
          <p className="text-[12px] text-muted-foreground">
            The simulation runs for five seconds. Input level controls listening and speaking.
          </p>

          <div className="border-t pt-5">
            <Message reflow={false} className="items-start gap-3">
              <Persona state="idle" variant={variant} className="size-10" aria-label="Assistant: ready" />
              <MessageContent>
                <MessageHeader className="px-0">
                  <span className="text-[13px] font-medium">Fernbrook assistant</span>
                </MessageHeader>
                <p className="max-w-xl text-[14px] leading-relaxed">
                  The propagation house is ready for the morning check. Start with the misting nozzles on bench 3.
                </p>
                <p className="text-[12px] text-muted-foreground">Saved in the greenhouse notes.</p>
              </MessageContent>
            </Message>
          </div>
        </div>
      </SpecimenItem>
    </>
  );
}
