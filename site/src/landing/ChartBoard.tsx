import { useMemo, useState, type ComponentProps, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { spring } from "@sift-design/tokens/motion";
import { IconArrowRight } from "@tabler/icons-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  Rectangle,
  type RectangleProps,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTable, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@sift-design/ui/chart";
import { RollingNumber, seeded } from "../../../specimen/src/charts/shared";
import { at } from "../base";
import { Reveal } from "./Reveal";

// Illustrative: plants sold each week at the fictional Fernbrook Greenhouse, by
// category, from the week of 1 June to the week of 2 November 2026. Bedding plants
// sell in early summer, herbs through midsummer, perennials for autumn planting,
// and succulents as November gifts.
const categories = ["bedding", "herbs", "perennials", "succulents"] as const;
type Category = (typeof categories)[number];

const config = {
  bedding: { label: "Bedding", color: "var(--chart-1)" },
  herbs: { label: "Herbs", color: "var(--chart-2)" },
  perennials: { label: "Perennials", color: "var(--chart-3)" },
  succulents: { label: "Succulents", color: "var(--chart-4)" },
} satisfies ChartConfig;

const WEEKS = 23;
const weekFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const longWeekFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
const bell = (t: number, at: number, width: number) => Math.exp(-(((t - at) / width) ** 2));
const random = seeded(23);
const weekly = Array.from({ length: WEEKS }, (_, index) => {
  const t = index / (WEEKS - 1);
  const noise = () => (random() - 0.5) * 18;
  return {
    week: new Date(Date.UTC(2026, 5, 1 + index * 7)).toISOString().slice(0, 10),
    bedding: Math.round(30 + 250 * bell(t, 0.1, 0.3) + noise()),
    herbs: Math.round(70 + 90 * bell(t, 0.36, 0.3) + noise()),
    perennials: Math.round(35 + 170 * bell(t, 0.72, 0.17) + noise()),
    succulents: Math.round(28 + 26 * t + 80 * bell(t, 1, 0.1) + noise()),
  };
});
const season = Object.fromEntries(
  categories.map((key) => [key, weekly.reduce((sum, row) => sum + row[key], 0)]),
) as Record<Category, number>;
// The share of each category's plants sold on each day of the week. The Saturday
// market sells most bedding and herbs; florists order perennials on weekdays.
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const weights: Record<Category, number[]> = {
  bedding: [9, 9, 10, 11, 14, 33, 14],
  herbs: [10, 10, 11, 12, 14, 29, 14],
  perennials: [17, 18, 17, 16, 14, 12, 6],
  succulents: [11, 11, 12, 13, 16, 23, 14],
};
const byDay = days.map((day, index) => ({
  day,
  ...Object.fromEntries(categories.map((key) => [key, Math.round((season[key] * weights[key][index]) / 100)])),
})) as ({ day: string } & Record<Category, number>)[];
const GOAL = 10_000;
const listFormat = new Intl.ListFormat("en-GB", { type: "conjunction" });
/** A category that is turned off drops to zero, so its marks drain away instead of vanishing. */
const onlyShown = <T extends Record<Category, number>>(row: T, shown: Record<Category, boolean>) => ({
  ...row,
  ...Object.fromEntries(categories.map((key) => [key, shown[key] ? row[key] : 0])),
});
// The axes keep the scale of all four categories, so a category that is turned off
// drains out of the stack and the rest stay where they were.
const weekMax = Math.ceil(Math.max(...weekly.map((row) => categories.reduce((s, k) => s + row[k], 0))) / 100) * 100;
const dayMax = Math.ceil(Math.max(...byDay.map((row) => categories.reduce((s, k) => s + row[k], 0))) / 500) * 500;

function Toggle({
  id,
  on,
  only,
  onToggle,
  onPoint,
}: {
  id: Category;
  on: boolean;
  only: boolean;
  onToggle: () => void;
  onPoint: (key: Category | null) => void;
}) {
  const reduced = useReducedMotion();
  return (
    <button
      type="button"
      className="board-toggle"
      aria-pressed={on}
      disabled={only}
      title={only ? "Keep at least one category" : undefined}
      onClick={onToggle}
      onPointerEnter={() => onPoint(id)}
      onPointerLeave={() => onPoint(null)}
      onFocus={() => onPoint(id)}
      onBlur={() => onPoint(null)}
    >
      <span className="board-swatch" style={{ color: `var(--color-${id})` }} aria-hidden>
        <motion.span
          initial={false}
          animate={{ scale: on ? 1 : 0, opacity: on ? 1 : 0 }}
          transition={reduced ? { duration: 0.08 } : spring.snappy}
        />
      </span>
      {config[id].label}
      <span className="board-toggle-total">{season[id].toLocaleString("en-GB")}</span>
    </button>
  );
}

function Tile({ name, note, children }: { name: string; note: string; children: ReactNode }) {
  return (
    <div className="board-tile">
      <div className="sheet-label">
        <code>{name}</code>
        <span>{note}</span>
      </div>
      {children}
    </div>
  );
}

export function ChartBoard() {
  const [shown, setShown] = useState<Record<Category, boolean>>({
    bedding: true,
    herbs: true,
    perennials: true,
    succulents: true,
  });
  // The category a reader points at. The others fade in every chart, so one category
  // can be followed across the season, the share, and the week.
  const [focus, setFocus] = useState<Category | null>(null);
  const visible = categories.filter((key) => shown[key]);
  // New data only when a category changes, so pointing at a category replays nothing.
  const weeks = useMemo(() => weekly.map((row) => onlyShown(row, shown)), [shown]);
  const weekdays = useMemo(() => byDay.map((row) => onlyShown(row, shown)), [shown]);
  const shares = useMemo(
    () =>
      categories.map((key) => ({
        category: key,
        plants: shown[key] ? season[key] : 0,
        fill: `var(--color-${key})`,
        className: `board-series board-${key}`,
      })),
    [shown],
  );
  const total = visible.reduce((sum, key) => sum + season[key], 0);
  const top = visible.at(-1);
  const scope =
    visible.length === categories.length
      ? "all four categories"
      : listFormat.format(visible.map((key) => config[key].label.toLowerCase()));
  return (
    <section className="landing-charts" id="charts" aria-labelledby="charts-heading">
      <div className="section-head">
        <Reveal as="h2" id="charts-heading">
          Charts that move with the data
        </Reveal>
        <Reveal delay={0.06}>
          <p className="section-lede">
            Seventy charts in seven types, from area to radial. Marks arrive once, then morph when the data changes.
            Every chart has a data table, so no value is only on hover.
          </p>
          <a className="landing-link" href={at("/charts")}>
            Browse all charts
            <IconArrowRight aria-hidden size={16} />
          </a>
        </Reveal>
      </div>
      <Reveal className="chart-board" y={28} focus={focus && shown[focus] ? focus : undefined}>
        <div className="board-head" data-chart="board" style={swatchVars}>
          <div className="board-title">
            <span>Fernbrook Greenhouse, June to November 2026</span>
            <h3>Plants sold each week</h3>
            <p>
              <RollingNumber value={total} className="board-total" /> plants from {scope}
            </p>
          </div>
          <div className="board-toggles" role="group" aria-label="Categories in all four charts">
            {categories.map((key) => (
              <Toggle
                key={key}
                id={key}
                on={shown[key]}
                only={shown[key] && visible.length === 1}
                onToggle={() => setShown((now) => ({ ...now, [key]: !now[key] }))}
                onPoint={setFocus}
              />
            ))}
          </div>
        </div>
        <div className="board-main">
          <ChartContainer
            config={config}
            className="aspect-auto h-[clamp(220px,28vw,340px)] w-full"
            aria-label={`Plants sold each week from June to November 2026, ${scope}, stacked`}
          >
            <AreaChart data={weeks} accessibilityLayer margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={40}
                tickFormatter={(value) => weekFormat.format(new Date(value))}
              />
              <YAxis
                domain={[0, weekMax]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={40}
                ticks={[0, weekMax / 2, weekMax]}
                allowDataOverflow
              />
              <ChartTooltip
                cursor
                content={
                  <ShownTooltip
                    shown={shown}
                    indicator="line"
                    labelFormatter={(value) => `Week of ${longWeekFormat.format(new Date(String(value)))}`}
                  />
                }
              />
              {categories.map((key) => (
                <Area
                  key={key}
                  dataKey={key}
                  type="monotone"
                  stackId="season"
                  fill={`var(--color-${key})`}
                  fillOpacity={0.22}
                  stroke={`var(--color-${key})`}
                  strokeWidth={2}
                  strokeOpacity={shown[key] ? 1 : 0}
                  className={`board-series board-${key}`}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        </div>
        <div className="board-tiles">
          <Tile name="chart-pie-donut-text" note="Sectors sweep to the new shares">
            <div className="board-donut">
              <ChartContainer
                config={config}
                className="aspect-square h-[200px]"
                aria-label={`Share of plants sold from June to November 2026, ${scope}`}
              >
                <PieChart accessibilityLayer>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="category" />} />
                  <Pie
                    data={shares}
                    dataKey="plants"
                    nameKey="category"
                    innerRadius={62}
                    outerRadius={92}
                    startAngle={90}
                    endAngle={-270}
                  />
                </PieChart>
              </ChartContainer>
              <p className="board-center" aria-hidden>
                <RollingNumber value={total} />
                <span>plants</span>
              </p>
            </div>
          </Tile>
          <Tile name="chart-bar-stacked" note="Segments drain out of the stack">
            <ChartContainer
              config={config}
              className="aspect-auto h-[200px] w-full"
              aria-label={`Plants sold by day of the week, June to November 2026, ${scope}, stacked`}
            >
              <BarChart data={weekdays} accessibilityLayer margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis domain={[0, dayMax]} hide allowDataOverflow />
                <ChartTooltip
                  content={
                    <ShownTooltip
                      shown={shown}
                      labelFormatter={(value) => dayNames[days.indexOf(String(value))] ?? String(value)}
                    />
                  }
                />
                {categories.map((key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="days"
                    fill={`var(--color-${key})`}
                    stroke="var(--surface)"
                    strokeWidth={shown[key] ? 2 : 0}
                    radius={key === top ? [4, 4, 0, 0] : 0}
                    className={`board-series board-${key}`}
                    shape={drainingBar}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </Tile>
          <Tile name="chart-radial-text" note="The ring fills toward the goal">
            <div className="board-donut">
              <ChartContainer
                config={config}
                className="aspect-square h-[200px]"
                aria-label={`Season goal of ${GOAL.toLocaleString("en-GB")} plants: ${Math.round((total / GOAL) * 100)}% sold by ${scope}`}
              >
                <RadialBarChart
                  data={[{ name: "sold", plants: total, fill: "var(--color-bedding)" }]}
                  innerRadius={74}
                  outerRadius={96}
                  startAngle={90}
                  endAngle={-270}
                  barSize={16}
                >
                  <PolarAngleAxis type="number" domain={[0, GOAL]} tick={false} axisLine={false} />
                  <RadialBar dataKey="plants" background cornerRadius={8} />
                </RadialBarChart>
              </ChartContainer>
              <p className="board-center" aria-hidden>
                <RollingNumber value={Math.round((total / GOAL) * 100)} />
                <span>% of the {GOAL.toLocaleString("en-GB")} goal</span>
              </p>
            </div>
          </Tile>
        </div>
        <div className="board-foot">
          <ChartTable
            data={weeks}
            config={config}
            labelKey="week"
            labelHeader="Week of"
            keys={[...visible]}
            formatLabel={(value) => longWeekFormat.format(new Date(String(value)))}
            caption={`Plants sold each week, June to November 2026, ${scope}. Illustrative data.`}
          />
          <p>
            Fernbrook Greenhouse is fictional. Point at a category to pick it out. Turn it off, and all four charts
            follow on the same spring.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/** The tooltip lists only the categories that are turned on. */
function ShownTooltip({
  shown,
  payload,
  ...props
}: ComponentProps<typeof ChartTooltipContent> & { shown: Record<Category, boolean> }) {
  return (
    <ChartTooltipContent {...props} payload={payload?.filter((item) => shown[item.dataKey as Category] !== false)} />
  );
}

/** Recharts drops a bar whose new height is zero, so it could not drain away. With its
 * own shape, the bar stays and shrinks to the baseline on the kit spring. */
const drainingBar = (props: RectangleProps) => <Rectangle {...props} />;

/** The category swatches outside the charts use the same colors as the charts. */
const swatchVars = Object.fromEntries(categories.map((key) => [`--color-${key}`, config[key].color])) as CSSProperties;
