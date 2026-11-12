import { CartesianGrid, Line, LineChart, XAxis, YAxis, LabelList } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import {
  ChartContainer,
  ChartTable,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from "@sift-design/ui/chart";
import { ChartName, Trend, months } from "./shared";

export const description = "A multiple line chart";

const values = [12, 15, 18, 17, 20, 23];
const chartData = values.map((hollins, i) => ({ month: months[i], hollins, marsh: [7, 9, 8, 12, 14, 16][i] }));
const chartConfig = {
  hollins: { label: "Hollins Florist", color: "var(--chart-1)" },
  marsh: { label: "Marsh Lane Florist", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChartLineMultiple() {
  return (
    <Card data-specimen="line-multiple">
      <CardHeader>
        <ChartName name="chart-line-multiple" />
        <CardTitle>Florist orders fulfilled</CardTitle>
        <CardDescription>Fernbrook Greenhouse, orders per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Florist orders fulfilled. Fernbrook Greenhouse, orders per month, June to November 2026."
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
              dataKey="hollins"
              type="monotone"
              stroke="var(--color-hollins)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            >
              <LabelList
                position="top"
                offset={10}
                className="fill-foreground"
                fontSize={12}
                dataKey={(row) => (row.month === "November" ? "Hollins" : "")}
              />
            </Line>
            <Line
              dataKey="marsh"
              type="monotone"
              stroke="var(--color-marsh)"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
            >
              <LabelList
                position="top"
                offset={10}
                className="fill-foreground"
                fontSize={12}
                dataKey={(row) => (row.month === "November" ? "Marsh" : "")}
              />
            </Line>
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend
          from={chartData.at(-2)!.hollins + chartData.at(-2)!.marsh}
          to={chartData.at(-1)!.hollins + chartData.at(-1)!.marsh}
          period="on October"
        />
        <p className="text-muted-foreground">
          Marsh Lane Florist orders more than doubled, from {chartData[0].marsh} in June to {chartData.at(-1)!.marsh} in
          November.
        </p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          keys={["hollins", "marsh"]}
          caption="Florist orders fulfilled. Fernbrook Greenhouse, orders per month, June to November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
