import { Label, PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend } from "./shared";

export const description = "A radial chart with stacked sections";
const chartData = [{ month: "November", retail: 360, wholesale: 240, goal: 800 }];
const chartConfig = {
  retail: { label: "Retail (plants)", color: "var(--chart-1)" },
  wholesale: { label: "Wholesale (plants)", color: "var(--chart-2)" },
  goal: { label: "Monthly goal (plants)" },
} satisfies ChartConfig;

export function ChartRadialStacked() {
  const total = chartData[0].retail + chartData[0].wholesale;
  return (
    <Card data-specimen="radial-stacked">
      <CardHeader>
        <ChartName name="chart-radial-stacked" />
        <CardTitle>Plants sold toward the monthly goal</CardTitle>
        <CardDescription>Retail and wholesale, plants, 1 to 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto aspect-auto h-[150px] w-full max-w-[250px]"
          aria-label={`Plants sold, ${total} of 800 plants, retail and wholesale stacked, 1 to 9 November 2026`}
        >
          <RadialBarChart
            data={chartData}
            startAngle={180}
            endAngle={0}
            cy={128}
            innerRadius={82}
            outerRadius={110}
            barSize={18}
            accessibilityLayer
          >
            <PolarAngleAxis type="number" domain={[0, chartData[0].goal]} tick={false} axisLine={false} />
            <RadialBar
              dataKey="retail"
              fill="var(--color-retail)"
              stackId="a"
              cornerRadius={4}
              stroke="var(--surface)"
              strokeWidth={2}
              background
            />
            <RadialBar
              dataKey="wholesale"
              fill="var(--color-wholesale)"
              stackId="a"
              cornerRadius={4}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan
                        x={viewBox.cx}
                        y={Number(viewBox.cy) - 16}
                        className="fill-foreground font-mono text-[30px] font-semibold"
                      >
                        {total.toLocaleString("en-GB")}
                      </tspan>
                      <tspan x={viewBox.cx} y={Number(viewBox.cy) + 7} className="fill-muted-foreground text-xs">
                        of 800 plants
                      </tspan>
                    </text>
                  );
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs" aria-label="Sales channels">
          {(["retail", "wholesale"] as const).map((key) => (
            <li key={key} className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-[2px]"
                style={{ background: `var(--color-${key}, ${chartConfig[key].color})` }}
                aria-hidden
              />
              <span>{key === "retail" ? "Retail" : "Wholesale"}</span>
              <span className="font-mono">{chartData[0][key]}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={540} to={total} period="on the same days in October" />
        <p className="text-muted-foreground">The half-circle represents 800 plants. Sales reached 75% of the goal.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month to date"
          caption="Retail and wholesale plants sold, plants out of an 800-plant monthly goal, 1 to 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
