// One fluid, interruptible motion language, for the `motion` library.
//
// Anything that travels through space moves on a spring, so it can be grabbed,
// reversed or retargeted mid-flight and keeps its velocity when it is. Fades
// and color changes use short durations. The shell never moves; only the work
// surface changes. Things arrive from where they come from: menus grow out of
// their trigger, panels slide from their edge, deeper pages push in from the
// trailing edge and slide back out the way they came.
//
// Reduced motion keeps cross-fades and state feedback and drops all travel,
// scale, blur and springs. Never animate every streamed event; batch bursts.
// CSS twins of these springs live in tokens.css as --spring-* easings.

export const settle = [0.16, 1, 0.3, 1] as const; // arrivals and moves, when a duration is needed
export const leave = [0.4, 0, 1, 1] as const; // exits that fade rather than travel

export const duration = {
  instant: 0.08,
  quick: 0.14,
  base: 0.18,
  move: 0.34,
} as const;

/** Spring presets. Pick by role, never tune per component. */
export const spring = {
  /** Default for anything that travels: panels, pages, sheets, disclosure, list reflow. No overshoot. */
  smooth: { type: "spring", visualDuration: 0.28, bounce: 0 },
  /** Menus, popovers, selection highlights, toggles, small objects: quick, with a hint of overshoot. */
  snappy: { type: "spring", visualDuration: 0.2, bounce: 0.12 },
  /** Rare moments of success (a task completed, setup finished). Never on routine navigation. */
  lively: { type: "spring", visualDuration: 0.32, bounce: 0.22 },
  /** Press and release feedback. */
  press: { type: "spring", visualDuration: 0.12, bounce: 0 },
  /** Full-width travel on small screens: push navigation, bottom sheets. */
  travel: { type: "spring", visualDuration: 0.3, bounce: 0 },
  /** Leaving: a quicker, overshoot-free spring for the travel or scale of an exit; its fade uses `leave`. */
  exit: { type: "spring", visualDuration: 0.16, bounce: 0 },
} as const;

/** Exit transition: spatial properties on spring.exit, opacity on a short `leave` fade. */
const exitWith = (fade: number, delay = 0) => ({ ...spring.exit, opacity: { duration: fade, ease: leave, delay } });

/** Rail width and other shell reflow. */
export const shellSpring = { type: "spring", stiffness: 560, damping: 48, mass: 0.8 } as const;
/** The selected-item highlight that travels between navigation items, tabs or segments. */
export const selectionSpring = { type: "spring", stiffness: 700, damping: 48, mass: 0.6 } as const;
/** A title that lifts out of a list and becomes a heading. */
export const titleMorph = { type: "spring", stiffness: 560, damping: 46, mass: 0.7 } as const;

export type Direction = 1 | -1;

/**
 * Press feedback for anything tappable that is bigger than a checkbox:
 * it gives a little under the pointer and springs back on release.
 *   <motion.button {...pressable(reduced)}>
 */
export function pressable(reduced: boolean, scale = 0.97) {
  return reduced ? {} : { whileTap: { scale }, transition: spring.press };
}

/**
 * Resistance past a limit, for drags (sheets pulled past open, carousels past
 * their ends). Returns how far the element should actually move.
 */
export function rubberBand(overshoot: number, dimension: number, constant = 0.55) {
  const sign = Math.sign(overshoot);
  const d = Math.abs(overshoot);
  return sign * (1 - 1 / ((d * constant) / dimension + 1)) * dimension;
}

/** Sibling destinations (rail items, tabs): cross-fade with a 14px drift in navigation order. */
export function pageMotion(reduced: boolean) {
  return {
    enter: (sign: Direction) => (reduced ? { opacity: 0 } : { opacity: 0, x: sign * 14 }),
    visible: {
      opacity: 1,
      x: 0,
      transition: reduced ? { duration: duration.quick } : { ...spring.smooth, opacity: { duration: 0.2, ease: "linear" } },
    },
    exit: (sign: Direction) =>
      reduced
        ? { opacity: 0, transition: { duration: duration.instant } }
        : { opacity: 0, x: sign * -10, transition: exitWith(duration.quick) },
  };
}

