import { ChartSections, type ChartSection } from "./ChartSections";
import { ChartRadarDefault } from "../../charts/chart-radar-default";
import { ChartRadarDots } from "../../charts/chart-radar-dots";
import { ChartRadarLinesOnly } from "../../charts/chart-radar-lines-only";
import { ChartRadarMultiple } from "../../charts/chart-radar-multiple";
import { ChartRadarLegend } from "../../charts/chart-radar-legend";
import { ChartRadarIcons } from "../../charts/chart-radar-icons";
import { ChartRadarGridCustom } from "../../charts/chart-radar-grid-custom";
import { ChartRadarGridNone } from "../../charts/chart-radar-grid-none";
import { ChartRadarGridCircle } from "../../charts/chart-radar-grid-circle";
import { ChartRadarGridCircleNoLines } from "../../charts/chart-radar-grid-circle-no-lines";
import { ChartRadarGridCircleFill } from "../../charts/chart-radar-grid-circle-fill";
import { ChartRadarGridFill } from "../../charts/chart-radar-grid-fill";
import { ChartRadarLabelCustom } from "../../charts/chart-radar-label-custom";
import { ChartRadarRadius } from "../../charts/chart-radar-radius";

const sections: ChartSection[] = [
  {
    title: "Shapes",
    intro: "One record across six measures: a filled shape, dots, or lines only.",
    charts: [ChartRadarDefault, ChartRadarDots, ChartRadarLinesOnly],
  },
  {
    title: "Several records",
    intro: "Two records on the same measures, with a legend or icons to name them.",
    charts: [ChartRadarMultiple, ChartRadarLegend, ChartRadarIcons],
  },
  {
    title: "Grids",
    intro: "Polygon and circle grids, with and without lines and fills.",
    charts: [
      ChartRadarGridCustom,
      ChartRadarGridNone,
      ChartRadarGridCircle,
      ChartRadarGridCircleNoLines,
      ChartRadarGridCircleFill,
      ChartRadarGridFill,
    ],
  },
  {
    title: "Labels and axes",
    intro: "Values written at each measure, and a scale on the radius.",
    charts: [ChartRadarLabelCustom, ChartRadarRadius],
  },
];

export default function RadarCharts() {
  return <ChartSections group="radar" sections={sections} />;
}
