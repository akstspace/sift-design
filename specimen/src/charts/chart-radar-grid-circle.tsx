import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend } from "./shared";

export const description = "A radar chart with a grid and circle";

const chartData = [
  { axis: "Morning", score: 7 },
  { axis: "Noon", score: 9 },
  { axis: "Evening", score: 8 },
  { axis: "Night", score: 6 },
  { axis: "Intake", score: 8 },
  { axis: "Outlet", score: 9 },
];

const chartConfig = {
  score: { label: "Inspection", color: "var(--chart-1)" },
} satisfies ChartConfig;

const octoberValues = [6, 8, 7, 6, 7, 8];
const previous = octoberValues.reduce((sum, value) => sum + value, 0) / octoberValues.length;
const current = chartData.reduce((sum, row) => sum + row.score, 0) / (chartData.length * 1);
const number = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 });

export function ChartRadarGridCircle() {
  return (
    <Card data-specimen="radar-grid-circle">
      <CardHeader>
        <ChartName name="chart-radar-grid-circle" />
        <CardTitle>Ventilation inspection</CardTitle>
        <CardDescription>Polytunnel 2, score out of 10, November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[300px] w-full max-w-[380px] aspect-auto"
          aria-label="Ventilation inspection, polytunnel 2, score out of 10, November 2026"
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
            <PolarGrid gridType="circle" />
            <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
            <Radar
              name="Inspection"
              dataKey="score"
              fill="var(--color-score)"
              fillOpacity={0.22}
              stroke="var(--color-score)"
              strokeWidth={2}
              dot={{ r: 4, fillOpacity: 1, stroke: "var(--surface)", strokeWidth: 2 }}
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
          caption="Ventilation inspection, polytunnel 2, score out of 10, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
