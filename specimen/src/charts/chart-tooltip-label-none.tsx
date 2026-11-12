import { Bar, BarChart, XAxis } from "recharts";
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
  [42, 35],
  [38, 30],
  [45, 40],
  [40, 32],
  [35, 28],
  [44, 36],
];
const chartData = lastDays(6).map((date, index) => ({ date, bench1: values[index][0], bench2: values[index][1] }));
const chartConfig = {
  bench1: { label: "Bench 1", color: "var(--chart-1)" },
  bench2: { label: "Bench 2", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChartTooltipLabelNone() {
  const previous = meanRow(chartData.slice(0, -1));
  const current = chartData.at(-1)!;
  return (
    <Card data-specimen="tooltip-label-none">
      <CardHeader>
        <ChartName name="chart-tooltip-label-none" />
        <CardTitle>Water used by bench</CardTitle>
        <CardDescription>Polytunnel 2, litres per day, 4 to 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[220px] w-full aspect-auto"
          aria-label="Water used by bench, L per day, 4 to 9 November 2026"
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
              dataKey="bench1"
              stackId="a"
              fill="var(--color-bench1)"
              radius={0}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <Bar
              dataKey="bench2"
              stackId="a"
              fill="var(--color-bench2)"
              radius={[4, 4, 0, 0]}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <ChartTooltip cursor={false} defaultIndex={1} content={<ChartTooltipContent hideIndicator hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend
          from={previous.bench1 + previous.bench2}
          to={current.bench1 + current.bench2}
          period="on the 4–8 November average"
        />
        <p className="text-muted-foreground">Daily watering volumes for two growing benches.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="date"
          labelHeader="Day"
          formatLabel={longDate}
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} L`}
          caption="Water used by bench, L per day, 4 to 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
