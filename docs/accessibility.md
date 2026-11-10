Make content understandable and every action operable without relying on a mouse, color, or motion. Test the actual product; reusable components are a starting point, not proof of conformance.

# Accessibility

Target WCAG 2.2 AA. Apply the checks relevant to the features present: an article reader does not need a drag contract, a store does not need an automation log, and a conversation does not need a task board. Each still needs meaningful structure, readable content, accessible controls, and honest feedback.

## Keep focus visible and unobscured

For custom controls, use a 2px `--focus-ring` outline with a 3px offset, or `--rail-ring` on the sidebar’s dark background. Existing kit controls include their own focus styles, sometimes with a 3px ring; do not add a second competing outline. These are system styles, not a claim that one ring passes on every background. Check its actual contrast and visibility.

Make sure clipping, pinned controls, overlays, and scroll containers do not hide focus. Do not apply `outline: none` without an equivalent visible replacement. Controls revealed on hover must also appear on focus and remain available on devices without hover.

If a card’s title link has an extended hit area, show where its focus is and keep sibling actions independently reachable. Do not nest interactive controls inside that link or turn a multi-action container into one large button. Restore overflow after an expanding section settles so its focus indicator is not clipped.

## Make every action work with a keyboard

- Offer a way to bypass repeated navigation, usually a skip link to main content. Use appropriate landmarks and real headings; do not require a particular sidebar/header composition.
- Make destinations links and operations buttons. Keep persistent field labels; placeholders do not replace them.
- Preserve the native or kit control’s keyboard contract. Menus, tabs, comboboxes, switches, date pickers, and dialogs have different roles and keys; do not apply one wrapper-level shortcut to all of them.
- Give icon-only controls accessible names. A tooltip supplements a name; it does not make an otherwise unnamed control accessible. Include the visible label text in the accessible name when there is a visible label.
- Keep focus order consistent with meaning and visual order. Avoid positive `tabIndex` values and CSS rearrangements that make keyboard use jump unpredictably.
- When adding or removing repeated form rows, keep focus on the new input or a nearby surviving action rather than letting it fall to the document body.
- Let active dialogs and text fields own their keys. Global search, navigation, or chat shortcuts must not interfere with typing or a modal interaction.

For drag and drop, provide a keyboard path with meaningful pickup, target, drop, and cancel announcements. Also provide a single-pointer alternative that does not require dragging, such as a Move menu or reorder buttons; keyboard support alone does not satisfy WCAG’s dragging-movement requirement. Use directions and targets appropriate to the actual collection, not fixed left/right workflow columns. Opening a record must not begin a drag.

## Make controls easy to click or tap

Meet WCAG 2.2 AA’s 24-by-24 CSS-pixel target minimum or its applicable spacing and other exceptions. Assess the actual pointer target, not just the glyph. An icon can be visually small while a button or associated label provides the larger target.

Prefer at least 44-by-44 CSS pixels for frequently used touch actions when space allows. This is a usability recommendation, not the universal WCAG AA minimum. Expand hit areas without overlapping adjacent actions or making one control steal another’s input. Keep actions discoverable on touch; do not depend on hover.

Wrap or simplify a cramped toolbar rather than shrinking all of its controls to fit. Check target spacing at narrow widths and with enlarged text, not only at the reference desktop size.

## Test contrast on the real background

Require at least 4.5:1 for ordinary text and 3:1 for large text. WCAG large text means at least 18pt regular or 14pt bold, approximately 24px or 18.7px at standard CSS conversion; a 14px UI label is not large text. Essential visual information used to identify controls, states, and graphics generally needs 3:1 against adjacent colors. Check the applicable criterion and exceptions rather than treating every decorative border as a control boundary.

Test actual hover, selected, error, disabled, and dark states. Disabled controls have WCAG contrast exceptions but should remain understandable. See [color](color.md) for token pairings and [data visualization](data-visualization.md) for chart-color warnings.

Use `--control-line` for essential field boundaries and `--line` for decorative dividers. The latter is deliberately too quiet for many control-boundary uses; the former also falls below 3:1 on some tinted or hover backgrounds. Choose an appropriate token pairing or a reviewed shared fix and re-test. Do not claim that importing tokens guarantees contrast conformance.

Use words, shapes, patterns, or icons alongside color where meaning depends on a distinction. Make links discoverable beyond hue. Charts need persistent identification and a readable data alternative; add accessible outlines or patterns when essential marks otherwise fail contrast. A table does not automatically exempt an essential graphic from its own requirements.

## Support resizing, reflow, and alternative presentation

Keep content and controls usable at 200% text enlargement and with user text-spacing overrides. Test reflow at a 320 CSS-pixel viewport equivalent, commonly 400% browser zoom on a 1280px-wide viewport. Avoid two-dimensional scrolling except where the content genuinely requires it, such as a data table or map. A 390px mobile capture alone does not establish reflow conformance.

