import { ChartSections, type ChartSection } from "./ChartSections";
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

const sections: ChartSection[] = [
  {
    title: "Interactive",
    intro: "Choose a sales channel. The bars morph to its values, and the highlight moves to the button.",
    charts: [ChartBarInteractive],
  },
  {
    title: "Layouts",
    intro: "Vertical, horizontal, grouped, and stacked bars on a common baseline.",
    charts: [ChartBarDefault, ChartBarHorizontal, ChartBarMultiple, ChartBarStacked],
  },
  {
    title: "Labels",
    intro: "Values and names written on the bars, so the reader does not need the axis.",
    charts: [ChartBarLabel, ChartBarLabelCustom],
  },
  {
    title: "Emphasis",
    intro: "A color for each bar, one highlighted bar, and values below zero.",
    charts: [ChartBarMixed, ChartBarActive, ChartBarNegative],
  },
];

export default function BarCharts() {
  return <ChartSections group="bar" sections={sections} />;
}
