Use the activity ribbon for time placement and category bars for duration composition.
Keep categorical identities fixed, marks thin, and the same information readable without color or hover.

# Data visualization

## Choose Sift form for its job

Use Sift’s activity ribbon to show when recorded sessions happened in a selected local day. Use task-time category bars to compare composition of recorded duration. Use the chronological feed and labeled category durations as the non-graphical reading path. Do not turn an operating workspace into a collection of stat tiles or draw a chart when a plain value/row answers the question.

Do: distinguish recorded time, checked intervals, unchecked gaps, a running check, and now. Don’t: fill unknown time with invented sessions or imply an absent record proves no work happened. Use the configured timezone for day boundaries, labels, and tooltips.

## Keep the categorical slots stable

| Slot/token | Sift identity | Larkspur identity | Light | Dark | Light mark/surface | Dark mark/surface |
|---|---|---|---|---|---:|---:|
| 1 / `--cat-1` | Coding | Growing | `#017c5d` | `#017c5d` | 4.85:1 | 2.92:1 |
| 2 / `--cat-2` | Reviewing | Inspection | `#aa84d4` | `#9d78c6` | 2.82:1 | 4.29:1 |
| 3 / `--cat-3` | Meetings | Meetings and calls | `#976b03` | `#946800` | 4.43:1 | 3.07:1 |
| 4 / `--cat-4` | Messages | Messages | `#6da9e7` | `#5b97d3` | 2.31:1 | 4.93:1 |
| 5 / `--cat-5` | Admin | Admin | `#a1592e` | `#9d562b` | 4.92:1 | 2.75:1 |
| 6 / `--cat-6` | Research | Research | `#8aab5f` | `#7c9c50` | 2.43:1 | 4.87:1 |
| 7 / `--cat-7` | Writing | Writing | `#b85862` | `#b5555f` | 4.25:1 | 3.20:1 |
| 8 / `--cat-8` | Other | Other | `#868bd1` | `#7a7ec4` | 2.96:1 | 4.06:1 |

Assign in this fixed order, never cycle or re-rank colors. Filtered categories retain their slot. Fold a ninth identity into Other or change the representation; do not generate a hue. Keep `--good`, `--warn`, and `--danger` for status, not category identity. Keep text in `--ink`/`--muted`; the adjacent swatch carries category identity.

These contrast values are computed against the exact token surface, not a generic white/black background. Several data fills are below 3:1. Treat them as identity fills with persistent text/legend and a readable table/feed alternative; do not use them as tiny text or the sole essential indicator. Add an accessible outline, pattern, or other secondary encoding when a mark’s boundary itself is essential. Do not claim the palette alone proves WCAG non-text conformance.

The categorical validator was run against both actual surfaces. Both palettes pass its adjacent-pair CVD and normal-vision separation checks; both return contrast warnings. Light warnings affect slots 2, 4, 6, and 8; dark warnings affect slots 1 and 5. Do not “fix” these by inventing replacement values outside the normative tokens. Retain labels and secondary reading/encoding; propose token changes separately if an essential boundary still fails. No Sift’s sequential/diverging ramps are defined; do not invent them for this reference.

## Build the ribbon anatomy

- Keep the timeline proportional to actual start/end times within the day’s displayed span. Do not use equal-width blocks for unequal sessions.
- Use the 46px Sift’s ribbon track with a 10px rounded clipping container. Sift’s sessions have 4px radius and `clip-path: inset(0 1px round 4px)`, producing a 2px surface gap between touching marks.
- Separate checked coverage, hatched gaps, and actual sessions. The now indicator is a 2px line with a 6px point; it is not another category. Sift’s running-gap scan is real-state feedback only; reduced mode removes it.
- Use sparse 11px tabular hour labels with clear start/end alignment. Do not add a competing y-axis or a grid heavier than the data.
- Preserve the selected day and the week strip. Week miniature tracks are 4px high; they summarize actual sessions, not invented streaks.

## Keep task-time bars thin and honest

Use Sift task-time bar: 6px high, 2px gaps, minimum visible segment width 4px, 1px segment radius, and 3px rounded outer ends. Size segment flex-grow by category duration, not by rank or a decorative constant. The minimum segment width is a visibility exception; exact durations in the legend remain authoritative.

Show a persistent category label and duration for each visible segment. Sift’s task bars are `aria-hidden` because the adjacent list carries the meaning. Do not put essential information only in a CSS fill or native title attribute.

Explain overlapping sessions honestly: Sift counts an overlapping interval once in total elapsed time but in full for each category, so category totals can exceed elapsed total. Do not label those category proportions as mutually exclusive percentages of elapsed time.

## Labels, legends, hover, and keyboard

Keep category names and durations visible. For multiple categories retain the legend; Sift’s legend chips have 8px swatches, 28px height, and 12.5px labels. For one category, a direct label can supply identity without a redundant legend box. Never recolor surviving marks after a legend filter.

Use tooltips for precise session title, local start/end time, duration, and category. Sift clamps the ribbon tooltip to stay within the useful plot region and uses a compact inverted surface; keep it legible at the viewport edges. Provide the same session details through the feed and keyboard-accessible action, not just pointer hover. Use expanded hit targets rather than making the thin marks visually bulky. Keep selection/filter state readable with `aria-pressed` where applicable.

Provide a table/list alternative with session label, date/local time span, duration, category, linked task, and provenance. Sift’s session feed and category list already expose much of that information, but it is not a separate semantic table toggle. A derived chart must preserve an equivalent readable list or add a table when the feed does not cover all plotted values. Do not claim an absent table control exists in Sift.

## Never use a dual axis

Use a single time scale for the ribbon and a single duration basis for the category bar. Put incompatible units in separate labeled views, not a second y-axis. Do not invent a rainbow magnitude scale. Use the same fixed categorical slots in both themes, with each theme’s own values rather than automatic inversion.

## Checklist

- Time position/length and category totals derive from real records and timezone rules.
- Eight slots retain identity through filters; overflow folds into Other.
- Thin marks keep 2px gaps and readable labels/legend.
- Every plotted value is available without hover and without color.
- Both palettes are checked against their actual surface; contrast warnings are resolved with accessible encoding, not ignored.
- No dual axis, fake coverage, or misleading percentage appears.
