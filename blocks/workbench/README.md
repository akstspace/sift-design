# Larkspur daily workspace

A daily task board for the fictional Fernbrook Greenhouse. The example is set on Tuesday 10 November 2026. You can edit tasks, switch views, and drag cards; reloading resets your changes.

This optional example demonstrates navigation, collection views, drag-and-drop, and detail panels. Its columns, completion notes, daily progress, and helpers belong to Larkspur; they are not requirements for products using the design system.

## Run

From the repository root:

```sh
npm run dev -w @larkspur/workbench
```

Open http://localhost:5302. Use `?theme=dark` for dark mode. No additional dependencies are needed.

```sh
npx tsc --noEmit -p blocks/workbench
npx vite build blocks/workbench
node scripts/capture.mjs workbench --axe
```

## What to try

- Toggle the navigation in the persistent header: 256px expanded, 72px icon rail. Below 768px it becomes a modal left-edge sheet; close it with its close button, backdrop, Escape, or a swipe toward the left edge.
- Switch between Today, All tasks and Areas. Today derives its daily progress from the actual task state.
- Switch between Board and List, search by title/area/tag/helper, or filter by priority and assignee.
- Drag a card into another column. Mouse movement has a 6px lift threshold; touch uses a 220ms press. For keyboard control, focus a drag handle, press Space, use Left/Right to select a column, then Space to drop. Escape cancels. Dropping into Done asks for a completion note.
- Open a task by its title. The right-edge inspector includes description, working checklist, working subtask checkboxes, properties and history. Expand it into a full-page task without remounting its contents. Close returns focus to the task.
- Run Climate watch using the helper button. Its timer starts only on request (or `?live=1`). It appends a new task to Open without changing the order of existing tasks. If a card is lifted, the arrival waits until the drag ends or is cancelled.
- Complete a task with a note. The task moves to Done, progress updates, and a twelve-second Undo toast restores its previous column and history.
- Open Areas, then an area. Its name lifts from the row into the heading; All areas reverses the relationship.
- Open the empty state and create the first task. An unmatched search instead offers Clear filters.

## Kit and motion recipes

The shell uses the kit's `SidebarProvider`, `Sidebar`, `SidebarMenuButton`, and `SidebarTrigger`; overlays and controls use `Dialog`, `Popover`, `Button`, `Input`, `Textarea`, `Checkbox`, `ToggleGroup`, `Empty`, and `Toaster`. Navigation uses `SiblingTransition` and `PushStack`.

| Relationship | Recipe |
| --- | --- |
| Rail collapse and shell reflow | Kit sidebar, `shellSpring` |
| Rail selection and board/list pill | Kit shared selection, `selectionSpring` |
| Sibling destinations and board/list change | `SiblingTransition` / `pageMotion` |
| Area push and return | `PushStack` / `pushMotion` |
| Area name becoming heading | Shared `layoutId` and `titleMorph` |
| Inspector opening and closing | `sheetMotion`; right edge at both widths |
| Inspector resizing | Motion layout and `reflowTransition` |
| New task and helper notice | `arrivalMotion`, spring layout reflow |
| Drag lift and release | Direct pointer geometry, `spring.snappy`, CSS twin `--spring-snappy` for the drop |
| Card and column reflow | `layout="position"`, `reflowTransition` |
| Daily progress line | Transform-only scale, `reflowTransition` |
| Completion note and Undo | Kit dialog and toast motion |

Reduced motion removes travel, springs, rotation, shared-element morphing and drop animation. Fades and state feedback remain. No ambient timers or looping decorative animations run.

The inspector is local because this surface specifically demonstrates a right-edge task sheet on phones too; the general kit Sheet adapts to a bottom sheet. It uses the same accessible dialog primitive and shared motion tokens.

## Reproducible states

Combine these with `theme=dark` as needed:

| Query | State |
| --- | --- |
| `?view=list` | Today's list |
| `?page=all&view=list` | All tasks list |
| `?page=areas` | Area overview |
| `?page=areas&area=Propagation%20house` | Area board |
| `?rail=collapsed` | Icon rail |
| `?open=FG-104` | Task inspector |
| `?open=FG-104&full=1` | Full-page task |
| `?state=empty` | Empty workspace |
| `?state=editing` | Task creation dialog |
| `?state=error` | Recoverable helper read error |
| `?search=orchid` | No search matches |
| `?filter=priority` | Urgent and high-priority tasks |
| `?live=1` | Requested helper filing simulation |

