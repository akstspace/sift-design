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

export const description = "A pie chart with a legend";

const chartData = [
  { category: "hollins", value: 34, fill: "var(--color-hollins)" },
  { category: "marsh", value: 26, fill: "var(--color-marsh)" },
  { category: "mill", value: 22, fill: "var(--color-mill)" },
  { category: "willow", value: 18, fill: "var(--color-willow)" },
];

const chartConfig = {
  value: { label: "Orders" },
  hollins: { label: "Hollins", color: "var(--chart-1)" },
  marsh: { label: "Marsh Lane", color: "var(--chart-2)" },
  mill: { label: "Mill Road", color: "var(--chart-3)" },
  willow: { label: "Willow", color: "var(--chart-4)" },
} satisfies ChartConfig;

const total = chartData.reduce((sum, row) => sum + row.value, 0);

export function ChartPieLegend() {
  return (
    <Card data-specimen="pie-legend">
      <CardHeader>
        <ChartName name="chart-pie-legend" />
        <CardTitle>Orders fulfilled</CardTitle>
        <CardDescription>Wholesale orders, orders, November 2026</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[280px] w-full max-w-[360px] aspect-auto [&_.recharts-pie-label-text]:fill-foreground"
          aria-label="Orders fulfilled, orders, November 2026"
        >
          <PieChart accessibilityLayer>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="category" />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="category"
              cy={112}
              outerRadius={90}
              stroke="var(--surface)"
              strokeWidth={2}
            ></Pie>
            <ChartLegend itemSorter={null} content={<ChartLegendContent nameKey="category" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={94} to={total} period="on October" />
        <p className="text-muted-foreground">
          Largest share: {chartConfig[largestShare(chartData).name as keyof typeof chartConfig].label},{" "}
          <span className="font-mono text-[12.5px] tabular-nums">{largestShare(chartData).percent}%</span>.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="category"
          labelHeader="Customers"
          caption="Orders fulfilled, orders, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
