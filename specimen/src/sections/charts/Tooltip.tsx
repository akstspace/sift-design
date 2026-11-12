import { ChartTooltipDefault } from "../../charts/chart-tooltip-default";
import { ChartTooltipIndicatorLine } from "../../charts/chart-tooltip-indicator-line";
import { ChartTooltipIndicatorNone } from "../../charts/chart-tooltip-indicator-none";
import { ChartTooltipLabelCustom } from "../../charts/chart-tooltip-label-custom";
import { ChartTooltipLabelFormatter } from "../../charts/chart-tooltip-label-formatter";
import { ChartTooltipLabelNone } from "../../charts/chart-tooltip-label-none";
import { ChartTooltipFormatter } from "../../charts/chart-tooltip-formatter";
import { ChartTooltipIcons } from "../../charts/chart-tooltip-icons";
import { ChartTooltipAdvanced } from "../../charts/chart-tooltip-advanced";

export default function TooltipCharts() {
  return (
    <>
      <ChartTooltipDefault />
      <ChartTooltipIndicatorLine />
      <ChartTooltipIndicatorNone />
      <ChartTooltipLabelCustom />
      <ChartTooltipLabelFormatter />
      <ChartTooltipLabelNone />
      <ChartTooltipFormatter />
      <ChartTooltipIcons />
      <ChartTooltipAdvanced />
    </>
  );
}
