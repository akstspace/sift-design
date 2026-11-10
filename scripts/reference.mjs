// What the website publishes for agents, shared by the build and the dev server:
//
//   rawFiles()     every repository file served under /raw/, for manifest.json
//   llmsFiles()    llms.txt (the reading order, with a link to every guide,
//                  token file, component and block) and llms-full.txt
//                  (AGENTS.md, DESIGN.md and every guide in one file)
//
// `site` is the site's address without a trailing slash ("" serves links from
// the origin's root). `raw` is where plain repository files live; it defaults
// to the site's /raw/ copy.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const blocks = ["workbench", "routines", "timeline", "assistant", "onboarding"];

// The raw reference. Only what an agent needs; never node_modules or builds.
export const rawRoots = [
  "README.md",
  "AGENTS.md",
  "DESIGN.md",
  "CREDITS.md",
  "LICENSE",
  "docs",
  "tokens",
  "screenshots",
  "packages/ui/README.md",
  "packages/ui/docs",
  "packages/ui/src",
  "blocks/_shared",
  ...blocks.flatMap((b) => [`blocks/${b}/README.md`, `blocks/${b}/src`]),
  "specimen/README.md",
  "scripts/capture.mjs",
  "scripts/spring-easing.mjs",
];
const skip = (p) => /(^|\/)(node_modules|dist|\.cache)(\/|$)/.test(p) || p.endsWith(".DS_Store");

/** Every file under the raw roots, in a stable order, with its size. */
export function rawFiles() {
  const files = [];
  const walk = (rel) => {
    const from = path.join(root, rel);
    if (!fs.existsSync(from) || skip(rel)) return;
    if (fs.statSync(from).isDirectory()) {
      for (const entry of fs.readdirSync(from).sort()) walk(path.posix.join(rel, entry));
      return;
    }
    files.push({ path: rel, size: fs.statSync(from).size });
  };
  rawRoots.forEach(walk);
  return files;
}

const title = (rel) => {
  const text = fs.readFileSync(path.join(root, rel), "utf8");
  return (text.match(/^#\s+(.+)$/m)?.[1] ?? rel).trim();
};
const summary = (rel) => {
  const text = fs.readFileSync(path.join(root, rel), "utf8").replace(/^---[\s\S]*?\n---\n/, "");
  // The first prose paragraph, cut to its first sentence.
  const para =
    text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p && !/^[#>|!\-`<]/.test(p)) ?? "";
  const flat = para
    .replace(/\s+/g, " ")
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  return (flat.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? flat).slice(0, 200);
};
const guides = fs
  .readdirSync(path.join(root, "docs"))
  .filter((f) => f.endsWith(".md"))
  .sort()
  .map((f) => `docs/${f}`);
const kitDocs = ["controls", "overlays", "display"].map((f) => `packages/ui/docs/${f}.md`);
const components = fs
  .readdirSync(path.join(root, "packages/ui/src/components"))
  .filter((f) => f.endsWith(".tsx"))
  .sort();

export function llmsFiles({ site = "", raw = `${site}/raw` } = {}) {
  const link = (rel, label = title(rel)) => `- [${label}](${raw}/${rel}): ${summary(rel)}`;

  const llms = `# Sift Design

> A design reference for coding agents: normative tokens, written guidelines, a spring-based motion system, every shadcn/ui component restyled and animated, and full-page React blocks with reference screenshots and motion clips. Built on shadcn/ui. ${site.startsWith("http") ? "" : "Links are relative to this site's origin. "}Every file is plain text, an image or a video.

Read AGENTS.md first, then DESIGN.md and docs/motion.md before writing any UI. Copy tokens and components rather than recreating them. Check your work against the screenshots and the review checklist.

## Ask about the palette first

Before writing any UI, ask the user one question: keep the default Sift Design palette (slate, oatmeal, coral and sea), or use a custom palette? Skip it if they have already answered.

- Default: copy [tokens.css](${raw}/tokens/tokens.css) unchanged.
- Custom: ask for their brand colors, or offer to propose some, then follow [docs/retheming.md](${raw}/docs/retheming.md). Only the color roles change; type, spacing, components and motion stay the same. [themes/harbor.css](${raw}/tokens/themes/harbor.css) is a worked example.
- If you cannot ask, as in a non-interactive run, use the default palette and say so in your summary.

## Start here

${link("AGENTS.md", "AGENTS.md")}
${link("DESIGN.md", "DESIGN.md")}
- [Full text](${site}/llms-full.txt): AGENTS.md, DESIGN.md and every guide in one file

## Guidelines

${guides.map((g) => link(g)).join("\n")}

## Tokens

- [tokens.css](${raw}/tokens/tokens.css): light and dark roles, categorical colors, radii, shadows, durations, spring easings
- [tokens.json](${raw}/tokens/tokens.json): the same tokens in W3C design token format
- [motion.ts](${raw}/tokens/motion.ts): spring presets and motion recipes for the motion library
- [fonts.css](${raw}/tokens/fonts.css): font loading (Albert Sans files in ${raw}/tokens/fonts/)
- [themes/harbor.css](${raw}/tokens/themes/harbor.css): a worked alternate palette (see docs/retheming.md)

## Component kit

- [Kit README](${raw}/packages/ui/README.md): how to copy the kit into a project
- [theme.css](${raw}/packages/ui/src/theme.css): Tailwind v4 theme mapping onto the tokens
- [motion.css](${raw}/packages/ui/src/motion.css): default component motion (imports ${raw}/packages/ui/src/motion/*.css)
${kitDocs.map((d) => link(d)).join("\n")}

Component sources (copy these over stock shadcn/ui files):
${components.map((c) => `- [${c.replace(".tsx", "")}](${raw}/packages/ui/src/components/${c})`).join("\n")}

## Blocks

Full-page compositions built with the kit, like shadcn/ui blocks: copy a block's source from ${raw}/blocks/<name>/src/ and adapt it. Each runs live at ${site}/live/<name>/, and its README lists its screenshots and motion recipes.

${blocks.map((b) => `- [${b}](${raw}/blocks/${b}/README.md): ${summary(`blocks/${b}/README.md`)} Source: ${raw}/blocks/${b}/src/. Live: ${site}/live/${b}/`).join("\n")}
- [Sample content](${raw}/blocks/_shared/LARKSPUR.md): Larkspur, the made-up greenhouse business the blocks use
- [Component specimen](${raw}/specimen/README.md): every kit component, live at ${site}/live/specimen/

## Optional

- [Manifest](${site}/raw/manifest.json): every raw file with its size
- [Capture script](${raw}/scripts/capture.mjs): screenshots, motion filmstrips and clips, with axe checks

## Credits

- [Credits](${raw}/CREDITS.md): the third-party libraries, fonts and tools Sift Design uses, and the Impeccable skill used to review it
`;

  const full = ["AGENTS.md", "DESIGN.md", ...guides]
    .map((rel) => `<!-- ${raw}/${rel} -->\n\n${fs.readFileSync(path.join(root, rel), "utf8").trim()}\n`)
    .join("\n\n---\n\n");

  return { llms, full };
}
