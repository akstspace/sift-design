import { flushSync } from "react-dom";

type ViewTransition = { finished: Promise<void> };

/**
 * Switches theme or palette in one step. Every element's own color transition is
 * frozen for the switch, so nothing trails behind at its own pace, and the whole
 * page cross-fades once (styles.css sets the fade). Without the View Transitions
 * API, or with reduced motion, the switch is instant.
 */
export function changeAppearance(apply: () => void) {
  const root = document.documentElement;
  const doc = document as Document & { startViewTransition?: (update: () => void) => ViewTransition };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const run = () => {
    flushSync(apply);
    window.dispatchEvent(new Event("themechange"));
  };
  // Keep transitions frozen until the new colors have been computed and painted.
  const thaw = () => {
    getComputedStyle(document.body).color;
    requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.themeSwitching));
  };
  root.dataset.themeSwitching = "";
  if (!doc.startViewTransition || reduced) {
    run();
    thaw();
    return;
  }
  doc.startViewTransition(run).finished.finally(thaw);
}
