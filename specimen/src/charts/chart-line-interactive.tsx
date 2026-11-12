import * as React from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { selectionSpring } from "@sift-design/tokens/motion";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, lastDays, longDate, RollingNumber, seeded, shortDate, Trend } from "./shared";

export const description = "An interactive line chart";

const random = seeded(43);
const chartData = lastDays(90).map((date, i) => ({
  date,
  herbs: Math.round(35 + 14 * Math.sin(i / 5) + random() * 18),
  bedding: Math.round(58 - i / 3 + 12 * Math.cos(i / 7) + random() * 16),
}));
const chartConfig = {
  herbs: { label: "Herb cuttings", color: "var(--chart-1)" },
  bedding: { label: "Bedding cuttings", color: "var(--chart-2)" },
} satisfies ChartConfig;
const metrics = ["herbs", "bedding"] as const;
type Metric = (typeof metrics)[number];
const totals = {
  herbs: chartData.reduce((sum, row) => sum + row.herbs, 0),
  bedding: chartData.reduce((sum, row) => sum + row.bedding, 0),
};

export function ChartLineInteractive() {
  const [activeChart, setActiveChart] = React.useState<Metric>("herbs");
  const reduced = !!useReducedMotion();
  const id = React.useId();
  // Keep one mark and one value key. Changing the data lets the existing line morph.
  const selectedData = React.useMemo(
    () => chartData.map((row) => ({ date: row.date, cuttings: row[activeChart] })),
    [activeChart],
  );
  const selectedConfig = { cuttings: chartConfig[activeChart] } satisfies ChartConfig;

  return (
    <Card data-specimen="line-interactive" className="col-span-full pt-0">
      <CardHeader className="flex flex-col items-stretch gap-0 border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-2 px-6 py-5">
          <ChartName name="chart-line-interactive" />
          <CardTitle>Rooted cuttings potted</CardTitle>
          <CardDescription>Propagation house, cuttings per day, 12 August to 9 November 2026</CardDescription>
          <p className="sr-only" aria-live="polite">
            Showing {chartConfig[activeChart].label.toLowerCase()}: {totals[activeChart].toLocaleString("en-GB")}{" "}
            cuttings.
          </p>
        </div>
        <LayoutGroup id={id}>
          <div className="isolate flex border-t sm:border-t-0" role="group" aria-label="Cutting group">
            {metrics.map((metric) => (
              <button
                key={metric}
                type="button"
                data-metric={metric}
                aria-pressed={activeChart === metric}
                onClick={() => setActiveChart(metric)}
                className="relative flex min-w-0 flex-1 flex-col justify-center gap-2 px-6 py-4 text-left outline-none even:border-l focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:min-w-[170px] sm:border-l sm:px-8"
              >
                {activeChart === metric && (
                  <motion.span
                    aria-hidden
                    layoutId={reduced ? undefined : "metric-selection"}
                    initial={false}
                    transition={reduced ? { duration: 0 } : selectionSpring}
                    style={{ borderRadius: 0 }}
                    className="pointer-events-none absolute inset-0 bg-tint"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{ background: chartConfig[metric].color }}
                  />
                  {chartConfig[metric].label}
                </span>
                <RollingNumber value={totals[metric]} className="relative z-10 text-[18px] font-semibold" />
                <span className="relative z-10 text-xs text-muted-foreground">cuttings in 90 days</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer
          role="region"
          config={selectedConfig}
          className="aspect-auto h-[250px] w-full"
          aria-label={`${chartConfig[activeChart].label} potted, cuttings per day, 12 August to 9 November 2026`}
        >
          <LineChart accessibilityLayer data={selectedData} margin={{ top: 12, left: 0, right: 12 }}>
            <CartesianGrid vertical={false} />
            <YAxis domain={[0, 90]} tickLine={false} axisLine={false} tickMargin={8} width={38} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={shortDate}
            />
            <ChartTooltip cursor content={<ChartTooltipContent labelFormatter={longDate} indicator="line" />} />
            <Line
              dataKey="cuttings"
              type="monotone"
              stroke="var(--color-cuttings)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend
          from={selectedData.slice(-14, -7).reduce((sum, row) => sum + row.cuttings, 0)}
          to={selectedData.slice(-7).reduce((sum, row) => sum + row.cuttings, 0)}
          period="on the previous seven days"
        />
        <p className="text-muted-foreground">
          {chartConfig[activeChart].label}. The trend compares 3–9 November with 27 October–2 November. Each cutting is
          counted once, when it is potted.
        </p>
        <ChartTable
          data={selectedData}
          config={selectedConfig}
          labelKey="date"
          labelHeader="Day"
          formatLabel={longDate}
          caption={`${chartConfig[activeChart].label} potted, cuttings per day, 12 August to 9 November 2026. Illustrative data.`}
        />
      </CardFooter>
    </Card>
  );
}
