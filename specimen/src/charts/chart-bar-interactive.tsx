import * as React from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { selectionSpring } from "@sift-design/tokens/motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, lastDays, longDate, RollingNumber, seeded, shortDate, Trend } from "./shared";

export const description = "An interactive bar chart";

const random = seeded(27);
const chartData = lastDays(90).map((date) => {
  const day = new Date(date).getUTCDay();
  return {
    date,
    retail: Math.round((day === 6 ? 112 : day === 0 ? 34 : 62) + random() * 26),
    wholesale: Math.round((day === 0 || day === 6 ? 10 : 52) + random() * 36),
  };
});
const chartConfig = {
  retail: { label: "Retail", color: "var(--chart-1)" },
  wholesale: { label: "Wholesale", color: "var(--chart-2)" },
} satisfies ChartConfig;
const metrics = ["retail", "wholesale"] as const;
const totals = {
  retail: chartData.reduce((sum, row) => sum + row.retail, 0),
  wholesale: chartData.reduce((sum, row) => sum + row.wholesale, 0),
};

export function ChartBarInteractive() {
  const [metric, setMetric] = React.useState<(typeof metrics)[number]>("retail");
  const reduced = !!useReducedMotion();
  const id = React.useId();
  const previousWeek = chartData.slice(-14, -7).reduce((sum, row) => sum + row[metric], 0);
  const currentWeek = chartData.slice(-7).reduce((sum, row) => sum + row[metric], 0);

  return (
    <Card data-specimen="bar-interactive" className="col-span-full pt-0">
      <CardHeader className="flex flex-col items-stretch gap-0 border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-2 px-6 py-5">
          <ChartName name="chart-bar-interactive" />
          <CardTitle>Plants sold each day</CardTitle>
          <CardDescription>Fernbrook Greenhouse, plants per day, 12 August to 9 November 2026</CardDescription>
          <p className="sr-only" aria-live="polite">
            Showing {chartConfig[metric].label.toLowerCase()} sales: {totals[metric].toLocaleString("en-GB")} plants.
          </p>
        </div>
        <LayoutGroup id={id}>
          <div className="isolate flex border-t sm:border-t-0" role="group" aria-label="Sales channel">
            {metrics.map((key) => (
              <button
                type="button"
                key={key}
                aria-pressed={metric === key}
                onClick={() => setMetric(key)}
                className="relative flex min-w-0 flex-1 flex-col justify-center gap-2 px-6 py-4 text-left outline-none even:border-l focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:min-w-[170px] sm:border-l sm:px-8"
              >
                {metric === key && (
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
                    style={{ background: chartConfig[key].color }}
                  />
                  {chartConfig[key].label}
                </span>
                <RollingNumber value={totals[key]} className="relative z-10 text-[18px] font-semibold" />
                <span className="relative z-10 text-xs text-muted-foreground">plants in 90 days</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
          aria-label={`${chartConfig[metric].label} plants sold per day, 12 August to 9 November 2026`}
        >
          <BarChart accessibilityLayer data={chartData} margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={shortDate}
            />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={longDate} />} />
            <Bar dataKey={metric} fill={`var(--color-${metric})`} maxBarSize={10} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previousWeek} to={currentWeek} period="on the previous seven days" />
        <p className="text-muted-foreground">
          {chartConfig[metric].label} sales. The trend compares 3–9 November with 27 October–2 November.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          keys={[metric]}
          labelKey="date"
          labelHeader="Day"
          formatLabel={longDate}
          formatValue={(value) => Number(value).toLocaleString("en-GB")}
          caption={`${chartConfig[metric].label} plants sold per day, 12 August to 9 November 2026. Illustrative data.`}
        />
      </CardFooter>
    </Card>
  );
}
