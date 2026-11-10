import { useLayoutEffect, useRef, useState } from "react";
import { applyPalette, applyTheme, storedTheme } from "@sift-design/ui/lib/theme";
import { routeOf } from "./base";

/** The element that scrolls the page: the shell's work area, or the document on the landing page. */
export function scroller(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-slot="sidebar-inset"]') ?? document.scrollingElement as HTMLElement;
}

/** Scroll a heading or section into view and move focus to it without a second jump. */
export function revealHash(hash: string, behavior: ScrollBehavior = "smooth") {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return false;
  const root = document.querySelector('[data-transition-page="current"]') ?? document;
  const node = root.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`) ?? document.getElementById(id);
  if (!node) return false;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.scrollIntoView({ block: "start", behavior: reduce ? "auto" : behavior });
  if (!node.hasAttribute("tabindex")) node.tabIndex = -1;
  node.focus({ preventScroll: true });
  return true;
}

/** The site path for a location, without the base or a trailing slash. */
const pathOf = (pathname: string) => routeOf(pathname).replace(/\/$/, "") || "/";

export function useRouter() {
  const [navigation, setNavigation] = useState({ path: pathOf(location.pathname), entry: 0 });
  const positions = useRef(new Map<string, number>());
  const key = useRef(history.state?.siftKey ?? crypto.randomUUID());
  const restore = useRef<number | string>(location.hash || 0);
  const current = useRef(navigation.path);
  current.current = navigation.path;
  useLayoutEffect(() => {
    history.scrollRestoration = "manual";
    history.replaceState({ ...history.state, siftKey: key.current }, "");
    const save = () => positions.current.set(key.current, scroller().scrollTop);
    const move = () => {
      key.current = history.state?.siftKey ?? crypto.randomUUID();
      history.replaceState({ ...history.state, siftKey: key.current }, "");
      applyPalette(new URLSearchParams(location.search).get("palette"));
      applyTheme(storedTheme());
      setNavigation((previous) => ({ path: pathOf(location.pathname), entry: previous.entry + 1 }));
    };
    const pop = () => {
      save();
      if (pathOf(location.pathname) === current.current && location.hash) {
        key.current = history.state?.siftKey ?? key.current;
        revealHash(location.hash);
        return;
      }
      restore.current = location.hash || (positions.current.get(history.state?.siftKey) ?? 0);
      move();
    };
    const click = (event: MouseEvent) => {
      const anchor = (event.target as Element)?.closest("a");
      if (
        !anchor ||
        anchor.target ||
        anchor.hasAttribute("download") ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const url = new URL(anchor.href);
      if (
        url.origin !== location.origin ||
        routeOf(url.pathname).startsWith("/raw/") ||
        routeOf(url.pathname).startsWith("/live/") ||
        url.pathname.endsWith(".txt")
      )
        return;
      event.preventDefault();
      // A link to a heading on this page scrolls; it is not a navigation.
      if (pathOf(url.pathname) === pathOf(location.pathname) && url.search === location.search && url.hash) {
        save();
        history.pushState({ siftKey: crypto.randomUUID() }, "", url);
        key.current = history.state.siftKey;
        revealHash(url.hash);
        return;
      }
      save();
      const query = new URLSearchParams(location.search);
      for (const name of ["theme", "palette"])
        if (query.has(name) && !url.searchParams.has(name)) url.searchParams.set(name, query.get(name)!);
      history.pushState({ siftKey: crypto.randomUUID() }, "", url);
      restore.current = url.hash || 0;
      move();
    };
    document.addEventListener("click", click);
    window.addEventListener("popstate", pop);
    return () => {
      document.removeEventListener("click", click);
      window.removeEventListener("popstate", pop);
    };
  }, []);
  useLayoutEffect(() => {
    const value = restore.current;
    let frame = 0,
      attempts = 0;
    const position = () => {
      if (typeof value === "string") {
        if (!revealHash(value, "auto") && ++attempts < 120) frame = requestAnimationFrame(position);
      } else scroller().scrollTo({ top: value });
    };
    frame = requestAnimationFrame(position);
    return () => cancelAnimationFrame(frame);
  }, [navigation]);
  return navigation.path;
}