/**
 * Hierarchy (list -> detail and back). Forward: the new page pushes in from
 * the trailing edge while the old one slides partly back and dims. Back: the
 * reverse. Full width on small screens, a short parallax on wide ones.
 * Use with <AnimatePresence custom={direction} initial={false} mode="popLayout">
 * and pages stacked in the same grid cell.
 */
export function pushMotion(reduced: boolean, mobile: boolean) {
  const front = mobile ? "100%" : 56;
  const behind = mobile ? "-28%" : -28;
  const travel = mobile ? spring.travel : spring.smooth;
  return {
    enter: (sign: Direction) =>
      reduced ? { opacity: 0 } : { x: sign > 0 ? front : behind, opacity: mobile ? 1 : 0, filter: sign > 0 ? "brightness(1)" : "brightness(0.94)" },
    visible: {
      x: 0,
      opacity: 1,
      filter: "brightness(1)",
      transition: reduced ? { duration: duration.quick } : { ...travel, opacity: { duration: 0.2, ease: "linear" } },
    },
    exit: (sign: Direction) =>
      reduced
        ? { opacity: 0, transition: { duration: duration.instant } }
        : {
            x: sign > 0 ? behind : front,
            opacity: mobile ? 1 : 0,
            filter: sign > 0 ? "brightness(0.94)" : "brightness(1)",
            transition: { ...(mobile ? spring.exit : travel), opacity: { duration: 0.16, ease: "linear" } },
          },
  };
}

/** A side panel (inspector) slides in from the right edge; opaque long before it stops. */
export function sheetMotion(reduced: boolean, mobile: boolean) {
  return {
    initial: { opacity: 0, x: reduced ? 0 : mobile ? "100%" : 64, scale: reduced || mobile ? 1 : 0.985 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: reduced
        ? { duration: 0.12 }
        : { ...(mobile ? spring.travel : spring.smooth), opacity: { duration: duration.quick, ease: "linear" } },
    },
    exit: {
      opacity: mobile && !reduced ? 1 : 0,
      x: reduced ? 0 : mobile ? "100%" : 40,
      scale: reduced || mobile ? 1 : 0.99,
      transition: reduced
        ? { duration: duration.instant }
        : mobile
          ? spring.exit
          : exitWith(0.16, 0.02),
    },
  };
}

/** A modal sheet on small screens rises from the bottom edge and can be dragged back down. */
export function bottomSheetMotion(reduced: boolean) {
  return {
    initial: reduced ? { opacity: 0 } : { y: "100%" },
    animate: { y: 0, opacity: 1, transition: reduced ? { duration: duration.quick } : spring.travel },
    exit: reduced ? { opacity: 0, transition: { duration: duration.instant } } : { y: "100%", transition: spring.exit },
  };
}

/** A confirmation or alert: settles down from slightly larger, so it reads as "in front". */
export function alertMotion(reduced: boolean) {
  return {
    initial: reduced ? { opacity: 0 } : { opacity: 0, scale: 1.06 },
    animate: { opacity: 1, scale: 1, transition: reduced ? { duration: duration.quick } : { ...spring.snappy, opacity: { duration: duration.quick, ease: "linear" } } },
    exit: reduced ? { opacity: 0, transition: { duration: duration.instant } } : { opacity: 0, scale: 0.98, transition: exitWith(0.12) },
  };
}

/** Something new arrives in a list (created elsewhere, moved here). Present items never re-animate. */
export function arrivalMotion(reduced: boolean) {
  return {
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: reduced ? { duration: duration.quick } : spring.smooth },
    exit: reduced ? { opacity: 0, transition: { duration: 0.06 } } : { opacity: 0, scale: 0.98, transition: exitWith(0.12) },
  };
}

/** Siblings close the gap when an item is inserted or removed: put `layout` on rows with this transition. */
export function reflowTransition(reduced: boolean) {
  return reduced ? { duration: 0 } : spring.smooth;
}

/** Menus, popovers and tooltips grow out of their trigger (set transform-origin from Radix). */
export function popoverMotion(reduced: boolean) {
  return {
    initial: reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 },
    animate: { opacity: 1, scale: 1, transition: reduced ? { duration: duration.quick } : { ...spring.snappy, opacity: { duration: 0.1, ease: "linear" } } },
    exit: reduced ? { opacity: 0, transition: { duration: duration.instant } } : { opacity: 0, scale: 0.97, transition: exitWith(0.1) },
  };
}
