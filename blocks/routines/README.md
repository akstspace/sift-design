# Helpers

Larkspur’s scheduled automations for Fernbrook Greenhouse. Deterministic example data uses Tuesday 10 November 2026 at 10:00 in Europe/London. Sources, sign-in, saved changes, and runs are simulated in memory; reloading restores the example.

## Run

From the repository root:

```sh
npm run dev -w @larkspur/routines
```

Open http://localhost:5303. Typecheck with `npx tsc --noEmit -p blocks/routines`. Capture the reference set with `node scripts/capture.mjs routines --axe`.

## What it demonstrates

- Six honest helper states: a running helper with elapsed time, a scheduled helper with its next run, a pause attributed to Larkspur with a reason and Resume, a pause attributed to Jane, a failed run whose schedule continues, and expired sign-in with a reconnect step.
- Inspector editing with name, instructions, area, daily times, selected weekdays, minute/hour intervals, and five-field cron. Schedule validation and the next three matching runs share the same parser. London timezone and each occurrence’s UTC offset remain visible, including repeated local times at a clock change.
- Guarded dismissal through Cancel, close, Escape, backdrop, mobile sheet drag, and browser unload. Save errors preserve the draft. Delete, pause and run cancellation require confirmation.
- Run now, cancellation without changing the schedule, history filters, expandable tool activity, batched live logs, and a final summary linked to task previews.
- Empty, filtered-empty, connection-error, validation-error and save-error examples.

## Components and motion

Kit imports: Button, Input, Textarea, Sheet, AlertDialog, Dialog, Collapsible, PushStack and SiblingTransition.

- `PushStack` uses `pushMotion` for hierarchical run pushes and back pops; `SiblingTransition` uses `pageMotion` for the helper/history surface. The shell stays fixed.
- The kit Sheet uses edge-origin inspector motion on desktop and a draggable bottom sheet on mobile (`sheetMotion` / `bottomSheetMotion` recipes in the kit).
- Local segmented controls use `LayoutGroup`, a shared `layoutId`, and `selectionSpring`. A schedule selection travels instead of blinking.
- Status pills cross-fade their label and spring their size. Preview entries use layout reflow, stable date keys, and `reflowTransition` for inserts/removals and moving siblings.
- Streamed lines arrive as three-line batches every three seconds; only the batch fades. The log follows new work only while the reader is at the end. Scrolling upward preserves reading position; Jump to latest restores following.
- Reduced motion retains cross-fades and feedback, removing shared-layout travel, springs, scaling and the real-progress pulse. Press feedback is provided by kit controls.

Live timers start only with Start live preview, Run now, or `?live=1`. Pause live preview freezes the demonstration clock; it is not a schedule pause. A run finishes after the fourth activity batch has been delivered. Manual runs do not resume a paused schedule.

## Addressable states

`?edit=order-sweep`, `?new=1`, `?run=run-106`, `?run=run-104`, `?run=run-105`, `?view=history`, `?state=empty`, `?state=error`, `?edit=order-sweep&saveError=1`, `?theme=dark`, `?live=1`. Other states have short `prepare` functions in `shots.mjs`.

## Screenshot index

All files are under `screenshots/routines/`. Mobile captures are 390 × 844; full-page list captures include all six helper states.

| Files | Evidence |
| --- | --- |
| `01-helpers-light.png`, `02-helpers-dark.png` | Desktop helpers list, both themes |
| `03-helpers-light-mobile.png`, `04-helpers-dark-mobile.png` | Full mobile list, both themes |
| `05-editor-light.png`–`08-editor-dark-mobile.png` | Desktop inspector and mobile bottom sheet, both themes |
| `09-cron-light.png`, `10-interval-dark.png` | Advanced cron and repeating interval preview |
| `11-validation-light.png` | New-helper field errors |
| `12-unsaved-light.png` | Discard confirmation over an unsaved editor |
| `13-live-light.png`–`15-live-light-mobile.png` | Live run, desktop themes and mobile |
| `16-completed-light.png`, `17-completed-dark-mobile.png` | Completed run and filed tasks |
| `18-expanded-tool-light.png` | Expanded tool activity |
| `19-failed-run-dark.png` | Failed run with schedule explanation |
| `20-history-light.png`, `21-history-dark-mobile.png` | Run history |
| `22-sign-in-light.png` | Simulated reconnect step |
| `23-cancel-dark.png` | Destructive cancellation confirmation |
| `24-empty-light.png`, `25-empty-dark-mobile.png` | No helpers yet |
| `26-error-light.png`, `27-error-dark-mobile.png` | Recoverable local connection failure |
| `28-save-error-light.png` | Failed save with draft retained |
| `29-no-results-light.png` | Search with no matching helpers |
| `30-reduced-motion-mobile.png` | Reduced-motion editor |
| `31-editor-filmstrip.png` | Inspector entrance frames |
| `32-schedule-filmstrip.png` | Traveling selection and schedule preview reflow |
| `33-status-filmstrip.png` | Resume status cross-fade and pill reshape |
| `34-push-filmstrip-mobile.png` | Hierarchical mobile run push |
| `35-preview-light-mobile.png` | Full next-three-run preview in the mobile sheet |
| `36-cron-validation-dark-mobile.png` | Invalid cron fields with preview withheld |
| `37-delete-confirmation-light.png` | Helper deletion confirmation |
| `38-cancelled-run-light.png` | Cancelled run and retained-history explanation |
| `routines-motion-editor-{desktop,mobile}.webp` | Inspector entrance and dismissal |
| `routines-motion-schedule-{desktop,mobile}.webp` | Schedule segment travel and preview reflow |
| `routines-motion-status-{desktop,mobile}.webp` | Resume and live status reshape |
| `routines-motion-push-pop-{desktop,mobile}.webp` | List-to-run push and back pop |
| `routines-motion-live-log-{desktop,mobile}.webp` | Real-time batches, log following and final summary |
| `axe.json` | Accessibility results for all still captures |

## Local kit candidates

The frequency segments, status-cross-fade pill, schedule parser/preview, and batched run-log following are implemented locally because they are domain-specific compositions. A reusable `StatusPill` with cross-fade + spring resize and an accessible traveling `SegmentedControl` would make useful kit candidates.
