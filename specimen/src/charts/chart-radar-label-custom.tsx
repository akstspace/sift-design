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

export const description = "A radar chart with a custom label";

const chartData = [
  { axis: "Basil", batchA: 88, batchB: 92 },
  { axis: "Chives", batchA: 92, batchB: 88 },
  { axis: "Parsley", batchA: 76, batchB: 82 },
  { axis: "Mint", batchA: 84, batchB: 90 },
  { axis: "Thyme", batchA: 82, batchB: 86 },
  { axis: "Sage", batchA: 86, batchB: 80 },
];

const chartConfig = {
  batchA: { label: "Batch A", color: "var(--chart-1)" },
  batchB: { label: "Batch B", color: "var(--chart-2)" },
} satisfies ChartConfig;

const octoberValues = [84, 88, 72, 80, 78, 82, 88, 84, 78, 86, 82, 76];
const previous = octoberValues.reduce((sum, value) => sum + value, 0) / octoberValues.length;
const current = chartData.reduce((sum, row) => sum + row.batchA + row.batchB, 0) / (chartData.length * 2);
const number = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 });

export function ChartRadarLabelCustom() {
  return (
    <Card data-specimen="radar-label-custom">
      <CardHeader>
        <ChartName name="chart-radar-label-custom" />
        <CardTitle>Herb seed germination</CardTitle>
        <CardDescription>Propagation house, percent of seeds sown, November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto h-[300px] w-full max-w-[380px] aspect-auto"
          aria-label="Herb seed germination, propagation house, percent of seeds sown, November 2026"
        >
          <RadarChart
            data={chartData}
            outerRadius="62%"
            margin={{ top: 20, right: 28, bottom: 20, left: 28 }}
            accessibilityLayer
          >
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent labelFormatter={(_, payload) => payload?.[0]?.payload?.axis} indicator="line" />
              }
            />
            <PolarAngleAxis
              dataKey="axis"
              tick={({ x, y, textAnchor, index }) => {
                const row = chartData[index];
                // Two lines of text stay outside the shape: the top label stacks upward,
                // the bottom label stacks downward, and the side labels sit centered.
                const offset = index === 0 ? -18 : index === chartData.length / 2 ? 10 : -4;
                return (
                  <text x={x} y={Number(y) + offset} textAnchor={textAnchor} fontSize={12}>
                    <tspan className="font-mono fill-foreground">
                      {row.batchA}/{row.batchB}%
                    </tspan>
                    <tspan x={x} dy={16} className="fill-muted-foreground">
                      {row.axis}
                    </tspan>
                  </text>
                );
              }}
            />
            <PolarGrid />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Batch A"
              dataKey="batchA"
              fill="var(--color-batchA)"
              fillOpacity={0.22}
              stroke="var(--color-batchA)"
              strokeWidth={2}
            />
            <Radar
              name="Batch B"
              dataKey="batchB"
              fill="var(--color-batchB)"
              fillOpacity={0.22}
              stroke="var(--color-batchB)"
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
          Both November batches averaged <span className="font-mono tabular-nums">{number(current)}%</span>. The October
          batches averaged <span className="font-mono tabular-nums">{number(previous)}%</span>.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="axis"
          labelHeader="Category"
          caption="Herb seed germination, propagation house, percent of seeds sown, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
