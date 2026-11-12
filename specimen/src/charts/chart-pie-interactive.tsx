import * as React from "react";
import { Pie, PieChart } from "recharts";
import type { PieSectorShapeProps } from "recharts/types/polar/Pie";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@sift-design/ui/select";
import { Button } from "@sift-design/ui/button";
import { AnimatedPieSector, usePieSectorExpansion } from "./chart-pie-donut-active";
import { ChartName, months, RollingNumber, Trend } from "./shared";

export const description = "An interactive pie chart";

const categories = ["herbs", "bedding", "perennials", "seedlings"] as const;
const revenue = [
  [840, 1260, 720, 540],
  [920, 1140, 860, 620],
  [1080, 980, 940, 700],
  [1240, 860, 1080, 760],
  [1380, 720, 1260, 840],
  [1560, 600, 1380, 960],
];
const chartConfig = {
  value: { label: "Revenue (£)" },
  herbs: { label: "Herbs", color: "var(--chart-1)" },
  bedding: { label: "Bedding", color: "var(--chart-2)" },
  perennials: { label: "Perennials", color: "var(--chart-3)" },
  seedlings: { label: "Seedlings", color: "var(--chart-4)" },
} satisfies ChartConfig;
const monthTotal = (index: number) => revenue[index].reduce((sum, value) => sum + value, 0);

export function ChartPieInteractive() {
  const [month, setMonth] = React.useState("November");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const expansion = usePieSectorExpansion(activeIndex);
  const monthIndex = months.findIndex((value) => value === month);
  const chartData = React.useMemo(
    () =>
      categories.map((category, index) => ({
        category,
        value: revenue[monthIndex][index],
        fill: `var(--color-${category})`,
      })),
    [monthIndex],
  );
  const total = monthTotal(monthIndex);

  return (
    <Card data-specimen="pie-interactive">
      <CardHeader className="flex flex-col items-start">
        <ChartName name="chart-pie-interactive" />
        <CardTitle>Plant sale revenue</CardTitle>
        <CardDescription>Retail benches, pounds (£), {month} 2026</CardDescription>
        <CardAction className="self-start pt-1">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger aria-label="Revenue month" className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="relative mx-auto max-w-[360px]">
          <ChartContainer
            role="group"
            config={chartConfig}
            className="h-[260px] w-full aspect-auto"
            aria-label={`Plant sale revenue, pounds, ${month} 2026, by plant group`}
          >
            <PieChart accessibilityLayer>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="category" />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="category"
                cy={120}
                innerRadius={62}
                outerRadius={90}
                stroke="var(--surface)"
                strokeWidth={2}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                shape={(props: PieSectorShapeProps) => (
                  <AnimatedPieSector
                    {...props}
                    active={props.index === activeIndex}
                    expansion={expansion[props.index]}
                    halo
                  />
                )}
              />
            </PieChart>
          </ChartContainer>
          <div
            className="pointer-events-none absolute inset-x-0 top-[99px] flex flex-col items-center gap-1"
            aria-live="polite"
            aria-atomic="true"
          >
            <RollingNumber value={total} className="text-[30px] leading-none font-semibold" />
            <span className="text-[12px] text-muted-foreground">pounds (£)</span>
          </div>
        </div>
        <div role="group" className="flex flex-wrap justify-center gap-1" aria-label="Emphasise revenue category">
          {categories.map((category, index) => (
            <Button
              key={category}
              size="xs"
              variant="ghost"
              aria-label={`Inspect ${chartConfig[category].label} revenue`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index === activeIndex ? 0 : index)}
            >
              <span aria-hidden className="size-2 rounded-[2px]" style={{ background: chartConfig[category].color }} />
              {chartConfig[category].label}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend
          from={monthTotal(Math.max(0, monthIndex - 1))}
          to={total}
          period={monthIndex ? `on ${months[monthIndex - 1]}` : "against June baseline"}
        />
        <p className="text-muted-foreground">Revenue by plant group. Select a month to compare the mix.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="category"
          labelHeader="Plant group"
          caption={`Plant sale revenue, pounds (£), ${month} 2026. Illustrative data.`}
        />
      </CardFooter>
    </Card>
  );
}
