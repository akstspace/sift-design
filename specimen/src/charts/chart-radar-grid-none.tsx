import { PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend } from "./shared";

export const description = "A radar chart with no grid";

const chartData = [
  { axis: "Herbs", crates: 12 },
  { axis: "Bedding", crates: 8 },
  { axis: "Perennials", crates: 10 },
  { axis: "Seedlings", crates: 14 },
  { axis: "Succulents", crates: 6 },
];

const chartConfig = {
  crates: { label: "Crates", color: "var(--chart-1)" },
} satisfies ChartConfig;

const octoberValues = [10, 8, 8, 12, 6];
const previous = octoberValues.reduce((sum, value) => sum + value, 0);
const current = chartData.reduce((sum, row) => sum + row.crates, 0);
const number = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 });

export function ChartRadarGridNone() {
  return (
    <Card data-specimen="radar-grid-none">
      <CardHeader>
        <ChartName name="chart-radar-grid-none" />
        <CardTitle>Saturday market crates</CardTitle>
        <CardDescription>Market stall, crates by category, November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[300px] w-full max-w-[380px] aspect-auto"
          aria-label="Saturday market crates, market stall, crates by category, November 2026"
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
            <PolarRadiusAxis domain={[0, 16]} tick={false} axisLine={false} />
            <Radar
              name="Crates"
              dataKey="crates"
              fill="var(--color-crates)"
              fillOpacity={0.22}
              stroke="var(--color-crates)"
              strokeWidth={2}
              dot={{ r: 4, fillOpacity: 1, stroke: "var(--surface)", strokeWidth: 2 }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={previous} to={current} period="on October" />
        <p className="text-muted-foreground">
          Total: <span className="font-mono tabular-nums">{number(current)}</span> crates in November;{" "}
          <span className="font-mono tabular-nums">{number(previous)}</span> crates in October.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="axis"
          labelHeader="Category"
          caption="Saturday market crates, market stall, crates by category, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
