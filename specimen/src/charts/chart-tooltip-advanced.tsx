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
  [110, 75],
  [135, 90],
  [95, 60],
  [150, 100],
  [45, 30],
  [160, 105],
];
const chartData = lastDays(6).map((date, index) => ({ date, picking: values[index][0], packing: values[index][1] }));
const chartConfig = {
  picking: { label: "Picking", color: "var(--chart-1)" },
  packing: { label: "Packing", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChartTooltipAdvanced() {
  const previous = meanRow(chartData.slice(0, -1));
  const current = chartData.at(-1)!;
  return (
    <Card data-specimen="tooltip-advanced">
      <CardHeader>
        <ChartName name="chart-tooltip-advanced" />
        <CardTitle>Order handling time</CardTitle>
        <CardDescription>Wholesale orders, minutes per day, 4 to 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[220px] w-full aspect-auto"
          aria-label="Order handling time, min per day, 4 to 9 November 2026"
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
              dataKey="picking"
              stackId="a"
              fill="var(--color-picking)"
              radius={0}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <Bar
              dataKey="packing"
              stackId="a"
              fill="var(--color-packing)"
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
                  className="w-[190px]"
                  formatter={(value, name, item, index) => (
                    <>
                      <span
                        className="size-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: `var(--color-${name})` }}
                        aria-hidden
                      />
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                      </span>
                      <span className="ml-auto flex items-baseline gap-1 font-mono font-medium text-foreground tabular-nums">
                        {Number(value).toLocaleString("en-GB")}
                        <span className="font-normal text-muted-foreground">min</span>
                      </span>
                      {index === 1 && (
                        <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 font-medium">
                          Total
                          <span className="ml-auto flex items-baseline gap-1 font-mono tabular-nums">
                            {(item.payload.picking + item.payload.packing).toLocaleString("en-GB")}
                            <span className="font-normal text-muted-foreground">min</span>
                          </span>
                        </div>
                      )}
                    </>
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
          from={previous.picking + previous.packing}
          to={current.picking + current.packing}
          period="on the 4–8 November average"
        />
        <p className="text-muted-foreground">Daily picking and packing time, with a combined total.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="date"
          labelHeader="Day"
          formatLabel={longDate}
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} min`}
          caption="Order handling time, min per day, 4 to 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
