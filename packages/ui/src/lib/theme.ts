// Light, dark, or follow the system. The choice is stored per browser.
// `?theme=light|dark` in the URL wins, so screenshots can pick a theme.

export type ThemeChoice = "system" | "light" | "dark";
const KEY = "theme";

function systemDark() {
  return typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;
}

export function storedTheme(): ThemeChoice {
  const fromUrl = new URLSearchParams(location.search).get("theme");
  if (fromUrl === "light" || fromUrl === "dark") return fromUrl;
  const saved = localStorage.getItem(KEY);
  return saved === "light" || saved === "dark" ? saved : "system";
}

export function applyTheme(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "system" && systemDark());
  document.documentElement.classList.toggle("dark", dark);
  return dark;
}

export function setTheme(choice: ThemeChoice) {
  if (choice === "system") localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, choice);
  return applyTheme(choice);
}

/**
 * An alternate palette from tokens/themes/ (see docs/retheming.md), chosen with
 * `?palette=<name>`. It sets data-palette on <html>; the palette's CSS file
 * must be imported by the app.
 */
export function applyPalette(name: string | null) {
  if (name) document.documentElement.dataset.palette = name;
  else delete document.documentElement.dataset.palette;
}

/** Call once before the first render so the page never flashes the wrong theme. */
export function initTheme() {
  applyPalette(new URLSearchParams(location.search).get("palette"));
  const choice = storedTheme();
  applyTheme(choice);
  if (typeof matchMedia === "function") {
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (storedTheme() === "system") applyTheme("system");
    });
  }
  return choice;
}
