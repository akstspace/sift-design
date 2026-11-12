import { CartesianGrid, Line, LineChart, XAxis, YAxis, LabelList } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend, lastDays, shortDate, longDate } from "./shared";

export const description = "A line chart with a custom label";

const destinations = ["hollins", "marsh", "willow", "orchard", "fern"] as const;
const values = [18, 26, 22, 32, 24];
const chartData = values.map((distance, i) => ({ date: lastDays(5)[i], distance, destination: destinations[i] }));
const chartConfig = {
  distance: { label: "Distance (km)", color: "var(--chart-1)" },
  hollins: { label: "Hollins" },
  marsh: { label: "Marsh" },
  willow: { label: "Willow" },
  orchard: { label: "Orchard" },
  fern: { label: "Fern" },
} satisfies ChartConfig;

export function ChartLineLabelCustom() {
  return (
    <Card data-specimen="line-label-custom">
      <CardHeader>
        <ChartName name="chart-line-label-custom" />
        <CardTitle>Daily delivery distance</CardTitle>
        <CardDescription>Fernbrook Greenhouse, kilometres per return journey, 5 to 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Daily delivery distance. Fernbrook Greenhouse, kilometres per return journey, 5 to 9 November 2026."
        >
          <LineChart accessibilityLayer data={chartData} margin={{ top: 30, left: 0, right: 36 }}>
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
              dataKey="distance"
              type="monotone"
              stroke="var(--color-distance)"
              strokeWidth={2}
              dot={{ fill: "var(--color-distance)", r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                dataKey="destination"
                formatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={chartData.at(-2)!.distance} to={chartData.at(-1)!.distance} period="on the previous day" />
        <p className="text-muted-foreground">One delivery journey per day. Labels identify the destination.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="date"
          labelHeader="Day"
          keys={["distance"]}
          formatLabel={(value, row) =>
            `${longDate(value)} · ${chartConfig[row.destination as keyof typeof chartConfig]?.label}`
          }
          caption="Daily delivery distance. Fernbrook Greenhouse, kilometres per return journey, 5 to 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
