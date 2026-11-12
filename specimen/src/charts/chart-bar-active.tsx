import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, months, Trend } from "./shared";

import type { BarShapeProps } from "recharts/types/cartesian/Bar";
const ACTIVE_INDEX = 2;
function inspectionBar({ index, isActive, ...props }: BarShapeProps) {
  return (
    <Rectangle
      {...props}
      fillOpacity={index === ACTIVE_INDEX ? 1 : isActive ? 0.8 : 0.55}
      stroke={index === ACTIVE_INDEX ? "var(--ink)" : "none"}
      strokeWidth={1.5}
      strokeDasharray={index === ACTIVE_INDEX ? "4 3" : undefined}
      style={{ transition: "fill-opacity var(--dur-quick) linear" }}
    />
  );
}
export const description = "A bar chart with an active bar";
const chartData = months.map((month, index) => ({ month, checks: [84, 90, 108, 92, 98, 104][index] }));
const chartConfig = { checks: { label: "Inspections", color: "var(--chart-1)" } } satisfies ChartConfig;
export function ChartBarActive() {
  return (
    <Card data-specimen="bar-active">
      <CardHeader>
        <ChartName name="chart-bar-active" />
        <CardTitle>Bench inspections completed</CardTitle>
        <CardDescription>Growing houses, inspections per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
          aria-label="Bench inspections completed, growing houses, inspections per month, June to November 2026"
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="checks"
              fill="var(--color-checks)"
              maxBarSize={24}
              radius={[4, 4, 0, 0]}
              shape={inspectionBar}
              activeBar={inspectionBar}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={chartData[4].checks} to={chartData[5].checks} period="on October" />
        <p className="text-muted-foreground">August is outlined for the annual inspection review.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          formatValue={(value) => Number(value).toLocaleString("en-GB")}
          caption="Bench inspections completed, growing houses, inspections per month, June to November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
