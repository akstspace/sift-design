import { Pie, PieChart } from "recharts";
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
import { ChartName, largestShare, Trend } from "./shared";

export const description = "A donut chart";

const chartData = [
  { category: "propagation", value: 3200, fill: "var(--color-propagation)" },
  { category: "polytunnel", value: 2600, fill: "var(--color-polytunnel)" },
  { category: "retail", value: 1800, fill: "var(--color-retail)" },
  { category: "herbs", value: 1400, fill: "var(--color-herbs)" },
];

const chartConfig = {
  value: { label: "Litres" },
  propagation: { label: "Propagation", color: "var(--chart-1)" },
  polytunnel: { label: "Polytunnel 2", color: "var(--chart-2)" },
  retail: { label: "Retail benches", color: "var(--chart-3)" },
  herbs: { label: "Herb house", color: "var(--chart-4)" },
} satisfies ChartConfig;

const total = chartData.reduce((sum, row) => sum + row.value, 0);

export function ChartPieDonut() {
  return (
    <Card data-specimen="pie-donut">
      <CardHeader>
        <ChartName name="chart-pie-donut" />
        <CardTitle>Water used</CardTitle>
        <CardDescription>Fernbrook Greenhouse, litres, November 2026</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[280px] w-full max-w-[360px] aspect-auto [&_.recharts-pie-label-text]:fill-foreground"
          aria-label="Water used, litres, November 2026"
        >
          <PieChart accessibilityLayer>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="category" />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="category"
              cy={112}
              innerRadius={60}
              outerRadius={90}
              stroke="var(--surface)"
              strokeWidth={2}
            ></Pie>
            <ChartLegend itemSorter={null} content={<ChartLegendContent nameKey="category" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={9600} to={total} period="on October" />
        <p className="text-muted-foreground">
          Largest share: {chartConfig[largestShare(chartData).name as keyof typeof chartConfig].label},{" "}
          <span className="font-mono text-[12.5px] tabular-nums">{largestShare(chartData).percent}%</span>.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="category"
          labelHeader="Growing areas"
          caption="Water used, litres, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
