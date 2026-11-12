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

export const description = "A pie chart with a custom label";

const chartData = [
  { category: "peas", value: 48, fill: "var(--color-peas)" },
  { category: "beans", value: 36, fill: "var(--color-beans)" },
  { category: "lettuce", value: 30, fill: "var(--color-lettuce)" },
  { category: "herbs", value: 24, fill: "var(--color-herbs)" },
];

const chartConfig = {
  value: { label: "Trays" },
  peas: { label: "Peas", color: "var(--chart-1)" },
  beans: { label: "Beans", color: "var(--chart-2)" },
  lettuce: { label: "Lettuce", color: "var(--chart-3)" },
  herbs: { label: "Herbs", color: "var(--chart-4)" },
} satisfies ChartConfig;

const total = chartData.reduce((sum, row) => sum + row.value, 0);

export function ChartPieLabelCustom() {
  return (
    <Card data-specimen="pie-label-custom">
      <CardHeader>
        <ChartName name="chart-pie-label-custom" />
        <CardTitle>Seed trays sown</CardTitle>
        <CardDescription>Propagation house, trays, November 2026</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[280px] w-full max-w-[360px] aspect-auto [&_.recharts-pie-label-text]:fill-foreground"
          aria-label="Seed trays sown, trays, November 2026"
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
              labelLine={false}
              label={({ payload, x, y, textAnchor }) => (
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  fill="var(--ink)"
                  className="font-mono"
                >
                  {payload.value} trays
                </text>
              )}
            ></Pie>
            <ChartLegend itemSorter={null} content={<ChartLegendContent nameKey="category" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={126} to={total} period="on October" />
        <p className="text-muted-foreground">
          Largest share: {chartConfig[largestShare(chartData).name as keyof typeof chartConfig].label},{" "}
          <span className="font-mono text-[12.5px] tabular-nums">{largestShare(chartData).percent}%</span>.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="category"
          labelHeader="Seed groups"
          caption="Seed trays sown, trays, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
