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

export const description = "An area chart with a legend";

// Illustrative monthly records for Fernbrook Greenhouse.
const chartData = months.map((month, index) => ({
  month,
  bedding: [640, 720, 680, 560, 480, 420][index],
  perennials: [220, 240, 280, 320, 360, 400][index],
}));

const chartConfig = {
  bedding: { label: "Bedding", color: "var(--chart-1)" },
  perennials: { label: "Perennials", color: "var(--chart-2)" },
} satisfies ChartConfig;

const previous = chartData[4].bedding + chartData[4].perennials;
const current = chartData[5].bedding + chartData[5].perennials;

export function ChartAreaLegend() {
  return (
    <Card data-specimen="area-legend">
      <CardHeader>
        <ChartName name="chart-area-legend" />
        <CardTitle>Plants potted</CardTitle>
        <CardDescription>Growing benches, plants per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Plants potted, growing benches, plants per month, June to November 2026"
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
              dataKey="bedding"
              type="monotone"
              fill="var(--color-bedding)"
              fillOpacity={0.22}
              stroke="var(--color-bedding)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="perennials"
              type="monotone"
              fill="var(--color-perennials)"
              fillOpacity={0.22}
              stroke="var(--color-perennials)"
              strokeWidth={2}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previous} to={current} period="on October" />
        <p className="text-muted-foreground">Bedding plants and perennials form the monthly total.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          caption="Plants potted, plants per month, June to November 2026. Illustrative data."
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} plants`}
        />
      </CardFooter>
    </Card>
  );
}
