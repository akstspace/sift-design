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

export const description = "A multiple bar chart";
const chartData = months.map((month, index) => ({
  month,
  hollins: [18, 22, 20, 16, 19, 21][index],
  marsh: [12, 14, 16, 12, 14, 16][index],
}));
const chartConfig = {
  hollins: { label: "Hollins Florist", color: "var(--chart-1)" },
  marsh: { label: "Marsh Lane Florist", color: "var(--chart-2)" },
} satisfies ChartConfig;
export function ChartBarMultiple() {
  return (
    <Card data-specimen="bar-multiple">
      <CardHeader>
        <ChartName name="chart-bar-multiple" />
        <CardTitle>Florist orders delivered</CardTitle>
        <CardDescription>Wholesale orders, deliveries per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
          aria-label="Florist orders delivered, wholesale orders, deliveries per month, June to November 2026"
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar
              dataKey="hollins"
              fill="var(--color-hollins)"
              maxBarSize={18}
              radius={[4, 4, 0, 0]}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <Bar
              dataKey="marsh"
              fill="var(--color-marsh)"
              maxBarSize={18}
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
          from={chartData[4].hollins + chartData[4].marsh}
          to={chartData[5].hollins + chartData[5].marsh}
          period="on October"
        />
        <p className="text-muted-foreground">
          {sumOf(chartData, "hollins")} deliveries to Hollins Florist and {sumOf(chartData, "marsh")} to Marsh Lane
          Florist in six months.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          formatValue={(value) => Number(value).toLocaleString("en-GB")}
          caption="Florist orders delivered, wholesale orders, deliveries per month, June to November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
