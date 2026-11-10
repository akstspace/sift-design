Use animation to show what changed and where things went. Let people interrupt movement and keep feedback useful with reduced motion.

# Motion

## Use the shared animation settings

Animation should help people follow the interface. Menus open from their buttons, selection highlights move between options, and dragged panels follow the pointer. If someone reverses an action, movement should continue from its current position rather than starting over. Controls stay usable while things move. If the layout has persistent navigation or a header, keep those regions still during page transitions; this does not require a sidebar or fixed app shell.

Use the spring presets in `tokens/motion.ts` and the matching CSS curves in `tokens/tokens.css`. A spring describes how movement slows and settles, rather than giving it a fixed end time. `visualDuration` estimates when most visible movement finishes; a small tail can continue afterward. Reuse the presets instead of tuning each component separately. Fades and color changes use short durations, not springs.

These settings describe how an interaction moves, not which features a product must contain. A reader can use disclosure, a store can use selection and filtering, an analytics view can use list reflow, and a conversation can use message arrival without adopting the blocks’ task model.

Do: retarget an existing motion value when intent changes. Don’t: reset an element to its entrance coordinates, replay a keyframe from the start, or add a timeout before accepting input.

## Choose a spring for the action

| Preset | Exact parameters | Use |
|---|---|---|
| `spring.smooth` | `type: "spring", visualDuration: 0.28, bounce: 0` | Pages, inspectors, disclosure, list reflow |
| `spring.snappy` | `type: "spring", visualDuration: 0.2, bounce: 0.12` | Menus, popovers, toggles, small objects |
| `spring.lively` | `type: "spring", visualDuration: 0.32, bounce: 0.22` | Rare real success; never routine navigation |
| `spring.press` | `type: "spring", visualDuration: 0.12, bounce: 0` | Press and release |
| `spring.travel` | `type: "spring", visualDuration: 0.3, bounce: 0` | Full-width pushes and bottom sheets |
| `spring.exit` | `type: "spring", visualDuration: 0.16, bounce: 0` | Quicker, overshoot-free departure travel/scale |
| `shellSpring` | stiffness 560, damping 48, mass 0.8 | Explicit confined rail collapse/reflow |
| `selectionSpring` | stiffness 700, damping 48, mass 0.6 | Shared selected backing |
| `titleMorph` | stiffness 560, damping 46, mass 0.7 | Shared title lifting into a heading |

All stiffness/damping/mass presets have `type: "spring"`. All visualDuration values are seconds. Keep their units intact.

| Fade token | Seconds / CSS | Use |
|---|---|---|
| `duration.instant` / `--dur-instant` | 0.08 / 80ms | Immediate exit feedback |
| `duration.quick` / `--dur-quick` | 0.14 / 140ms | Short entrance, press highlight release |
| `duration.base` / `--dur-base` | 0.18 / 180ms | Small fade/exit |
| `duration.move` / `--dur-move` | 0.34 / 340ms | Retained compatibility value; do not use for new spatial travel |
| `settle` / `--ease-settle` | `[0.16, 1, 0.3, 1]` | Compatibility easing when a duration is appropriate |
| `leave` / `--ease-leave` | `[0.4, 0, 1, 1]` | Fade exit easing |

Keep ordinary opacity/color feedback within the shared 80–200ms range. `arrivalMotion` has a deliberately short 60ms opacity exit in reduced motion. Spatial departures in the shared helpers use a spring; opacity has its own short transition. Do not use a fade duration as the transform transition. The recipes below document each helper’s exact exceptions, such as the linear fades in `pushMotion`.

## Use matching CSS curves and durations

| Easing | Paired duration | Role |
|---|---|---|
| `--spring-smooth` | `--spring-smooth-duration`: 538ms | No-overshoot travel |
| `--spring-snappy` | `--spring-snappy-duration`: 358ms | Small anchored objects |
| `--spring-lively` | `--spring-lively-duration`: 562ms | Rare success |
| `--spring-press` | `--spring-press-duration`: 263ms | Press/release |
| `--spring-travel` | `--spring-travel-duration`: 572ms | Full-width push/sheet travel |
| `--spring-exit` | `--spring-exit-duration`: 335ms | Quicker departure |

Each easing is an exact generated `linear(...)` sample sequence in `tokens.css`. Pair the easing with its own duration; do not shorten the duration to the visualDuration and compress the curve twice. The long tail is intentional: most motion is visually done before the entire sampled curve ends. Use `scripts/spring-easing.mjs` for regeneration rather than hand-editing samples. Use the travel and exit twins for matching CSS travel roles; use JS springs when real release velocity must be preserved.

