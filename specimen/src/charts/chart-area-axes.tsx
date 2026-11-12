import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

export const description = "An area chart with axes";

// Illustrative monthly records for Fernbrook Greenhouse.
const chartData = months.map((month, index) => ({
  month,
  fresh: [240, 300, 280, 220, 200, 260][index],
  reused: [60, 70, 80, 90, 100, 110][index],
}));

const chartConfig = {
  fresh: { label: "Fresh compost", color: "var(--chart-1)" },
  reused: { label: "Reused compost", color: "var(--chart-2)" },
} satisfies ChartConfig;

const previous = chartData[4].fresh + chartData[4].reused;
const current = chartData[5].fresh + chartData[5].reused;

export function ChartAreaAxes() {
  return (
    <Card data-specimen="area-axes">
      <CardHeader>
        <ChartName name="chart-area-axes" />
        <CardTitle>Potting compost used</CardTitle>
        <CardDescription>Potting shed, litres per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Potting compost used, potting shed, litres per month, June to November 2026"
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
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={3}
              width={52}
              tick={{ className: "font-mono" }}
              domain={[0, "auto"]}
              tickFormatter={(value: number) => `${value} L`}
            />
            <ChartTooltip cursor content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="fresh"
              type="monotone"
              fill="var(--color-fresh)"
              fillOpacity={0.22}
              stroke="var(--color-fresh)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="reused"
              type="monotone"
              fill="var(--color-reused)"
              fillOpacity={0.22}
              stroke="var(--color-reused)"
              strokeWidth={2}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previous} to={current} period="on October" />
        <p className="text-muted-foreground">Fresh and reused compost form the monthly volume.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          caption="Potting compost used, L per month, June to November 2026. Illustrative data."
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} L`}
        />
      </CardFooter>
    </Card>
  );
}
