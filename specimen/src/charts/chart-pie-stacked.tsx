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
import { ChartName, Trend } from "./shared";

export const description = "A pie chart with stacked sections";

const chartData = [
  { category: "herbs", retail: 348, wholesale: 480, fill: "var(--color-herbs)" },
  { category: "bedding", retail: 264, wholesale: 360, fill: "var(--color-bedding)" },
  { category: "perennials", retail: 198, wholesale: 300, fill: "var(--color-perennials)" },
  { category: "seedlings", retail: 150, wholesale: 240, fill: "var(--color-seedlings)" },
];
const chartConfig = {
  retail: { label: "Retail plants" },
  wholesale: { label: "Wholesale plants" },
  herbs: { label: "Herbs", color: "var(--chart-1)" },
  bedding: { label: "Bedding", color: "var(--chart-2)" },
  perennials: { label: "Perennials", color: "var(--chart-3)" },
  seedlings: { label: "Seedlings", color: "var(--chart-4)" },
} satisfies ChartConfig;
const total = chartData.reduce((sum, row) => sum + row.retail + row.wholesale, 0);

export function ChartPieStacked() {
  return (
    <Card data-specimen="pie-stacked">
      <CardHeader>
        <ChartName name="chart-pie-stacked" />
        <CardTitle>Plants supplied by channel</CardTitle>
        <CardDescription>Fernbrook Greenhouse, plants, November 2026</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[280px] w-full max-w-[360px] aspect-auto"
          aria-label="Plants supplied, November 2026. Retail inside, wholesale outside. Each ring shows its own total."
        >
          <PieChart accessibilityLayer>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  nameKey="category"
                  indicator="line"
                  labelFormatter={(_, payload) => chartConfig[payload?.[0]?.dataKey as keyof typeof chartConfig]?.label}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="retail"
              nameKey="category"
              cy={112}
              outerRadius={58}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <Pie
              data={chartData}
              dataKey="wholesale"
              nameKey="category"
              cy={112}
              innerRadius={68}
              outerRadius={90}
              stroke="var(--surface)"
              strokeWidth={2}
              legendType="none"
            />
            <ChartLegend itemSorter={null} content={<ChartLegendContent nameKey="category" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={2184} to={total} period="on October" />
        <p className="text-muted-foreground">Retail inside. Wholesale outside. Each ring shows its own total.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="category"
          labelHeader="Plant group"
          keys={["retail", "wholesale"]}
          caption="Plants supplied by channel, plants, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
