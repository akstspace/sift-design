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
  [120, 90],
  [150, 105],
  [135, 80],
  [100, 75],
  [60, 45],
  [160, 110],
];
const chartData = lastDays(6).map((date, index) => ({ date, john: values[index][0], jane: values[index][1] }));
const chartConfig = {
  work: { label: "Potting work" },
  john: { label: "John Smith", color: "var(--chart-1)" },
  jane: { label: "Jane Doe", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChartTooltipLabelCustom() {
  const previous = meanRow(chartData.slice(0, -1));
  const current = chartData.at(-1)!;
  return (
    <Card data-specimen="tooltip-label-custom">
      <CardHeader>
        <ChartName name="chart-tooltip-label-custom" />
        <CardTitle>Potting time</CardTitle>
        <CardDescription>Propagation house, minutes per day, 4 to 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[220px] w-full aspect-auto"
          aria-label="Potting time, min per day, 4 to 9 November 2026"
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
              dataKey="john"
              stackId="a"
              fill="var(--color-john)"
              radius={0}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <Bar
              dataKey="jane"
              stackId="a"
              fill="var(--color-jane)"
              radius={[4, 4, 0, 0]}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={1}
              content={<ChartTooltipContent labelKey="work" indicator="line" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend
          from={previous.john + previous.jane}
          to={current.john + current.jane}
          period="on the 4–8 November average"
        />
        <p className="text-muted-foreground">Potting time by John Smith and Jane Doe.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="date"
          labelHeader="Day"
          formatLabel={longDate}
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} min`}
          caption="Potting time, min per day, 4 to 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
