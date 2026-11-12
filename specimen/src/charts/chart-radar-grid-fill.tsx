import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend } from "./shared";

export const description = "A radar chart with a grid filled";

const chartData = [
  { axis: "Bench 1", litres: 84 },
  { axis: "Bench 2", litres: 96 },
  { axis: "Bench 3", litres: 72 },
  { axis: "Bench 4", litres: 88 },
  { axis: "Bench 5", litres: 64 },
  { axis: "Bench 6", litres: 80 },
];

const chartConfig = {
  litres: { label: "Water used", color: "var(--chart-1)" },
} satisfies ChartConfig;

const octoberValues = [90, 104, 80, 96, 72, 88];
const previous = octoberValues.reduce((sum, value) => sum + value, 0);
const current = chartData.reduce((sum, row) => sum + row.litres, 0);
const number = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 });

export function ChartRadarGridFill() {
  return (
    <Card data-specimen="radar-grid-fill">
      <CardHeader>
        <ChartName name="chart-radar-grid-fill" />
        <CardTitle>Bench irrigation water</CardTitle>
        <CardDescription>Benches 1 to 6, litres used, November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[300px] w-full max-w-[380px] aspect-auto"
          aria-label="Bench irrigation water, benches 1 to 6, litres used, November 2026"
        >
          <RadarChart
            data={chartData}
            outerRadius="74%"
            margin={{ top: 20, right: 28, bottom: 20, left: 28 }}
            accessibilityLayer
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent labelFormatter={(_, payload) => payload?.[0]?.payload?.axis} />}
            />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <PolarGrid fill="var(--subtle)" />
            <PolarRadiusAxis domain={[0, 120]} tick={false} axisLine={false} />
            <Radar
              name="Water used"
              dataKey="litres"
              fill="var(--color-litres)"
              fillOpacity={0.22}
              stroke="var(--color-litres)"
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previous} to={current} period="on October" />
        <p className="text-muted-foreground">
          Total: <span className="font-mono tabular-nums">{number(current)}</span> litres in November;{" "}
          <span className="font-mono tabular-nums">{number(previous)}</span> litres in October.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="axis"
          labelHeader="Bench"
          caption="Bench irrigation water, benches 1 to 6, litres used, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
