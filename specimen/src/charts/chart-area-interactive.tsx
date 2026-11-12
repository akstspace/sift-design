import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sift-design/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTable,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@sift-design/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@sift-design/ui/select";
import { ChartName, lastDays, longDate, RollingNumber, seeded, shortDate } from "./shared";

export const description = "An interactive area chart";

// Illustrative: plants sold each day at Fernbrook Greenhouse, from the retail
// benches and the Saturday market, and in wholesale orders to florists.
const random = seeded(11);
const chartData = lastDays(90).map((date, i) => {
  const day = new Date(date).getUTCDay();
  const season = 1 - i / 260;
  const retail = Math.round((day === 6 ? 96 : day === 0 ? 46 : 66) * season + random() * 14);
  const wholesale = Math.round((day === 0 || day === 6 ? 22 : 46) * season + random() * 14);
  return { date, retail, wholesale };
});

const chartConfig = {
  plants: { label: "Plants sold" },
  retail: { label: "Retail", color: "var(--chart-1)" },
  wholesale: { label: "Wholesale", color: "var(--chart-2)" },
} satisfies ChartConfig;

const ranges = { "90d": "Last 3 months", "30d": "Last 30 days", "7d": "Last 7 days" } as const;

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState<keyof typeof ranges>("90d");
  const filteredData = chartData.slice(-Number(timeRange.replace("d", "")));
  const total = filteredData.reduce((sum, d) => sum + d.retail + d.wholesale, 0);

  return (
    <Card data-specimen="area-interactive" className="col-span-full pt-0">
      <CardHeader className="flex flex-wrap items-center gap-3 border-b py-5">
        <div className="grid flex-1 gap-2">
          <ChartName name="chart-area-interactive" />
          <CardTitle>Plants sold</CardTitle>
          <CardDescription>
            <RollingNumber value={total} className="text-foreground" /> plants from the benches, the market and florist
            orders. {ranges[timeRange]}.
          </CardDescription>
        </div>
        <CardAction className="col-start-auto row-span-1 row-start-auto">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as keyof typeof ranges)}>
            <SelectTrigger className="w-[160px]" aria-label="Time range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ranges).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
          aria-label={`Plants sold per day, ${ranges[timeRange].toLowerCase()}, retail and wholesale stacked`}
        >
          <AreaChart data={filteredData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={shortDate}
            />
            <ChartTooltip cursor content={<ChartTooltipContent labelFormatter={longDate} indicator="dot" />} />
            <Area
              dataKey="wholesale"
              type="monotone"
              fill="var(--color-wholesale)"
              fillOpacity={0.22}
              stroke="var(--color-wholesale)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="retail"
              type="monotone"
              fill="var(--color-retail)"
              fillOpacity={0.22}
              stroke="var(--color-retail)"
              strokeWidth={2}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <ChartTable
          data={filteredData}
          config={chartConfig}
          labelKey="date"
          labelHeader="Day"
          keys={["retail", "wholesale"]}
          formatLabel={longDate}
          caption={`Plants sold per day, ${ranges[timeRange].toLowerCase()}. Illustrative data.`}
        />
      </CardFooter>
    </Card>
  );
}
