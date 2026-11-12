import * as React from "react";
import { Pie, PieChart, Sector } from "recharts";
import type { PieSectorShapeProps } from "recharts/types/polar/Pie";
import { animate, motionValue, useMotionValueEvent, useReducedMotion, type MotionValue } from "motion/react";
import { spring } from "@sift-design/tokens/motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { Button } from "@sift-design/ui/button";
import { ChartName, largestShare, Trend } from "./shared";

export const description = "A donut chart with an active sector";

const chartData = [
  { category: "herbs", value: 480, fill: "var(--color-herbs)" },
  { category: "bedding", value: 360, fill: "var(--color-bedding)" },
  { category: "perennials", value: 300, fill: "var(--color-perennials)" },
  { category: "seedlings", value: 240, fill: "var(--color-seedlings)" },
];

const chartConfig = {
  value: { label: "Plants" },
  herbs: { label: "Herbs", color: "var(--chart-1)" },
  bedding: { label: "Bedding", color: "var(--chart-2)" },
  perennials: { label: "Perennials", color: "var(--chart-3)" },
  seedlings: { label: "Seedlings", color: "var(--chart-4)" },
} satisfies ChartConfig;

const total = chartData.reduce((sum, row) => sum + row.value, 0);

/** Keep expansion outside Recharts sectors, whose geometry keys change during data morphs. */
export function usePieSectorExpansion(activeIndex: number) {
  const reduced = !!useReducedMotion();
  const values = React.useMemo(() => Array.from({ length: 4 }, () => motionValue(0)), []);
  React.useEffect(() => {
    const controls = values.map((value, index) => {
      if (reduced) {
        value.set(0);
        return;
      }
      return animate(value, index === activeIndex ? 10 : 0, index === activeIndex ? spring.smooth : spring.exit);
    });
    return () => controls.forEach((control) => control?.stop());
  }, [activeIndex, reduced, values]);
  return values;
}

/** Stable motion values retain position and velocity when selection reverses. */
export function AnimatedPieSector({
  active,
  expansion,
  halo = false,
  outerRadius = 0,
  ...props
}: PieSectorShapeProps & { active: boolean; expansion: MotionValue<number>; halo?: boolean }) {
  const reduced = !!useReducedMotion();
  const [radius, setRadius] = React.useState(() => expansion.get());
  useMotionValueEvent(expansion, "change", setRadius);
  const growth = reduced ? 0 : radius;
  return (
    <g data-active-sector={active || undefined}>
      <Sector
        {...props}
        outerRadius={outerRadius + growth}
        stroke={reduced && active ? "var(--ink)" : "var(--surface)"}
        strokeWidth={2}
      />
      {halo && !reduced && growth > 0.01 && (
        <Sector
          {...props}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 12 + growth * 0.8}
          stroke="var(--surface)"
          strokeWidth={2}
        />
      )}
    </g>
  );
}

export function ChartPieDonutActive() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const expansion = usePieSectorExpansion(activeIndex);
  return (
    <Card data-specimen="pie-donut-active">
      <CardHeader>
        <ChartName name="chart-pie-donut-active" />
        <CardTitle>Plants dispatched</CardTitle>
        <CardDescription>Wholesale orders, plants, November 2026</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[280px] w-full max-w-[360px] aspect-auto [&_.recharts-pie-label-text]:fill-foreground"
          aria-label="Plants dispatched, plants, November 2026"
        >
          <PieChart accessibilityLayer>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="category" />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="category"
              cy={112}
              innerRadius={60}
              outerRadius={90}
              stroke="var(--surface)"
              strokeWidth={2}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              shape={(props: PieSectorShapeProps) => (
                <AnimatedPieSector {...props} active={props.index === activeIndex} expansion={expansion[props.index]} />
              )}
            ></Pie>
          </PieChart>
        </ChartContainer>
        <div role="group" className="flex flex-wrap justify-center gap-1" aria-label="Emphasise plant group">
          {chartData.map((row, index) => (
            <Button
              key={row.category}
              variant="ghost"
              size="xs"
              aria-label={`Emphasise ${chartConfig[row.category as keyof typeof chartConfig].label}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index === activeIndex ? 0 : index)}
            >
              <span
                aria-hidden
                className="size-2 rounded-[2px]"
                style={{
                  background: chartConfig[row.category as "herbs" | "bedding" | "perennials" | "seedlings"].color,
                }}
              />
              {chartConfig[row.category as keyof typeof chartConfig].label}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={1300} to={total} period="on October" />
        <p className="text-muted-foreground">
          Largest share: {chartConfig[largestShare(chartData).name as keyof typeof chartConfig].label},{" "}
          <span className="font-mono text-[12.5px] tabular-nums">{largestShare(chartData).percent}%</span>.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="category"
          labelHeader="Plant groups"
          caption="Plants dispatched, plants, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