```css
.press-surface {
  transition: transform var(--spring-press-duration) var(--spring-press),
    background-color var(--dur-quick) linear;
}
.press-surface:active { transform: scale(0.97); }
@media (prefers-reduced-motion: reduce) {
  .press-surface { transition: background-color var(--dur-quick) linear; }
  .press-surface:active { transform: none; }
}
```

Prefer transitions for rapidly toggled CSS state because they reverse from the currently displayed value. JS springs preserve velocity more faithfully during retargeting; do not claim a CSS easing reproduces every release-velocity case. Never run a CSS transform animation and a JS transform spring on the same element.

The kit already owns animation for its controls and overlays. Its CSS, Radix, Vaul, or Sonner lifecycle can differ from a lower-level Motion helper; do not layer a helper on top or assume they have identical entry and exit values. See the [component guides](components.md) for the actual primitive behavior. For example, the kit’s Sheet becomes a bottom sheet on small screens, while `sheetMotion(reduced, true)` describes a side-edge inspector.

## Let animations reverse without a jump

Use a persistent motion value/element identity. On reversal, target the new destination without remounting the active object. Let the spring carry its current velocity; do not reset position or set velocity to zero unless deliberately stopping direct manipulation. Use release velocity only after a real drag; never invent momentum after a click.

Navigation, dismissal, selection, and editing stay usable during travel. Focus is granted when the new surface is ready, not after a spring’s mathematical tail. Do not disable input solely to prevent interruption. Preserve a draft, reading position, and active drag through live updates.

Do: reverse an opening sheet with the same motion value. Don’t: unmount it, wait, then start a close animation from the fully open coordinate.

## Make drags follow the pointer

Within bounds, drag follows the pointer 1:1. Apply `rubberBand(overshoot, dimension)` only to the distance beyond a known bound. The helper uses constant 0.55 and returns `sign × (1 - 1 / ((abs(overshoot) × 0.55) / dimension + 1)) × dimension`. Pass a measured positive dimension; this function has no guard for a zero-sized region.

Apply resistance only when dragging past a limit, such as pulling a bottom panel above its open position or a carousel beyond its last item. On release, use the actual release speed and shared spring to settle at a supported position. Each component defines how far a drag must go to dismiss it; there is no single global threshold. Make scrolling and dragging work together, and cancel interrupted gestures cleanly.

```tsx
import { animate, useMotionValue, useReducedMotion } from "motion/react";
import { rubberBand, spring } from "../../../tokens/motion";

// Inside a component. `limit`, `dimension`, `target`, and `velocity`
// come from the actual gesture/layout, never decorative constants.
const reduced = !!useReducedMotion();
const y = useMotionValue(0);
function follow(raw: number, limit: number, dimension: number) {
  y.set(raw < limit ? limit + rubberBand(raw - limit, dimension) : raw);
}
function release(target: number, velocity: number) {
  if (reduced) y.set(target);
  else animate(y, target, { ...spring.travel, velocity });
}
```

This snippet handles resistance and release only. The surrounding component must still handle scrolling, cancelled pointer events, keyboard actions, focus, and closing.

Reduced direct manipulation: drags still follow the pointer and controls still work; settle immediately without momentum, elastic flourishes, or springs. Keep an equivalent button/keyboard action for every gesture-only operation.

## Give press feedback without slowing activation

Use `pressable(reduced)` on tappable surfaces larger than a checkbox. It applies `whileTap: { scale: 0.97 }` and `spring.press`; on release the surface springs to rest. Keep the pressed highlight instant, then fade it on release over 140ms. Keep menu-item highlights instant for keyboard speed; do not spring the pointer’s scan through a menu.

Do not scale a whole layout region around a tiny target or scale every child independently. Press feedback never replaces a focus ring or a real selected state. Keep checkbox feedback specific to its state rather than adding a second generic press transform.

Reduced press: `pressable(true)` returns no transform behavior. Keep the instant highlight and short release fade. Never remove activation feedback merely because travel is reduced.

## Open elements from the expected place

Menus, selects, context menus, hover cards, popovers, and tooltips grow from their trigger. Use the matching `--radix-*-content-transform-origin` for Radix primitives or the positioning library’s equivalent; the Base UI Combobox uses `--transform-origin`. Do not grow a corner-anchored surface from the viewport center. `popoverMotion` enters opacity 0 / scale 0.94 → rest with `spring.snappy`, opacity 100ms linear; exits opacity 0 / scale 0.97 with `spring.exit` and a separate 100ms leave opacity fade.

