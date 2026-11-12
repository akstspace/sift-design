import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend } from "./shared";

export const description = "A radial chart";

const chartData = [
  { bench: "bench1", rate: 82, fill: "var(--color-bench1)" },
  { bench: "bench2", rate: 74, fill: "var(--color-bench2)" },
  { bench: "bench3", rate: 91, fill: "var(--color-bench3)" },
];
const chartConfig = {
  rate: { label: "Germinated (%)" },
  bench1: { label: "Bench 1", color: "var(--chart-1)" },
  bench2: { label: "Bench 2", color: "var(--chart-2)" },
  bench3: { label: "Bench 3", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function ChartRadialSimple() {
  const mean = chartData.reduce((sum, row) => sum + row.rate, 0) / chartData.length;
  return (
    <Card data-specimen="radial-simple">
      <CardHeader>
        <ChartName name="chart-radial-simple" />
        <CardTitle>Germinated trays</CardTitle>
        <CardDescription>Propagation house, share of trays per bench, 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto aspect-square h-[250px] max-w-full"
          aria-label="Germinated trays by bench, percent, 9 November 2026. Each full circle is 100 percent."
        >
          <RadialBarChart
            data={chartData}
            innerRadius={35}
            outerRadius={112}
            startAngle={90}
            endAngle={-270}
            barSize={14}
            accessibilityLayer
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="bench"
                  formatter={(value, _name, item) => (
                    <>
                      <span className="text-muted-foreground">{chartConfig[item.payload.bench as "bench1"].label}</span>
                      <span className="ml-auto font-mono">{String(value)}%</span>
                    </>
                  )}
                />
              }
            />
            <RadialBar dataKey="rate" background cornerRadius={4} />
          </RadialBarChart>
        </ChartContainer>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs" aria-label="Benches">
          {chartData.map((row) => (
            <li key={row.bench} className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-[2px]"
                style={{ background: chartConfig[row.bench as "bench1"].color }}
                aria-hidden
              />
              <span>{chartConfig[row.bench as "bench1"].label}</span>
              <span className="font-mono">{row.rate}%</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={78} to={mean} period="since 2 November" />
        <p className="text-muted-foreground">Each bench holds 100 trays. Rings run from 0 to 100%.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="bench"
          labelHeader="Bench"
          caption="Germinated trays by bench, percent, 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
