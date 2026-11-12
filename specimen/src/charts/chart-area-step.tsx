import { IconTemperature } from "@tabler/icons-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, months, Trend } from "./shared";

export const description = "A step area chart";

// Illustrative monthly records for Fernbrook Greenhouse.
const chartData = months.map((month, index) => ({
  month,
  benches: [8, 8, 10, 10, 12, 14][index],
}));

const chartConfig = {
  benches: { label: "Heated benches", color: "var(--chart-1)", icon: () => <IconTemperature aria-hidden /> },
} satisfies ChartConfig;

const previous = chartData[4].benches;
const current = chartData[5].benches;

export function ChartAreaStep() {
  return (
    <Card data-specimen="area-step">
      <CardHeader>
        <ChartName name="chart-area-step" />
        <CardTitle>Heated benches</CardTitle>
        <CardDescription>Propagation house, benches at each month start, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Heated benches, propagation house, benches at each month start, June to November 2026"
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
              dataKey="benches"
              type="step"
              fill="var(--color-benches)"
              fillOpacity={0.22}
              stroke="var(--color-benches)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previous} to={current} period="on October" />
        <p className="text-muted-foreground">Heated benches change when the heating system expands.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          caption="Heated benches, benches at each month start, June to November 2026. Illustrative data."
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} benches`}
        />
      </CardFooter>
    </Card>
  );
}
