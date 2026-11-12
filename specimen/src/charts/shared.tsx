// Shared helpers for the chart examples: fictional Fernbrook Greenhouse data,
// an honest trend line for card footers, and a number that rolls to its new value.
import * as React from "react";
import { animate, useMotionValue, useReducedMotion, useTransform, motion } from "motion/react";
import { IconTrendingDown, IconTrendingUp, IconMinus } from "@tabler/icons-react";
import { spring } from "@sift-design/tokens/motion";

/** A seeded random source, so the illustrative data is the same on every load. */
export function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** The six months that end with the example's current month, November 2026. */
export const months = ["June", "July", "August", "September", "October", "November"] as const;

/** Days that end on Monday 9 November 2026, the last full day in the examples. */
export function lastDays(count: number) {
  const end = Date.UTC(2026, 10, 9);
  return Array.from({ length: count }, (_, i) => new Date(end - (count - 1 - i) * 86400000).toISOString().slice(0, 10));
}

const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const longDayFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
/** The sum of one field across the rows, formatted for en-GB: "1,234". */
export const sumOf = (rows: Record<string, unknown>[], key: string) =>
  rows.reduce((sum, row) => sum + Number(row[key]), 0).toLocaleString("en-GB");

/** The label of the row with the largest value of one field, such as the busiest month. */
export const peakOf = (rows: Record<string, unknown>[], key: string, labelKey = "month") =>
  String(rows.reduce((best, row) => (Number(row[key]) > Number(best[key]) ? row : best))[labelKey]);

/** The largest part of a whole and its share, for a pie footer: { name, percent }. */
export function largestShare(rows: Record<string, unknown>[], key = "value", nameKey = "category") {
  const sum = rows.reduce((total, row) => total + Number(row[key]), 0);
  const top = rows.reduce((best, row) => (Number(row[key]) > Number(best[key]) ? row : best));
  return { name: String(top[nameKey]), percent: Math.round((Number(top[key]) / sum) * 100) };
}

/** The mean of every numeric field across the rows: a baseline for the trend line. */
export function meanRow(rows: Record<string, unknown>[]) {
  const mean: Record<string, number> = {};
  for (const key of Object.keys(rows[0] ?? {}))
    if (typeof rows[0][key] === "number")
      mean[key] = rows.reduce((sum, row) => sum + Number(row[key]), 0) / rows.length;
  return mean;
}

/** "9 Nov" */
export const shortDate = (iso: unknown) => dayFormat.format(new Date(String(iso)));
/** "Mon 9 Nov" */
export const longDate = (iso: unknown) => longDayFormat.format(new Date(String(iso)));

/**
 * The change from the previous value to the last one, said plainly. It is computed
 * from the data, so the footer never claims a trend the chart does not show.
 */
export function Trend({ from, to, period, unit = "" }: { from: number; to: number; period: string; unit?: string }) {
  const change = from === 0 ? 0 : ((to - from) / from) * 100;
  const rounded = Math.abs(change).toFixed(1);
  const Icon = change > 0.05 ? IconTrendingUp : change < -0.05 ? IconTrendingDown : IconMinus;
  const words = change > 0.05 ? "Up" : change < -0.05 ? "Down" : "No change";
  return (
    <div className="flex items-center gap-1.5 leading-none font-medium">
      {words}
      {words !== "No change" && (
        <>
          {" "}
          <span className="font-mono text-[12.5px] tabular-nums">{rounded}%</span>
        </>
      )}{" "}
      {period}
      {unit}
      <Icon className="size-4 text-muted-foreground" aria-hidden />
    </div>
  );
}

/**
 * A number that rolls to its new value on spring.smooth when the data changes, so the
 * reader sees that it changed and by how much. It renders the final value at once for
 * assistive technology and under reduced motion.
 */
export function RollingNumber({ value, className }: { value: number; className?: string }) {
  const reduced = !!useReducedMotion();
  const motionValue = useMotionValue(value);
  const text = useTransform(motionValue, (v) => Math.round(v).toLocaleString("en-GB"));
  React.useEffect(() => {
    if (reduced) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, spring.smooth);
    return () => controls.stop();
  }, [value, reduced, motionValue]);
  return (
    <span className={className}>
      <motion.span aria-hidden className="font-mono tabular-nums">
        {text}
      </motion.span>
      <span className="sr-only">{value.toLocaleString("en-GB")}</span>
    </span>
  );
}

/** The example's file name, so a reader can find and copy it: "chart-area-stacked". */
export function ChartName({ name }: { name: string }) {
  return <p className="font-mono text-[12px] leading-none text-muted-foreground">{name}</p>;
}
