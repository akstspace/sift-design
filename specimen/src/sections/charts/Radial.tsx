import { ChartSections, type ChartSection } from "./ChartSections";
import { ChartRadialText } from "../../charts/chart-radial-text";
import { ChartRadialShape } from "../../charts/chart-radial-shape";
import { ChartRadialStacked } from "../../charts/chart-radial-stacked";
import { ChartRadialSimple } from "../../charts/chart-radial-simple";
import { ChartRadialLabel } from "../../charts/chart-radial-label";
import { ChartRadialGrid } from "../../charts/chart-radial-grid";

const sections: ChartSection[] = [
  {
    title: "Progress",
    intro: "One value against its goal, with the total in the middle.",
    charts: [ChartRadialText, ChartRadialShape, ChartRadialStacked],
  },
  {
    title: "Several values",
    intro: "A few values, each on its own ring.",
    charts: [ChartRadialSimple, ChartRadialLabel, ChartRadialGrid],
  },
];

export default function RadialCharts() {
  return <ChartSections group="radial" sections={sections} />;
}
