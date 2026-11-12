Choose a chart that answers a real question. Keep labels visible and make the information available without color or hovering.

# Data visualization

## Start with the question, not a chart type

Use a chart when a visual comparison, trend, or relationship is clearer than prose or a table. Do not add a chart simply because the page has room. A single value can answer “How many?”, while a table can be better for looking up exact records.

| Question | Useful starting point | Watch for |
|---|---|---|
| Which groups have more or less? | Aligned bars | A consistent scale and readable category names |
| How does a measure change over time? | Line chart | Irregular samples, missing observations, and time intervals |
| What makes up a total? | Stacked bar | Whether parts are mutually exclusive and sum to that total |
| When do intervals occur or overlap? | Timeline or calendar | Actual start/end positions, timezone, and overlap |
| How are two measurements related? | Scatter plot | Units, outliers, and correlation not implying causation |
| What is the precise value for a record? | Table or list | Clear headers, units, and sorting |

A store might compare sales by product, an analytics view might show a weekly trend, and a booking tool might show occupied intervals. None needs to adopt the time-tracking model in the Timeline block. Choose only the views that serve the product.

## Define what the values mean

Name the measure, unit, scope, and period. Explain aggregation when it changes interpretation: orders placed and orders fulfilled are different counts; net revenue and gross revenue are different measures. Show the source or last-updated time when freshness affects a decision.

Distinguish zero, missing, pending, estimated, and unavailable values. Do not fill an observation gap with invented records or draw a continuous line across missing samples without explaining that choice. Label illustrative data as illustrative; never present it as live product performance.

For percentages, identify the denominator. For overlapping groups, explain that group totals may exceed the unique overall total. A part-to-whole chart is appropriate only when its parts genuinely form that whole. Use a common baseline for comparisons and disclose a restricted range; bar-length comparisons normally start at zero.

## Give categories consistent colors

The eight categorical tokens provide distinct identities, not an application taxonomy. Assign them to the product’s own series and keep that mapping through sorting, filtering, and theme changes. Do not recolor surviving categories because another one disappears.

| CSS variable | Light | Dark | Light contrast | Dark contrast |
|---|---|---|---:|---:|
| `--cat-1` | `#017c5d` | `#017c5d` | 4.85:1 | 2.92:1 |
| `--cat-2` | `#aa84d4` | `#9d78c6` | 2.82:1 | 4.29:1 |
| `--cat-3` | `#976b03` | `#946800` | 4.43:1 | 3.07:1 |
| `--cat-4` | `#6da9e7` | `#5b97d3` | 2.31:1 | 4.93:1 |
| `--cat-5` | `#a1592e` | `#9d562b` | 4.92:1 | 2.75:1 |
| `--cat-6` | `#8aab5f` | `#7c9c50` | 2.43:1 | 4.87:1 |
| `--cat-7` | `#b85862` | `#b5555f` | 4.25:1 | 3.20:1 |
| `--cat-8` | `#868bd1` | `#7a7ec4` | 2.96:1 | 4.06:1 |

These contrast values are against the token’s `--surface` background, not generic white or black. Several fills are below 3:1. Category text uses `--ink` or `--muted`, not the series color. Keep `--good`, `--warn`, and `--danger` for status rather than using them as interchangeable category colors.

Eight color slots do not limit the product to eight categories. For larger sets, use filtering, direct labels, small multiples, or a table. Aggregate into Other only when that grouping is meaningful, and explain what it contains. Do not cycle the palette and rely on repeated color alone to distinguish series.

The reference palette’s validator checks adjacent color separation, including color-vision deficiency simulations; those checks do not establish accessibility for every chart. Light slots 2, 4, 6, and 8 and dark slots 1 and 5 have background-contrast warnings. When an essential mark or boundary needs 3:1 contrast, use an appropriate contrasting outline, pattern, or other accessible encoding and test the result. A legend or table does not automatically repair an inaccessible essential graphic.

