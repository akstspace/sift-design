Make spatial changes spring-based, direct, and interruptible; keep the shell still.
Preserve velocity and shared-element continuity, and use short durations only for fades and color.

# Motion

## Use one physical language

Motion is the most important craft quality of this language. Make the work feel connected: an object travels from its origin, a selected backing moves between destinations, a sheet follows the pointer, and a reversed transition continues from its current position and velocity. Never make the person wait for motion. Keep the shell fixed while the work changes.

Use `tokens/motion.ts` for shared presets and `tokens/tokens.css` for generated CSS spring twins. Do not retune physics per component. A spring has a visual settling target rather than a fixed frame deadline; `visualDuration` is not the full mathematical settling time. Use short durations for opacity/color, not as a substitute for a spatial spring.

Do: retarget an existing motion value when intent changes. Don’t: reset an element to its entrance coordinates, replay a keyframe from the start, or add a timeout before accepting input.

## Pick a spring by role

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

Keep ordinary opacity/color feedback within the upgrade’s 80–200ms range. A disappearing item retains a 60ms reduced-opacity exit as a deliberately short feedback case. All spatial departures use a spring; their opacity is independently timed with `leave`. Do not use a fade duration as the transform transition.

## Use the CSS twins correctly

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

## Keep interruption and velocity intact

Use a persistent motion value/element identity. On reversal, target the new destination without remounting the active object. Let the spring carry its current velocity; do not reset position or set velocity to zero unless deliberately stopping direct manipulation. Use release velocity only after a real drag; never invent momentum after a click.

Navigation, dismissal, selection, and editing stay usable during travel. Focus is granted when the new surface is ready, not after a spring’s mathematical tail. Do not disable input solely to prevent interruption. Preserve a draft, reading position, and active drag through live updates.

Do: reverse an opening sheet with the same motion value. Don’t: unmount it, wait, then start a close animation from the fully open coordinate.

## Make direct manipulation literal

Within bounds, drag follows the pointer 1:1. Apply `rubberBand(overshoot, dimension)` only to the distance beyond a known bound. The helper uses constant 0.55 and returns `sign × (1 - 1 / ((abs(overshoot) × 0.55) / dimension + 1)) × dimension`. Pass a measured positive dimension; this function has no guard for a zero-sized region.

Apply resistance to bottom sheets beyond open, carousels beyond their ends, or supported swipe actions. On release, settle to an actual snap/dismiss target using the release velocity and the shared spring. Determine dismiss thresholds from the component contract; there is no global threshold token to invent here. Keep scroll ownership deliberate and cancel cleanly on interrupted gestures.

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

Treat this as the resistance/release portion of an existing accessible gesture, not a replacement for scroll arbitration, pointer cancellation, keyboard actions, focus, or dismissal semantics.

Reduced direct manipulation: drags still follow the pointer and controls still work; settle immediately without momentum, elastic flourishes, or springs. Keep an equivalent button/keyboard action for every gesture-only operation.

## Give press feedback without slowing activation

Use `pressable(reduced)` on tappable surfaces larger than a checkbox. It applies `whileTap: { scale: 0.97 }` and `spring.press`; on release the surface springs to rest. Keep the pressed highlight instant, then fade it on release over 140ms. Keep menu-item highlights instant for keyboard speed; do not spring the pointer’s scan through a menu.

Do not scale a whole layout region around a tiny target or scale every child independently. Press feedback never replaces a focus ring or a real selected state. Keep checkbox feedback specific to its state rather than adding a second generic press transform.

Reduced press: `pressable(true)` returns no transform behavior. Keep the instant highlight and short release fade. Never remove activation feedback merely because travel is reduced.

## Respect origin and direction

Menus, selects, context menus, hover cards, popovers, and tooltips grow from their trigger. Use the matching `--radix-*-content-transform-origin`; do not grow a corner-anchored surface from the viewport center. `popoverMotion` enters opacity 0 / scale 0.94 → rest with `spring.snappy`, opacity 100ms linear; exits opacity 0 / scale 0.97 with `spring.exit` and a separate 100ms leave opacity fade.

`alertMotion` communicates foreground importance: enter from scale 1.06 / opacity 0 with `spring.snappy`, opacity 140ms linear; exit opacity 0 / scale 0.98 with `spring.exit` and a separate 120ms leave opacity fade. Do not use the alert scale for routine menus or task cards.

Reduced popover and alert: 140ms fade in / 80ms out, no scale. Keep modal naming, initial focus, Escape, scroll lock, and focus return independent from animation.

## Separate siblings from hierarchy

### Sibling destinations

Use `pageMotion(reduced)` for rail destinations or sibling views. Incoming content starts opacity 0 and x = sign × 14px, arrives at x 0 with `spring.smooth`, and fades to full opacity over 200ms linear. Outgoing content travels x = sign × -10px on `spring.exit`, with opacity independently fading over 140ms leave.

