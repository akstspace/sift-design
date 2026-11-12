import { ChartBarInteractive } from "../../charts/chart-bar-interactive";
import { ChartBarDefault } from "../../charts/chart-bar-default";
import { ChartBarHorizontal } from "../../charts/chart-bar-horizontal";
import { ChartBarMultiple } from "../../charts/chart-bar-multiple";
import { ChartBarStacked } from "../../charts/chart-bar-stacked";
import { ChartBarLabel } from "../../charts/chart-bar-label";
import { ChartBarLabelCustom } from "../../charts/chart-bar-label-custom";
import { ChartBarMixed } from "../../charts/chart-bar-mixed";
import { ChartBarActive } from "../../charts/chart-bar-active";
import { ChartBarNegative } from "../../charts/chart-bar-negative";

export default function BarCharts() {
  return (
    <>
      <ChartBarInteractive />
      <ChartBarDefault />
      <ChartBarHorizontal />
      <ChartBarMultiple />
      <ChartBarStacked />
      <ChartBarLabel />
      <ChartBarLabelCustom />
      <ChartBarMixed />
      <ChartBarActive />
      <ChartBarNegative />
    </>
  );
}