`alertMotion` communicates foreground importance: enter from scale 1.06 / opacity 0 with `spring.snappy`, opacity 140ms linear; exit opacity 0 / scale 0.98 with `spring.exit` and a separate 120ms leave opacity fade. Do not use the alert scale for routine menus or static content cards.

Reduced popover and alert: 140ms fade in / 80ms out, no scale. Keep modal naming, initial focus, Escape, scroll lock, and focus return independent from animation.

## Match page movement to the navigation

### Switching between pages at the same level

Use `pageMotion(reduced)` for sibling views when a directional transition helps explain their relationship. Incoming content starts opacity 0 and x = sign × 14px, arrives at x 0 with `spring.smooth`, and fades to full opacity over 200ms linear. Outgoing content travels x = sign × -10px on `spring.exit`, with opacity independently fading over 140ms leave.

Derive sign from meaningful destination order rather than an arbitrary URL comparison. Use `AnimatePresence mode="popLayout" initial={false}` with `custom={sign}` on both presence and frame. Incoming and outgoing content overlap without a blank frame; do not move persistent navigation with them. Key by route identity, not by every refreshed record. Do not invent an ordered relationship just to add travel; a short fade is sufficient when direction conveys nothing.

### Opening details and going back

Use `pushMotion(reduced, mobile)` for list-to-detail and back. Stack pages in the same grid cell. Forward pushes the incoming page from the trailing edge while the outgoing page slides partly behind and dims; back reverses those roles.

On small screens, front is `100%` and behind is `-28%`; opacity stays 1, `spring.travel` moves the arriving page and `spring.exit` the leaving one. On desktop, front is 56px and behind is -28px, using `spring.smooth`; opacity enters over 200ms and exits over 160ms linear. The behind layer uses `brightness(0.94)` and the front uses `brightness(1)`. Keep that bounded filter on the work surface, never the entire shell. The helper is authored for its trailing-edge direction; adapt deliberately for a different reading direction rather than calling the numeric sign a universal direction solution.

Reduced siblings/hierarchy: 140ms incoming and 80ms outgoing opacity, no translation, dimming travel, scale, or springs. Preserve semantic back behavior and focus/scroll restoration.

## Open panels from the side or bottom

`sheetMotion(reduced, mobile)` is the edge inspector. Desktop starts x 64px / scale 0.985 / opacity 0 and settles with `spring.smooth`; opacity becomes 1 over 140ms linear. Its exit uses x 40px / scale 0.99 on `spring.exit`, with a separate opacity fade of 160ms leave after 20ms. Small-screen edge inspectors use x `100%`, `spring.travel` in, and `spring.exit` out; opacity remains 1 during the mobile exit.

Use `bottomSheetMotion(reduced)` for modal small-screen sheets: y `100%` → 0 with `spring.travel`; dismiss to y `100%` with `spring.exit`. Permit downward direct dismissal where the component contract supports it; use rubber-band resistance beyond open and spring settling with release velocity. Keep the close button and keyboard path; dragging is not the only way out. A navigation rail remains attached to its own edge instead of becoming an unrelated bottom sheet.

Reduced edge inspector: x 0 / scale 1, 120ms fade in / 80ms out. Reduced bottom sheet: 140ms in / 80ms out, no y travel. Keep overlay lifecycle and focus management synchronized, but do not block focus until the spring tail ends.

If a product supports expanding a panel to a full page, preserve scroll position and use a shared spring for the size change. Header and footer controls should stay at their own size; do not stretch text. Expansion is an optional capability, not a requirement for every panel.

## Keep moving highlights and changing lists connected

Use `layoutId` for a backing or object that is truly the same thing, scoped per component instance. Shared navigation selections, segmented pills, tab indicators, and selected dates use `selectionSpring`. Keep text/icons above an aria-hidden backing; do not remount all labels to indicate selection. A record title may share a stable ID between its list cell and heading with `titleMorph`; never morph unrelated text merely because it occupies a similar position.

Use `layout` plus `reflowTransition(reduced)` on keyed inserted/removed/reordered rows so siblings close a gap instead of jumping. The helper returns `spring.smooth`, or `{ duration: 0 }` when reduced. Keep stable IDs and presence `initial={false}` so existing records do not replay arrivals after a refresh.

`arrivalMotion` starts opacity 0 / y -6px / scale 0.98 and arrives with `spring.smooth`; its exit uses opacity 0 / scale 0.98 on `spring.exit`, with opacity fading over 120ms leave. Reduced arrival fades in over 140ms and out over 60ms, without scale/travel. When an item moves between groups, show the real departure and destination arrival and reflow surrounding items. Do not invent an intermediate state or imply a shared-object flight when none is implemented.

