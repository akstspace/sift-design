import { CartesianGrid, Line, LineChart, XAxis, YAxis, LabelList } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend, months } from "./shared";

export const description = "A line chart with a label";

const values = [64, 72, 58, 84, 96, 108];
const chartData = values.map((trays, i) => ({ month: months[i], trays }));
const chartConfig = {
  trays: { label: "Trays", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ChartLineLabel() {
  return (
    <Card data-specimen="line-label">
      <CardHeader>
        <ChartName name="chart-line-label" />
        <CardTitle>Seed trays sown</CardTitle>
        <CardDescription>Propagation house, trays per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Seed trays sown. Propagation house, trays per month, June to November 2026."
        >
          <LineChart accessibilityLayer data={chartData} margin={{ top: 30, left: 0, right: 18 }}>
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
              dataKey="trays"
              type="monotone"
              stroke="var(--color-trays)"
              strokeWidth={2}
              dot={{ fill: "var(--color-trays)", r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            >
              <LabelList position="top" offset={12} className="fill-foreground font-mono" fontSize={12} />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={chartData.at(-2)!.trays} to={chartData.at(-1)!.trays} period="on October" />
        <p className="text-muted-foreground">Monthly sowing totals. Each point shows its exact tray count.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          keys={["trays"]}
          caption="Seed trays sown. Propagation house, trays per month, June to November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
