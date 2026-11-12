import { IconBuildingStore, IconTruck } from "@tabler/icons-react";
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

export const description = "A radar chart with icons";

const RetailIcon = () => <IconBuildingStore aria-hidden />;
const FloristIcon = () => <IconTruck aria-hidden />;

const chartData = [
  { axis: "Salvia", retail: 48, florists: 72 },
  { axis: "Dahlia", retail: 36, florists: 54 },
  { axis: "Aster", retail: 60, florists: 90 },
  { axis: "Cosmos", retail: 42, florists: 66 },
  { axis: "Zinnia", retail: 54, florists: 78 },
  { axis: "Statice", retail: 30, florists: 48 },
];

const chartConfig = {
  retail: { label: "Retail", color: "var(--chart-1)", icon: RetailIcon },
  florists: { label: "Florists", color: "var(--chart-2)", icon: FloristIcon },
} satisfies ChartConfig;

const octoberValues = [42, 30, 54, 36, 48, 24, 66, 48, 84, 60, 72, 42];
const previous = octoberValues.reduce((sum, value) => sum + value, 0);
const current = chartData.reduce((sum, row) => sum + row.retail + row.florists, 0);
const number = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 });

export function ChartRadarIcons() {
  return (
    <Card data-specimen="radar-icons">
      <CardHeader>
        <ChartName name="chart-radar-icons" />
        <CardTitle>Cut stems harvested</CardTitle>
        <CardDescription>Retail and florist orders, stems by crop, November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[300px] w-full max-w-[380px] aspect-auto"
          aria-label="Cut stems harvested, retail and florist orders, stems by crop, November 2026"
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
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Retail"
              dataKey="retail"
              fill="var(--color-retail)"
              fillOpacity={0.22}
              stroke="var(--color-retail)"
              strokeWidth={2}
            />
            <Radar
              name="Florists"
              dataKey="florists"
              fill="var(--color-florists)"
              fillOpacity={0.22}
              stroke="var(--color-florists)"
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
          Total: <span className="font-mono tabular-nums">{number(current)}</span> stems in November;{" "}
          <span className="font-mono tabular-nums">{number(previous)}</span> stems in October.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="axis"
          labelHeader="Category"
          caption="Cut stems harvested, retail and florist orders, stems by crop, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
