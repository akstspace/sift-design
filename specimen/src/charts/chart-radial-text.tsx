import { IconArrowBackUp, IconPackage } from "@tabler/icons-react";
import * as React from "react";
import { Label, PolarAngleAxis, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Button } from "@sift-design/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sift-design/ui/card";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { ChartName, RollingNumber, Trend } from "./shared";

export const description = "A radial chart with text";
const goal = 6;
const chartConfig = {
  packed: { label: "Crates packed", color: "var(--chart-1)" },
  goal: { label: "Crate goal" },
} satisfies ChartConfig;

// Keep the label component identity stable so its number can roll between updates.
function CrateCenter({ packed, viewBox }: { packed: number; viewBox?: React.ComponentProps<typeof Label>["viewBox"] }) {
  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
  return (
    <foreignObject x={Number(viewBox.cx) - 75} y={Number(viewBox.cy) - 36} width={150} height={72}>
      <div className="flex h-full flex-col items-center justify-center gap-1 text-foreground" aria-hidden>
        <RollingNumber value={packed} className="text-[30px] font-semibold leading-9" />
        <span className="text-xs text-muted-foreground">of 6 crates</span>
      </div>
    </foreignObject>
  );
}

export function ChartRadialText() {
  const [packed, setPacked] = React.useState(4);
  const chartData = [{ market: "Saturday market", packed, goal, fill: "var(--color-packed)" }];
  return (
    <Card data-specimen="radial-text">
      <CardHeader>
        <ChartName name="chart-radial-text" />
        <CardTitle>Market crates packed</CardTitle>
        <CardDescription>Saturday market, crates out of 6, 7 November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          role="group"
          config={chartConfig}
          className="mx-auto aspect-square h-[250px] max-w-full"
          aria-label={`Market crates packed, ${packed} of 6 crates, 7 November 2026`}
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={-270}
            innerRadius={82}
            outerRadius={96}
            barSize={12}
            accessibilityLayer
          >
            <PolarAngleAxis type="number" domain={[0, goal]} tick={false} axisLine={false} />
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              polarRadius={[96, 82]}
              className="first:fill-subtle last:fill-card"
            />
            <RadialBar dataKey="packed" background cornerRadius={4} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label content={<CrateCenter packed={packed} />} />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
        <div className="flex h-9 justify-center">
          <Button
            variant="outline"
            size="sm"
            data-crate-control
            onClick={() => setPacked((value) => (value === 4 ? 5 : 4))}
          >
            {packed === 4 ? <IconPackage aria-hidden /> : <IconArrowBackUp aria-hidden />}
            {packed === 4 ? "Pack one crate" : "Undo last crate"}
          </Button>
        </div>
        <span className="sr-only" role="status">
          {packed} of {goal} crates packed.
        </span>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Trend from={3} to={packed} period="since the morning check" />
        <p className="text-muted-foreground">The full track holds 6 crates. Packing is not complete.</p>
        <ChartTable
          data={chartData}
          config={chartConfig}
          labelKey="market"
          labelHeader="Market"
          caption="Saturday market crates packed, crates out of 6, 7 November 2026. Illustrative data."
        />
      </CardFooter>
    </Card>
  );
}
