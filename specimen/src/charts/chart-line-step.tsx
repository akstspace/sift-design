import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend } from "./shared";

export const description = "A line chart with step";

const values = [15, 15, 10, 10, 20, 20];
const chartData = values.map((interval, i) => ({
  hour: ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00"][i],
  interval,
}));
const chartConfig = {
  interval: { label: "Interval (minutes)", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ChartLineStep() {
  return (
    <Card data-specimen="line-step">
      <CardHeader>
        <ChartName name="chart-line-step" />
        <CardTitle>Misting interval</CardTitle>
        <CardDescription>Propagation house controller, minutes between cycles, 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Misting interval. Propagation house controller, minutes between cycles, 9 November 2026."
        >
          <LineChart accessibilityLayer data={chartData} margin={{ top: 12, left: 0, right: 18 }}>
            <CartesianGrid vertical={false} />
            <YAxis tickLine={false} axisLine={false} width={38} tickMargin={8} domain={[0, "auto"]} />
            <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} minTickGap={12} />
            <ChartTooltip cursor content={<ChartTooltipContent indicator="line" />} />
            <Line
              dataKey="interval"
              type="step"
              stroke="var(--color-interval)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={chartData.at(-2)!.interval} to={chartData.at(-1)!.interval} period="on the previous sample" />
        <p className="text-muted-foreground">
          Controller samples every two hours. Steps change midway between samples.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="hour"
          labelHeader="Time (GMT)"
          keys={["interval"]}
          caption="Misting interval. Propagation house controller, minutes between cycles, 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
