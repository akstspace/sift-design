import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, months, Trend } from "./shared";

export const description = "A linear area chart";

// Illustrative monthly records for Fernbrook Greenhouse.
const chartData = months.map((month, index) => ({
  month,
  collected: [4200, 5100, 4600, 3800, 4500, 4900][index],
}));

const chartConfig = {
  collected: { label: "Rainwater", color: "var(--chart-1)" },
} satisfies ChartConfig;

const previous = chartData[4].collected;
const current = chartData[5].collected;

export function ChartAreaLinear() {
  return (
    <Card data-specimen="area-linear">
      <CardHeader>
        <ChartName name="chart-area-linear" />
        <CardTitle>Rainwater collected</CardTitle>
        <CardDescription>Storage tanks, litres per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Rainwater collected, storage tanks, litres per month, June to November 2026"
        >
          <AreaChart accessibilityLayer data={chartData} margin={{ left: 4, right: 12, top: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              interval={0}
              padding={{ left: 12, right: 12 }}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip cursor content={<ChartTooltipContent indicator="dot" hideLabel />} />
            <Area
              dataKey="collected"
              type="linear"
              fill="var(--color-collected)"
              fillOpacity={0.22}
              stroke="var(--color-collected)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previous} to={current} period="on October" />
        <p className="text-muted-foreground">Rainwater collected from the greenhouse roofs.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          caption="Rainwater collected, L per month, June to November 2026. Illustrative data."
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} L`}
        />
      </CardFooter>
    </Card>
  );
}
