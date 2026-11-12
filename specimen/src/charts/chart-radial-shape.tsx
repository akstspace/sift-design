import { Label, PolarAngleAxis, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend } from "./shared";

export const description = "A radial chart with a custom shape";
const chartData = [{ tank: "Irrigation tank", litres: 1260, capacity: 1800, fill: "var(--color-litres)" }];
const chartConfig = {
  litres: { label: "Water (litres)", color: "var(--chart-1)" },
  capacity: { label: "Capacity (litres)" },
} satisfies ChartConfig;

export function ChartRadialShape() {
  return (
    <Card data-specimen="radial-shape">
      <CardHeader>
        <ChartName name="chart-radial-shape" />
        <CardTitle>Irrigation tank level</CardTitle>
        <CardDescription>Fernbrook Greenhouse, litres out of 1,800, 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto aspect-square h-[250px] max-w-full"
          aria-label="Irrigation tank level, 1,260 of 1,800 litres, 9 November 2026"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={-270}
            innerRadius={65}
            outerRadius={95}
            barSize={12}
            accessibilityLayer
          >
            <PolarAngleAxis type="number" domain={[0, chartData[0].capacity]} tick={false} axisLine={false} />
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              polarRadius={[86, 74]}
              className="first:fill-subtle last:fill-card"
            />
            <RadialBar dataKey="litres" background cornerRadius={0} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground font-mono text-[30px] font-semibold"
                      >
                        {chartData[0].litres.toLocaleString("en-GB")}
                      </tspan>
                      <tspan x={viewBox.cx} y={Number(viewBox.cy) + 25} className="fill-muted-foreground text-xs">
                        of 1,800 litres
                      </tspan>
                    </text>
                  );
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={1440} to={chartData[0].litres} period="since 8 November" />
        <p className="text-muted-foreground">The full track holds 1,800 litres. The tank is 70% full.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="tank"
          labelHeader="Tank"
          caption="Irrigation tank level, litres out of 1,800, 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
