import { ChartRadialSimple } from "../../charts/chart-radial-simple";
import { ChartRadialLabel } from "../../charts/chart-radial-label";
import { ChartRadialGrid } from "../../charts/chart-radial-grid";
import { ChartRadialText } from "../../charts/chart-radial-text";
import { ChartRadialShape } from "../../charts/chart-radial-shape";
import { ChartRadialStacked } from "../../charts/chart-radial-stacked";

export default function RadialCharts() {
  return (
    <>
      <ChartRadialSimple />
      <ChartRadialLabel />
      <ChartRadialGrid />
      <ChartRadialText />
      <ChartRadialShape />
      <ChartRadialStacked />
    </>
  );
}
