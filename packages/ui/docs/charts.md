# Charts

The kit has one chart component, `@sift-design/ui/chart`. It wraps [Recharts](https://recharts.org) and keeps the shadcn/ui chart API: `ChartContainer`, `ChartTooltip`, `ChartLegend`, and their content parts. Sift Design adds the shared spring, quiet chart chrome, and `ChartTable`, a data table for every chart.

The Charts page shows a Sift version of every [shadcn/ui chart block](https://ui.shadcn.com/charts): area, bar, line, pie, radar, radial, and tooltip examples. Each example is one copyable file in `specimen/src/charts/`, named after the upstream block. For example, `chart-area-stacked.tsx` ports `chart-area-stacked`. The untouched upstream blocks are in `packages/ui/upstream/shadcn-4.23.0-new-york/charts/`.

The example data is fictional. It describes the Fernbrook Greenhouse in the Larkspur sample app. Replace it with your own measures; do not copy the greenhouse data model. Read [Data visualization](../../../docs/data-visualization.md) before you choose a chart.

Every example imports `specimen/src/charts/shared.tsx`. It holds the seeded sample data helpers, the `Trend` footer line, `RollingNumber`, `ChartName`, and small helpers that compute totals, peaks, shares, and averages for the footers. Copy it with the example, or replace those parts with your own.

## Chart

**When:** use a chart when a comparison, a trend, or a share is clearer as a picture than as prose. Keep the values available in a table. Do not use a chart as decoration.

**Structure:** `ChartContainer config` names the series and sets one CSS variable per series (`--color-<key>`). Recharts draws the chart, the axes, and the marks inside it. `ChartTooltip` with `ChartTooltipContent` shows exact values on hover and focus. `ChartLegend` with `ChartLegendContent` names the series. `ChartTable` puts the same values in a semantic table behind a quiet "Show data" button.

**Props:**
- `ChartContainer`: `config` (`{ [key]: { label, color | theme, icon } }`), `className` (set a height, for example `aspect-auto h-[250px] w-full`), and `aria-label` (name the measure, the unit, and the period).
- `ChartTooltipContent`: `indicator` (`"dot"`, `"line"`, or `"dashed"`), `hideLabel`, `hideIndicator`, `labelFormatter`, `formatter`, `nameKey`, and `labelKey`.
- `ChartTable`: `data`, `config`, `labelKey`, `labelHeader`, `keys`, `caption`, `formatLabel`, `formatValue`, `toggle` (default `true`), and `defaultOpen`.
- `chartMotion(reduced)` and `useChartMotion()`: the animation props that the container gives to its marks. Spread them on a mark inside your own wrapper component, because the container only reaches its direct marks and their children.

**Category colors:** `--chart-1` to `--chart-8` are the categorical palette (`--cat-1` to `--cat-8`). Assign them to series in a fixed order, and keep each series' color when a filter hides another series. The palette is not a list of required categories, and eight colors are not a limit on the data. For more series, use filters, direct labels, small multiples, or a table. Do not cycle the colors. Text uses `--ink` and `--muted`, never a series color. Some fills are below 3:1 against the surface, so give each chart labels, a legend, and the table. Do not rely on color alone. Keep `--good`, `--warn`, and `--danger` for status.

**Legend order:** `ChartLegendContent` lists series in the order of the config keys, so the legend reads `--chart-1` first even when a stack draws the series in another order.

**Marks:** use 2px lines and `type="monotone"`. The `"natural"` curve overshoots and draws values that do not exist. Use a flat area fill of about 22% opacity under a 2px stroke. Give bars a 4px radius on the data end. Separate stacked segments and pie sectors with a 2px `var(--surface)` stroke. Pie sectors get this gap by default; set `stroke="none"` on the `Pie` to remove it. A radial track (`RadialBar background`) is `--subtle` by default; a fill set on `background` wins. Bars start at zero. Never use a second y-axis.

**Motion:**
- Marks arrive once, when the chart first renders, on `spring.smooth`. Recharts runs the animation with the same sampled curve as `--spring-smooth`, for **538ms**, with no delay. Bars grow from the baseline. Lines draw from the start. Areas open from the left. Pie and radial sectors sweep around. Radar shapes grow from the center.
- When the data changes, the marks morph to the new values on the same spring. A filter or a range switch therefore explains itself. Re-renders and hovers that do not change the data do not replay any animation.
- Dots, value labels, and pie labels fade in over **140ms** after their mark arrives.
- The tooltip enters on `spring.snappy` (**358ms**, from 97% scale and 2px lower). Then it glides between data points in **200ms** on the `settle` curve. The crosshair and the band cursor glide with it. The active dot grows from 30% scale on `spring.snappy`, with a 2px ring in the surface color.
- Marks that react to hover change opacity only, over **140ms**. When a switch gives a mark another series color, the fill and stroke cross-fade over **140ms** while the shape morphs.
- Nothing loops. A chart is still until the data or the pointer changes.

**Rendering:** `ChartContainer` renders its Recharts chart when its box comes within 200px of the viewport. After that, the chart stays rendered. A page with many charts therefore renders only the charts near the reader, and it does not stop responding while it loads. The card, the title, the `aria-label`, and the `ChartTable` render at once, so screen readers get all the content. The box keeps its size from `className`, so the page does not move when a chart renders. Before the page prints, every chart renders without animation.

**Reduced motion:** Recharts animation is off, so data changes apply at once. A new chart fades in over **140ms**. The tooltip fades in over **80ms** and moves at once. The active dot fades in without scale.

**Accessibility:** set `accessibilityLayer` on the chart, so the arrow keys move between data points and the tooltip follows. Give `ChartContainer` an `aria-label` that names the measure, the unit, and the period. Show a legend for two or more series. Add a `ChartTable` with a caption that names the measure, the unit, and the period. The table is also the fallback for print and forced colors. In forced colors, bars, sectors, areas, and radar shapes get a `CanvasText` outline.

**Changes from upstream:**
- Marks animate on the kit spring for 538ms with no delay. Upstream uses the Recharts default of 1,500ms ease, and a 400ms delay on pies.
- The tooltip glides and enters on springs. It uses the popover surface, the kit border, and `--shadow-float`.
- The grid, ticks, and legend use the muted text color and hairline colors.
- The chart renders when it comes near the viewport. Upstream renders every chart on mount.
- `ChartTable`, `chartMotion`, `useChartMotion`, `chartEase`, and `CHART_MOTION_MS` are new.
- `--chart-1` to `--chart-8` map onto the categorical palette.
- The legend follows the config order. Pie sectors have a surface gap by default. Grid styles apply only to the Recharts default stroke, so an explicit `stroke` wins.

```tsx
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTable,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@sift-design/ui/chart";

const config = {
  delivery: { label: "Delivery", color: "var(--chart-1)" },
  collection: { label: "Store collection", color: "var(--chart-2)" },
} satisfies ChartConfig;

<ChartContainer config={config} className="aspect-auto h-[240px] w-full" aria-label="Orders by fulfillment method, per month">
  <BarChart data={months} accessibilityLayer>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
    <Bar dataKey="delivery" fill="var(--color-delivery)" radius={4} />
    <Bar dataKey="collection" fill="var(--color-collection)" radius={4} />
  </BarChart>
</ChartContainer>
<ChartTable data={months} config={config} labelKey="month" labelHeader="Month" caption="Orders per month. Illustrative data." />
```

Upstream reference: [shadcn/ui Chart](https://ui.shadcn.com/docs/components/chart).

## Area charts

**When:** Use an area chart to show a measure over time. Use stacked areas for parts of one total.

**Examples:**

| File | Shows | Upstream block |
| --- | --- | --- |
| `chart-area-interactive.tsx` | Daily plants sold, with a range selector | `chart-area-interactive` |
| `chart-area-default.tsx` | Seed trays sown, with a monotone curve | `chart-area-default` |
| `chart-area-linear.tsx` | Rainwater collected, with straight segments | `chart-area-linear` |
| `chart-area-step.tsx` | Heated benches, with changes at each month start | `chart-area-step` |
| `chart-area-legend.tsx` | Bedding plants and perennials potted, with a legend | `chart-area-legend` |
| `chart-area-stacked.tsx` | Potting and inspection hours, stacked | `chart-area-stacked` |
| `chart-area-stacked-expand.tsx` | Monthly plant sales shares, normalized to 100% | `chart-area-stacked-expand` |
| `chart-area-icons.tsx` | Seed-grown plants and cuttings, with config icons | `chart-area-icons` |
| `chart-area-gradient.tsx` | Irrigation water by source, with subtle gradient fills | `chart-area-gradient` |
| `chart-area-axes.tsx` | Compost volume, with a labelled vertical axis | `chart-area-axes` |

**Motion:** Marks arrive and morph on `spring.smooth`, sampled over 538ms. Tooltips move between points over 200ms with `cubic-bezier(0.16, 1, 0.3, 1)`.
The range selector updates the stacked areas and the `RollingNumber` total together. Hover does not restart the area entrance.
Data tables use the shared disclosure: `spring.smooth` on opening and `spring.exit` on closing.
Disclosure opacity uses `duration.quick` (140ms) on opening and `duration.instant` (80ms) on closing.

**Reduced motion:** Marks update without movement. The chart fades in once with `duration.quick` (140ms).
Tooltips use `duration.instant` (80ms). Totals update immediately, and disclosures change height without movement.

**Accessibility:** Every chart has a measure, unit, period, and an accessible name. New examples use a named region and `accessibilityLayer`.
Each chart includes a keyboard-accessible data table with explicit units. Multiple series have a legend.
The expanded chart labels its vertical axis, tooltips, and table as shares of monthly plant sales.
The first three categorical tokens pass palette separation checks in both themes. Legends and tables retain category names without color.

**Changes from upstream:**

- Illustrative greenhouse measures replace generic traffic counts.
- Monotone curves replace natural curves to prevent invented overshoot.
- The linear curve remains linear. The step variant keeps the upstream `step` curve.
- Flat areas use 22% opacity and 2px strokes. Only the gradient variant uses gradients, from 35% to 2% opacity.
- The expanded chart keeps `stackOffset="expand"`. Its table and tooltips use the same monthly denominator.
- Config icons use local icon components. Numeric vertical ticks use the mono typeface and include units.
- All new examples include computed trends and semantic data tables. All multi-series examples include legends.

```tsx
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTable,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@sift-design/ui/chart";

const data = [
  { month: "October", trays: 132 },
  { month: "November", trays: 148 },
];
const config = {
  trays: { label: "Seed trays", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function SeedTrays() {
  return (
    <>
      <ChartContainer
        role="region"
        config={config}
        aria-label="Seed trays sown, trays per month, October to November 2026"
      >
        <AreaChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <ChartTooltip cursor content={<ChartTooltipContent indicator="line" />} />
          <Area
            dataKey="trays"
            type="monotone"
            fill="var(--color-trays)"
            fillOpacity={0.22}
            stroke="var(--color-trays)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
      <ChartTable
        data={data}
        config={config}
        labelKey="month"
        labelHeader="Month"
        formatValue={(value) => `${Number(value).toLocaleString("en-GB")} trays`}
        caption="Seed trays sown, trays per month, October to November 2026. Illustrative data."
      />
    </>
  );
}
```

Upstream reference: [shadcn/ui Area charts](https://ui.shadcn.com/charts/area).

## Bar charts

**When:** Use bars to compare amounts across categories or periods. Use a zero baseline, including when values fall below zero.

**Examples:**

| File | Shows | Upstream block |
| --- | --- | --- |
| `chart-bar-interactive.tsx` | Daily retail and wholesale plant sales with channel selection | `chart-bar-interactive` |
| `chart-bar-default.tsx` | Seed trays sown each month | `chart-bar-default` |
| `chart-bar-horizontal.tsx` | Irrigation water in litres with horizontal bars | `chart-bar-horizontal` |
| `chart-bar-multiple.tsx` | Deliveries to two florists with grouped bars and a legend | `chart-bar-multiple` |
| `chart-bar-stacked.tsx` | Sowing and potting compost in litres with stacked bars and a legend | `chart-bar-stacked` |
| `chart-bar-label.tsx` | Saturday market crates with value labels | `chart-bar-label` |
| `chart-bar-label-custom.tsx` | Rooted cuttings with internal month labels and external plant counts | `chart-bar-label-custom` |
| `chart-bar-mixed.tsx` | Plant sales with fixed category colors | `chart-bar-mixed` |
| `chart-bar-active.tsx` | Bench inspections with an outlined review month and hover emphasis | `chart-bar-active` |
| `chart-bar-negative.tsx` | Monthly stock changes with signed labels and a zero reference | `chart-bar-negative` |

**Motion:** Marks arrive and change on the kit's sampled `spring.smooth` curve, which settles in 538ms. The tooltip glides for 200ms. The interactive selection uses `selectionSpring`: stiffness 700, damping 48, and mass 0.6. A shared `layoutId` connects the selection backgrounds. The channel buttons show their totals with `RollingNumber` on `spring.smooth`. The bar and line interactive charts share one header: joined metric buttons with a selection wash. A polite live region announces the selected total. Active bar emphasis changes opacity with `duration.quick` at 140ms. Hover does not replay the data entrance.

**Reduced motion:** The kit applies new bar geometry immediately. A new chart fades in over 140ms. Channel selection has no shared-layout travel. Numbers update without rolling. Tooltips use the kit's 80ms fade without travel.

**Accessibility:** Every chart has a named region and the Recharts `accessibilityLayer`. Channel controls are real buttons with `aria-pressed` and visible keyboard focus. The selected channel updates the accessible data table. Use “Show data” to inspect exact values without hover. Grouped and stacked charts include legends. Category labels identify mixed bars without color. Signed labels identify stock additions and removals without color. The outlined month remains identifiable in forced colors. Internal month labels remain readable at 390px.

**Changes from upstream:**

- Examples use illustrative Fernbrook Greenhouse measures with explicit units and periods.
- Footers calculate changes from the data instead of showing a fixed percentage.
- Bars use thin marks and 4px corners at the data end.
- Stacked and grouped bars use 2px surface-colored strokes.
- Custom label bars use a transparent fill to keep ink labels readable in both themes.
- Active bars use one hue, opacity, and an outline instead of a new hue.
- Negative bars show changes from previous closing stock, signed values, and a zero reference.
- Every chart includes `ChartTable` with an illustrative-data caption.

```tsx
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTable,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@sift-design/ui/chart";

const data = [
  { month: "October", trays: 116 },
  { month: "November", trays: 128 },
];
const config = {
  trays: { label: "Trays", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function SeedTrays() {
  return (
    <>
      <ChartContainer
        role="region"
        config={config}
        aria-label="Seed trays sown, trays per month, October to November 2026"
      >
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="trays" fill="var(--color-trays)" maxBarSize={24} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
      <ChartTable
        data={data}
        config={config}
        labelKey="month"
        labelHeader="Month"
        caption="Seed trays sown, trays per month, October to November 2026. Illustrative data."
      />
    </>
  );
}
```

Upstream reference: [shadcn/ui Bar charts](https://ui.shadcn.com/charts/bar).

## Line charts

**When:** Use lines to show change over time. Use multiple lines when the series share one measure and unit.

**Examples:**

| File | Shows | Upstream block |
| --- | --- | --- |
| `chart-line-interactive.tsx` | Daily rooted cuttings, metric selection and totals | `chart-line-interactive` |
| `chart-line-default.tsx` | Mean seedling height with a monotone curve | `chart-line-default` |
| `chart-line-linear.tsx` | Daily bench water use with straight segments | `chart-line-linear` |
| `chart-line-step.tsx` | Sampled misting intervals with midpoint steps | `chart-line-step` |
| `chart-line-multiple.tsx` | Monthly fulfilled orders for two florists | `chart-line-multiple` |
| `chart-line-dots.tsx` | Monthly germination rates with filled dots | `chart-line-dots` |
| `chart-line-dots-custom.tsx` | Monthly inspections with custom icon dots | `chart-line-dots-custom` |
| `chart-line-dots-colors.tsx` | Daily dispatch batches with stable plant category colors | `chart-line-dots-colors` |
| `chart-line-label.tsx` | Monthly sowing totals with numeric labels | `chart-line-label` |
| `chart-line-label-custom.tsx` | Daily journey distances with destination labels | `chart-line-label-custom` |

**Motion:** Lines arrive and change on the 538ms sampled `spring.smooth` curve. The tooltip glides between points in 200ms.
The interactive example keeps one line and changes its data. A shared `layoutId` moves the selection highlight on `selectionSpring`.
This spring uses stiffness 700, damping 48 and mass 0.6. The inline highlight radius is zero for the joined header buttons.
The totals on the metric buttons use `RollingNumber` on `spring.smooth`. A polite live region announces the selected total.
Dots and labels enter with the kit's 140ms `duration.quick` fade. Active dots use the kit's `spring.snappy` appearance.
Hovering does not replay line arrival.

**Reduced motion:** The kit disables line drawing and data interpolation. Charts enter with a short fade.
The selection highlight has no shared layout movement. Totals update immediately. Tooltips do not glide, and active dots fade without scale.

**Accessibility:** Each chart has a named region and the Recharts keyboard accessibility layer. Each chart includes a semantic data table.
Metric controls are real buttons with `aria-pressed`. Their accessible names include the visible labels and totals.
The selected table updates with the selected measure. Category names remain available in the legend, tooltip and table.
The two florist series also use distinct line patterns and endpoint labels. Values use one scale, with visible units and zero baselines.
All fixtures identify their data as illustrative.

**Changes from upstream:**

- Replace traffic examples with ten distinct greenhouse measures.
- Replace natural curves with monotone curves, except for the linear and step demonstrations.
- Add one numeric axis, horizontal grids, computed trends and data tables.
- Retain all variant features, including custom icons, point colors and custom labels.
- Replace the custom dot with a Tabler icon.
- Put colored dispatch points on dates, not an unordered category axis.
- Add stable category colors and a legend for dispatch batches.
- Add metric selection motion and an animated selected total.
- Keep the interactive card first and full width.

```tsx
import { Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTable,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@sift-design/ui/chart";

const data = [
  { month: "October", trays: 96 },
  { month: "November", trays: 108 },
];
const config = {
  trays: { label: "Trays", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function SowingTrend() {
  return (
    <>
      <ChartContainer
        config={config}
        role="region"
        aria-label="Seed trays sown per month, October to November 2026"
      >
        <LineChart accessibilityLayer data={data}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} />
          <YAxis domain={[0, "auto"]} axisLine={false} tickLine={false} />
          <ChartTooltip cursor content={<ChartTooltipContent />} />
          <Line
            dataKey="trays"
            type="monotone"
            stroke="var(--color-trays)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
      <ChartTable
        data={data}
        config={config}
        labelKey="month"
        labelHeader="Month"
        caption="Seed trays sown per month, October to November 2026. Illustrative data."
      />
    </>
  );
}
```

Upstream reference: [shadcn/ui Line charts](https://ui.shadcn.com/charts/line).

## Pie charts

**When:** Show a few mutually exclusive parts of one whole. Use bars when readers must compare similar amounts precisely.

**Examples:**

| File | Shows | Upstream block |
| --- | --- | --- |
| `chart-pie-interactive.tsx` | Monthly plant sale revenue, month selection, and sector emphasis | chart-pie-interactive |
| `chart-pie-simple.tsx` | Plants sold by plant group | chart-pie-simple |
| `chart-pie-separator-none.tsx` | Compost use without sector separators | chart-pie-separator-none |
| `chart-pie-label.tsx` | Market crates with outside value labels | chart-pie-label |
| `chart-pie-label-custom.tsx` | Seed trays with custom value and unit labels | chart-pie-label-custom |
| `chart-pie-label-list.tsx` | Work hours with inside category labels | chart-pie-label-list |
| `chart-pie-legend.tsx` | Fulfilled orders with a customer legend | chart-pie-legend |
| `chart-pie-donut.tsx` | Water use by growing area | chart-pie-donut |
| `chart-pie-donut-active.tsx` | Dispatched plants with selected sector growth | chart-pie-donut-active |
| `chart-pie-donut-text.tsx` | Reused pots with a centre total | chart-pie-donut-text |
| `chart-pie-stacked.tsx` | Retail and wholesale plant totals in separate concentric rings | chart-pie-stacked |

**Motion:** Marks arrive and morph on the kit's 538ms sampled `spring.smooth` curve. Tooltips glide for 200ms.
The centre total uses `RollingNumber` and `spring.smooth`.
Selected sectors grow outward by 10px on `spring.smooth`, with a 0.28s visual duration.
Previous sectors shrink on `spring.exit`, with a 0.16s visual duration.
The interactive chart also grows a separate outside ring.
Motion values persist outside Recharts geometry keys to preserve interrupted sector movement during data changes.
The `usePieSectorExpansion` and `AnimatedPieSector` helpers live in `chart-pie-donut-active.tsx`.
Category buttons support keyboard selection. Press the selected non-first category again to return to the first category.

**Reduced motion:** Marks and totals update without travel. Selected sectors use an ink outline without growth or the outside ring.
The kit retains short entrance fades.

**Accessibility:** Every chart has a named group, a visible legend, a tooltip, and a semantic data table.
The table includes units and identifies illustrative data.
Outside labels fit within the card at 390px.
Centre totals use 30px semibold mono text with a 12px muted unit.
Each stacked ring represents its own total. Ring sizes do not compare channel totals.
Palette validation passes with contrast warnings for light slots 2 and 4, and dark slot 1.
Labels and exact data tables provide additional identification and values.

**Changes from upstream:**

- Replace generic categories with Fernbrook Greenhouse measures.
- Keep the interactive chart in a normal card to avoid unused horizontal space.
- Select the month instead of selecting a month-shaped sector within one pie.
- Keep category colors stable across all month selections.
- Add computed trends, legends, tooltips, explicit units, and data tables.
- Replace instant active-sector path changes with interruptible spring-driven radii.
- Reserve outside-label space and keep all controls visible on mobile.
- Add readable text outlines around the inside category labels.

```tsx
import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTable,
  ChartTooltip,
  ChartTooltipContent,
} from "@sift-design/ui/chart";

const data = [
  { category: "herbs", plants: 348, fill: "var(--color-herbs)" },
  { category: "bedding", plants: 264, fill: "var(--color-bedding)" },
  { category: "perennials", plants: 198, fill: "var(--color-perennials)" },
];
const config = {
  plants: { label: "Plants" },
  herbs: { label: "Herbs", color: "var(--chart-1)" },
  bedding: { label: "Bedding", color: "var(--chart-2)" },
  perennials: { label: "Perennials", color: "var(--chart-3)" },
};

export function PlantsSold() {
  return (
    <>
      <ChartContainer
        config={config}
        role="group"
        aria-label="Plants sold, plants, November 2026"
        className="h-[280px] aspect-auto"
      >
        <PieChart accessibilityLayer>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="category" />} />
          <Pie
            data={data}
            dataKey="plants"
            nameKey="category"
            outerRadius={90}
            stroke="var(--surface)"
            strokeWidth={2}
          />
          <ChartLegend itemSorter={null} content={<ChartLegendContent nameKey="category" />} />
        </PieChart>
      </ChartContainer>
      <ChartTable
        data={data}
        config={config}
        labelKey="category"
        labelHeader="Plant group"
        caption="Plants sold, plants, November 2026. Illustrative data."
      />
    </>
  );
}
```

Upstream reference: [shadcn/ui Pie charts](https://ui.shadcn.com/charts/pie).

## Radar charts

**When:** Compare profiles across a small, fixed set of categories. Use the same unit and zero-based scale on every axis.

Keep comparisons to two or three records. Use bars when readers need precise comparisons between categories.

**Examples:**

| File | Shows | Upstream block |
| --- | --- | --- |
| `chart-radar-default.tsx` | Propagation bench health, scored from 0 to 10 | `chart-radar-default` |
| `chart-radar-dots.tsx` | Irrigation inspection with visible point markers | `chart-radar-dots` |
| `chart-radar-multiple.tsx` | Retail plant sales in October and November | `chart-radar-multiple` |
| `chart-radar-lines-only.tsx` | Plant orders from two florists, without filled areas | `chart-radar-lines-only` |
| `chart-radar-label-custom.tsx` | Germination percentages and crop names in custom ticks | `chart-radar-label-custom` |
| `chart-radar-grid-custom.tsx` | Seed trays sown within a single outer grid polygon | `chart-radar-grid-custom` |
| `chart-radar-grid-none.tsx` | Saturday market crates without grid lines | `chart-radar-grid-none` |
| `chart-radar-grid-circle.tsx` | Ventilation inspection with circular grid lines | `chart-radar-grid-circle` |
| `chart-radar-grid-circle-no-lines.tsx` | Reused pots with circular grid lines and no radial lines | `chart-radar-grid-circle-no-lines` |
| `chart-radar-grid-circle-fill.tsx` | Rooted cuttings with a quiet circular grid fill | `chart-radar-grid-circle-fill` |
| `chart-radar-grid-fill.tsx` | Bench irrigation water with a quiet polygon grid fill | `chart-radar-grid-fill` |
| `chart-radar-icons.tsx` | Harvested stems with store and delivery icons | `chart-radar-icons` |
| `chart-radar-legend.tsx` | Plants potted on with a two-record legend | `chart-radar-legend` |
| `chart-radar-radius.tsx` | Growing bench health with visible radius ticks | `chart-radar-radius` |

**Motion:** Radar polygons expand from the centre on the kit's 538ms `spring.smooth` curve. Data changes use the same curve.

The tooltip moves between axes over 200ms. Point markers use the kit's 140ms `duration.quick` fade.

The data disclosure uses the kit's measured height spring. It opens on `spring.smooth` and closes on `spring.exit`.

No example overrides mark animation settings. Pointer movement and keyboard navigation do not replay the arrival animation.

**Reduced motion:** Radar polygons render at their final positions. The chart uses a short opacity fade instead of scaling.

The tooltip moves immediately. The data disclosure changes height immediately and retains its short opacity fade.

**Accessibility:** Each chart has a named group and the chart library's keyboard accessibility layer. Arrow keys inspect each axis through the tooltip.

Every card includes a semantic data table behind a “Show data” button. The table caption states the measure, unit, period and illustrative status.

Two-record charts include a legend and a dashed second outline. Custom tick values use monospace text, and crop names remain visible at 390px.

The radius example shows muted numeric ticks. Health and inspection scores use a fixed 0–10 domain; higher scores indicate better conditions.

**Changes from upstream:**

- Replaced generic device counts with distinct Fernbrook Greenhouse measures.
- Added zero-based domains, explicit units and computed October comparisons.
- Added accessible tables, group names and keyboard tooltip support.
- Reduced area opacity to 0.22 and used 2px outlines.
- Added legends to every two-record chart and dashed second outlines.
- Used a quiet surface token for filled grids.
- Replaced configuration icons with Tabler store and delivery icons.
- Reserved space for custom two-line ticks at narrow widths.
- Added category labels to the radius example while retaining its numeric radius axis.

```tsx
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import {
  ChartContainer,
  ChartTable,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@sift-design/ui/chart";

const data = [
  { check: "Light", score: 8 },
  { check: "Water", score: 7 },
  { check: "Airflow", score: 6 },
  { check: "Soil", score: 8 },
  { check: "Pests", score: 9 },
  { check: "Growth", score: 7 },
];
const config = {
  score: { label: "Bench 4", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function BenchHealth() {
  return (
    <>
      <ChartContainer
        config={config}
        role="group"
        aria-label="Bench 4 health, score out of 10, November 2026"
        className="h-[280px] w-full aspect-auto"
      >
        <RadarChart data={data} outerRadius="64%" accessibilityLayer>
          <PolarAngleAxis dataKey="check" />
          <PolarGrid />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent labelFormatter={(_, payload) => payload?.[0]?.payload?.check} />}
          />
          <Radar
            dataKey="score"
            fill="var(--color-score)"
            fillOpacity={0.22}
            stroke="var(--color-score)"
            strokeWidth={2}
          />
        </RadarChart>
      </ChartContainer>
      <ChartTable
        data={data}
        config={config}
        labelKey="check"
        labelHeader="Check"
        caption="Bench 4 health, score out of 10, November 2026. Illustrative data."
      />
    </>
  );
}
```

Upstream reference: [shadcn/ui Radar charts](https://ui.shadcn.com/charts/radar).

## Radial charts

**When:** Show progress against a stated goal or capacity. Use aligned bars when readers need precise comparisons between categories.

**Examples:**

| File | Shows | Upstream block |
| --- | --- | --- |
| `chart-radial-simple.tsx` | Germinated trays by bench, with full background tracks | chart-radial-simple |
| `chart-radial-label.tsx` | Plants potted by crop, with custom start labels | chart-radial-label |
| `chart-radial-grid.tsx` | Weekly watering budget used by area, with a circular grid | chart-radial-grid |
| `chart-radial-text.tsx` | Market crates packed, with a rolling center count | chart-radial-text |
| `chart-radial-shape.tsx` | Irrigation tank level, with custom concentric track geometry | chart-radial-shape |
| `chart-radial-stacked.tsx` | Retail and wholesale sales toward one monthly goal | chart-radial-stacked |

**Motion:** Marks arrive and update on the 538ms `spring.smooth` curve supplied by `ChartContainer`. Tooltip movement takes 200ms. The crate control switches between four and five packed crates. `RollingNumber` uses `spring.smooth` for the center count. A stable label component preserves the number animation across updates. The same control can reverse the arc during movement. The card reserves space for the control. No animation runs automatically after arrival. No completion effect appears because the example does not reach six crates.

**Reduced motion:** Marks update immediately. `RollingNumber` shows the final count immediately. The kit uses a 140ms arrival fade and an 80ms tooltip fade.

**Accessibility:** Each chart has a named group and uses `accessibilityLayer`. Each footer has a keyboard-operated data table. Tables include units, periods, and the illustrative-data notice. Multiple categories have labelled swatches and visible values. The crate status announces the new count. Tables update with the crate count. Center numbers use 30px semibold mono text. Units use 12px muted text. Labels stay readable without category colors.

**Changes from upstream:**

- Use six distinct greenhouse measures instead of browser traffic.
- Fix percentage scales at zero to 100. Fix progress scales at the stated goal or capacity.
- Replace the label example's overlapping 470-degree sweep with one full circle.
- Reduce category counts to three for readable labels at narrow widths.
- Place start labels on surface-colored backgrounds instead of colored text or white text.
- Preserve the custom concentric track geometry and the stacked half-circle.
- Add neutral tracks, visible legends, exact values, and accessible tables.
- Add a reversible crate control without autoplay.

```tsx
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@sift-design/ui/chart";

const config = { packed: { label: "Crates packed", color: "var(--chart-1)" } };
const data = [{ packed: 4, fill: "var(--color-packed)" }];

<ChartContainer
  config={config}
  role="group"
  className="aspect-square h-[250px]"
  aria-label="Market crates packed, 4 of 6 crates, 7 November 2026"
>
  <RadialBarChart data={data} startAngle={90} endAngle={-270} accessibilityLayer>
    <PolarAngleAxis type="number" domain={[0, 6]} tick={false} axisLine={false} />
    <RadialBar dataKey="packed" cornerRadius={4} background={{ fill: "var(--subtle)" }} />
    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
  </RadialBarChart>
</ChartContainer>;
```

Upstream reference: [shadcn/ui Radial charts](https://ui.shadcn.com/charts/radial).

## Tooltip charts

**When:** Use a tooltip to inspect exact values in a stacked bar chart. Keep a table available when a reader cannot hover.

**Examples:**

| File | Shows | Upstream block |
| --- | --- | --- |
| `chart-tooltip-default.tsx` | Growing work in hours, with dot indicators | `chart-tooltip-default` |
| `chart-tooltip-indicator-line.tsx` | Bench inspection time in minutes, with line indicators | `chart-tooltip-indicator-line` |
| `chart-tooltip-indicator-none.tsx` | Seed trays sown, without indicators | `chart-tooltip-indicator-none` |
| `chart-tooltip-label-custom.tsx` | Potting time in minutes, with a heading from the chart configuration | `chart-tooltip-label-custom` |
| `chart-tooltip-label-formatter.tsx` | Florist order preparation in minutes, with a full date heading | `chart-tooltip-label-formatter` |
| `chart-tooltip-label-none.tsx` | Water used in litres, without a heading or indicators | `chart-tooltip-label-none` |
| `chart-tooltip-formatter.tsx` | Crop care time, with right-aligned minute values | `chart-tooltip-formatter` |
| `chart-tooltip-icons.tsx` | Irrigation maintenance time, with icons for nozzles and supply lines | `chart-tooltip-icons` |
| `chart-tooltip-advanced.tsx` | Picking and packing time, with minute values and a total row | `chart-tooltip-advanced` |

**Motion:** Bars arrive on the kit's sampled `spring.smooth` curve in 538ms. Hover does not restart the bar entrance. Tooltips move between bars in 200ms with `cubic-bezier(0.16, 1, 0.3, 1)`. Tooltip entrances use `spring.snappy`: 200ms visual duration and 358ms full settle time. Each entrance fades from zero opacity, with a 2px rise and scale from 0.97. The initial tooltip uses `defaultIndex={1}`. The upstream blocks intentionally disable the cursor band.

**Reduced motion:** Bars render their final geometry immediately. A new chart fades in over `duration.quick` (140ms). Tooltip position updates immediately, without travel or scale. Tooltip entrances use an 80ms `duration.instant` fade.

**Accessibility:** Every chart has an accessible name with its measure, unit, and period. Each chart enables the Recharts accessibility layer. Arrow keys inspect the bars. The “Show data” button opens a semantic table containing all six daily records. Tables include units and an illustrative-data caption. Text stays neutral. Legends identify both series, including variants without tooltip indicators. Surface-coloured strokes separate stacked segments. Configured icons are decorative.

**Changes from upstream:**

- Use fictional Fernbrook Greenhouse records from 4 to 9 November 2026.
- Keep all nine tooltip APIs and the initial active index.
- Use shared date and trend helpers.
- Add legends, accessible names, computed trends, and data tables.
- Use the first two categorical tokens in fixed series order.
- Use thin bars with square baselines and 4px top corners.
- Replace the configured icons with Tabler icons.
- Format custom values and table values with the `en-GB` locale.
- Exclude `chart-tooltip-demo`, which is a documentation example.

```tsx
import { Bar, BarChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@sift-design/ui/chart";

const data = [
  { day: "4 Nov", jane: 4, john: 5 },
  { day: "5 Nov", jane: 5, john: 4 },
];
const config = {
  jane: { label: "Jane Doe", color: "var(--chart-1)" },
  john: { label: "John Smith", color: "var(--chart-2)" },
};

<ChartContainer config={config} aria-label="Growing work, hours per day, 4 to 5 November 2026">
  <BarChart accessibilityLayer data={data} barSize={28}>
    <XAxis dataKey="day" axisLine={false} tickLine={false} />
    <Bar dataKey="jane" stackId="work" fill="var(--color-jane)" stroke="var(--surface)" strokeWidth={2} />
    <Bar
      dataKey="john"
      stackId="work"
      fill="var(--color-john)"
      radius={[4, 4, 0, 0]}
      stroke="var(--surface)"
      strokeWidth={2}
    />
    <ChartTooltip cursor={false} defaultIndex={1} content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
  </BarChart>
</ChartContainer>;
```

Upstream reference: [shadcn/ui Tooltip charts](https://ui.shadcn.com/charts/tooltip).
