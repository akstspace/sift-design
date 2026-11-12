import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend, months } from "./shared";

export const description = "A line chart";

const values = [5, 8, 12, 18, 23, 27];
const chartData = values.map((height, i) => ({ month: months[i], height }));
const chartConfig = {
  height: { label: "Height (cm)", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ChartLineDefault() {
  return (
    <Card data-specimen="line-default">
      <CardHeader>
        <ChartName name="chart-line-default" />
        <CardTitle>Seedling height</CardTitle>
        <CardDescription>Sweet pea trial, mean height in cm, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Seedling height. Sweet pea trial, mean height in cm, June to November 2026."
        >
          <LineChart accessibilityLayer data={chartData} margin={{ top: 12, left: 0, right: 18 }}>
            <CartesianGrid vertical={false} />
            <YAxis tickLine={false} axisLine={false} width={38} tickMargin={8} domain={[0, "auto"]} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={12}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor content={<ChartTooltipContent indicator="line" />} />
            <Line
              dataKey="height"
              type="monotone"
              stroke="var(--color-height)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={chartData.at(-2)!.height} to={chartData.at(-1)!.height} period="on October" />
        <p className="text-muted-foreground">Mean height of 20 marked sweet pea plants.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          keys={["height"]}
          caption="Seedling height. Sweet pea trial, mean height in cm, June to November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
