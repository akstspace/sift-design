import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend, lastDays, shortDate, longDate } from "./shared";

export const description = "A linear line chart";

const values = [42, 38, 45, 36, 31, 35, 32];
const chartData = values.map((water, i) => ({ date: lastDays(7)[i], water }));
const chartConfig = {
  water: { label: "Water (litres)", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ChartLineLinear() {
  return (
    <Card data-specimen="line-linear">
      <CardHeader>
        <ChartName name="chart-line-linear" />
        <CardTitle>Water used on bench 4</CardTitle>
        <CardDescription>Propagation house, litres per day, 3 to 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Water used on bench 4. Propagation house, litres per day, 3 to 9 November 2026."
        >
          <LineChart accessibilityLayer data={chartData} margin={{ top: 12, left: 0, right: 18 }}>
            <CartesianGrid vertical={false} />
            <YAxis tickLine={false} axisLine={false} width={38} tickMargin={8} domain={[0, "auto"]} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={12}
              tickFormatter={shortDate}
            />
            <ChartTooltip cursor content={<ChartTooltipContent labelFormatter={longDate} indicator="line" />} />
            <Line
              dataKey="water"
              type="linear"
              stroke="var(--color-water)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={chartData.at(-2)!.water} to={chartData.at(-1)!.water} period="on the previous day" />
        <p className="text-muted-foreground">Daily irrigation volume from the bench meter.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="date"
          labelHeader="Day"
          keys={["water"]}
          formatLabel={longDate}
          caption="Water used on bench 4. Propagation house, litres per day, 3 to 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
