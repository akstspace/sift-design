import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, months, peakOf, sumOf, Trend } from "./shared";

export const description = "A bar chart";
const chartData = months.map((month, index) => ({ month, trays: [132, 148, 126, 102, 116, 128][index] }));
const chartConfig = { trays: { label: "Trays", color: "var(--chart-1)" } } satisfies ChartConfig;
export function ChartBarDefault() {
  return (
    <Card data-specimen="bar-default">
      <CardHeader>
        <ChartName name="chart-bar-default" />
        <CardTitle>Seed trays sown</CardTitle>
        <CardDescription>Propagation house, trays per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
          aria-label="Seed trays sown, propagation house, trays per month, June to November 2026"
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
            <Bar dataKey="trays" fill="var(--color-trays)" maxBarSize={24} radius={[4, 4, 0, 0]}></Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={chartData[4].trays} to={chartData[5].trays} period="on October" />
        <p className="text-muted-foreground">
          {sumOf(chartData, "trays")} trays in six months. {peakOf(chartData, "trays")} was the busiest month.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          formatValue={(value) => Number(value).toLocaleString("en-GB")}
          caption="Seed trays sown, propagation house, trays per month, June to November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
