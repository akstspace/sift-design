import { PolarAngleAxis, PolarGrid, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend } from "./shared";

export const description = "A radial chart with a grid";
const chartData = [
  { zone: "propagation", used: 68, fill: "var(--color-propagation)" },
  { zone: "polytunnel", used: 54, fill: "var(--color-polytunnel)" },
  { zone: "retail", used: 42, fill: "var(--color-retail)" },
];
const chartConfig = {
  used: { label: "Budget used (%)" },
  propagation: { label: "Propagation", color: "var(--chart-1)" },
  polytunnel: { label: "Polytunnel 2", color: "var(--chart-2)" },
  retail: { label: "Retail benches", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function ChartRadialGrid() {
  const total = chartData.reduce((sum, row) => sum + row.used, 0);
  return (
    <Card data-specimen="radial-grid">
      <CardHeader>
        <ChartName name="chart-radial-grid" />
        <CardTitle>Watering budget used</CardTitle>
        <CardDescription>Three growing areas, weekly budget share, 3 to 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto aspect-square h-[250px] max-w-full"
          aria-label="Watering budget used by area, percent, 3 to 9 November 2026. Full circle is 100 percent."
        >
          <RadialBarChart
            data={chartData}
            innerRadius={35}
            outerRadius={110}
            startAngle={90}
            endAngle={-270}
            barSize={14}
            accessibilityLayer
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="zone" />} />
            <PolarGrid gridType="circle" polarAngles={[0, 90, 180, 270]} />
            <RadialBar dataKey="used" cornerRadius={4} />
          </RadialBarChart>
        </ChartContainer>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs" aria-label="Growing areas">
          {chartData.map((row) => (
            <li key={row.zone} className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-[2px]"
                style={{ background: chartConfig[row.zone as "retail"].color }}
                aria-hidden
              />
              <span>{chartConfig[row.zone as "retail"].label}</span>
              <span className="font-mono">{row.used}%</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={180} to={total} period="on the previous week" />
        <p className="text-muted-foreground">Each area has a 1,000-litre weekly budget. Grid spokes mark 25% steps.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="zone"
          labelHeader="Area"
          caption="Watering budget used by area, percent of 1,000 litres, 3 to 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