Show successful outcomes through actual state and readable feedback. Attribution and undo belong where the product supports them, not in every success animation. Use `spring.lively` only for a restrained, meaningful success moment, not every save or data refresh. Copying, removal, and undo feedback follow the resulting records; there is no separate duplicate-animation token.

Reduced continuity: remove shared layout travel and springs, switch geometry instantly, retain short opacity feedback. Do not leave a layoutId active and assume a CSS media rule stops its JS spring.

## Keep expanding sections and updates readable

Use the kit’s measured disclosure mechanism. Spatial expansion/reflow uses the shared spring, with overflow hidden only during the transition and restored afterward so focus is not clipped. Avoid per-frame alternating geometry reads/writes; use measured height only when the region actually pushes surrounding content. Rotate a disclosure mark with a small spring, not a new timed travel curve.

Coalesce rapid external changes when this improves readability, but do not adopt an example’s refresh interval as a global requirement or delay feedback to a person’s action. Preserve the item someone is editing, reading, or dragging. Do not animate each word of a reply or replay entrances for existing records. In a conversation, follow new messages only while the reader is near the bottom; otherwise keep their place and offer “Jump to latest.” Give screen readers a useful summary rather than every small change.

Reduced disclosure: immediate geometry plus useful short fade; reduced updates preserve the same data behavior and readable state without travel. A running indicator must reflect actual work, stop when work ends, and have a textual status.

## Keep drag and drop quick and predictable

Choose drag activation for the content, device, and gesture library. Touch scrolling should remain available before activation, and opening a record must not accidentally begin a drag. Do not copy a task board’s distance, delay, keyboard directions, or status transitions into an unrelated collection. Provide a visible move/reorder action for people who cannot drag, plus the library’s documented keyboard path and announcements.

Keep pointer-following direct. If a preview duplicates the original, make the duplicate inert, aria-hidden, and non-interactive; keep the real control and its accessible identity intact. Portalling a preview can avoid transformed-ancestor coordinate problems, but test the actual scroll and layout arrangement. Settle only a real directly manipulated object and spring-reflow siblings; do not add a theatrical bounce or a drop flight the implementation does not support. Reduced drag retains pointer following and keyboard announcements without inertia flourishes.

## Apply motion only to features the product needs

For a setup flow, keep steps oriented around a stable heading or progress structure. Preserve supported skip, revisit, and retry paths; expose a real connection test only when a connection needs testing. Use sibling or hierarchy springs according to the actual relationship, not a generic timed slide. Keep controls available immediately. Do not fake connection success, percentages, or setup waits.

Use shared springs with no delay to input or focus. If a sequence genuinely needs staggered items, use no more than five, spaced 25–30ms apart. Routine movement should look settled in roughly 250–400ms; the remaining spring tail is not a reason to delay input. Do not add scroll-triggered entrances to ordinary product content.

For a conversation, preserve the composer draft and reading position. If chat expands from a launcher into a panel, keep that transition connected and return focus on close; a full-page conversation does not need a launcher or dock. Use a polite additions-only log and attribute messages or tool results when present. Never animate token-by-token. Use shared springs for geometry and short fades for content handoff.

Toasts use the kit lifecycle and represent real outcomes. Supported swipe dismissal follows the pointer, resists bounds where relevant, and settles using release velocity; retain a close action and accessible announcement. Do not invent a universal dismiss threshold or display timeout. Essential undo remains discoverable beyond a disappearing toast. Reduced toasts retain message/fade/actions without travel or momentum.

## Keep focus safe and animations fast

Outgoing route frames are visual-only: use `useIsPresent()` to set `inert={!present}` and aria-hidden when leaving. Do not leave two focusable copies active during overlap. Keep focus visible through clipping, transforms, and pinned controls. Return focus to the trigger or logical surviving item on close; preserve scroll/drafts, and let active dialogs own keyboard shortcuts.

Use transform and opacity by default. Bound brightness/filter effects; never animate full-page blur for decoration. Apply `will-change` only around known work and remove it afterward. Do not animate margins/top/left/padding merely to move a surface; reserve measured layout changes for actual disclosure/reflow and supported structural resizing. Measure geometry once, batch writes, and avoid per-frame layout thrash.

Looping effects must represent actual activity. Keep idle navigation still. Do not add decorative card lifts, confetti, constant glows, fake progress, page-wide entrance cascades, or movement on the content someone is editing.

