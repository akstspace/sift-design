import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { IconGitCommit } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend, months } from "./shared";

export const description = "A line chart with custom dots";

const values = [42, 48, 46, 54, 58, 62];
const chartData = values.map((inspections, i) => ({ month: months[i], inspections }));
const chartConfig = {
  inspections: { label: "Inspections", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ChartLineDotsCustom() {
  return (
    <Card data-specimen="line-dots-custom">
      <CardHeader>
        <ChartName name="chart-line-dots-custom" />
        <CardTitle>Bench inspections completed</CardTitle>
        <CardDescription>Fernbrook Greenhouse, inspections per month, June to November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label="Bench inspections completed. Fernbrook Greenhouse, inspections per month, June to November 2026."
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
              dataKey="inspections"
              type="monotone"
              stroke="var(--color-inspections)"
              strokeWidth={2}
              dot={({ cx, cy, payload }) =>
                cx == null || cy == null ? null : (
                  <IconGitCommit
                    key={payload.month}
                    x={cx - 12}
                    y={cy - 12}
                    width={24}
                    height={24}
                    fill="var(--surface)"
                    stroke="var(--color-inspections)"
                    aria-hidden
                  />
                )
              }
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={chartData.at(-2)!.inspections} to={chartData.at(-1)!.inspections} period="on October" />
        <p className="text-muted-foreground">Each icon marks a monthly inspection total.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="month"
          labelHeader="Month"
          keys={["inspections"]}
          caption="Bench inspections completed. Fernbrook Greenhouse, inspections per month, June to November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
