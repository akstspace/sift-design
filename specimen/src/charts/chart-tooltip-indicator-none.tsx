import { Bar, BarChart, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTable,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@sift-design/ui/chart";
import { ChartName, lastDays, longDate, meanRow, shortDate, Trend } from "./shared";

export const description = "A stacked bar chart with a legend";

// Illustrative daily records for Fernbrook Greenhouse.
const values = [
  [12, 18],
  [16, 20],
  [10, 15],
  [14, 22],
  [8, 10],
  [18, 24],
];
const chartData = lastDays(6).map((date, index) => ({
  date,
  day: shortDate(date),
  herbs: values[index][0],
  bedding: values[index][1],
}));
const chartConfig = {
  herbs: { label: "Herbs", color: "var(--chart-1)" },
  bedding: { label: "Bedding", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChartTooltipIndicatorNone() {
  const previous = meanRow(chartData.slice(0, -1));
  const current = chartData.at(-1)!;
  return (
    <Card data-specimen="tooltip-indicator-none">
      <CardHeader>
        <ChartName name="chart-tooltip-indicator-none" />
        <CardTitle>Seed trays sown</CardTitle>
        <CardDescription>Propagation house, trays per day, 4 to 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[220px] w-full aspect-auto"
          aria-label="Seed trays sown, trays per day, 4 to 9 November 2026"
        >
          <BarChart accessibilityLayer data={chartData} barSize={28}>
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} minTickGap={12} />
            <Bar
              dataKey="herbs"
              stackId="a"
              fill="var(--color-herbs)"
              radius={0}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <Bar
              dataKey="bedding"
              stackId="a"
              fill="var(--color-bedding)"
              radius={[4, 4, 0, 0]}
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <ChartTooltip cursor={false} defaultIndex={1} content={<ChartTooltipContent hideIndicator />} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend
          from={previous.herbs + previous.bedding}
          to={current.herbs + current.bedding}
          period="on the 4–8 November average"
        />
        <p className="text-muted-foreground">Herb and bedding seed trays sown each day.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="date"
          labelHeader="Day"
          formatLabel={longDate}
          formatValue={(value) => `${Number(value).toLocaleString("en-GB")} trays`}
          caption="Seed trays sown, trays per day, 4 to 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
