import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { Spinner } from "@sift-design/ui/spinner";
import { SpecimenGroup } from "../frame";

// One file per chart type. Each chart is its own copyable file in src/charts/,
// named after the upstream block it ports. `?charts=<group>` shows one group alone.
const groups: Record<string, LazyExoticComponent<ComponentType>> = {
  area: lazy(() => import("./charts/Area")),
  bar: lazy(() => import("./charts/Bar")),
  line: lazy(() => import("./charts/Line")),
  pie: lazy(() => import("./charts/Pie")),
  radar: lazy(() => import("./charts/Radar")),
  radial: lazy(() => import("./charts/Radial")),
  tooltip: lazy(() => import("./charts/Tooltip")),
};

const sections = [
  {
    id: "charts-area",
    group: "area",
    title: "Area charts",
    intro: "Show how a total changes over time, and how its parts add up to it.",
  },
  {
    id: "charts-bar",
    group: "bar",
    title: "Bar charts",
    intro: "Compare amounts across a few categories or periods on a common baseline.",
  },
  {
    id: "charts-line",
    group: "line",
    title: "Line charts",
    intro: "Show a trend over time, or compare the trends of a few series.",
  },
  {
    id: "charts-pie",
    group: "pie",
    title: "Pie and donut charts",
    intro: "Show the parts of one whole when there are only a few parts.",
  },
  {
    id: "charts-radar",
    group: "radar",
    title: "Radar charts",
    intro: "Compare a few records across the same set of measures.",
  },
  {
    id: "charts-radial",
    group: "radial",
    title: "Radial charts",
    intro: "Show progress toward a goal, or a few values on a circular track.",
  },
  {
    id: "charts-tooltip",
    group: "tooltip",
    title: "Tooltips",
    intro: "Show exact values on hover or focus. A table under each chart keeps the values available without hover.",
  },
];

export default function Charts() {
  const only = new URLSearchParams(location.search).get("charts");
  return (
    <div id="charts" className="flex flex-col gap-14">
      {sections
        .filter((section) => !only || section.group === only)
        .map((section) => {
          const Group = groups[section.group];
          return (
            <SpecimenGroup key={section.id} id={section.id} title={section.title} intro={section.intro} min={340}>
              <Suspense
                fallback={
                  <p className="flex items-center gap-2" role="status">
                    <Spinner />
                    Loading the charts…
                  </p>
                }
              >
                <Group />
              </Suspense>
            </SpecimenGroup>
          );
        })}
    </div>
  );
}