Completion, Undo, filter popover and open mobile navigation are reached by short `prepare` steps in `shots.mjs`.

## Screenshot reference

All paths below are inside `screenshots/workbench/`.

| Files | Coverage |
| --- | --- |
| `01-today-light.png`, `02-today-dark.png` | Main board, 1440×900 |
| `03-today-light-mobile.png`, `04-today-dark-mobile.png` | Main board, 390×844 |
| `05-icon-rail-light.png` | Collapsed rail |
| `06-all-tasks-list-light.png`, `07-all-tasks-list-dark.png` | List in both themes |
| `08-areas-light.png`, `09-area-detail-dark.png` | Area overview and detail |
| `10-inspector-light.png`, `11-inspector-dark.png`, `12-inspector-light-mobile.png` | Task sheet |
| `13-full-page-dark.png` | Expanded task |
| `14-empty-light.png`, `15-no-matches-dark.png` | Empty and filtered-empty states |
| `16-error-light.png`, `17-create-light.png` | Error recovery and creation |
| `18-live-dark.png` | Helper arrival |
| `19-completion-reason-light.png`, `20-completion-undo-light.png` | Completion note and undo toast |
| `21-mobile-navigation-dark.png` | Modal mobile rail |
| `22-list-dark-mobile.png`, `23-areas-light-mobile.png` | Narrow list and areas |
| `24-filters-light.png`, `25-reduced-inspector-dark.png` | Filters and reduced-motion inspector |
| `26-filmstrip-rail.png`, `27-filmstrip-area.png`, `28-filmstrip-inspector.png` | Five frames of each signature transition |
| `workbench-motion-rail-collapse.webp`, `workbench-motion-rail-collapse-mobile.webp` | Rail open and close |
| `workbench-motion-page-change.webp`, `workbench-motion-page-change-mobile.webp` | Today → All tasks → Areas → Today |
| `workbench-motion-area-drill.webp`, `workbench-motion-area-drill-mobile.webp` | Area drill in and back |
| `workbench-motion-inspector.webp`, `workbench-motion-inspector-mobile.webp` | Inspector open and close |
| `workbench-motion-drag-drop.webp`, `workbench-motion-drag-drop-mobile.webp` | Mouse drag and synthesized touch drag |
| `workbench-motion-live-arrival.webp`, `workbench-motion-live-arrival-mobile.webp` | Requested helper filing |
| `workbench-motion-completion-undo.webp`, `workbench-motion-completion-undo-mobile.webp` | Complete with a reason, then undo |
| `workbench-motion-mobile-rail-sheet.webp` | Mobile modal rail open and close |

## Verification and review

- Typecheck and production build pass. Vite reports a non-blocking bundle-size warning; this is a standalone reference with the complete interaction stack.
- Axe reports zero violations across all 25 still states, using WCAG 2 A/AA, 2.1 A/AA and 2.2 AA rules.
- Browser checks cover exact rail widths, keyboard column movement, completion and undo, checklist changes, full-page switching, focus restoration, deferred helper arrival during a drag, preserved task order, and mobile navigation without document overflow. Synthesized touch verifies a card drop into the next column and rail swipe dismissal. These are browser-emulated gestures, not physical-device certification.
- Review round 1 fixed missing narrow-screen action icons, rail accessible-name mismatches, undersized drag targets, clipped rail copy, and undersized metadata.
- Review round 2 fixed the helper's changing accessible name, completed the board/list transition and incoming-board reflow, and preserved inspector focus on close.
- Review round 3 fixed selected rail count contrast, inherited work-surface fills, and a helper-review button label wrapping over its arrow. It also verified pointer-based mobile drop collision.
- Final review found no actionable visual or accessibility findings. The detector's one remaining advisory is the 2px corner on the 8px Waiting on supplier status marker: intentional geometry to distinguish it from round status marks, not a container radius. All container radii use the prescribed scale.

Evidence includes `axe.json`. The review was performed directly in this task; it is not an independent dual-reviewer critique.

Kit candidates, not changed here: a reusable workflow board/card/row with queued arrivals, and a persistent task inspector with an explicit mobile edge option and full-page layout continuity. A typed `MotionProps` return for `sheetMotion` would remove the local typing bridge.
