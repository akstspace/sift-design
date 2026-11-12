import { ChartSections, type ChartSection } from "./ChartSections";
import { ChartAreaInteractive } from "../../charts/chart-area-interactive";
import { ChartAreaDefault } from "../../charts/chart-area-default";
import { ChartAreaLinear } from "../../charts/chart-area-linear";
import { ChartAreaStep } from "../../charts/chart-area-step";
import { ChartAreaStacked } from "../../charts/chart-area-stacked";
import { ChartAreaStackedExpand } from "../../charts/chart-area-stacked-expand";
import { ChartAreaLegend } from "../../charts/chart-area-legend";
import { ChartAreaIcons } from "../../charts/chart-area-icons";
import { ChartAreaGradient } from "../../charts/chart-area-gradient";
import { ChartAreaAxes } from "../../charts/chart-area-axes";

const sections: ChartSection[] = [
  {
    title: "Interactive",
    intro: "Choose a time range. The areas morph to the new days, and the total rolls to its new value.",
    charts: [ChartAreaInteractive],
  },
  {
    title: "Curves",
    intro: "The same data with a smooth line, a straight line, and a stepped line.",
    charts: [ChartAreaDefault, ChartAreaLinear, ChartAreaStep],
  },
  {
    title: "Stacks",
    intro: "Areas stacked on each other show how the parts add up to the total or to 100%.",
    charts: [ChartAreaStacked, ChartAreaStackedExpand, ChartAreaLegend],
  },
  {
    title: "Details",
    intro: "Icons in the legend, a soft gradient fill, and two visible axes.",
    charts: [ChartAreaIcons, ChartAreaGradient, ChartAreaAxes],
  },
];

export default function AreaCharts() {
  return <ChartSections group="area" sections={sections} />;
}