Derive sign from semantic destination order. Use `AnimatePresence mode="popLayout" initial={false}` with `custom={sign}` on both presence and frame. The next work surface arrives while the outgoing one leaves; do not insert a blank frame or animate the shell. Key by route identity, not by every refreshed record.

### Hierarchical push and pop

Use `pushMotion(reduced, mobile)` for list-to-detail and back. Stack pages in the same grid cell. Forward pushes the incoming page from the trailing edge while the outgoing page slides partly behind and dims; back reverses those roles.

On small screens, front is `100%` and behind is `-28%`; opacity stays 1, `spring.travel` moves the arriving page and `spring.exit` the leaving one. On desktop, front is 56px and behind is -28px, using `spring.smooth`; opacity enters over 200ms and exits over 160ms linear. The behind layer uses `brightness(0.94)` and the front uses `brightness(1)`. Keep that bounded filter on the work surface, never the entire shell. The helper is authored for its trailing-edge direction; adapt deliberately for a different reading direction rather than calling the numeric sign a universal direction solution.

Reduced siblings/hierarchy: 140ms incoming and 80ms outgoing opacity, no translation, dimming travel, scale, or springs. Preserve semantic back behavior and focus/scroll restoration.

## Use edge inspectors and bottom sheets intentionally

`sheetMotion(reduced, mobile)` is the edge inspector. Desktop starts x 64px / scale 0.985 / opacity 0 and settles with `spring.smooth`; opacity becomes 1 over 140ms linear. Its exit uses x 40px / scale 0.99 on `spring.exit`, with a separate opacity fade of 160ms leave after 20ms. Small-screen edge inspectors use x `100%`, `spring.travel` in, and `spring.exit` out; opacity remains 1 during the mobile exit.

Use `bottomSheetMotion(reduced)` for modal small-screen sheets: y `100%` → 0 with `spring.travel`; dismiss to y `100%` with `spring.exit`. Permit downward direct dismissal where the component contract supports it; use rubber-band resistance beyond open and spring settling with release velocity. Keep the close button and keyboard path; dragging is not the only way out. A navigation rail remains attached to its own edge instead of becoming an unrelated bottom sheet.

Reduced edge inspector: x 0 / scale 1, 120ms fade in / 80ms out. Reduced bottom sheet: 140ms in / 80ms out, no y travel. Keep overlay lifecycle and focus management synchronized, but do not block focus until the spring tail ends.

When morphing a panel into a full reading surface, preserve the reading anchor, animate geometry with a shared spring, and keep header/footer controls at their own size. Do not stretch text. The historical Sift implementation used a 360ms layout morph plus delayed body fade; that remains provenance, not the upgraded recipe.

## Preserve shared-element continuity and reflow

Use `layoutId` for a backing or object that is truly the same thing, scoped per component instance. Rail selection, segmented pills, tab indicators, and selected days use `selectionSpring`. Keep text/icons above an aria-hidden backing; do not remount all labels to indicate selection. A project title may share a stable ID between its list cell and heading with `titleMorph`; never morph unrelated text merely because it occupies a similar position.

Use `layout` plus `reflowTransition(reduced)` on keyed inserted/removed/reordered rows so siblings close a gap instead of jumping. The helper returns `spring.smooth`, or `{ duration: 0 }` when reduced. Keep stable IDs and presence `initial={false}` so existing records do not replay arrivals after a refresh.

`arrivalMotion` starts opacity 0 / y -6px / scale 0.98 and arrives with `spring.smooth`; its exit uses opacity 0 / scale 0.98 on `spring.exit`, with opacity fading over 120ms leave. Reduced arrival fades in over 140ms and out over 60ms, without scale/travel. For status moves, show the real departure and destination arrival, and reflow surrounding items; do not invent a fake intermediate column or a shared cross-column flight when none is implemented.

Completion uses actual state plus icon/text, attribution/reason, and eligible undo. Use `spring.lively` only for a restrained real success moment, not every data refresh. Duplicate/undo feedback follows the real resulting records; there is no invented duplicate-animation token.

Reduced continuity: remove shared layout travel and springs, switch geometry instantly, retain short opacity feedback. Do not leave a layoutId active and assume a CSS media rule stops its JS spring.

## Keep disclosure and updates readable

Use the kit’s measured disclosure mechanism. Spatial expansion/reflow uses the shared spring, with overflow hidden only during the transition and restored afterward so focus is not clipped. Avoid per-frame alternating geometry reads/writes; use measured height only when the region actually pushes surrounding content. Rotate a disclosure mark with a small spring, not a new timed travel curve.

Sift’s change stream batches into a 180ms refresh window; retain that data behavior without adding an artificial delay to a person’s action. Keep active edit/read/drag ownership stable. Never animate every streamed token or reanimate every present card. Keep transcript auto-follow only while already near the latest message; otherwise preserve scroll and offer jump-to-latest. Announce useful aggregate updates politely.

