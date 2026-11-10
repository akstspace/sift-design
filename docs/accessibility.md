Target WCAG 2.2 AA with keyboard-complete paths, visible focus, sufficient contrast, and readable live updates.
Treat Sift as evidence of patterns, not proof that every legacy control already conforms.

# Accessibility

## Keep focus visible and unobscured

Use a 2px `--focus-ring` outline with 3px offset for custom controls; use `--rail-ring` in the rail. Preserve the kit’s focus-visible contract rather than layering competing outlines/rings. Sift’s kit controls also use a 3px ring and custom controls have contextual offsets; this is not permission to remove focus styling. Keep focus clear of clipping, pinned footers, overlays, and scroll boundaries.

For a card with a stretched title hit area, outline the card when the title is focused; keep completion, drag grip, disclosure, and nested controls independently reachable. Do not apply `outline: none` without an equivalent visible replacement. Do not make a keyboard-only control permanently transparent when focused.

Do: leave focus rings visible inside the column’s scroll inset. Don’t: clip them with an overflow mask that remains after disclosure settles.

## Preserve complete keyboard paths

- Offer a skip link to main content; use semantic header/navigation/main regions and real headings.
- Make destinations links and operations buttons. Keep persistent labels for form fields; do not rely on placeholder text alone.
- Keep native/kit select, combobox, menu, tab, switch, date, and dialog semantics. Implement the pattern’s arrow keys, Enter/Space, Escape, and expected focus behavior; do not invent competing shortcuts on individual wrappers.
- Keep collapsed rail icon labels available through accessible names and tooltips. Keyboard focus must not depend on a hover state.
- Keep drag accessible: a separate grip lifts with Space/Enter, Left/Right chooses a workflow column, Space/Enter drops, and Escape cancels. Announce meaningful pickup/target/drop/cancel state. Opening a task title must not start a drag.
- Adding a schedule moves focus to its new input; removing one moves focus to a surviving row action or the add action. Do not let focus fall to the body.
- Let active dialogs, alert dialogs, popovers, and text fields own their keys. App/chat shortcuts must not fire over a modal or interfere with typing.

## Keep targets usable

Meet WCAG 2.2 AA’s 24px target-size minimum or its valid spacing/exception conditions; do not assume a small visual glyph proves a violation or a pass. Sift’s task-check target is 24px and some actions are 25/26/28px, while its checkbox glyph is 16px. Give small glyphs a larger real hit area or associated label without overlapping neighboring actions.

Use Sift’s 44px touch target treatment where applicable: mobile rail rows are at least 44px, and coarse-pointer session/day/link actions expand a centered hit area to `max(100%, 44px)`. Keep those expanded areas from overlapping; Sift adds surrounding spacing for this reason. Keep row actions visible on devices without hover.

Do: distinguish visual density from hit-area size. Don’t: shrink mobile controls to fit a desktop toolbar; wrap or change composition instead.

## Test contrast on the real background

Require 4.5:1 for ordinary text and 3:1 for large text and essential non-text controls. Check the actual state/background, including hover, selected, error, and dark mode. See [color](color.md) for computed token pairs and [data visualization](data-visualization.md) for categorical contrast warnings.

Use `--control-line` for essential field boundaries and `--line` for decorative dividers. The latter is deliberately too quiet for many control-boundary uses. The former also falls below 3:1 on some tinted/hover backgrounds; do not claim universal conformance. Fix the pairing or approved role use and re-test without inventing an undocumented color.

Use a word and icon for status. Use a persistent label/legend and equivalent feed/table for data identity. Do not rely on red/green, pale wash, opacity, or a fleeting animation alone. Ensure link affordance is discoverable beyond hue.

## Provide meaningful reduced motion

Use `useReducedMotion()` in JS and `@media (prefers-reduced-motion: reduce)` in CSS. Keep short fades, color changes, text, and real-state feedback; remove x/y travel, rotation, scale, blur, stagger, and layout springs. Use the explicit equivalent for each recipe in [motion](motion.md).

Disable looping/spatial loading treatments in reduced motion and keep a readable busy/status label. Do not animate streamed tokens, the idle shell, or decorative backgrounds. Preserve keyboard access and state feedback without waiting for animation completion. Sift’s blanket 0.01ms CSS reduction and several unguarded JS transforms are recorded inconsistencies; new kit/example work must meet the stronger canonical contract rather than reproduce them.

## Announce useful updates, not streams

Use `role="status"` for nonurgent busy/connection/save outcomes and polite aggregate helper updates. Use `role="alert"` for an error that requires immediate attention after an action. Do not make every task mutation assertive.

Sift’s conversation scroll area uses `role="log"`, `aria-live="polite"`, and `aria-relevant="additions"`; run transcript reading uses `aria-live="off"` so continuous output does not dominate assistive technology. Preserve that distinction. Do not repeatedly reinsert the same message or announce every streamed token. Keep a textual result accessible when a loading indicator stops.

The task board does not have a blanket live region in Sift. For derived helper-update UI, provide a concise batched polite summary rather than marking the entire board live. Do not claim a Sift announcement exists when it does not.

## Manage dialogs and sheets as dialogs

Use the kit’s focus-managed primitive with an accessible title/description, Escape dismissal where appropriate, scroll lock, a reachable close button, and a sensible initial focus. Keep the background inert while modal. Preserve the draft guard for unsaved work; do not silently close a busy/destructive operation or confirm through backdrop interaction.

Return focus to the trigger on close; when that record was removed, choose a logical surviving task or nearby action. Preserve board scroll and task reading anchor. On mobile, keep the rail and detail sheet fully usable with the same focus/keyboard contract, not just a visual panel.

During overlapping route exits, apply Sift’s `PresenceFrame` behavior: outgoing content is inert and aria-hidden until removed. Never leave duplicate focusable controls or duplicate live regions active just because both frames are visible.

## Verify semantics and reading order

Keep DOM order meaningful without CSS or animation. Use labels and fieldsets for schedule groups; use error descriptions linked to the relevant inputs. Keep headings honest and avoid using a heading merely to get larger text. Mark decorative icons/backings aria-hidden and name icon-only actions. Supply attachment/image alternatives appropriate to their actual content. Keep the chronological feed readable as a list, with exact durations/time spans available outside visual bars.

## Checklist

- Keyboard alone reaches and operates every supported path, including drag/drop and recovery.
- Focus is visible, unobscured, trapped only in active modals, and returned after close.
- Targets meet size/spacing requirements; touch hit areas do not overlap.
- Actual state/background contrasts pass; color is never the sole meaning.
- Reduced motion retains feedback without spatial travel or springs.
- Live regions are polite/batched where appropriate and do not announce each token.
- Both themes and mobile pass automated axe checks plus manual keyboard/assistive-technology review in the agreed scope.
