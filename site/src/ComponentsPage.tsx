import { lazy, Suspense } from "react";
import { Button } from "@sift-design/ui/button";
import { Spinner } from "@sift-design/ui/spinner";
import { Markdown } from "./Markdown";
import { at } from "./base";
const Controls = lazy(() => import("../../specimen/src/sections/Controls"));
const Overlays = lazy(() => import("../../specimen/src/sections/Overlays"));
const Display = lazy(() => import("../../specimen/src/sections/Display"));
const families = [
  { name: "controls", title: "Controls", description: "Buttons, fields, selection, forms, and direct input." },
  {
    name: "overlays",
    title: "Overlays and menus",
    description: "Dialogs, sheets, menus, commands, and anchored context.",
  },
  {
    name: "display",
    title: "Display and navigation",
    description: "Rails, tables, feedback, disclosure, and page continuity.",
  },
];
export default function ComponentsPage({ family = "controls" }: { family?: string }) {
  const Section = family === "display" ? Display : family === "overlays" ? Overlays : Controls;
  return (
    <>
      <p className="lead">
        These are the kit components themselves, running on this page. Use the controls, open a sheet, and click again
        during a transition to reverse it.
      </p>
      <nav className="family-tabs" aria-label="Component families">
        {families.map((item) => (
          <Button key={item.name} asChild variant={family === item.name ? "default" : "outline"}>
            <a aria-current={family === item.name ? "page" : undefined} href={at(`/components/${item.name}`)}>
              {item.title}
            </a>
          </Button>
        ))}
      </nav>
      <p className="support">
        {families.find((item) => item.name === family)?.description} The sample content is illustrative; changes stay in
        your browser.
      </p>
      <div className="live-specimen">
        <Suspense
          fallback={
            <p className="flex items-center gap-2" role="status">
              <Spinner />
              Loading the live specimen…
            </p>
          }
        >
          <Section />
        </Suspense>
      </div>
      <section className="page-section">
        <h2>Using this family</h2>
        <Markdown file={`packages/ui/docs/${family}.md`} />
      </section>
    </>
  );
}