Reduced disclosure: immediate geometry plus useful short fade; reduced updates keep batching and readable state without travel. A running indicator must reflect actual work, stop when work ends, and have a textual status.

## Keep drag/drop honest

Sift’s mouse drag activates after 6px; touch activation is 220ms with 8px tolerance. Its keyboard grip uses Space/Enter to lift/drop, Left/Right to choose a column, Escape to cancel. Keep title opening separate from keyboard lift and let touch scroll before activation.

Keep pointer-following direct. Sift dims the original card to 0.35 and portals an inert, aria-hidden, non-interactive preview to the document body so transformed routes do not distort coordinates. Source `dropAnimation={null}` means there is no special drop flight to reproduce. In upgraded work, settle only a real directly manipulated object and spring-reflow siblings; do not add a theatrical bounce. Reduced drag retains pointer following and keyboard announcements without inertia flourishes.

## Preserve useful onboarding, chat, and toast behavior

Coordinate setup steps around a stable anchor; retain skip, revisit, retry, and explicit real test actions. Use sibling or hierarchy springs according to the actual relationship, not a generic timed slide. Keep setup controls available immediately. Do not fake connection success, percentages, paid tests, or artificial setup waits.

Sift’s longer first-run mark, observation, and tracker sequences are history, not upgraded spring parameters. New setup uses shared springs, at most 5 staggered items spaced 25–30ms apart, and no delay to input/focus. Routine operation should be visually settled in roughly 250–400ms; the travel preset’s 420ms visualDuration and CSS settling tails are documented exceptions, not a reason to extend all sequences.

Keep the contextual chat dock continuous between its pill and panel. Preserve close focus return, composer draft, additions-only polite log, and readable tool/result attribution. Never animate token-by-token. Use shared springs for geometry and short fades for content handoff; do not retain an unshared bespoke spring merely because Sift had one.

Toasts use the kit lifecycle and represent real outcomes. Supported swipe dismissal follows the pointer, resists bounds where relevant, and settles using release velocity; retain a close action and accessible announcement. Do not invent a universal dismiss threshold or display timeout. Essential undo remains discoverable beyond a disappearing toast. Reduced toasts retain message/fade/actions without travel or momentum.

## Preserve focus and performance

Outgoing route frames are visual-only: use `useIsPresent()` to set `inert={!present}` and aria-hidden when leaving. Do not leave two focusable copies active during overlap. Keep focus visible through clipping, transforms, and pinned controls. Return focus to the trigger or logical surviving item on close; preserve scroll/drafts, and let active dialogs own keyboard shortcuts.

Use transform and opacity by default. Bound brightness/filter effects; never animate full-page blur for decoration. Apply `will-change` only around known work and remove it afterward. Do not animate margins/top/left/padding to move a surface; reserve measured layout changes for actual disclosure/reflow and explicit rail collapse. Measure geometry once, batch writes, and avoid per-frame layout thrash.

Nothing loops except actual progress. Nothing in the idle shell animates. No decorative hover lift, confetti, perpetual glow, fake progress, route-wide cascade, or animation of the task being edited. Restraint is part of the physical language, not its opposite.

## Review frames and real-time motion

Run `node scripts/capture.mjs <example> --shots shots.mjs --axe` from the repo root. Named shots write `<shots-name>-axe.json`. Review both themes, desktop, 390px mobile, reduced motion, rapid reversal, keyboard, focus return, scroll preservation, and active edit/drag during updates.

Use timestamped filmstrips to judge curves and opacity layering. A baseline capture uses frames `[0, 60, 120, 200, 360]`; inspect the actual spring tails too, not only the old duration boundary. Check 100/140/160/200ms fade boundaries where applicable; inspect the shared spring’s visualDuration and full generated CSS duration separately. A sheet should be opaque before travel ends; an exiting frame must already be inert.

Record real-time animated WebP clips for signature interactions on desktop and 390px mobile where relevant: `video: { trigger: async (page) => { /* real input */ }, duration: 1200 }`. Name recordings `<family>-motion-<interaction>.webp`. Use filmstrip PNGs with the Read tool to inspect curves; recordings communicate real-time continuity. A still alone cannot sign off motion. Do not claim capture evidence for a surface not exercised.

## Copy the shared presets

Paths below assume `blocks/<name>/src`. Place the kit’s modal lifecycle around the animated content; these snippets do not replace focus trapping, accessible naming, scroll lock, or return focus.

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

## What carried over from Sift

Sift's shipped interface remains the foundation for shell stability, project-title continuity, edge-attached context, real state, batched updates, inert exits, preserved drafts/reading, direct drag geometry, and reduced-motion alternatives. Its old duration-driven travel is superseded by the upgraded shared spring language. Do not copy historical timed slides, blanket CSS suppression of all feedback, unguarded reduced-motion transforms, or background-position loops as new defaults.


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
