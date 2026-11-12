import { ChartLineInteractive } from "../../charts/chart-line-interactive";
import { ChartLineDefault } from "../../charts/chart-line-default";
import { ChartLineLinear } from "../../charts/chart-line-linear";
import { ChartLineStep } from "../../charts/chart-line-step";
import { ChartLineMultiple } from "../../charts/chart-line-multiple";
import { ChartLineDots } from "../../charts/chart-line-dots";
import { ChartLineDotsCustom } from "../../charts/chart-line-dots-custom";
import { ChartLineDotsColors } from "../../charts/chart-line-dots-colors";
import { ChartLineLabel } from "../../charts/chart-line-label";
import { ChartLineLabelCustom } from "../../charts/chart-line-label-custom";

export default function LineCharts() {
  return (
    <>
      <ChartLineInteractive />
      <ChartLineDefault />
      <ChartLineLinear />
      <ChartLineStep />
      <ChartLineMultiple />
      <ChartLineDots />
      <ChartLineDotsCustom />
      <ChartLineDotsColors />
      <ChartLineLabel />
      <ChartLineLabelCustom />
    </>
  );
}
