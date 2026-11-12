import { Pie, PieChart, Label } from "recharts";
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

export const description = "A donut chart with text";

const chartData = [
  { category: "small", value: 620, fill: "var(--color-small)" },
  { category: "medium", value: 480, fill: "var(--color-medium)" },
  { category: "large", value: 360, fill: "var(--color-large)" },
  { category: "deep", value: 240, fill: "var(--color-deep)" },
];

const chartConfig = {
  value: { label: "Pots" },
  small: { label: "9 cm", color: "var(--chart-1)" },
  medium: { label: "12 cm", color: "var(--chart-2)" },
  large: { label: "2 litres", color: "var(--chart-3)" },
  deep: { label: "3 litres", color: "var(--chart-4)" },
} satisfies ChartConfig;

const total = chartData.reduce((sum, row) => sum + row.value, 0);

export function ChartPieDonutText() {
  return (
    <Card data-specimen="pie-donut-text">
      <CardHeader>
        <ChartName name="chart-pie-donut-text" />
        <CardTitle>Pots reused</CardTitle>
        <CardDescription>Potting shed, pots, November 2026</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[280px] w-full max-w-[360px] aspect-auto [&_.recharts-pie-label-text]:fill-foreground"
          aria-label="Pots reused, pots, November 2026"
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
            >
              <Label
                content={({ viewBox }) =>
                  viewBox && "cx" in viewBox && "cy" in viewBox ? (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} dy={-4} fill="var(--ink)" className="font-mono text-[30px] font-semibold">
                        {total.toLocaleString("en-GB")}
                      </tspan>
                      <tspan x={viewBox.cx} dy={24} fill="var(--muted)" className="text-[12px]">
                        pots
                      </tspan>
                    </text>
                  ) : null
                }
              />
            </Pie>
            <ChartLegend itemSorter={null} content={<ChartLegendContent nameKey="category" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={1580} to={total} period="on October" />
        <p className="text-muted-foreground">
          Largest share: {chartConfig[largestShare(chartData).name as keyof typeof chartConfig].label},{" "}
          <span className="font-mono text-[12.5px] tabular-nums">{largestShare(chartData).percent}%</span>.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="category"
          labelHeader="Pot sizes"
          caption="Pots reused, pots, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
