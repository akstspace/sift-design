import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend } from "./shared";

export const description = "A radar chart with a grid and circle fill";

const chartData = [
  { axis: "Lavender", cuttings: 160 },
  { axis: "Rosemary", cuttings: 180 },
  { axis: "Sage", cuttings: 120 },
  { axis: "Mint", cuttings: 200 },
  { axis: "Thyme", cuttings: 140 },
  { axis: "Salvia", cuttings: 100 },
];

const chartConfig = {
  cuttings: { label: "Rooted cuttings", color: "var(--chart-1)" },
} satisfies ChartConfig;

const octoberValues = [140, 160, 100, 180, 130, 90];
const previous = octoberValues.reduce((sum, value) => sum + value, 0);
const current = chartData.reduce((sum, row) => sum + row.cuttings, 0);
const number = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 });

export function ChartRadarGridCircleFill() {
  return (
    <Card data-specimen="radar-grid-circle-fill">
      <CardHeader>
        <ChartName name="chart-radar-grid-circle-fill" />
        <CardTitle>Rooted cuttings</CardTitle>
        <CardDescription>Propagation house, cuttings by crop, November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[300px] w-full max-w-[380px] aspect-auto"
          aria-label="Rooted cuttings, propagation house, cuttings by crop, November 2026"
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
            <PolarGrid gridType="circle" fill="var(--subtle)" />
            <PolarRadiusAxis domain={[0, 250]} tick={false} axisLine={false} />
            <Radar
              name="Rooted cuttings"
              dataKey="cuttings"
              fill="var(--color-cuttings)"
              fillOpacity={0.22}
              stroke="var(--color-cuttings)"
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previous} to={current} period="on October" />
        <p className="text-muted-foreground">
          Total: <span className="font-mono tabular-nums">{number(current)}</span> cuttings in November;{" "}
          <span className="font-mono tabular-nums">{number(previous)}</span> cuttings in October.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="axis"
          labelHeader="Category"
          caption="Rooted cuttings, propagation house, cuttings by crop, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
