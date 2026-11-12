import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, months, Trend } from "./shared";

export const description = "A simple area chart";

// Illustrative monthly records for Fernbrook Greenhouse.
const chartData = months.map((month, index) => ({
  month,
  trays: [128, 156, 144, 112, 132, 148][index],
}));

const chartConfig = {
  trays: { label: "Seed trays", color: "var(--chart-1)" },
} satisfies ChartConfig;

const previous = chartData[4].trays;
const current = chartData[5].trays;

export function ChartAreaDefault() {
  return (
    <Card data-specimen="area-default">
      <CardHeader>
        <ChartName name="chart-area-default" />
        <CardTitle>Seed trays sown</CardTitle>
        <CardDescription>Propagation house, trays per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Seed trays sown, propagation house, trays per month, June to November 2026"
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
            <ChartTooltip cursor content={<ChartTooltipContent indicator="line" />} />
            <Area
              dataKey="trays"
              type="monotone"
              fill="var(--color-trays)"
              fillOpacity={0.22}
              stroke="var(--color-trays)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previous} to={current} period="on October" />
        <p className="text-muted-foreground">Seed trays prepared for propagation.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          caption="Seed trays sown, trays per month, June to November 2026. Illustrative data."
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} trays`}
        />
      </CardFooter>
    </Card>
  );
}
