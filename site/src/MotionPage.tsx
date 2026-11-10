import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { spring } from "@sift-design/tokens/motion";
import { Button } from "@sift-design/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@sift-design/ui/select";
import { Label } from "@sift-design/ui/label";
import { Markdown } from "./Markdown";
import { Clip } from "./Clip";

const clips = [
  { title: "A menu opens from its button", src: "specimen/clip-dropdown-menu" },
  { title: "Selection moves between options", src: "specimen/clip-segmented" },
  { title: "Open details, then go back", src: "specimen/clip-push-pop" },
  { title: "A sheet slides in from its edge", src: "specimen/clip-sheet" },
  { title: "Collapse and expand the sidebar", src: "workbench/workbench-motion-rail-collapse" },
  { title: "Open a growing area, then return to the list", src: "workbench/workbench-motion-area-drill" },
];
export default function MotionPage() {
  const [preset, setPreset] = useState<keyof typeof spring>("smooth");
  const [end, setEnd] = useState(false);
  const [distance, setDistance] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setDistance(Math.max(0, entry.contentRect.width - 56)));
    if (track.current) observer.observe(track.current);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <p className="lead">
        Animations help you follow changes: a menu opens from its button, a panel slides in from the edge,
        and a list makes room for a new item. Shared spring settings let movement reverse without a jump.
        Use these patterns where your product needs them; the example screens are not required layouts.
      </p>
      <section className="playground" aria-labelledby="playground-title">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="playground-title">Try a spring</h2>
            <p className="support">
              Choose a preset, then run it. Click again while the block moves to reverse it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Label htmlFor="spring-preset">Preset</Label>
            <Select value={preset} onValueChange={(value) => setPreset(value as keyof typeof spring)}>
              <SelectTrigger id="spring-preset" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(spring).map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setEnd(!end)}>Run spring</Button>
          </div>
        </div>
        <div ref={track} className="spring-track">
          <motion.div
            className="spring-block"
            animate={reduced ? { x: 0, opacity: end ? 0.45 : 1 } : { x: end ? distance : 0, opacity: 1 }}
            transition={reduced ? { duration: 0.14 } : spring[preset]}
          />
          <span>Start</span>
          <span>End</span>
        </div>
        <code>{JSON.stringify(spring[preset])}</code>
        {reduced && (
          <p role="status" className="support">
            Reduced motion is on: the block fades instead of moving.
          </p>
        )}
      </section>
      <section className="page-section">
        <h2>Motion in the components and examples</h2>
        <p className="support">Recorded in real time from the kit and the blocks. Each clip plays while it is on screen.</p>
        <div className="clip-grid">
          {clips.map((clip) => (
            <figure key={clip.title}>
              <Clip src={clip.src} label={clip.title} />
              <figcaption>{clip.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <Markdown file="docs/motion.md" />
    </>
  );
}
