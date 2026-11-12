import { ChartSections, type ChartSection } from "./ChartSections";
import { ChartTooltipDefault } from "../../charts/chart-tooltip-default";
import { ChartTooltipIndicatorLine } from "../../charts/chart-tooltip-indicator-line";
import { ChartTooltipIndicatorNone } from "../../charts/chart-tooltip-indicator-none";
import { ChartTooltipLabelCustom } from "../../charts/chart-tooltip-label-custom";
import { ChartTooltipLabelFormatter } from "../../charts/chart-tooltip-label-formatter";
import { ChartTooltipLabelNone } from "../../charts/chart-tooltip-label-none";
import { ChartTooltipFormatter } from "../../charts/chart-tooltip-formatter";
import { ChartTooltipIcons } from "../../charts/chart-tooltip-icons";
import { ChartTooltipAdvanced } from "../../charts/chart-tooltip-advanced";

const sections: ChartSection[] = [
  {
    title: "Indicators",
    intro: "A dot, a line, or no mark beside each value.",
    charts: [ChartTooltipDefault, ChartTooltipIndicatorLine, ChartTooltipIndicatorNone],
  },
  {
    title: "Labels",
    intro: "A custom label, a formatted date, or no label at all.",
    charts: [ChartTooltipLabelCustom, ChartTooltipLabelFormatter, ChartTooltipLabelNone],
  },
  {
    title: "Values",
    intro: "Units after each value, icons for each series, and a total row.",
    charts: [ChartTooltipFormatter, ChartTooltipIcons, ChartTooltipAdvanced],
  },
];

export default function TooltipCharts() {
  return <ChartSections group="tooltip" sections={sections} />;
}
