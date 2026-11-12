import { Pie, PieChart, LabelList } from "recharts";
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

export const description = "A pie chart with a label list";

const chartData = [
  { category: "sowing", value: 42, fill: "var(--color-sowing)" },
  { category: "potting", value: 36, fill: "var(--color-potting)" },
  { category: "packing", value: 28, fill: "var(--color-packing)" },
  { category: "care", value: 24, fill: "var(--color-care)" },
];

const chartConfig = {
  value: { label: "Hours" },
  sowing: { label: "Sowing", color: "var(--chart-1)" },
  potting: { label: "Potting", color: "var(--chart-2)" },
  packing: { label: "Packing", color: "var(--chart-3)" },
  care: { label: "Care", color: "var(--chart-4)" },
} satisfies ChartConfig;

const total = chartData.reduce((sum, row) => sum + row.value, 0);

export function ChartPieLabelList() {
  return (
    <Card data-specimen="pie-label-list">
      <CardHeader>
        <ChartName name="chart-pie-label-list" />
        <CardTitle>Work completed</CardTitle>
        <CardDescription>Fernbrook Greenhouse, hours, November 2026</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[280px] w-full max-w-[360px] aspect-auto [&_.recharts-pie-label-text]:fill-foreground"
          aria-label="Work completed, hours, November 2026"
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
            >
              <LabelList
                dataKey="category"
                position="inside"
                stroke="var(--surface)"
                strokeWidth={3}
                paintOrder="stroke"
                fill="var(--ink)"
                fontSize={12}
                formatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label}
              />
            </Pie>
            <ChartLegend itemSorter={null} content={<ChartLegendContent nameKey="category" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={122} to={total} period="on October" />
        <p className="text-muted-foreground">
          Largest share: {chartConfig[largestShare(chartData).name as keyof typeof chartConfig].label},{" "}
          <span className="font-mono text-[12.5px] tabular-nums">{largestShare(chartData).percent}%</span>.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="category"
          labelHeader="Work types"
          caption="Work completed, hours, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