## Review frames and real-time motion

For this repo’s runnable examples, run `node scripts/capture.mjs <example> --shots shots.mjs --axe` from the repo root. Named shots write `<shots-name>-axe.json`. In another product, use its capture setup to exercise the same relevant checks: both themes, desktop, 390px mobile, reduced motion, rapid reversal, keyboard, focus return, scroll preservation, and editing or dragging during updates where supported.

Use timestamped filmstrips to judge curves and opacity layering. A baseline capture uses frames `[0, 60, 120, 200, 360]`; inspect the actual spring tails too, not only the old duration boundary. Check 100/140/160/200ms fade boundaries where applicable; inspect the shared spring’s visualDuration and full generated CSS duration separately. A sheet should be opaque before travel ends; an exiting frame must already be inert.

Record real-time animated WebP clips for key interactions on desktop and 390px mobile where relevant: `video: { trigger: async (page) => { /* real input */ }, duration: 1200 }`. Name recordings `<family>-motion-<interaction>.webp`. Inspect filmstrip PNGs to judge each stage and recordings to judge real-time movement. A still alone cannot show whether animation works. Do not claim to have tested a screen you did not exercise.

## Copy the shared presets

Paths below assume `blocks/<name>/src`; adapt imports to the consuming project. These snippets demonstrate lower-level helpers, not replacements for the kit’s already animated components. A custom modal still needs accessible naming, focus management, scroll lock, and return focus; a custom route transition still needs heading focus and history/scroll restoration.

```tsx
import type { ComponentProps, ReactNode } from "react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { pageMotion, pushMotion, type Direction } from "../../../tokens/motion";

function Frame(props: ComponentProps<typeof motion.div>) {
  const present = useIsPresent();
  return <motion.div {...props} inert={!present} aria-hidden={present ? undefined : true} />;
}

export function WorkSurface({ routeKey, sign, mobile, hierarchy, children }: {
  routeKey: string; sign: Direction; mobile: boolean; hierarchy: boolean; children: ReactNode;
}) {
  const reduced = !!useReducedMotion();
  const variants = hierarchy ? pushMotion(reduced, mobile) : pageMotion(reduced);
  return <div className="grid">
    <AnimatePresence mode="popLayout" initial={false} custom={sign}>
      <Frame key={routeKey} custom={sign} variants={variants}
        initial="enter" animate="visible" exit="exit" className="col-start-1 row-start-1">
        {children}
      </Frame>
    </AnimatePresence>
  </div>;
}
```

```tsx
import { motion, useReducedMotion } from "motion/react";
import { arrivalMotion, reflowTransition, pressable, bottomSheetMotion,
  selectionSpring } from "../../../tokens/motion";

// Inside components; scope selectionId with a stable per-instance ID.
const reduced = !!useReducedMotion();
const row = <motion.article layout={!reduced} {...arrivalMotion(reduced)}
  transition={{ ...arrivalMotion(reduced).animate.transition,
    layout: reflowTransition(reduced) }} />;
const action = <motion.button {...pressable(reduced)}>Save changes</motion.button>;
const bottom = <motion.section {...bottomSheetMotion(reduced)} />;
const selection = <motion.span aria-hidden initial={false}
  layoutId={reduced ? undefined : selectionId}
  transition={reduced ? { duration: 0 } : selectionSpring} />;
```

Apply a preset once, not to both the kit wrapper and a nested child. Keep a persistent key for interrupted objects. Keep menu highlights instant and do not apply press scale to the entire surrounding layout.

## Loops show real activity only

Spinners, pulses, typing indicators, carets, shimmers and scanning effects run only while the operation, stream, pending input or tracking they stand for is actually active. A countdown is tied to the real remaining time, never an invented progress bar. Prefer `transform` and `opacity` for these loops; background-position sweeps, color flashes and shadow transitions are exceptions to justify, not defaults. Reduced motion stops the loop and keeps a static indicator.

## Checklist

- Spatial travel/scale, including departures, uses shared springs; opacity has its own short fade.
- Retargeting preserves current position/velocity and never delays input or focus.
- Drags follow 1:1 in bounds, resist only beyond bounds, and settle from real release velocity.
- Origin, direction, sibling/hierarchy relationship, selection continuity, and list reflow are correct.
- Press feedback is restrained; menu highlights remain instant; loops reflect actual progress only.
- Reduced motion keeps feedback and gesture operation without springs, travel, scale, blur, or momentum.
- Filmstrips and real-time recordings cover both themes, desktop/mobile, interruption, focus, and scroll ownership for shipped motion.
