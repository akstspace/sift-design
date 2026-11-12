import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend, months } from "./shared";

export const description = "A line chart with dots";

const values = [82, 86, 89, 87, 91, 94];
const chartData = values.map((rate, i) => ({ month: months[i], rate }));
const chartConfig = {
  rate: { label: "Germinated (%)", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ChartLineDots() {
  return (
    <Card data-specimen="line-dots">
      <CardHeader>
        <ChartName name="chart-line-dots" />
        <CardTitle>Germination rate</CardTitle>
        <CardDescription>Basil trial, percent of 100 seeds per monthly batch, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Germination rate. Basil trial, percent of 100 seeds per monthly batch, June to November 2026."
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
              dataKey="rate"
              type="monotone"
              stroke="var(--color-rate)"
              strokeWidth={2}
              dot={{ fill: "var(--color-rate)", r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={chartData.at(-2)!.rate} to={chartData.at(-1)!.rate} period="on October" />
        <p className="text-muted-foreground">Each batch contains 100 seeds. Readings are taken after 14 days.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          keys={["rate"]}
          caption="Germination rate. Basil trial, percent of 100 seeds per monthly batch, June to November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
