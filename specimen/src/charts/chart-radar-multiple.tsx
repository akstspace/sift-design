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

export const description = "A radar chart with multiple data";

const chartData = [
  { axis: "Herbs", october: 180, november: 210 },
  { axis: "Bedding", october: 240, november: 180 },
  { axis: "Perennials", october: 160, november: 170 },
  { axis: "Seedlings", october: 210, november: 260 },
  { axis: "Succulents", october: 110, november: 130 },
];

const chartConfig = {
  october: { label: "October", color: "var(--chart-1)" },
  november: { label: "November", color: "var(--chart-2)" },
} satisfies ChartConfig;

const previous = chartData.reduce((sum, row) => sum + row.october, 0);
const current = chartData.reduce((sum, row) => sum + row.november, 0);
const number = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 });

export function ChartRadarMultiple() {
  return (
    <Card data-specimen="radar-multiple">
      <CardHeader>
        <ChartName name="chart-radar-multiple" />
        <CardTitle>Retail plants sold</CardTitle>
        <CardDescription>Retail benches, plants by category, October and November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[300px] w-full max-w-[380px] aspect-auto"
          aria-label="Retail plants sold, retail benches, plants by category, October and November 2026"
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
            <PolarRadiusAxis domain={[0, 300]} tick={false} axisLine={false} />
            <Radar
              name="October"
              dataKey="october"
              fill="var(--color-october)"
              fillOpacity={0.22}
              stroke="var(--color-october)"
              strokeWidth={2}
            />
            <Radar
              name="November"
              dataKey="november"
              fill="var(--color-november)"
              fillOpacity={0.22}
              stroke="var(--color-november)"
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
          caption="Retail plants sold, retail benches, plants by category, October and November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
