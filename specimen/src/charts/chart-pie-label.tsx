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

export const description = "A pie chart with a label";

const chartData = [
  { category: "herbs", value: 24, fill: "var(--color-herbs)" },
  { category: "bedding", value: 18, fill: "var(--color-bedding)" },
  { category: "perennials", value: 14, fill: "var(--color-perennials)" },
  { category: "seedlings", value: 10, fill: "var(--color-seedlings)" },
];

const chartConfig = {
  value: { label: "Crates" },
  herbs: { label: "Herbs", color: "var(--chart-1)" },
  bedding: { label: "Bedding", color: "var(--chart-2)" },
  perennials: { label: "Perennials", color: "var(--chart-3)" },
  seedlings: { label: "Seedlings", color: "var(--chart-4)" },
} satisfies ChartConfig;

const total = chartData.reduce((sum, row) => sum + row.value, 0);

export function ChartPieLabel() {
  return (
    <Card data-specimen="pie-label">
      <CardHeader>
        <ChartName name="chart-pie-label" />
        <CardTitle>Market crates packed</CardTitle>
        <CardDescription>Saturday market, crates, November 2026</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[280px] w-full max-w-[360px] aspect-auto [&_.recharts-pie-label-text]:fill-foreground"
          aria-label="Market crates packed, crates, November 2026"
        >
          <PieChart accessibilityLayer>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="category" />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="category"
              cy={112}
              outerRadius={78}
              stroke="var(--surface)"
              strokeWidth={2}
              label
            ></Pie>
            <ChartLegend itemSorter={null} content={<ChartLegendContent nameKey="category" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={60} to={total} period="on October" />
        <p className="text-muted-foreground">
          Largest share: {chartConfig[largestShare(chartData).name as keyof typeof chartConfig].label},{" "}
          <span className="font-mono text-[12.5px] tabular-nums">{largestShare(chartData).percent}%</span>.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="category"
          labelHeader="Crate contents"
          caption="Market crates packed, crates, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
