import { Bar, BarChart, CartesianGrid, Cell, LabelList, Rectangle, ReferenceLine, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, months, Trend } from "./shared";

import type { BarShapeProps } from "recharts/types/cartesian/Bar";
function stockBar(props: BarShapeProps) {
  const negative = Number(props.payload.change) < 0;
  return <Rectangle {...props} radius={negative ? [0, 0, 4, 4] : [4, 4, 0, 0]} />;
}
export const description = "A bar chart with negative values";
const stock = [1200, 1280, 1390, 1340, 1410, 1375, 1420];
const chartData = months.map((month, index) => ({ month, change: stock[index + 1] - stock[index] }));
const chartConfig = { change: { label: "Net plants", color: "var(--chart-1)" } } satisfies ChartConfig;
export function ChartBarNegative() {
  return (
    <Card data-specimen="bar-negative">
      <CardHeader>
        <ChartName name="chart-bar-negative" />
        <CardTitle>Change in plant stock</CardTitle>
        <CardDescription>Retail benches, net plants per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
          aria-label="Change in plant stock, retail benches, net plants per month, June to November 2026"
        >
          <BarChart accessibilityLayer data={chartData} margin={{ top: 24, bottom: 12 }}>
            <CartesianGrid vertical={false} />
            <YAxis domain={[-150, 150]} hide />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ReferenceLine y={0} stroke="var(--muted)" />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="change" maxBarSize={24} shape={stockBar}>
              <LabelList
                dataKey="change"
                position="top"
                offset={8}
                className="fill-foreground font-mono"
                fontSize={12}
                formatter={(value: unknown) => `${Number(value) > 0 ? "+" : ""}${value}`}
              />
              {chartData.map((row) => (
                <Cell key={row.month} fill={row.change >= 0 ? "var(--chart-1)" : "var(--chart-2)"} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={stock[5]} to={stock[6]} period="in stock on October" />
        <p className="text-muted-foreground">
          Positive adds stock; negative removes stock. Trend compares closing stock.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          formatValue={(value) => Number(value).toLocaleString("en-GB")}
          caption="Change in plant stock, retail benches, net plants per month, June to November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
