import { CartesianGrid, Line, LineChart, XAxis, YAxis, Dot } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend, lastDays, shortDate, longDate } from "./shared";

export const description = "A line chart with dots and colors";

const categories = ["herbs", "bedding", "perennials", "seedlings", "succulents"] as const;
const values = [72, 96, 84, 60, 78];
const chartData = values.map((plants, i) => ({
  date: lastDays(5)[i],
  plants,
  category: categories[i],
  fill: `var(--color-${categories[i]})`,
}));
const chartConfig = {
  plants: { label: "Plants", color: "var(--chart-1)" },
  herbs: { label: "Herbs", color: "var(--chart-1)" },
  bedding: { label: "Bedding", color: "var(--chart-2)" },
  perennials: { label: "Perennials", color: "var(--chart-3)" },
  seedlings: { label: "Seedlings", color: "var(--chart-4)" },
  succulents: { label: "Succulents", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function ChartLineDotsColors() {
  return (
    <Card data-specimen="line-dots-colors">
      <CardHeader>
        <ChartName name="chart-line-dots-colors" />
        <CardTitle>Plants in the daily dispatch batch</CardTitle>
        <CardDescription>Fernbrook Greenhouse, plants per batch, 5 to 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Plants in the daily dispatch batch. Fernbrook Greenhouse, plants per batch, 5 to 9 November 2026."
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
            <ChartTooltip cursor content={<ChartTooltipContent labelFormatter={longDate} nameKey="category" />} />
            <Line
              dataKey="plants"
              type="monotone"
              stroke="var(--color-plants)"
              strokeWidth={2}
              dot={({ cx, cy, payload }) => (
                <Dot
                  key={payload.date}
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill={payload.fill}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              )}
              activeDot={({ cx, cy, payload }) => (
                <Dot
                  className="recharts-dot"
                  cx={cx}
                  cy={cy}
                  r={6}
                  fill={payload.fill}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              )}
            />
          </LineChart>
        </ChartContainer>
        <ul
          className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
          aria-label="Plant categories"
        >
          {categories.map((category) => (
            <li key={category} className="flex items-center gap-1.5">
              <span className="size-2 rounded-[2px]" style={{ background: chartConfig[category].color }} aria-hidden />
              {chartConfig[category].label}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={chartData.at(-2)!.plants} to={chartData.at(-1)!.plants} period="on the previous day" />
        <p className="text-muted-foreground">One dispatch batch per day. Each batch contains one plant category.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="date"
          labelHeader="Day"
          keys={["plants"]}
          formatLabel={longDate}
          formatValue={(value, key, row) =>
            key === "plants"
              ? `${Number(value).toLocaleString("en-GB")} (${chartConfig[row.category as keyof typeof chartConfig]?.label})`
              : String(value)
          }
          caption="Plants in the daily dispatch batch. Fernbrook Greenhouse, plants per batch, 5 to 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