Allow labels to wrap and help text to grow. Do not fix field or message heights so enlarged text gets clipped. Keep dialogs and sheets operable on short screens and with a software keyboard. Test forced colors, browser zoom, and light/dark themes; important boundaries and focus should survive without relying on background fills alone.

## Respect reduced-motion settings

Use `useReducedMotion()` in JS and `@media (prefers-reduced-motion: reduce)` in CSS. Keep short fades, color changes, text, and real-state feedback; remove automatic x/y travel, rotation, scale, blur, stagger, and layout springs. Disable JS shared-layout movement explicitly; a CSS media rule does not stop a Motion spring. Use the equivalents in [motion](motion.md).

Deliberate dragging can still follow the pointer, but settle immediately without momentum or elastic flourishes. Stop looping loading effects in reduced motion and keep a readable status label. Do not animate each streamed word, idle navigation, or decorative backgrounds. Input and focus must not wait for animation. Avoid flashing effects and provide pause or stop controls for moving or auto-updating content where WCAG requires them.

## Announce useful updates, not every small change

Use `role="status"` for meaningful nonurgent outcomes such as a saved change or completed search. Use `role="alert"` for an urgent error needing immediate attention. Persistent explanatory text may need neither. Do not make every record update assertive or announce the same outcome in a toast, inline status, and live region simultaneously.

For a conversation, a polite `role="log"` with `aria-relevant="additions"` can announce new messages without repeating every streamed edit. The kit’s MessageScroller follows this pattern. A continuously updating diagnostic transcript may instead use `aria-live="off"` with an accessible summary so output does not dominate assistive technology. Choose by the content’s purpose, not by whether it came from a person or automation.

For other live collections, announce a concise result when useful, such as “12 products found” after a filter change. Do not make the whole page a live region. Keep the user’s reading position and focused control stable. An activity indicator needs a textual status and must leave a readable outcome when it stops.

## Manage focus in dialogs and panels

Use a focus-managed kit primitive for modal interactions, with an accessible name, appropriate description, reachable close action, sensible initial focus, and Escape dismissal where appropriate. Keep the background inert while the modal is active and prevent background scrolling. Preserve unsaved work and never make backdrop interaction confirm a destructive action.

A nonmodal split view or inline panel should not trap focus or inert the rest of the page. Choose that behavior deliberately; a visually side-attached Sheet is still modal. See the [overlay guide](../packages/ui/docs/overlays.md) for each primitive’s actual behavior and responsive treatment.

Return focus to the trigger after close; if it was removed, choose a logical surviving control. Preserve the underlying view’s scroll position and any active draft. When routes overlap during animation, make outgoing content inert and aria-hidden until removal. Avoid hiding an ancestor while focus remains inside it; move focus to the active view as part of the route lifecycle. Never leave two focusable copies or duplicate live regions active because both are still visible.

## Check structure, labels, and content alternatives

Keep DOM order meaningful without CSS or animation. Use fieldsets and legends for related controls, labels for inputs, and `aria-describedby` to connect help and errors. Set `aria-invalid` when appropriate. Name icon-only actions, hide decorative icons from assistive technology, and use actual headings rather than choosing heading elements for size alone.

Supply image alternatives that communicate purpose; use empty alt text for decorative images. File actions need readable file names and action labels, not just thumbnails. Use semantic tables with headers for comparable data and meaningful lists for collections. Add captions or transcripts for media as appropriate to its content and the applicable WCAG requirements. Set the document language and use direction-aware layout for the content’s actual language.

## Test more than automated rules

Run axe in representative states in both themes and at narrow widths. Then manually test keyboard paths, focus order and return, accessible names, screen-reader reading and announcements, zoom/reflow, forced colors, and reduced motion. Include error and recovery paths as well as success. Automation cannot prove that labels make sense, reading order is useful, or a workflow is complete.

Report the browsers, assistive technologies, states, and interactions tested. A zero-violation axe report covers those automated checks in those states, not universal WCAG conformance.

## Checklist

- Keyboard and non-drag pointer alternatives cover every relevant action and recovery path.
- Focus is visible, logically ordered, unobscured, trapped only in active modals, and returned after close.
- Targets meet size or spacing requirements without overlapping; touch actions do not depend on hover.
- Actual text, essential controls, states, and graphics meet contrast requirements without color-only meaning.
- Zoom, text enlargement, reflow, forced colors, both themes, and narrow layouts remain usable.
- Reduced motion retains feedback without automatic travel or springs; live regions do not announce every small update.
- Automated checks and manual assistive-technology review are reported honestly within the tested scope.
