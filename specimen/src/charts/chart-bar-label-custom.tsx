import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, months, peakOf, sumOf, Trend } from "./shared";

export const description = "A bar chart with a custom label";
const chartData = months.map((month, index) => ({ month, plants: [168, 192, 180, 144, 156, 174][index] }));
const chartConfig = { plants: { label: "Plants", color: "var(--chart-1)" } } satisfies ChartConfig;
export function ChartBarLabelCustom() {
  return (
    <Card data-specimen="bar-label-custom">
      <CardHeader>
        <ChartName name="chart-bar-label-custom" />
        <CardTitle>Cuttings rooted</CardTitle>
        <CardDescription>Propagation house, plants per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
          aria-label="Cuttings rooted, propagation house, plants per month, June to November 2026"
        >
          <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ right: 36 }}>
            <CartesianGrid horizontal={false} />
            <YAxis dataKey="month" type="category" hide />
            <XAxis dataKey="plants" type="number" domain={[0, "auto"]} hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Bar dataKey="plants" fill="var(--color-plants)" fillOpacity={0.22} maxBarSize={24} radius={[0, 4, 4, 0]}>
              <LabelList
                dataKey="month"
                position="insideLeft"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: unknown) => String(value).slice(0, 3)}
              />
              <LabelList
                dataKey="plants"
                position="right"
                offset={8}
                className="fill-foreground font-mono"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={chartData[4].plants} to={chartData[5].plants} period="on October" />
        <p className="text-muted-foreground">
          {sumOf(chartData, "plants")} cuttings rooted in six months. {peakOf(chartData, "plants")} rooted the most.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          formatValue={(value) => Number(value).toLocaleString("en-GB")}
          caption="Cuttings rooted, propagation house, plants per month, June to November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
