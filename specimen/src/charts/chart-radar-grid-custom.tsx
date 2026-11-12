import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend } from "./shared";

export const description = "A radar chart with a custom grid";

const chartData = [
  { axis: "Basil", trays: 18 },
  { axis: "Chives", trays: 12 },
  { axis: "Parsley", trays: 16 },
  { axis: "Mint", trays: 10 },
  { axis: "Thyme", trays: 14 },
  { axis: "Sage", trays: 8 },
];

const chartConfig = {
  trays: { label: "Trays sown", color: "var(--chart-1)" },
} satisfies ChartConfig;

const octoberValues = [16, 10, 14, 8, 12, 8];
const previous = octoberValues.reduce((sum, value) => sum + value, 0);
const current = chartData.reduce((sum, row) => sum + row.trays, 0);
const number = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 });

export function ChartRadarGridCustom() {
  return (
    <Card data-specimen="radar-grid-custom">
      <CardHeader>
        <ChartName name="chart-radar-grid-custom" />
        <CardTitle>Seed trays sown</CardTitle>
        <CardDescription>Propagation house, trays by crop, November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[300px] w-full max-w-[380px] aspect-auto"
          aria-label="Seed trays sown, propagation house, trays by crop, November 2026"
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
            <PolarGrid radialLines={false} polarRadius={[74]} strokeWidth={1} />
            <PolarRadiusAxis domain={[0, 20]} tick={false} axisLine={false} />
            <Radar
              name="Trays sown"
              dataKey="trays"
              fill="var(--color-trays)"
              fillOpacity={0.22}
              stroke="var(--color-trays)"
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previous} to={current} period="on October" />
        <p className="text-muted-foreground">
          Total: <span className="font-mono tabular-nums">{number(current)}</span> trays in November;{" "}
          <span className="font-mono tabular-nums">{number(previous)}</span> trays in October.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="axis"
          labelHeader="Category"
          caption="Seed trays sown, propagation house, trays by crop, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
