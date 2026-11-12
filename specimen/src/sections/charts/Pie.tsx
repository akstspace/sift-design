import { ChartSections, type ChartSection } from "./ChartSections";
import { ChartPieInteractive } from "../../charts/chart-pie-interactive";
import { ChartPieSimple } from "../../charts/chart-pie-simple";
import { ChartPieSeparatorNone } from "../../charts/chart-pie-separator-none";
import { ChartPieStacked } from "../../charts/chart-pie-stacked";
import { ChartPieLabel } from "../../charts/chart-pie-label";
import { ChartPieLabelCustom } from "../../charts/chart-pie-label-custom";
import { ChartPieLabelList } from "../../charts/chart-pie-label-list";
import { ChartPieLegend } from "../../charts/chart-pie-legend";
import { ChartPieDonut } from "../../charts/chart-pie-donut";
import { ChartPieDonutActive } from "../../charts/chart-pie-donut-active";
import { ChartPieDonutText } from "../../charts/chart-pie-donut-text";

const sections: ChartSection[] = [
  {
    title: "Interactive",
    intro: "Choose a month or a category. The selected sector grows out on a spring.",
    charts: [ChartPieInteractive],
  },
  {
    title: "Pies",
    intro: "One whole split into a few parts, with and without gaps, and two rings.",
    charts: [ChartPieSimple, ChartPieSeparatorNone, ChartPieStacked],
  },
  {
    title: "Labels and legends",
    intro: "Names and values on the sectors, beside them, or in a legend.",
    charts: [ChartPieLabel, ChartPieLabelCustom, ChartPieLabelList, ChartPieLegend],
  },
  {
    title: "Donuts",
    intro: "A ring with room in the middle for a total or a highlighted part.",
    charts: [ChartPieDonut, ChartPieDonutActive, ChartPieDonutText],
  },
];

export default function PieCharts() {
  return <ChartSections group="pie" sections={sections} />;
}
