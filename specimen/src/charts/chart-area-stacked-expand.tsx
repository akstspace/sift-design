import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { ChartName, months, Trend } from "./shared";

export const description = "A stacked area chart with expand stacking";

// Illustrative monthly records for Fernbrook Greenhouse.
const chartData = months.map((month, index) => ({
  month,
  herbs: [240, 260, 280, 300, 320, 350][index],
  bedding: [480, 520, 440, 360, 300, 250][index],
  perennials: [80, 120, 160, 180, 180, 200][index],
}));

// Normalize the table and tooltip too: all three use the same monthly denominator.
const shareData = chartData.map(({ month, herbs, bedding, perennials }) => {
  const total = herbs + bedding + perennials;
  return {
    month,
    herbs: (herbs / total) * 100,
    bedding: (bedding / total) * 100,
    perennials: (perennials / total) * 100,
  };
});

const chartConfig = {
  herbs: { label: "Herbs", color: "var(--chart-1)" },
  bedding: { label: "Bedding", color: "var(--chart-2)" },
  perennials: { label: "Perennials", color: "var(--chart-3)" },
} satisfies ChartConfig;

const previous = shareData[4].herbs;
const current = shareData[5].herbs;

export function ChartAreaStackedExpand() {
  return (
    <Card data-specimen="area-stacked-expand">
      <CardHeader>
        <ChartName name="chart-area-stacked-expand" />
        <CardTitle>Plant sales mix</CardTitle>
        <CardDescription>Retail benches, share of plants sold (%), June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Plant sales mix, retail benches, share of plants sold (%), June to November 2026"
        >
          <AreaChart accessibilityLayer data={shareData} margin={{ left: 4, right: 12, top: 12 }} stackOffset="expand">
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
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={3}
              width={52}
              tick={{ className: "font-mono" }}
              domain={[0, 1]}
              ticks={[0, 0.5, 1]}
              tickFormatter={(value: number) => `${Math.round(value * 100)}%`}
            />
            <ChartTooltip
              cursor
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, name) => (
                    <>
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label}
                      </span>
                      <span className="ml-auto font-mono tabular-nums">
                        {Number(value).toLocaleString("en-GB", { maximumFractionDigits: 1 })}%
                      </span>
                    </>
                  )}
                />
              }
            />
            <Area
              dataKey="herbs"
              type="monotone"
              fill="var(--color-herbs)"
              fillOpacity={0.22}
              stroke="var(--color-herbs)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="bedding"
              type="monotone"
              fill="var(--color-bedding)"
              fillOpacity={0.22}
              stroke="var(--color-bedding)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="perennials"
              type="monotone"
              fill="var(--color-perennials)"
              fillOpacity={0.22}
              stroke="var(--color-perennials)"
              strokeWidth={2}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previous} to={current} period="on October" />
        <p className="text-muted-foreground">Each month totals 100%. The trend compares the herb share.</p>
        <ChartTable
          data={shareData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          caption="Plant sales mix, monthly shares of retail plants sold (%), June to November 2026. Illustrative data."
          formatValue={(value) => `${Number(value).toLocaleString("en-GB", { maximumFractionDigits: 1 })}%`}
        />
      </CardFooter>
    </Card>
  );
}
