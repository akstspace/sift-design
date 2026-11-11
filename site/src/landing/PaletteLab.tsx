import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { leave, spring } from "@sift-design/tokens/motion";
import { IconArrowRight, IconMoon, IconSun } from "@tabler/icons-react";
import { ToggleGroup, ToggleGroupItem } from "@sift-design/ui/toggle-group";
import { applyPalette, setTheme } from "@sift-design/ui/lib/theme";
import { at } from "../base";
import { Reveal } from "./Reveal";
import { changeAppearance } from "./changeAppearance";

const roles = [
  { name: "ground", use: "Page canvas" },
  { name: "surface", use: "Cards, panels, popovers" },
  { name: "rail", use: "Navigation rail" },
  { name: "ink", use: "Primary text" },
  { name: "accent", use: "Actions and links" },
  { name: "rail-selected", use: "Selection" },
];

const readState = () => ({
  dark: document.documentElement.classList.contains("dark"),
  palette: document.documentElement.dataset.palette ?? "default",
});

function Hex({ role, version }: { role: string; version: string }) {
  const [value, setValue] = useState("");
  const reduced = useReducedMotion();
  useEffect(() => {
    setValue(getComputedStyle(document.documentElement).getPropertyValue(`--${role}`).trim().toLowerCase());
  }, [role, version]);
  return (
    <span className="role-hex">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.code
          key={value}
          initial={{ opacity: 0, y: reduced ? 0 : 8 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: reduced ? { duration: 0.14 } : spring.snappy,
          }}
          exit={{
            opacity: 0,
            y: reduced ? 0 : -8,
            transition: { duration: 0.1, ease: leave },
          }}
        >
          {value}
        </motion.code>
      </AnimatePresence>
    </span>
  );
}

export function PaletteLab() {
  const [state, setState] = useState(readState);
  useEffect(() => {
    // The header's theme menu can change the theme too; follow it.
    const observer = new MutationObserver(() => setState(readState()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-palette"],
    });
    return () => observer.disconnect();
  }, []);
  const version = `${state.palette}-${state.dark}`;
  const choosePalette = (value: string) =>
    changeAppearance(() => {
      applyPalette(value === "harbor" ? "harbor" : null);
      const url = new URL(location.href);
      if (value === "harbor") url.searchParams.set("palette", "harbor");
      else url.searchParams.delete("palette");
      history.replaceState(history.state, "", url);
      setState(readState());
    });
  const chooseTheme = (value: string) =>
    changeAppearance(() => {
      const url = new URL(location.href);
      url.searchParams.delete("theme");
      history.replaceState(history.state, "", url);
      setTheme(value as "light" | "dark");
      setState(readState());
    });
  return (
    <section className="landing-palette" id="palette" aria-labelledby="palette-heading">
      <div className="section-head">
        <Reveal as="h2" id="palette-heading">
          A warm palette, made to be replaced
        </Reveal>
        <Reveal delay={0.06}>
          <p className="section-lede">
            Oatmeal grounds, slate ink and rail, coral for selection and sea green for actions. Components read named
            variables such as <code>--surface</code> and <code>--accent</code>, so your colors drop in without touching
            component code.
          </p>
          <a className="landing-link" href={at("/retheming")}>
            Change the palette
            <IconArrowRight aria-hidden size={17} />
          </a>
        </Reveal>
      </div>
      <Reveal className="palette-board" delay={0.1}>
        <div className="palette-controls">
          <ToggleGroup
            type="single"
            value={state.palette}
            onValueChange={(value) => value && choosePalette(value)}
            aria-label="Palette"
            data-group="palette"
          >
            <ToggleGroupItem value="default" data-value="default">
              Default
            </ToggleGroupItem>
            <ToggleGroupItem value="harbor" data-value="harbor">
              Harbor
            </ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            type="single"
            value={state.dark ? "dark" : "light"}
            onValueChange={(value) => value && chooseTheme(value)}
            aria-label="Theme"
            data-group="theme"
          >
            <ToggleGroupItem value="light" data-value="light">
              <IconSun aria-hidden />
              Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" data-value="dark">
              <IconMoon aria-hidden />
              Dark
            </ToggleGroupItem>
          </ToggleGroup>
          <p aria-live="polite">
            {state.palette === "harbor" ? "Harbor" : "Default"}, {state.dark ? "dark" : "light"}. The whole page
            follows.
          </p>
        </div>
        <ul className="role-swatches">
          {roles.map((role, index) => (
            <li key={role.name} style={{ "--i": index } as CSSProperties}>
              <span className="role-chip" style={{ background: `var(--${role.name})` }} />
              <code>--{role.name}</code>
              <span>{role.use}</span>
              <Hex role={role.name} version={version} />
            </li>
          ))}
        </ul>
        <div className="category-strip">
          <p>
            Eight chart colors <span>Keep each category on one color. Fold larger sets into labels or a table.</span>
          </p>
          <ol aria-label="Chart category colors">
            {Array.from({ length: 8 }, (_, index) => (
              <li key={index} style={{ "--i": index } as CSSProperties}>
                <span style={{ background: `var(--cat-${index + 1})` }} />
                <code>{index + 1}</code>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}
