import { LabelList, PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, Trend } from "./shared";

export const description = "A radial chart with a label";
const chartData = [
  { crop: "herbs", label: "Herbs", potted: 72, fill: "var(--color-herbs)" },
  { crop: "bedding", label: "Bedding", potted: 86, fill: "var(--color-bedding)" },
  { crop: "perennials", label: "Perennials", potted: 64, fill: "var(--color-perennials)" },
];
const chartConfig = {
  potted: { label: "Potted (%)" },
  herbs: { label: "Herbs", color: "var(--chart-1)" },
  bedding: { label: "Bedding", color: "var(--chart-2)" },
  perennials: { label: "Perennials", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function ChartRadialLabel() {
  const total = chartData.reduce((sum, row) => sum + row.potted, 0);
  return (
    <Card data-specimen="radial-label">
      <CardHeader>
        <ChartName name="chart-radial-label" />
        <CardTitle>Plants potted</CardTitle>
        <CardDescription>Potting shed, share of each crop batch, 9 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto aspect-square h-[250px] max-w-full"
          aria-label="Plants potted by crop, percent, 9 November 2026. Each full circle is 100 percent."
        >
          <RadialBarChart
            data={chartData}
            innerRadius={34}
            outerRadius={116}
            startAngle={90}
            endAngle={-270}
            barSize={16}
            accessibilityLayer
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="crop" />} />
            <RadialBar dataKey="potted" background cornerRadius={4}>
              <LabelList
                dataKey="label"
                position="insideStart"
                content={({ viewBox, value }) => {
                  if (!viewBox || !("cx" in viewBox) || !("outerRadius" in viewBox)) return null;
                  const x = Number(viewBox.cx) + 5;
                  const y = Number(viewBox.cy) - (Number(viewBox.innerRadius) + Number(viewBox.outerRadius)) / 2;
                  return (
                    <g>
                      <rect
                        x={x - 3}
                        y={y - 9}
                        width={String(value).length * 6.5 + 6}
                        height={18}
                        rx={3}
                        fill="var(--surface)"
                      />
                      <text x={x} y={y} dominantBaseline="central" fill="var(--ink)" fontSize={12}>
                        {value}
                      </text>
                    </g>
                  );
                }}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs" aria-label="Crop batches">
          {chartData.map((row) => (
            <li key={row.crop} className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-[2px]"
                style={{ background: chartConfig[row.crop as "herbs"].color }}
                aria-hidden
              />
              <span>{row.label}</span>
              <span className="font-mono">{row.potted}%</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={198} to={total} period="since 8 November" />
        <p className="text-muted-foreground">Each batch contains 100 plants. Rings run from 0 to 100%.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="crop"
          labelHeader="Crop"
          caption="Plants potted by crop, percent, 9 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
