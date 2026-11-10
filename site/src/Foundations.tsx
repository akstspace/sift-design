import { useEffect, useState } from "react";
import { pages } from "./content";
const roles = [
  "ground",
  "surface",
  "subtle",
  "hover",
  "ink",
  "muted",
  "line",
  "control-line",
  "primary",
  "accent",
  "accent-soft",
  "rail",
  "rail-selected",
  "good",
  "warn",
  "danger",
];
function Swatches({ dark }: { dark: boolean }) {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const read = () => {
      const probe = document.createElement("div");
      probe.className = dark ? "dark" : "";
      // Explicit light context also when the enclosing website is dark.
      probe.style.cssText = "position:fixed;visibility:hidden;pointer-events:none";
      const frame = document.createElement("iframe");
      frame.title = "Palette measurement";
      frame.hidden = true;
      document.body.append(frame);
      const doc = frame.contentDocument!;
      for (const style of document.querySelectorAll('style, link[rel="stylesheet"]'))
        doc.head.append(style.cloneNode(true));
      doc.documentElement.className = dark ? "dark" : "";
      doc.documentElement.dataset.palette = document.documentElement.dataset.palette ?? "";
      doc.body.append(probe);
      const sample = () => {
        const css = getComputedStyle(probe);
        setValues(
          Object.fromEntries(
            [...roles, ...Array.from({ length: 8 }, (_, i) => `cat-${i + 1}`)].map((role) => [
              role,
              css.getPropertyValue(`--${role}`).trim(),
            ]),
          ),
        );
      };
      // Linked styles may finish loading after the initial measurement.
      const links = Array.from(doc.querySelectorAll("link"));
      Promise.all(
        links.map(
          (link) =>
            new Promise<void>((resolve) => {
              if (link.sheet) resolve();
              else {
                link.onload = () => resolve();
                link.onerror = () => resolve();
              }
            }),
        ),
      ).then(() => {
        sample();
        frame.remove();
      });
      if (!links.length) frame.remove();
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-palette"] });
    return () => observer.disconnect();
  }, [dark]);
  return (
    <section>
      <h3>{dark ? "Dark" : "Light"} palette</h3>
      <div className="swatch-grid">
        {roles.map((role) => (
          <div className="swatch" key={role}>
            <span aria-hidden="true" style={{ background: values[role] }} />
            <div>
              <code>--{role}</code>
              <small>{values[role] || "Loading token"}</small>
            </div>
          </div>
        ))}
      </div>
      <h3>Categorical slots</h3>
      <p className="support">Fixed order for data identity. Always pair with labels.</p>
      <div className="category-slots">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <span style={{ background: values[`cat-${i + 1}`] }} />
            <code>{i + 1}</code>
            <small>{values[`cat-${i + 1}`]}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
export default function Foundations() {
  return (
    <>
      <p className="lead">
        The roles behind the workbench. Warm neutrals, deliberate type, clear boundaries, and room to read.
      </p>
      <div className="link-list">
        {pages
          .filter((p) => p.group === "Foundations")
          .map((p) => (
            <a href={p.path} key={p.path}>
              <strong>{p.title}</strong>
              <span>Read the guide</span>
            </a>
          ))}
      </div>
      <section id="color-tokens" className="page-section">
        <h2>Color, by role</h2>
        <p>Resolved directly from the token stylesheets in both themes, including the active brand palette.</p>
        <div className="palette-pair">
          <Swatches dark={false} />
          <Swatches dark />
        </div>
      </section>
      <section id="type-ramp" className="page-section">
        <h2>Typography</h2>
        <p>Albert Sans for interface text. IBM Plex Mono, with tabular figures, for code, counts, times and IDs.</p>
        <div className="type-ramp">
          <div>
            <span>Headline · 30 / 600</span>
            <p className="type-headline">Today’s tasks</p>
          </div>
          <div>
            <span>Title · 18 / 600</span>
            <p className="type-title">Task details</p>
          </div>
          <div>
            <span>Body · 14 / 400</span>
            <p>The shell stays still while the work changes.</p>
          </div>
          <div>
            <span>Label · 13 / 550</span>
            <p className="type-label">Show completed tasks</p>
          </div>
          <div>
            <span>Code · 12 / 400</span>
            <p className="font-mono text-xs">spring.smooth · 350ms · --surface</p>
          </div>
          <div>
            <span>Help · 12.5 / 400</span>
            <p className="type-help">Your changes are saved on this device.</p>
          </div>
        </div>
      </section>
      <section className="page-section">
        <h2>Shapes and depth</h2>
        <p className="measure">
          A 256px rail, a 72px compact state, and a modal rail on small screens. Keep prose near 72 characters. Use 6,
          8, and 12px radii, tonal surfaces, and hairlines; reserve shadows for floating layers.
        </p>
        <a href="/foundations/shapes-and-depth">Explore shapes and depth</a>
      </section>
    </>
  );
}
