import { ChartAreaInteractive } from "../../charts/chart-area-interactive";
import { ChartAreaDefault } from "../../charts/chart-area-default";
import { ChartAreaLinear } from "../../charts/chart-area-linear";
import { ChartAreaStep } from "../../charts/chart-area-step";
import { ChartAreaLegend } from "../../charts/chart-area-legend";
import { ChartAreaStacked } from "../../charts/chart-area-stacked";
import { ChartAreaStackedExpand } from "../../charts/chart-area-stacked-expand";
import { ChartAreaIcons } from "../../charts/chart-area-icons";
import { ChartAreaGradient } from "../../charts/chart-area-gradient";
import { ChartAreaAxes } from "../../charts/chart-area-axes";

export default function AreaCharts() {
  return (
    <>
      <ChartAreaInteractive />
      <ChartAreaDefault />
      <ChartAreaLinear />
      <ChartAreaStep />
      <ChartAreaLegend />
      <ChartAreaStacked />
      <ChartAreaStackedExpand />
      <ChartAreaIcons />
      <ChartAreaGradient />
      <ChartAreaAxes />
    </>
  );
}
