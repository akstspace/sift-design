import { lazy, Suspense, useEffect, useId, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { selectionSpring } from "@sift-design/tokens/motion";
import { SiblingTransition } from "@sift-design/ui/page-transition";
import { Button } from "@sift-design/ui/button";
import { Spinner } from "@sift-design/ui/spinner";
import { Markdown } from "./Markdown";
import { at } from "./base";
const Controls = lazy(() => import("../../specimen/src/sections/Controls"));
const Overlays = lazy(() => import("../../specimen/src/sections/Overlays"));
const Display = lazy(() => import("../../specimen/src/sections/Display"));
const families = [
  { name: "controls", title: "Controls", description: "Buttons, text fields, checkboxes, pickers, and forms." },
  {
    name: "overlays",
    title: "Overlays and menus",
    description: "Dialogs, slide-in panels, menus, tooltips, and search.",
  },
  {
    name: "display",
    title: "Display and navigation",
    description: "Sidebars, tables, messages, expandable sections, and page transitions.",
  },
];
export default function ComponentsPage({ family = "controls" }: { family?: string }) {
  const Section = family === "display" ? Display : family === "overlays" ? Overlays : Controls;
  const reduced = !!useReducedMotion();
  const selectionId = useId();
  const previous = useRef(family);
  const direction =
    families.findIndex((item) => item.name === family) >= families.findIndex((item) => item.name === previous.current)
      ? 1
      : -1;
  // This ref records only committed selections, including interrupted navigation.
  useEffect(() => {
    previous.current = family;
  }, [family]);
  return (
    <>
      <p className="lead">
        Try reusable controls, menus, and layout components: fill in a form, open a menu, or switch views.
        Choose only what your product needs. Each example explains the component’s behavior, not a required app feature.
      </p>
      <nav className="family-tabs" aria-label="Component families">
        {families.map((item) => (
          <Button key={item.name} asChild variant="outline">
            <a aria-current={family === item.name ? "page" : undefined} href={at(`/components/${item.name}`)}>
              {family === item.name && (
                <motion.span
                  className="family-selection"
                  aria-hidden
                  layoutId={reduced ? undefined : selectionId}
                  initial={false}
                  transition={reduced ? { duration: 0 } : selectionSpring}
                />
              )}
              <span className="family-label">{item.title}</span>
            </a>
          </Button>
        ))}
      </nav>
      <SiblingTransition pageKey={family} direction={direction} focusHeading={false}>
        <p className="support">
          {families.find((item) => item.name === family)?.description} The examples use fictional data; they do not
          change real product data or require the example’s data model.
        </p>
        <div className="live-specimen">
          <Suspense
            fallback={
              <p className="flex items-center gap-2" role="status">
                <Spinner />
                Loading the examples…
              </p>
            }
          >
            <Section />
          </Suspense>
        </div>
        <section className="page-section">
          <h2>How to use these components</h2>
          <Markdown file={`packages/ui/docs/${family}.md`} />
        </section>
      </SiblingTransition>
    </>
  );
}
