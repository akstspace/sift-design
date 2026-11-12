import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, months, peakOf, sumOf, Trend } from "./shared";

export const description = "A bar chart with a label";
const chartData = months.map((month, index) => ({ month, crates: [28, 32, 30, 24, 26, 29][index] }));
const chartConfig = { crates: { label: "Crates", color: "var(--chart-1)" } } satisfies ChartConfig;
export function ChartBarLabel() {
  return (
    <Card data-specimen="bar-label">
      <CardHeader>
        <ChartName name="chart-bar-label" />
        <CardTitle>Saturday market crates</CardTitle>
        <CardDescription>Market stall, crates per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
          aria-label="Saturday market crates, market stall, crates per month, June to November 2026"
        >
          <BarChart accessibilityLayer data={chartData} margin={{ top: 24 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="crates" fill="var(--color-crates)" maxBarSize={24} radius={[4, 4, 0, 0]}>
              <LabelList position="top" offset={10} className="fill-foreground font-mono" fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={chartData[4].crates} to={chartData[5].crates} period="on October" />
        <p className="text-muted-foreground">
          {sumOf(chartData, "crates")} crates taken to market in six months. {peakOf(chartData, "crates")} was the
          busiest month.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          formatValue={(value) => Number(value).toLocaleString("en-GB")}
          caption="Saturday market crates, market stall, crates per month, June to November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
