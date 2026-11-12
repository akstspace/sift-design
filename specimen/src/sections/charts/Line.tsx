import { ChartSections, type ChartSection } from "./ChartSections";
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

const sections: ChartSection[] = [
  {
    title: "Interactive",
    intro: "Choose a group of cuttings. The line morphs to its values, and the highlight moves to the button.",
    charts: [ChartLineInteractive],
  },
  {
    title: "Curves",
    intro: "The same data with a smooth line, a straight line, and a stepped line.",
    charts: [ChartLineDefault, ChartLineLinear, ChartLineStep],
  },
  {
    title: "Series and points",
    intro: "Two lines on one axis, and dots that mark each value.",
    charts: [ChartLineMultiple, ChartLineDots, ChartLineDotsCustom, ChartLineDotsColors],
  },
  {
    title: "Labels",
    intro: "Values and names written beside each point.",
    charts: [ChartLineLabel, ChartLineLabelCustom],
  },
];

export default function LineCharts() {
  return <ChartSections group="line" sections={sections} />;
}
