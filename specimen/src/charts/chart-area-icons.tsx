import { IconSeeding, IconCut } from "@tabler/icons-react";
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

export const description = "An area chart with icons";

// Illustrative monthly records for Fernbrook Greenhouse.
const chartData = months.map((month, index) => ({
  month,
  seed: [720, 840, 780, 660, 600, 640][index],
  cutting: [240, 280, 320, 360, 400, 440][index],
}));

const chartConfig = {
  seed: {
    label: "From seed",
    color: "var(--chart-1)",
    icon: () => <IconSeeding aria-hidden style={{ color: "var(--chart-1)" }} />,
  },
  cutting: {
    label: "From cuttings",
    color: "var(--chart-2)",
    icon: () => <IconCut aria-hidden style={{ color: "var(--chart-2)" }} />,
  },
} satisfies ChartConfig;

const previous = chartData[4].seed + chartData[4].cutting;
const current = chartData[5].seed + chartData[5].cutting;

export function ChartAreaIcons() {
  return (
    <Card data-specimen="area-icons">
      <CardHeader>
        <ChartName name="chart-area-icons" />
        <CardTitle>Plants propagated</CardTitle>
        <CardDescription>Propagation house, plants per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Plants propagated, propagation house, plants per month, June to November 2026"
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
            <ChartTooltip cursor content={<ChartTooltipContent indicator="line" />} />
            <Area
              dataKey="seed"
              type="monotone"
              fill="var(--color-seed)"
              fillOpacity={0.22}
              stroke="var(--color-seed)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="cutting"
              type="monotone"
              fill="var(--color-cutting)"
              fillOpacity={0.22}
              stroke="var(--color-cutting)"
              strokeWidth={2}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previous} to={current} period="on October" />
        <p className="text-muted-foreground">Seed-grown plants and rooted cuttings form the total.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          caption="Plants propagated, plants per month, June to November 2026. Illustrative data."
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} plants`}
        />
      </CardFooter>
    </Card>
  );
}
