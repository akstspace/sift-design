Build product patterns from real state, not from a demo component inventory.
Keep task anatomy, helper attribution, recovery, and focus behavior intact across board, list, and detail views.

# Components

Use `packages/ui` for primitives and interaction semantics. Read the family contracts before composition: [overlays](../packages/ui/docs/overlays.md), [controls](../packages/ui/docs/controls.md), and [display](../packages/ui/docs/display.md). Do not import pristine upstream copies. This document specifies product patterns rather than duplicating per-family APIs.

## Task card and compact row

Keep anatomy in this order: completion action, readable title with optional topical icon, task metadata, parent/child progress and disclosure, and nested real subtasks. Show priority only when useful; Larkspur’s Normal default is not badged. Use project/area, due state, tags, and helper attribution only when actual data exists. Do not fill every card with every possible property.

Use a 12px radius, surface background, quiet border, and `16px 14px 14px` padding. Make the title’s hit area cover the card without swallowing the independent completion, disclosure, status, and nested-task controls. Use a visible whole-card focus outline when the title is focused. Hover changes the border; selection uses the accent border. Completed titles strike through and use muted ink; retain readable identity.

Compact rows use a bottom divider, no outer radius/background, minimum 70px height, and `15px 10px` padding. Do not remove context just to force a single-line row. Preserve nested tasks; a child remains independently actionable without being duplicated as a default top-level card. Distinguish checklist progress from real child-task progress.

## Board columns

Use a semantic section with status mark, heading, actual count, and labeled add button. Keep the header 48px high and task stack gaps 8px. Empty columns offer a direct add action, not filler cards. Respect the user’s column order and stable status identifiers. Sift has exactly one completion column; custom columns remain active work.

Make drop targets visibly respond using the accent wash. Keep mouse/touch dragging and the keyboard grip separate from opening a title. Preserve scroll while dragging. See [motion](motion.md) for the exact activation and overlay behavior.

Do: derive counts from actual tasks. Don’t: display a fabricated count to make a column appear active.

## Toolbars and filters

Place the result scope near filters and the board/list toggle. Show a count of active filters only when filters are active. Keep search terms visibly attributable to the result set, clearable, and bounded rather than allowed to displace primary actions. Use labeled toggles with a persistent selected state; icons supplement labels.

Keep filters together above the affected work. Disclosure must not reset values or scroll the person away from their task. Distinguish a genuine empty workspace from a filtered no-match state and offer the appropriate create/clear action.

## Attached detail sheet

Use a right-edge inspector with pinned top controls, a scroll body, and pinned action area. Include title editing, task properties, description/Markdown, attachments, checklist, real subtasks, time spent, and activity only as supported by the record. Keep failures near the action they affect, not only in a toast.

Preserve board scroll on open/close and reading anchor when expanding panel to page. Keep header/footer controls at their own size during the morph; do not stretch the text. When the title scrolls out of the expanded view, reveal its header equivalent. Preserve draft guard behavior before leaving or switching records. Restore focus to the trigger or a logical surviving row after close.

## Activity and attribution lines

Show actor (person or helper badge), action, affected object, and time. Add the concise reason and evidence links where supplied. Use plain language, not raw JSON diffs. Keep provenance attached to automated changes, including completion/reopening and automatic parent changes.

Offer review acknowledgment separately from undo: acknowledgment says the person saw a change, not that it happened differently. Offer undo only for an eligible current change; Sift checks the recorded revision against the current task revision. Do not advertise an undo that would silently overwrite newer work.

## Notices and inline errors

Use a calm icon-plus-word state with specific cause and next action. Use `role="status"` for nonurgent connection/busy feedback and `role="alert"` for blocking action errors. Keep long diagnostics behind a named disclosure/copy action without hiding the actionable sentence. Retain the form draft after failure.

A reconnect grace period is not an outage. Do not immediately show a red disconnection banner on the first transport retry. Failed runs, paused schedules, and expired sign-ins require different copy and actions.

## Empty states

State what is absent and offer the next valid action. Distinguish no work, no matches, no time recorded, no tracker configured, and a read failure. Hide an irrelevant time section when neither tracking nor sessions exist rather than manufacturing an empty metric. Empty columns get an inline add action; a whole empty workspace may get a larger centered explanation. Do not use illustrations, sample data, or motivational filler as a substitute for the action.

## Confirmation and undo

Use an explicit confirmation for irreversible/destructive or consequential operations; name the object and consequence. Keep cancel visually available, choose a safe initial focus, and never make closing an overlay submit the action. Show progress only while a real request runs; report a failure without dismissing the form prematurely.

Prefer undo for eligible reversible task changes. Keep stale-revision protection and refresh/re-read guidance. Preserve the distinction between stopping a run, pausing a schedule, deleting a task, archiving it, and restoring it. A toast may confirm success, but essential recovery remains discoverable in context/history.

## Live updates

Batch change notifications before refreshing; preserve keyed records so already-present cards do not replay arrival motion. Keep the task being edited, read, or dragged stable. Never animate streamed tokens individually. Announce a useful aggregate outcome rather than overwhelming the live region with every diff.

## Forms and settings rows

Use persistent field labels, nearby hints, sensible grouped rows, and inline validation. Keep settings descriptions and their controls aligned but let them stack at Sift breakpoints. Use a switch for a true enabled/disabled setting and a button for an operation. Show saved/unsaved/error state honestly; do not quietly discard a draft on external refresh.

Use searchable choice controls for long task/entity/icon lists, not an unbounded native select. Use a named date entry plus picker, preserve typed input, and handle invalid dates with plain guidance. Keep disclosure and overlays keyboard-complete.

## Schedules and status pills

Group each schedule as a labeled fieldset with repeat type, local time/interval/cron input, optional weekdays, and a remove action. Keep timezone visible and describe the combined next-run behavior in plain words. Sift supports at most 20 schedules per job and requires at least one; do not leave an enabled job without a schedule. After adding/removing a row, move focus to the new input or a nearby surviving control.

Distinguish running now, next run, paused by a person, paused automatically with reason, failed run with schedule continuing, and needs action. Use icon plus label, not just a colored dot. Show the next occurrence only when computed from real schedule state. Keep stop and pause actions semantically distinct.

## Chat transcript

Keep chat contextual: a dock expands from its own pill; the task workspace remains primary. Separate person messages, helper responses, thinking disclosures, tool calls, result cards, notices, and questions. Show tool name, meaningful summary, state glyph, optional duration, and expandable details. Attribute resulting task changes and link back to the records.

Use a polite additions-only log for conversation, not an assertive stream of tokens. Auto-follow only while the person is already near the latest message. If they scroll back, preserve position and offer a jump-to-latest action. Keep the composer draft, keyboard shortcut ownership, slash-menu semantics, attachments, stop action, and question timeout outcomes explicit. A spinner or timer must reflect a real running operation/deadline.

Do: expose what a helper did and whether it succeeded. Don’t: turn every low-level tool event into an interruptive toast or repeated entrance animation.

## Checklist

- Board, compact row, and detail preserve the same task semantics.
- Helper changes expose actor, reason, evidence when present, and eligible undo.
- Empty, no-match, loading, failure, and paused states are distinguishable.
- Forms retain drafts; overlays return focus; schedule row edits keep a logical focus path.
- Live updates and transcript additions do not steal reading/drag ownership.
