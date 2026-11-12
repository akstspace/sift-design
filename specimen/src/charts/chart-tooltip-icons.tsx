import { Bar, BarChart, XAxis } from "recharts";
import { IconDroplet, IconSpray } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTable,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@sift-design/ui/chart";
import { ChartName, lastDays, longDate, meanRow, shortDate, Trend } from "./shared";

export const description = "A stacked bar chart with a legend";

// Illustrative daily records for Fernbrook Greenhouse.
const values = [
  [25, 40],
  [30, 35],
  [20, 25],
  [35, 45],
  [15, 20],
  [40, 30],
];
const chartData = lastDays(6).map((date, index) => ({ date, nozzles: values[index][0], lines: values[index][1] }));
const chartConfig = {
  nozzles: { label: "Nozzles", color: "var(--chart-1)", icon: () => <IconDroplet aria-hidden /> },
  lines: { label: "Supply lines", color: "var(--chart-2)", icon: () => <IconSpray aria-hidden /> },
} satisfies ChartConfig;

export function ChartTooltipIcons() {
  const previous = meanRow(chartData.slice(0, -1));
  const current = chartData.at(-1)!;
  return (
    <Card data-specimen="tooltip-icons">
      <CardHeader>
        <ChartName name="chart-tooltip-icons" />
        <CardTitle>Irrigation maintenance time</CardTitle>
        <CardDescription>Fernbrook Greenhouse, minutes per day, 4 to 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[220px] w-full aspect-auto"
          aria-label="Irrigation maintenance time, min per day, 4 to 9 November 2026"
        >
          <BarChart accessibilityLayer data={chartData} barSize={28}>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={shortDate}
              minTickGap={12}
            />
            <Bar
              dataKey="nozzles"
              stackId="a"
              fill="var(--color-nozzles)"
              radius={0}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <Bar
              dataKey="lines"
              stackId="a"
              fill="var(--color-lines)"
              radius={[4, 4, 0, 0]}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <ChartTooltip cursor={false} defaultIndex={1} content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent hideIcon />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend
          from={previous.nozzles + previous.lines}
          to={current.nozzles + current.lines}
          period="on the 4–8 November average"
        />
        <p className="text-muted-foreground">Nozzle checks and supply line flushing time.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="date"
          labelHeader="Day"
          formatLabel={longDate}
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} min`}
          caption="Irrigation maintenance time, min per day, 4 to 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
