import { ChartRadarDefault } from "../../charts/chart-radar-default";
import { ChartRadarDots } from "../../charts/chart-radar-dots";
import { ChartRadarMultiple } from "../../charts/chart-radar-multiple";
import { ChartRadarLinesOnly } from "../../charts/chart-radar-lines-only";
import { ChartRadarLabelCustom } from "../../charts/chart-radar-label-custom";
import { ChartRadarGridCustom } from "../../charts/chart-radar-grid-custom";
import { ChartRadarGridNone } from "../../charts/chart-radar-grid-none";
import { ChartRadarGridCircle } from "../../charts/chart-radar-grid-circle";
import { ChartRadarGridCircleNoLines } from "../../charts/chart-radar-grid-circle-no-lines";
import { ChartRadarGridCircleFill } from "../../charts/chart-radar-grid-circle-fill";
import { ChartRadarGridFill } from "../../charts/chart-radar-grid-fill";
import { ChartRadarIcons } from "../../charts/chart-radar-icons";
import { ChartRadarLegend } from "../../charts/chart-radar-legend";
import { ChartRadarRadius } from "../../charts/chart-radar-radius";

export default function RadarCharts() {
  return (
    <>
      <ChartRadarDefault />
      <ChartRadarDots />
      <ChartRadarMultiple />
      <ChartRadarLinesOnly />
      <ChartRadarLabelCustom />
      <ChartRadarGridCustom />
      <ChartRadarGridNone />
      <ChartRadarGridCircle />
      <ChartRadarGridCircleNoLines />
      <ChartRadarGridCircleFill />
      <ChartRadarGridFill />
      <ChartRadarIcons />
      <ChartRadarLegend />
      <ChartRadarRadius />
    </>
  );
}
