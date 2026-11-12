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
  [30, 20],
  [35, 25],
  [25, 20],
  [40, 35],
  [20, 30],
  [35, 40],
];
const chartData = lastDays(6).map((date, index) => ({
  date,
  day: shortDate(date),
  alex: values[index][0],
  sam: values[index][1],
}));
const chartConfig = {
  alex: { label: "Alex Lee", color: "var(--chart-1)" },
  sam: { label: "Sam Taylor", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChartTooltipIndicatorLine() {
  const previous = meanRow(chartData.slice(0, -1));
  const current = chartData.at(-1)!;
  return (
    <Card data-specimen="tooltip-indicator-line">
      <CardHeader>
        <ChartName name="chart-tooltip-indicator-line" />
        <CardTitle>Bench inspection time</CardTitle>
        <CardDescription>Retail benches, minutes per day, 4 to 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[220px] w-full aspect-auto"
          aria-label="Bench inspection time, min per day, 4 to 9 November 2026"
        >
          <BarChart accessibilityLayer data={chartData} barSize={28}>
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} minTickGap={12} />
            <Bar
              dataKey="alex"
              stackId="a"
              fill="var(--color-alex)"
              radius={0}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <Bar
              dataKey="sam"
              stackId="a"
              fill="var(--color-sam)"
              radius={[4, 4, 0, 0]}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <ChartTooltip cursor={false} defaultIndex={1} content={<ChartTooltipContent indicator="line" />} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend
          from={previous.alex + previous.sam}
          to={current.alex + current.sam}
          period="on the 4–8 November average"
        />
        <p className="text-muted-foreground">Inspection time by Alex Lee and Sam Taylor.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="date"
          labelHeader="Day"
          formatLabel={longDate}
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} min`}
          caption="Bench inspection time, min per day, 4 to 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
