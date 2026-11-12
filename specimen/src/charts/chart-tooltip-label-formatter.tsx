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
  [70, 35],
  [90, 45],
  [60, 30],
  [110, 50],
  [30, 15],
  [100, 55],
];
const chartData = lastDays(6).map((date, index) => ({ date, alex: values[index][0], jane: values[index][1] }));
const chartConfig = {
  alex: { label: "Alex Lee", color: "var(--chart-1)" },
  jane: { label: "Jane Doe", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChartTooltipLabelFormatter() {
  const previous = meanRow(chartData.slice(0, -1));
  const current = chartData.at(-1)!;
  return (
    <Card data-specimen="tooltip-label-formatter">
      <CardHeader>
        <ChartName name="chart-tooltip-label-formatter" />
        <CardTitle>Florist order preparation</CardTitle>
        <CardDescription>Wholesale orders, minutes per day, 4 to 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[220px] w-full aspect-auto"
          aria-label="Florist order preparation, min per day, 4 to 9 November 2026"
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
              dataKey="alex"
              stackId="a"
              fill="var(--color-alex)"
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
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    }).format(new Date(String(value)))
                  }
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend
          from={previous.alex + previous.jane}
          to={current.alex + current.jane}
          period="on the 4–8 November average"
        />
        <p className="text-muted-foreground">Order preparation time by Alex Lee and Jane Doe.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="date"
          labelHeader="Day"
          formatLabel={longDate}
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} min`}
          caption="Florist order preparation, min per day, 4 to 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
