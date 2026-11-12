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

export const description = "A radar chart with lines only";

const chartData = [
  { axis: "Herbs", hollins: 90, marsh: 70 },
  { axis: "Bedding", hollins: 120, marsh: 90 },
  { axis: "Perennials", hollins: 80, marsh: 110 },
  { axis: "Seedlings", hollins: 60, marsh: 40 },
  { axis: "Succulents", hollins: 100, marsh: 80 },
];

const chartConfig = {
  hollins: { label: "Hollins Florist", color: "var(--chart-1)" },
  marsh: { label: "Marsh Lane", color: "var(--chart-2)" },
} satisfies ChartConfig;

const octoberValues = [80, 110, 70, 55, 95, 60, 80, 100, 35, 75];
const previous = octoberValues.reduce((sum, value) => sum + value, 0);
const current = chartData.reduce((sum, row) => sum + row.hollins + row.marsh, 0);
const number = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 });

export function ChartRadarLinesOnly() {
  return (
    <Card data-specimen="radar-lines-only">
      <CardHeader>
        <ChartName name="chart-radar-lines-only" />
        <CardTitle>Florist plants ordered</CardTitle>
        <CardDescription>Florist orders, plants by category, November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[300px] w-full max-w-[380px] aspect-auto"
          aria-label="Florist plants ordered, florist orders, plants by category, November 2026"
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
            <PolarGrid radialLines={false} />
            <PolarRadiusAxis domain={[0, 150]} tick={false} axisLine={false} />
            <Radar
              name="Hollins Florist"
              dataKey="hollins"
              fill="var(--color-hollins)"
              fillOpacity={0}
              stroke="var(--color-hollins)"
              strokeWidth={2}
            />
            <Radar
              name="Marsh Lane"
              dataKey="marsh"
              fill="var(--color-marsh)"
              fillOpacity={0}
              stroke="var(--color-marsh)"
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
          Total: <span className="font-mono tabular-nums">{number(current)}</span> plants in November;{" "}
          <span className="font-mono tabular-nums">{number(previous)}</span> plants in October.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="axis"
          labelHeader="Category"
          caption="Florist plants ordered, florist orders, plants by category, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
