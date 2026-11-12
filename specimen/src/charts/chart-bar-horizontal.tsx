import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, months, peakOf, sumOf, Trend } from "./shared";

export const description = "A horizontal bar chart";
const chartData = months.map((month, index) => ({ month, litres: [920, 1040, 980, 840, 780, 720][index] }));
const chartConfig = { litres: { label: "Litres", color: "var(--chart-1)" } } satisfies ChartConfig;
export function ChartBarHorizontal() {
  return (
    <Card data-specimen="bar-horizontal">
      <CardHeader>
        <ChartName name="chart-bar-horizontal" />
        <CardTitle>Irrigation water used</CardTitle>
        <CardDescription>Bench 4, litres per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
          aria-label="Irrigation water used, bench 4, litres per month, June to November 2026"
        >
          <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: -8 }}>
            <XAxis type="number" dataKey="litres" domain={[0, "auto"]} hide />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              axisLine={false}
              width={56}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="litres" fill="var(--color-litres)" maxBarSize={20} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={chartData[4].litres} to={chartData[5].litres} period="on October" />
        <p className="text-muted-foreground">
          {sumOf(chartData, "litres")} litres in six months. Use fell each month after {peakOf(chartData, "litres")}.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          formatValue={(value) => Number(value).toLocaleString("en-GB")}
          caption="Irrigation water used, bench 4, litres per month, June to November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
