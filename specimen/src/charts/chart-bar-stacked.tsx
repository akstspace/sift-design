import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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
import { ChartName, months, sumOf, Trend } from "./shared";

export const description = "A stacked bar chart with a legend";
const chartData = months.map((month, index) => ({
  month,
  sowing: [180, 210, 190, 150, 165, 180][index],
  potting: [420, 460, 410, 360, 390, 420][index],
}));
const chartConfig = {
  sowing: { label: "Sowing mix", color: "var(--chart-1)" },
  potting: { label: "Potting mix", color: "var(--chart-2)" },
} satisfies ChartConfig;
export function ChartBarStacked() {
  return (
    <Card data-specimen="bar-stacked">
      <CardHeader>
        <ChartName name="chart-bar-stacked" />
        <CardTitle>Compost used</CardTitle>
        <CardDescription>Growing houses, litres per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
          aria-label="Compost used, growing houses, litres per month, June to November 2026"
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="sowing"
              stackId="compost"
              fill="var(--color-sowing)"
              maxBarSize={24}
              radius={0}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <Bar
              dataKey="potting"
              stackId="compost"
              fill="var(--color-potting)"
              maxBarSize={24}
              radius={[4, 4, 0, 0]}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend
          from={chartData[4].sowing + chartData[4].potting}
          to={chartData[5].sowing + chartData[5].potting}
          period="on October"
        />
        <p className="text-muted-foreground">
          {sumOf(chartData, "sowing")} litres of sowing mix and {sumOf(chartData, "potting")} litres of potting mix in
          six months.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          formatValue={(value) => Number(value).toLocaleString("en-GB")}
          caption="Compost used, growing houses, litres per month, June to November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
