import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend } from "./shared";

export const description = "A mixed bar chart";
const chartData = [
  { category: "herbs", plants: 275, fill: "var(--color-herbs)" },
  { category: "bedding", plants: 204, fill: "var(--color-bedding)" },
  { category: "perennials", plants: 186, fill: "var(--color-perennials)" },
  { category: "seedlings", plants: 172, fill: "var(--color-seedlings)" },
  { category: "succulents", plants: 96, fill: "var(--color-succulents)" },
];
const octoberTotal = 860;
const chartConfig = {
  plants: { label: "Plants" },
  herbs: { label: "Herbs", color: "var(--chart-1)" },
  bedding: { label: "Bedding", color: "var(--chart-2)" },
  perennials: { label: "Perennials", color: "var(--chart-3)" },
  seedlings: { label: "Seedlings", color: "var(--chart-4)" },
  succulents: { label: "Succulents", color: "var(--chart-5)" },
} satisfies ChartConfig;
export function ChartBarMixed() {
  return (
    <Card data-specimen="bar-mixed">
      <CardHeader>
        <ChartName name="chart-bar-mixed" />
        <CardTitle>Plants sold by category</CardTitle>
        <CardDescription>Retail benches, plants, November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="region"
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
          aria-label="Plants sold by category, retail benches, plants, November 2026"
        >
          <BarChart accessibilityLayer data={chartData} layout="vertical">
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              axisLine={false}
              width={84}
              tickMargin={8}
              tickFormatter={(value: string) => chartConfig[value as keyof typeof chartConfig]?.label ?? value}
            />
            <XAxis dataKey="plants" type="number" domain={[0, "auto"]} hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="plants" maxBarSize={22} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={octoberTotal} to={chartData.reduce((sum, row) => sum + row.plants, 0)} period="on October" />
        <p className="text-muted-foreground">November sales across five categories. October total: 860 plants.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="category"
          labelHeader="Category"
          formatValue={(value) => Number(value).toLocaleString("en-GB")}
          caption="Plants sold by category, retail benches, plants, November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
