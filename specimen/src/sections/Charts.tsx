import { lazy, Suspense, useState, type ComponentType, type LazyExoticComponent } from "react";
import { Spinner } from "@sift-design/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sift-design/ui/tabs";

// One file per chart type. Each chart is its own copyable file in src/charts/,
// named after the upstream block it ports. A chart type is split into subsections
// of related charts (see charts/<Type>.tsx).
const views: Record<string, LazyExoticComponent<ComponentType>> = {
  area: lazy(() => import("./charts/Area")),
  bar: lazy(() => import("./charts/Bar")),
  line: lazy(() => import("./charts/Line")),
  pie: lazy(() => import("./charts/Pie")),
  radar: lazy(() => import("./charts/Radar")),
  radial: lazy(() => import("./charts/Radial")),
  tooltip: lazy(() => import("./charts/Tooltip")),
};

/** The chart types, in page order. The website shows one type per tab. */
export const chartGroups = [
  { id: "area", title: "Area", description: "Show how a total changes over time, and how its parts add up to it." },
  { id: "bar", title: "Bar", description: "Compare amounts across a few categories or periods on a common baseline." },
  { id: "line", title: "Line", description: "Show a trend over time, or compare the trends of a few series." },
  { id: "pie", title: "Pie and donut", description: "Show the parts of one whole when there are only a few parts." },
  { id: "radar", title: "Radar", description: "Compare a few records across the same set of measures." },
  { id: "radial", title: "Radial", description: "Show progress toward a goal, or a few values on a circular track." },
  {
    id: "tooltip",
    title: "Tooltips",
    description:
      "Show exact values on hover or focus. A table under each chart keeps the values available without hover.",
  },
] as const;

/** The charts of one type, in their subsections. */
export function ChartGroup({ group }: { group: string }) {
  const View = views[group] ?? views.area;
  return (
    <div className="flex flex-col gap-14">
      <Suspense
        fallback={
          <p className="flex items-center gap-2" role="status">
            <Spinner />
            Loading the charts…
          </p>
        }
      >
        <View />
      </Suspense>
    </div>
  );
}

// The specimen shows one chart type at a time, so a page never mounts all 70 charts.
// `?charts=<type>` opens a type directly, which keeps screenshots focused.
export default function Charts() {
  const [group, setGroup] = useState(() => {
    const asked = new URLSearchParams(location.search).get("charts");
    return asked && asked in views ? asked : "area";
  });
  return (
    <div id="charts" className="flex flex-col gap-8">
      <Tabs value={group} onValueChange={setGroup}>
        <TabsList aria-label="Chart types" className="max-w-full overflow-x-auto">
          {chartGroups.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {chartGroups.map((item) => (
          <TabsContent key={item.id} value={item.id} className="pt-6">
            <p className="mb-10 max-w-[68ch] text-muted-foreground">{item.description}</p>
            <ChartGroup group={item.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
