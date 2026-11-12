import { ChartPieInteractive } from "../../charts/chart-pie-interactive";
import { ChartPieSimple } from "../../charts/chart-pie-simple";
import { ChartPieSeparatorNone } from "../../charts/chart-pie-separator-none";
import { ChartPieLabel } from "../../charts/chart-pie-label";
import { ChartPieLabelCustom } from "../../charts/chart-pie-label-custom";
import { ChartPieLabelList } from "../../charts/chart-pie-label-list";
import { ChartPieLegend } from "../../charts/chart-pie-legend";
import { ChartPieDonut } from "../../charts/chart-pie-donut";
import { ChartPieDonutActive } from "../../charts/chart-pie-donut-active";
import { ChartPieDonutText } from "../../charts/chart-pie-donut-text";
import { ChartPieStacked } from "../../charts/chart-pie-stacked";

export default function PieCharts() {
  return (
    <>
      <ChartPieInteractive />
      <ChartPieSimple />
      <ChartPieSeparatorNone />
      <ChartPieLabel />
      <ChartPieLabelCustom />
      <ChartPieLabelList />
      <ChartPieLegend />
      <ChartPieDonut />
      <ChartPieDonutActive />
      <ChartPieDonutText />
      <ChartPieStacked />
    </>
  );
}
