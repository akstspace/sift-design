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
  [4, 5],
  [5, 4],
  [4, 6],
  [3, 4],
  [2, 3],
  [5, 6],
];
const chartData = lastDays(6).map((date, index) => ({
  date,
  day: shortDate(date),
  jane: values[index][0],
  john: values[index][1],
}));
const chartConfig = {
  jane: { label: "Jane Doe", color: "var(--chart-1)" },
  john: { label: "John Smith", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChartTooltipDefault() {
  const previous = meanRow(chartData.slice(0, -1));
  const current = chartData.at(-1)!;
  return (
    <Card data-specimen="tooltip-default">
      <CardHeader>
        <ChartName name="chart-tooltip-default" />
        <CardTitle>Growing work</CardTitle>
        <CardDescription>Fernbrook Greenhouse, hours per day, 4 to 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[220px] w-full aspect-auto"
          aria-label="Growing work, hours per day, 4 to 9 November 2026"
        >
          <BarChart accessibilityLayer data={chartData} barSize={28}>
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} minTickGap={12} />
            <Bar
              dataKey="jane"
              stackId="a"
              fill="var(--color-jane)"
              radius={0}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <Bar
              dataKey="john"
              stackId="a"
              fill="var(--color-john)"
              radius={[4, 4, 0, 0]}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <ChartTooltip cursor={false} defaultIndex={1} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend
          from={previous.jane + previous.john}
          to={current.jane + current.john}
          period="on the 4–8 November average"
        />
        <p className="text-muted-foreground">Growing work by Jane Doe and John Smith.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="date"
          labelHeader="Day"
          formatLabel={longDate}
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} hours`}
          caption="Growing work, hours per day, 4 to 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
