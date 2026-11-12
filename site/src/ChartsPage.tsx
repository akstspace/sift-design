import { useEffect, useId, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { selectionSpring } from "@sift-design/tokens/motion";
import { SiblingTransition } from "@sift-design/ui/page-transition";
import { Button } from "@sift-design/ui/button";
import { ChartGroup, chartGroups } from "../../specimen/src/sections/Charts";
import { Markdown } from "./Markdown";
import { chartTypes, slug } from "./content";
import { at } from "./base";

const DOC = "packages/ui/docs/charts.md";

/** One tab per chart type. Each tab shows its charts in subsections, then how to use them. */
export default function ChartsPage({ type = "area" }: { type?: string }) {
  const current = chartTypes.find((item) => item.id === type) ?? chartTypes[0];
  const reduced = !!useReducedMotion();
  const selectionId = useId();
  const previous = useRef(current.id);
  const index = (id: string) => chartTypes.findIndex((item) => item.id === id);
  const direction = index(current.id) >= index(previous.current) ? 1 : -1;
  // This ref records only committed selections, including interrupted navigation.
  useEffect(() => {
    previous.current = current.id;
  }, [current.id]);
  return (
    <>
      <p className="lead">
        Seventy charts in seven types. Each chart is one copyable file built on the kit chart component. Marks arrive on
        the shared spring and morph when the data changes, and every chart has a data table.
      </p>
      <nav className="family-tabs" aria-label="Chart types">
        {chartTypes.map((item) => (
          <Button key={item.id} asChild variant="outline">
            <a aria-current={current.id === item.id ? "page" : undefined} href={at(`/charts/${item.id}`)}>
              {current.id === item.id && (
                <motion.span
                  className="family-selection"
                  aria-hidden
                  layoutId={reduced ? undefined : selectionId}
                  initial={false}
                  transition={reduced ? { duration: 0 } : selectionSpring}
                />
              )}
              <span className="family-label">{item.tab}</span>
            </a>
          </Button>
        ))}
      </nav>
      <SiblingTransition pageKey={current.id} direction={direction} focusHeading={false}>
        <p className="support">
          {chartGroups.find((group) => group.id === current.id)?.description} The examples use fictional greenhouse
          data.
        </p>
        <div className="live-specimen">
          <ChartGroup group={current.id} />
        </div>
        <section className="page-section">
          <h2 id={slug(current.doc)}>How to use {current.page.toLowerCase()}</h2>
          <Markdown file={DOC} section={current.doc} />
        </section>
        <section className="page-section">
          <h2 id="chart">The chart component</h2>
          <Markdown file={DOC} section="Chart" />
        </section>
      </SiblingTransition>
    </>
  );
}