This reference defines categorical colors, not sequential or diverging scales. A sequential scale represents increasing magnitude; a diverging scale represents direction and magnitude on either side of a meaningful midpoint. Do not use the categorical rainbow for either role or invent private token replacements. If the product needs an additional scale, propose it as a reviewed shared extension.

## Keep geometry and scales honest

Use proportional positions and lengths when they encode quantities. Align comparable plots to the same scale or make any difference explicit. Keep grids and dividers quieter than the data. Use clear axis labels and tick spacing that remain readable at narrow widths.

Separate incompatible units into labeled views rather than adding a second y-axis that can imply a misleading relationship. For time-based charts, use the relevant timezone and locale consistently in axes, details, and data alternatives. A local calendar day is not always 24 elapsed hours; handle daylight-saving transitions according to the product’s actual time model.

Thin marks and surface-colored gaps can make dense charts easier to read, but minimum visible widths or enlarged marks distort proportions. If such a visibility adjustment is necessary, disclose it, keep exact values available, and do not use the altered lengths for precise comparison. Do not adopt a block’s fixed track height, day strip, coverage states, or duration-accounting rules unless the product needs that representation.

## Labels, legends, and interaction

Give the chart a useful title or accessible name and show units. Prefer direct labels when they are readable; keep a legend for multiple series when labels alone cannot identify them. Labels should name the product’s actual categories, not internal series keys. IBM Plex Mono and tabular figures help people compare compact numbers.

Tooltips can supply precision, but must not be the only way to discover essential values or actions. Keep them within the viewport and useful plot area. Provide keyboard-accessible inspection for interactive marks, and keep thin marks operable without overlapping their hit targets. Use actual buttons or links for actions, with selected state such as `aria-pressed` only when that state fits the control.

Supply a semantic table or list containing the plotted values with their labels and units. A short text summary can explain the main trend but does not replace access to the underlying values. The alternative should update with the chart’s filter and scope, or clearly explain any difference. Keep it usable in print, forced colors, and narrow layouts.

## Use the chart component without changing its contract

`ChartContainer` supplies named series and CSS variables; Recharts supplies the chart and axes. Configure stable series keys, labels, and token-based colors. `ChartTooltip` and `ChartLegend` help compose inspection and identification, but the application still supplies the accessible name, units, and equivalent data. Use Recharts’ `accessibilityLayer` and test its keyboard path in the chosen chart type.

Marks arrive once on the shared `spring.smooth` curve and morph on the same spring when the data changes, so a filter or a range switch explains itself. Re-renders and hovers that do not change the data replay nothing. Reduced motion applies changes at once and fades a new chart in. Do not add an animation wrapper that duplicates this behavior, delays access to values, or implies progress that has not happened. `ChartTable` gives every chart its data table. See the [Chart guide](../packages/ui/docs/charts.md#chart) for the API and the motion details, and the [Charts page](../packages/ui/docs/charts.md) for a worked example of each chart type.

## Optional examples, not required features

The [Timeline block](../blocks/timeline/README.md) demonstrates interval placement and categorical duration summaries. Its selected day, observation coverage, session records, and overlap calculations belong to that example’s domain. Reuse its visual treatment only after deciding that interval data answers the product’s question; do not build a day timeline as a prerequisite for using this system.

For an analytics chart, define the measure and comparison period instead. For a store, a sortable product table may be enough. For a reader, reading progress is useful only if its denominator and saved position are real. The shared requirements are accurate values, consistent styling, accessible interpretation, and honest state—not a particular dashboard or ledger.

## Checklist

- The representation answers a specific product question and uses real or explicitly illustrative data.
- Measures, units, period, aggregation, missing values, and percentage denominators are clear.
- Geometry and scales preserve the intended comparison; overlapping groups are not falsely presented as exclusive parts.
- Category identity survives sorting, filtering, and both themes without depending on color alone.
- Every plotted value has a readable path outside hover; interactive marks work with a keyboard.
- Essential marks and text are checked against their actual backgrounds, including forced colors and narrow layouts.
- Motion reflects real changes and respects reduced motion; no timeline, category taxonomy, or task model is required.
