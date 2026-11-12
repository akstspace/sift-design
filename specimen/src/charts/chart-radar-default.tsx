import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend } from "./shared";

export const description = "A radar chart";

const chartData = [
  { axis: "Light", score: 8 },
  { axis: "Water", score: 7 },
  { axis: "Airflow", score: 6 },
  { axis: "Soil", score: 8 },
  { axis: "Pests", score: 9 },
  { axis: "Growth", score: 7 },
];

const chartConfig = {
  score: { label: "Bench 4", color: "var(--chart-1)" },
} satisfies ChartConfig;

const octoberValues = [7, 6, 6, 7, 8, 6];
const previous = octoberValues.reduce((sum, value) => sum + value, 0) / octoberValues.length;
const current = chartData.reduce((sum, row) => sum + row.score, 0) / (chartData.length * 1);
const number = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 });

export function ChartRadarDefault() {
  return (
    <Card data-specimen="radar-default">
      <CardHeader>
        <ChartName name="chart-radar-default" />
        <CardTitle>Propagation bench health</CardTitle>
        <CardDescription>Bench 4, score out of 10, November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[300px] w-full max-w-[380px] aspect-auto"
          aria-label="Propagation bench health, bench 4, score out of 10, November 2026"
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
            <PolarGrid />
            <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
            <Radar
              name="Bench 4"
              dataKey="score"
              fill="var(--color-score)"
              fillOpacity={0.22}
              stroke="var(--color-score)"
              strokeWidth={2}
            />
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
          caption="Propagation bench health, bench 4, score out of 10, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
