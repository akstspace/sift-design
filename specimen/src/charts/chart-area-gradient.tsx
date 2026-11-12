import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import {
  ChartContainer,
  ChartTable,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@sift-design/ui/chart";
import { ChartName, months, Trend } from "./shared";

export const description = "An area chart with gradient fill";

// Illustrative monthly records for Fernbrook Greenhouse.
const chartData = months.map((month, index) => ({
  month,
  rainwater: [1800, 2100, 2000, 1500, 1200, 1000][index],
  mains: [600, 700, 600, 500, 400, 300][index],
}));

const chartConfig = {
  rainwater: { label: "Rainwater", color: "var(--chart-1)" },
  mains: { label: "Mains water", color: "var(--chart-2)" },
} satisfies ChartConfig;

const previous = chartData[4].rainwater + chartData[4].mains;
const current = chartData[5].rainwater + chartData[5].mains;

export function ChartAreaGradient() {
  const gradientId = React.useId().replace(/:/g, "");
  return (
    <Card data-specimen="area-gradient">
      <CardHeader>
        <ChartName name="chart-area-gradient" />
        <CardTitle>Irrigation water used</CardTitle>
        <CardDescription>Polytunnel 2, litres per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Irrigation water used, polytunnel 2, litres per month, June to November 2026"
        >
          <AreaChart accessibilityLayer data={chartData} margin={{ left: 4, right: 12, top: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              interval={0}
              padding={{ left: 12, right: 12 }}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip cursor content={<ChartTooltipContent indicator="dot" />} />
            <defs>
              <linearGradient id={`${gradientId}-rainwater`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-rainwater)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-rainwater)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id={`${gradientId}-mains`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-mains)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-mains)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area
              dataKey="rainwater"
              type="monotone"
              fill={`url(#${gradientId}-rainwater)`}
              stroke="var(--color-rainwater)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="mains"
              type="monotone"
              fill={`url(#${gradientId}-mains)`}
              stroke="var(--color-mains)"
              strokeWidth={2}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previous} to={current} period="on October" />
        <p className="text-muted-foreground">Rainwater and mains water form the irrigation total.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          caption="Irrigation water used, L per month, June to November 2026. Illustrative data."
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} L`}
        />
      </CardFooter>
    </Card>
  );
}
