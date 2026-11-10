# Time spent

Review recorded time for the fictional Fernbrook Greenhouse. The example is set on Tuesday 10 November 2026 at 14:20 in Europe/London. Explore sessions, change categories, and edit records without contacting a real service. Reloading resets your changes.

This optional example demonstrates interval placement, labeled summaries, filtering, and editing. A day timeline, time categories, and linked tasks belong to this example—not to every product using Sift Design. Choose charts from the product's question and data; see [data visualization](../../docs/data-visualization.md).

## Run and verify

```sh
npm run dev -w @larkspur/timeline
npx tsc --noEmit -p blocks/timeline
node blocks/timeline/check.mjs
node scripts/capture.mjs timeline --axe
```

The development app uses port **5304**. Run the interaction check while the development app is listening there. Captures build and serve a private copy automatically.

## Patterns and components

- Day navigation, a seven-day miniature ribbon strip, factual recorded duration, session count, and linked-task count.
- Proportional 46px ribbon, 2px surface gaps, 12px mono local-time labels (two-hour steps on desktop, four-hour steps on mobile), and a fixed current-time label above the ribbon so it never competes with axis ticks. Immediate pointer and keyboard tooltips. Blank space means no recorded session, not inactivity. Focus a ribbon segment to read its details; use the corresponding rail/table action to edit it.
- Eight immutable category identities (`--cat-1` through `--cat-8`), direct labels, mono durations, thin baseline-anchored comparison bars, filterable legend, and optional patterned marks. Filters never reassign colors. Mobile category detail uses a measured disclosure to keep sessions close at hand.
- Semantic session table alternative and weekly category-duration table, including a named keyboard-focusable horizontal region at narrow widths.
- Chronological rail with time range, work description, category, linked task, provenance, and correction action. Linked tasks open their accumulated time and sessions in a sheet.
- Responsive kit `Sheet`, `Button`, `Input`, `Label`, `SiblingTransition`, and `DisclosureBody`. Editing validates nonempty descriptions, 24-hour times, positive duration, and future end times; all dismissal paths protect a dirty draft.
- Tracker automatically paused with its reason (`?state=paused`), person-paused attribution, resume, empty day (`?state=empty`), and manual session creation.

Elapsed totals count overlapping intervals once per day. Category totals retain each recorded session’s full duration and can therefore exceed elapsed time if records overlap. The fixture has no overlapping sessions.

## Motion recipes

- `SiblingTransition` + `pageMotion` keeps the shell fixed while day and day/week destinations spring in the travel direction. Rapid reversal is recorded separately.
- `selectionSpring` carries calendar and segmented-control selection between siblings. `pressable()` supplies direct press feedback.
- `spring.smooth` grows ribbon marks and category bars from their baseline once per day change; switching back from week does not replay day growth. Existing marks use Motion `layout` + `reflowTransition()` to reshape after edits instead of replaying an entrance.
- Totals and durations use a 140ms opacity cross-fade, never count-up animation. Tooltip position is immediate; only visibility fades.
- Reduced motion removes travel, scale, and spring reflow while retaining opacity feedback. The kit handles sheet origin, edge travel, focus management, and mobile drag dismissal.

## Reproducible states

`?theme=dark`, `?day=2026-11-09`, `?view=week`, `?display=table`, `?state=paused`, `?state=empty`, `?open=edit`, `?task=FG-142`. `shots.mjs` supplies short prepare steps for filtering, validation, expanded mobile breakdown, and unsaved-draft confirmation.

## Screenshot index

All evidence lives in `screenshots/timeline/`.

| Files | Demonstrates |
|---|---|
| `01-day-light.png`, `02-day-dark.png` | Desktop day ledger, full rail |
| `03-day-light-mobile.png`, `04-day-dark-mobile.png` | 390px day ledger in both themes |
| `05-tooltip-light.png` | Keyboard-accessible segment tooltip |
| `06-edit-light.png`, `07-edit-dark.png`, `08-edit-light-mobile.png` | Responsive session editor |
| `09-validation-light.png` | Invalid end time, preserved draft |
| `10-week-light.png`, `11-week-dark.png`, `12-week-light-mobile.png` | Stacked weekly daily bars and duration table |
| `13-table-light.png`, `14-table-dark-mobile.png` | Session table alternative |
| `15-paused-light.png`, `16-paused-dark-mobile.png` | Automatically paused tracker and explicit reason |
| `17-empty-light.png`, `18-empty-dark-mobile.png` | Empty day and add-time recovery |
| `19-task-time-light.png`, `20-task-time-dark-mobile.png` | Linked-task time view |
| `21-reduced-motion.png` | Reduced-motion navigation |
| `22-day-navigation-filmstrip.png` | Directional day navigation, 0–400ms |
| `23-day-week-filmstrip.png` | Sibling day/week transition, 0–400ms |
| `24-edit-filmstrip.png` | Session reshaping and category reflow, 0–400ms |
| `25-filter-light.png` | Filtered rail, stable color identities, legible labels |
| `26-breakdown-dark-mobile.png` | Expanded mobile category bars |
| `27-unsaved-draft-light.png` | Dismissal protects unsaved corrections |
| `timeline-motion-day-navigation{,-mobile}.webp` | Forward/back day travel and total cross-fades |
| `timeline-motion-day-rail{,-mobile}.webp` | Directional session-rail travel at the reading position |
| `timeline-motion-day-week{,-mobile}.webp` | Day/week sibling transitions |
| `timeline-motion-edit{,-mobile}.webp` | Sheet dismissal, corrected segment and spring bar reflow |
| `timeline-motion-filter{,-mobile}.webp` | Stable colors and spring-filtered session rail |
| `timeline-motion-tooltip{,-mobile}.webp` | Focus tracking across adjacent segments |
| `timeline-motion-interruption-dark.webp` | Rapidly reversed navigation in dark mode |

## Review notes

Both normative categorical palettes pass computed lightness, chroma, adjacent CVD separation, and normal-vision separation. Contrast warnings are handled by persistent text, full table/feed alternatives, and available texture; category colors are not used for text.

This example uses the shared type sizes: 12px for metadata and chart labels, 13px controls and compact subheadings, 14px task text, 18px task/empty-state headings and secondary counts, and 30px page headings and elapsed totals. Its mobile form fields use 18px to avoid input zoom; that is a local choice, not a universal field size. Corners use 6/8/12px or the 999px avatar pill; miniature tracks and swatches are square data geometry, with 6px ribbon marks and bar ends. Local overrides also normalize inherited kit button text and the mobile sheet handle; no shared kit or token changes are needed. See [typography](../../docs/typography.md) for shared roles and optional presets.

Verification: TypeScript passes; Impeccable reports zero findings (formerly 57 font-size and 8 radius findings). The full capture run covers 27 PNGs and 13 motion WebPs, with zero axe violations across 24 still states. Main day stills were visually reviewed in both themes at desktop and 390px, along with weekly, editor, tooltip, task, and expanded-breakdown states. Browser geometry checks found no axis-label collisions, crowded category labels, or page overflow at 360/390/768/1024/1440px.

Local kit candidates: proportional `ActivityRibbon` with clamped focus/pointer tooltip, labeled `CategoryDurationBars`, a time-format field, and reusable dirty-sheet dismissal protection. No kit or token files were changed.
