import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { spring } from "@sift-design/tokens/motion";
import { IconArrowRight, IconPlayerPlay } from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Switch } from "@sift-design/ui/switch";
import { Label } from "@sift-design/ui/label";
import { at } from "../base";
import { Reveal } from "./Reveal";

const presets = [
  { name: "smooth", role: "Panels, pages, sheets and disclosure" },
  { name: "snappy", role: "Menus, popovers, toggles and selection" },
  { name: "lively", role: "Real success, used rarely" },
  { name: "press", role: "Press and release" },
  { name: "travel", role: "Full-width moves on phones" },
  { name: "exit", role: "Leaving, with no overshoot" },
] as const;

type Name = (typeof presets)[number]["name"];

/** The same mapping Motion uses for { visualDuration, bounce }, sampled until the value rests. */
function simulate(visualDuration: number, bounce: number) {
  const root = (2 * Math.PI) / (visualDuration * 1.2);
  const stiffness = root * root;
  const damping = 2 * Math.min(1, Math.max(0.05, 1 - bounce)) * Math.sqrt(stiffness);
  const dt = 1 / 600;
  let x = 0,
    v = 0,
    t = 0;
  const points: [number, number][] = [];
  while (t < 3) {
    points.push([t, x]);
    const a = stiffness * (1 - x) - damping * v;
    v += a * dt;
    x += v * dt;
    t += dt;
    if (t > 0.05 && Math.abs(1 - x) < 0.002 && Math.abs(v) < 0.02) break;
  }
  points.push([t, 1]);
  return { points, settle: t };
}

const W = 132,
  H = 44,
  PAD = 4,
  TOP = 1.25;
const curves = Object.fromEntries(
  presets.map(({ name }) => [name, simulate(spring[name].visualDuration, spring[name].bounce)]),
) as Record<Name, ReturnType<typeof simulate>>;
const span = Math.max(...Object.values(curves).map((c) => c.settle));
const y = (x: number) => H - PAD - (x / TOP) * (H - PAD * 2);
const paths = Object.fromEntries(
  Object.entries(curves).map(([name, { points }]) => [
    name,
    points
      .filter((_, i) => i % 6 === 0 || i === points.length - 1)
      .map(([t, x], i) => `${i ? "L" : "M"}${((t / span) * W).toFixed(1)},${y(x).toFixed(1)}`)
      .join(" "),
  ]),
) as Record<Name, string>;

function Lane({
  name,
  role,
  on,
  run,
  calm,
  onPlay,
}: {
  name: Name;
  role: string;
  on: boolean;
  run: number;
  calm: boolean;
  onPlay: () => void;
}) {
  const preset = spring[name];
  const settle = curves[name].settle;
  return (
    <li>
      <button type="button" className="lane" onClick={onPlay}>
        {/* The visible text is the name; "Play" in front says what a click does. */}
        <span className="sr-only">Play </span>
        <span className="lane-name">
          <code>spring.{name}</code>
          <span>{role}</span>
        </span>
        <svg className="lane-curve" viewBox={`0 0 ${W} ${H}`} aria-hidden>
          <line x1="0" x2={W} y1={y(1)} y2={y(1)} className="lane-target" />
          <path d={paths[name]} className="lane-ghost" />
          <motion.path
            key={run}
            d={paths[name]}
            className="lane-trace"
            initial={{ pathLength: run ? 0 : 1 }}
            animate={{ pathLength: 1 }}
            transition={calm ? { duration: 0 } : { duration: settle, ease: "linear" }}
          />
        </svg>
        <span className="lane-track" data-on={on || undefined}>
          {calm ? (
            <span className="lane-run">
              <AnimatePresence initial={false}>
                <motion.span
                  key={String(on)}
                  className="lane-puck"
                  style={{ left: on ? "100%" : "0%" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.14 } }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                />
              </AnimatePresence>
            </span>
          ) : (
            <motion.span className="lane-run" initial={false} animate={{ x: on ? "100%" : "0%" }} transition={preset}>
              <span className="lane-puck" />
            </motion.span>
          )}
        </span>
        <span className="lane-time">
          <code>{Math.round(preset.visualDuration * 1000)} ms</code>
          <span>bounce {preset.bounce}</span>
        </span>
      </button>
    </li>
  );
}

export function SpringLab() {
  const systemReduced = !!useReducedMotion();
  const [calm, setCalm] = useState(systemReduced);
  const [state, setState] = useState(
    () =>
      Object.fromEntries(presets.map(({ name }) => [name, { on: false, run: 0 }])) as Record<
        Name,
        { on: boolean; run: number }
      >,
  );
  const lab = useRef<HTMLDivElement>(null);
  const seen = useInView(lab, { once: true, amount: 0.6 });
  const toggle = (names: Name[], to?: boolean) =>
    setState((prev) => {
      const next = { ...prev };
      for (const name of names) next[name] = { on: to ?? !prev[name].on, run: prev[name].run + 1 };
      return next;
    });
  const all = presets.map((p) => p.name);
  const allOn = all.every((name) => state[name].on);
  useEffect(() => {
    // Run once when the lab first comes into view, so the curves are seen moving.
    if (!seen || systemReduced) return;
    const timer = window.setTimeout(() => toggle(all, true), 180);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);
  return (
    <section className="landing-motion" id="motion" aria-labelledby="motion-heading">
      <div className="section-head">
        <Reveal as="h2" id="motion-heading">
          Motion you can interrupt
        </Reveal>
        <Reveal delay={0.06}>
          <p className="section-lede">
            Six spring presets, chosen by role. A spring keeps its speed when its target changes, so a panel closed
            halfway turns around from where it is. Click a lane twice, quickly, to feel it.
          </p>
          <a className="landing-link" href={at("/motion")}>
            Read the motion guide
            <IconArrowRight aria-hidden size={17} />
          </a>
        </Reveal>
      </div>
      <Reveal className="spring-lab" delay={0.1}>
        <div ref={lab}>
          <div className="lab-bar">
            <Button variant="secondary" size="sm" onClick={() => toggle(all, !allOn)} className="lab-play">
              <IconPlayerPlay aria-hidden />
              Play all
            </Button>
            <div className="lab-calm">
              <Switch id="lab-calm" checked={calm} onCheckedChange={setCalm} />
              <Label htmlFor="lab-calm">Reduced motion</Label>
            </div>
            <span className="lab-legend" aria-hidden>
              <span /> position over time
            </span>
          </div>
          <ul className="lanes">
            {presets.map(({ name, role }) => (
              <Lane
                key={name}
                name={name}
                role={role}
                on={state[name].on}
                run={state[name].run}
                calm={calm}
                onPlay={() => toggle([name])}
              />
            ))}
          </ul>
          <p className="lab-note" aria-live="polite">
            {calm
              ? "With reduced motion, nothing travels. The change is a short fade in place."
              : "Curves come from the same spring settings the components use."}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
