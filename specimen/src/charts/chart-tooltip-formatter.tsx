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
  [90, 150],
  [120, 180],
  [75, 135],
  [105, 165],
  [45, 90],
  [135, 195],
];
const chartData = lastDays(6).map((date, index) => ({ date, sowing: values[index][0], potting: values[index][1] }));
const chartConfig = {
  sowing: { label: "Sowing", color: "var(--chart-1)" },
  potting: { label: "Potting", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChartTooltipFormatter() {
  const previous = meanRow(chartData.slice(0, -1));
  const current = chartData.at(-1)!;
  return (
    <Card data-specimen="tooltip-formatter">
      <CardHeader>
        <ChartName name="chart-tooltip-formatter" />
        <CardTitle>Crop care time</CardTitle>
        <CardDescription>Propagation house, minutes per day, 4 to 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[220px] w-full aspect-auto"
          aria-label="Crop care time, min per day, 4 to 9 November 2026"
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
              dataKey="sowing"
              stackId="a"
              fill="var(--color-sowing)"
              radius={0}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <Bar
              dataKey="potting"
              stackId="a"
              fill="var(--color-potting)"
              radius={[4, 4, 0, 0]}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={1}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => (
                    <div className="flex w-full min-w-[160px] items-center gap-4 text-muted-foreground">
                      <span>{chartConfig[name as keyof typeof chartConfig]?.label ?? name}</span>
                      <span className="ml-auto flex items-baseline gap-1 font-mono font-medium text-foreground tabular-nums">
                        {Number(value).toLocaleString("en-GB")}
                        <span className="font-normal text-muted-foreground">min</span>
                      </span>
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend
          from={previous.sowing + previous.potting}
          to={current.sowing + current.potting}
          period="on the 4–8 November average"
        />
        <p className="text-muted-foreground">Daily sowing and potting time.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="date"
          labelHeader="Day"
          formatLabel={longDate}
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} min`}
          caption="Crop care time, min per day, 4 to 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
