import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend } from "./shared";

export const description = "A radar chart with a grid and circle fill";

const chartData = [
  { axis: "Propagation", pots: 140 },
  { axis: "Tunnel", pots: 180 },
  { axis: "Retail", pots: 120 },
  { axis: "Herbs", pots: 160 },
  { axis: "Potting", pots: 200 },
  { axis: "Store", pots: 100 },
];

const chartConfig = {
  pots: { label: "Pots reused", color: "var(--chart-1)" },
} satisfies ChartConfig;

const octoberValues = [120, 160, 100, 150, 180, 90];
const previous = octoberValues.reduce((sum, value) => sum + value, 0);
const current = chartData.reduce((sum, row) => sum + row.pots, 0);
const number = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 });

export function ChartRadarGridCircleNoLines() {
  return (
    <Card data-specimen="radar-grid-circle-no-lines">
      <CardHeader>
        <ChartName name="chart-radar-grid-circle-no-lines" />
        <CardTitle>Pots reused</CardTitle>
        <CardDescription>Greenhouse work areas, pots, November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[300px] w-full max-w-[380px] aspect-auto"
          aria-label="Pots reused, greenhouse work areas, pots, November 2026"
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
            <PolarGrid gridType="circle" radialLines={false} />
            <PolarRadiusAxis domain={[0, 250]} tick={false} axisLine={false} />
            <Radar
              name="Pots reused"
              dataKey="pots"
              fill="var(--color-pots)"
              fillOpacity={0.22}
              stroke="var(--color-pots)"
              strokeWidth={2}
              dot={{ r: 4, fillOpacity: 1, stroke: "var(--surface)", strokeWidth: 2 }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previous} to={current} period="on October" />
        <p className="text-muted-foreground">
          Total: <span className="font-mono tabular-nums">{number(current)}</span> pots in November;{" "}
          <span className="font-mono tabular-nums">{number(previous)}</span> pots in October.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="axis"
          labelHeader="Area"
          caption="Pots reused, greenhouse work areas, pots, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
