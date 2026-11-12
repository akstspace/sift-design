import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import {
  ChartContainer,
  ChartTable,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from "@sift-design/ui/chart";
import { ChartName, Trend } from "./shared";

export const description = "A radar chart with a radius axis";

const chartData = [
  { axis: "Light", bench2: 7, bench4: 8 },
  { axis: "Water", bench2: 9, bench4: 7 },
  { axis: "Airflow", bench2: 8, bench4: 6 },
  { axis: "Soil", bench2: 7, bench4: 8 },
  { axis: "Pests", bench2: 8, bench4: 9 },
  { axis: "Growth", bench2: 9, bench4: 7 },
];

const chartConfig = {
  bench2: { label: "Bench 2", color: "var(--chart-1)" },
  bench4: { label: "Bench 4", color: "var(--chart-2)" },
} satisfies ChartConfig;

const octoberValues = [6, 8, 7, 6, 7, 8, 7, 6, 6, 7, 8, 6];
const previous = octoberValues.reduce((sum, value) => sum + value, 0) / octoberValues.length;
const current = chartData.reduce((sum, row) => sum + row.bench2 + row.bench4, 0) / (chartData.length * 2);
const number = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 });

export function ChartRadarRadius() {
  return (
    <Card data-specimen="radar-radius">
      <CardHeader>
        <ChartName name="chart-radar-radius" />
        <CardTitle>Growing bench health</CardTitle>
        <CardDescription>Benches 2 and 4, score out of 10, November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[300px] w-full max-w-[380px] aspect-auto"
          aria-label="Growing bench health, benches 2 and 4, score out of 10, November 2026"
        >
          <RadarChart
            data={chartData}
            outerRadius="74%"
            margin={{ top: 20, right: 28, bottom: 20, left: 28 }}
            accessibilityLayer
          >
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent labelFormatter={(_, payload) => payload?.[0]?.payload?.axis} indicator="line" />
              }
            />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <PolarGrid />
            <PolarRadiusAxis
              domain={[0, 10]}
              tickCount={6}
              angle={60}
              orientation="middle"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}
              stroke="var(--muted)"
            />
            <Radar
              name="Bench 2"
              dataKey="bench2"
              fill="var(--color-bench2)"
              fillOpacity={0.22}
              stroke="var(--color-bench2)"
              strokeWidth={2}
            />
            <Radar
              name="Bench 4"
              dataKey="bench4"
              fill="var(--color-bench4)"
              fillOpacity={0.22}
              stroke="var(--color-bench4)"
              strokeWidth={2}
              strokeDasharray="5 3"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previous} to={current} period="on October" />
        <p className="text-muted-foreground">
          Mean score: <span className="font-mono tabular-nums">{number(current)}</span> out of 10 in November;{" "}
          <span className="font-mono tabular-nums">{number(previous)}</span> out of 10 in October.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="axis"
          labelHeader="Check"
          caption="Growing bench health, benches 2 and 4, score out of 10, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
