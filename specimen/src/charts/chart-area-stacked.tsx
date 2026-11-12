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

export const description = "A stacked area chart";

// Illustrative monthly records for Fernbrook Greenhouse.
const chartData = months.map((month, index) => ({
  month,
  potting: [96, 112, 104, 88, 80, 92][index],
  inspection: [28, 32, 36, 40, 44, 48][index],
}));

const chartConfig = {
  potting: { label: "Potting", color: "var(--chart-1)" },
  inspection: { label: "Inspection", color: "var(--chart-2)" },
} satisfies ChartConfig;

const previous = chartData[4].potting + chartData[4].inspection;
const current = chartData[5].potting + chartData[5].inspection;

export function ChartAreaStacked() {
  return (
    <Card data-specimen="area-stacked">
      <CardHeader>
        <ChartName name="chart-area-stacked" />
        <CardTitle>Bench work</CardTitle>
        <CardDescription>Growing team, hours per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Bench work, growing team, hours per month, June to November 2026"
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
            <Area
              dataKey="potting"
              type="monotone"
              fill="var(--color-potting)"
              fillOpacity={0.22}
              stroke="var(--color-potting)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="inspection"
              type="monotone"
              fill="var(--color-inspection)"
              fillOpacity={0.22}
              stroke="var(--color-inspection)"
              strokeWidth={2}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previous} to={current} period="on October" />
        <p className="text-muted-foreground">Potting and inspection hours form the bench work total.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          caption="Bench work, h per month, June to November 2026. Illustrative data."
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} h`}
        />
      </CardFooter>
    </Card>
  );
}
