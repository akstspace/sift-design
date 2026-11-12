// What the website publishes for agents, shared by the build and the dev server:
//
//   rawFiles()     every repository file served under /raw/
//   manifest()     /raw/manifest.json: a searchable index of components, AI
//                  elements, blocks, guides, tokens and motion files, plus the
//                  file list (see docs/finding-components.md)
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
const kitDocs = ["controls", "overlays", "display", "charts", "ai"].map((f) => `packages/ui/docs/${f}.md`);
const components = fs
  .readdirSync(path.join(root, "packages/ui/src/components"))
  .filter((f) => f.endsWith(".tsx"))
  .sort();
const aiSources = fs
  .readdirSync(path.join(root, "packages/ui/src/ai"))
  .filter((f) => f.endsWith(".tsx"))
  .sort();

// ---------------------------------------------------------------------------
// The searchable index. Everything is read from the repository at build time,
// so the index cannot drift from the sources, docs and demos.

const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(root, rel));
const listDir = (rel, test = () => true) =>
  exists(rel) ? fs.readdirSync(path.join(root, rel)).filter(test).sort() : [];
/** The site's heading anchors: same rules as site/src/content.ts. */
const anchor = (text) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
const firstSentence = (text) => {
  const flat = text
    .replace(/\s+/g, " ")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
  return (flat.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? flat).slice(0, 240);
};

export const families = [
  { id: "controls", title: "Controls", doc: "packages/ui/docs/controls.md", dir: "packages/ui/src/components" },
  {
    id: "overlays",
    title: "Overlays and menus",
    doc: "packages/ui/docs/overlays.md",
    dir: "packages/ui/src/components",
  },
  {
    id: "display",
    title: "Display and navigation",
    doc: "packages/ui/docs/display.md",
    dir: "packages/ui/src/components",
  },
  { id: "charts", title: "Charts", doc: "packages/ui/docs/charts.md", dir: "packages/ui/src/components" },
  { id: "ai", title: "AI elements", doc: "packages/ui/docs/ai.md", dir: "packages/ui/src/ai" },
];

/** The chart types, in the order of the Charts page. Each is a `?charts=<group>` demo. */
const chartGroups = ["area", "bar", "line", "pie", "radar", "radial", "tooltip"];

/** Level-two sections of a doc, with the kit imports used in each and its "When" line. */
function docSections(rel) {
  const sections = [];
  const ids = new Map();
  let current = null;
  let fence = false;
  for (const line of read(rel).split("\n")) {
    if (line.startsWith("```")) fence = !fence;
    const heading = !fence && line.match(/^##\s+(.+)$/);
    if (heading) {
      const title = heading[1]
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[*`]/g, "")
        .trim();
      const base = anchor(title);
      const count = ids.get(base) ?? 0;
      ids.set(base, count + 1);
      current = {
        title,
        id: base + (count ? `-${count}` : ""),
        imports: new Set(),
        mentions: new Set(),
        when: "",
        lead: "",
      };
      sections.push(current);
      continue;
    }
    if (!current) continue;
    for (const match of line.matchAll(/["']@sift-design\/ui\/((?:ai\/)?[a-z0-9-]+)["']/g))
      current.imports.add(match[1]);
    for (const match of line.matchAll(/`@sift-design\/ui\/((?:ai\/)?[a-z0-9-]+)`/g)) current.mentions.add(match[1]);
    // The first prose line of a section is its summary when it has no "When:" line.
    if (!fence && !current.lead && /^[A-Z`*]/.test(line) && !line.startsWith("```") && !/^\*\*[^*]+:\*\*/.test(line))
      current.lead = firstSentence(line);
    const when = !fence && line.match(/^\*\*When:\*\*\s*(.+)$/);
    if (when && !current.when) {
      const text = firstSentence(when[1]);
      current.when = /^[a-z]/.test(text) ? `When: ${text}` : text;
    }
  }
  return sections;
}

/** Named exports of a component file, split by kind. */
function exportsOf(rel) {
  const text = read(rel);
  const out = { components: [], hooks: [], functions: [], constants: [], types: [] };
  const add = (kind, name) => out[kind].includes(name) || out[kind].push(name);
  for (const m of text.matchAll(
    /^export\s+(?:declare\s+)?(const|function|class|type|interface|enum)\s+([A-Za-z0-9_]+)(\s*(?::[^=\n]+)?=\s*(?:async\s*)?(?:<[^>]*>\s*)?(?:\(|[A-Za-z0-9_]+\s*=>))?/gm,
  )) {
    // An exported arrow function counts as a function, not a constant.
    const [, declared, name, arrow] = m;
    const kind = declared === "const" && arrow ? "function" : declared;
    if (kind === "type" || kind === "interface") add("types", name);
    else if (/^use[A-Z]/.test(name)) add("hooks", name);
    else if (/^[A-Z]/.test(name)) add(kind === "const" && /^[A-Z0-9_]+$/.test(name) ? "constants" : "components", name);
    else add(kind === "function" ? "functions" : "constants", name);
  }
  // `export { A, B as C }` lists, as the shadcn sources use.
  for (const m of text.matchAll(/^export\s+(type\s+)?\{([^}]+)\}/gm)) {
    for (const part of m[2].split(",")) {
      const name = part
        .trim()
        .split(/\s+as\s+/)
        .pop()
        ?.replace(/^type\s+/, "")
        .trim();
      if (!name) continue;
      if (m[1] || /^type\s/.test(part.trim())) add("types", name);
      else if (/^use[A-Z]/.test(name)) add("hooks", name);
      else if (/^[A-Z0-9_]+$/.test(name)) add("constants", name);
      else if (/^[A-Z]/.test(name)) add("components", name);
      else add("functions", name);
    }
  }
  return out;
}

/** The first sentence of the first JSDoc block above an exported function or constant. */
function docComment(rel) {
  const m = read(rel).match(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*export\s+(?:function|const)/);
  return m ? firstSentence(m[1].replace(/^\s*\*\s?/gm, " ")) : "";
}

/** Kit and AI components a source file imports. */
function usesOf(rel, family) {
  const text = read(rel);
  const kit = new Set();
  const ai = new Set();
  for (const m of text.matchAll(/from\s+["']@sift-design\/ui\/(ai\/)?([a-z0-9-]+)["']/g)) (m[1] ? ai : kit).add(m[2]);
  if (family === "ai") for (const m of text.matchAll(/from\s+["']\.\/([a-z0-9-]+)["']/g)) ai.add(m[1]);
  // Kit components import their neighbors by relative path.
  if (family === "kit" && rel.startsWith("packages/ui/src/components/"))
    for (const m of text.matchAll(/from\s+["']\.\/([a-z0-9-]+)["']/g)) kit.add(m[1]);
  return { kit: [...kit].sort(), ai: [...ai].sort() };
}

const latestUpstream = (prefix) =>
  listDir("packages/ui/upstream", (d) => d.startsWith(prefix))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .pop();

/** AI demo groups: `?ai=<group>` on the specimen, from specimen/src/sections/AI.tsx. */
function aiDemoGroups() {
  const groups = {};
  if (!exists("specimen/src/sections/AI.tsx")) return groups;
  for (const m of read("specimen/src/sections/AI.tsx").matchAll(
    /"([a-z-]+)":\s*lazy\(\(\)\s*=>\s*import\("\.\/ai\/([A-Za-z]+)"\)\)/g,
  )) {
    const file = `specimen/src/sections/ai/${m[2]}.tsx`;
    if (!exists(file)) continue;
    for (const c of read(file).matchAll(/from\s+["']@sift-design\/ui\/ai\/([a-z0-9-]+)["']/g)) groups[c[1]] ??= m[1];
  }
  return groups;
}

const titleCase = (name) => name.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

export function componentIndex({ site = "" } = {}) {
  const sectionsByFamily = Object.fromEntries(families.map((f) => [f.id, exists(f.doc) ? docSections(f.doc) : []]));
  const shadcn = latestUpstream("shadcn-");
  const aiUpstream = latestUpstream("ai-elements-");
  const aiGroups = aiDemoGroups();
  const entries = [];
  for (const dir of ["packages/ui/src/components", "packages/ui/src/ai"]) {
    const isAi = dir.endsWith("/ai");
    for (const file of listDir(dir, (f) => f.endsWith(".tsx"))) {
      const name = file.replace(".tsx", "");
      const key = isAi ? `ai/${name}` : name;
      // The section that documents this component: its heading names it, or failing that, it is the first to import it.
      let found = null;
      for (const family of families.filter((f) => (f.id === "ai") === isAi)) {
        const candidates = sectionsByFamily[family.id].filter((s) => s.imports.has(key));
        const own =
          candidates.find((s) => s.id === name) ??
          candidates.find((s) => s.id.startsWith(name + "-") || s.id.endsWith("-" + name) || s.id.includes(name));
        if (own && !found) found = { family, section: own };
      }
      // Failing that, the first section that imports it, then the first that names it in prose.
      let mentioned = false;
      for (const test of [(s) => s.imports.has(key), (s) => s.mentions.has(key)]) {
        for (const family of families.filter((f) => (f.id === "ai") === isAi)) {
          const first = sectionsByFamily[family.id].find(test);
          if (first && !found) [found, mentioned] = [{ family, section: first }, test.toString().includes("mentions")];
        }
      }
      const family = found?.family;
      const source = `${dir}/${file}`;
      const upstreamDir = isAi ? aiUpstream : shadcn;
      const upstreamFile =
        upstreamDir && exists(`packages/ui/upstream/${upstreamDir}/${file}`)
          ? `packages/ui/upstream/${upstreamDir}/${file}`
          : null;
      const uses = usesOf(source, isAi ? "ai" : "kit");
      const group = isAi ? aiGroups[name] : undefined;
      const hasDemo = family && (!isAi || group);
      entries.push({
        name,
        title: found?.section.title ?? titleCase(name),
        family: family?.id ?? null,
        summary: (!mentioned && (found?.section.when || found?.section.lead)) || docComment(source) || null,
        import: isAi ? `@sift-design/ui/ai/${name}` : `@sift-design/ui/${name}`,
        source,
        exports: exportsOf(source),
        uses: uses.kit,
        usesAi: uses.ai,
        docs: family
          ? { file: family.doc, anchor: found.section.id, page: `${site}/components/${family.id}#${found.section.id}` }
          : null,
        demo: hasDemo
          ? {
              live: `${site}/live/specimen/?section=${family.id}${group ? `&ai=${group}` : ""}`,
              ...(group ? { group } : {}),
            }
          : null,
        upstream: upstreamFile
          ? {
              library: isAi ? "AI Elements" : "shadcn/ui",
              version: upstreamDir.replace(/^(shadcn|ai-elements)-/, "").replace(/-new-york$/, ""),
              ...(isAi ? {} : { style: "new-york" }),
              source: upstreamFile,
              reference: isAi
                ? `https://elements.ai-sdk.dev/components/${name}`
                : `https://ui.shadcn.com/docs/components/${name}`,
            }
          : null,
        keywords: [
          ...new Set(
            [
              name,
              ...name.split("-"),
              ...(found?.section.title ?? "").toLowerCase().split(/[^a-z0-9]+/),
              family?.id,
              group,
            ].filter((w) => w && w.length > 1 && !["and", "the", "with", "for"].includes(w)),
          ),
        ],
      });
    }
  }
  return entries;
}

/**
 * The chart examples: one copyable file per upstream shadcn/ui chart block, in
 * specimen/src/charts/. Each builds on the kit chart component.
 */
export function chartIndex({ site = "" } = {}) {
  const shadcn = latestUpstream("shadcn-");
  const docs = exists("packages/ui/docs/charts.md") ? docSections("packages/ui/docs/charts.md") : [];
  return listDir("specimen/src/charts", (f) => /^chart-[a-z0-9-]+\.tsx$/.test(f)).map((file) => {
    const name = file.replace(".tsx", "");
    const source = `specimen/src/charts/${file}`;
    const text = read(source);
    const group = name.split("-")[1];
    const variant = name.split("-").slice(2).join("-");
    const section = docs.find((d) => d.id === `${group}-charts`) ?? docs.find((d) => d.id.startsWith(group));
    const upstream = shadcn && exists(`packages/ui/upstream/${shadcn}/charts/${file}`)
      ? `packages/ui/upstream/${shadcn}/charts/${file}`
      : null;
    const uses = usesOf(source, "kit");
    const local = [...text.matchAll(/from\s+["']\.\/([a-z0-9-]+)["']/g)].map((m) => `specimen/src/charts/${m[1]}.tsx`);
    return {
      name,
      group,
      variant,
      title: text.match(/<CardTitle[^>]*>([^<{]+)</)?.[1].trim() ?? titleCase(name),
      summary: text.match(/export const description\s*=\s*"([^"]+)"/)?.[1] ?? null,
      source,
      exports: exportsOf(source),
      uses: uses.kit,
      helpers: local,
      docs: section
        ? { file: "packages/ui/docs/charts.md", anchor: section.id, page: `${site}/components/charts#${section.id}` }
        : null,
      demo: { live: `${site}/live/specimen/?section=charts&charts=${group}`, group, slug: `${group}-${variant}` },
      upstream: upstream
        ? {
            library: "shadcn/ui",
            version: shadcn.replace(/^shadcn-/, "").replace(/-new-york$/, ""),
            style: "new-york",
            source: upstream,
            reference: `https://ui.shadcn.com/charts/${group}`,
          }
        : null,
      keywords: [...new Set(["chart", group, ...variant.split("-"), "recharts"].filter((w) => w && w.length > 1))],
    };
  });
}

export function blockIndex({ site = "", raw = `${site}/raw` } = {}) {
  return blocks.map((name) => {
    const readme = `blocks/${name}/README.md`;
    const files = [];
    const walk = (rel) => {
      for (const entry of listDir(rel)) {
        const child = `${rel}/${entry}`;
        if (fs.statSync(path.join(root, child)).isDirectory()) walk(child);
        else files.push(child);
      }
    };
    walk(`blocks/${name}/src`);
    const kit = new Set();
    const ai = new Set();
    for (const f of files.filter((f) => /\.tsx?$/.test(f)))
      for (const m of read(f).matchAll(/from\s+["']@sift-design\/ui\/(ai\/)?([a-z0-9-]+)["']/g))
        (m[1] ? ai : kit).add(m[2]);
    const shots = listDir(`screenshots/${name}`, (f) => /\.(png|jpg|webp|mp4)$/.test(f));
    return {
      name,
      title: title(readme),
      summary: summary(readme),
      readme,
      page: `${site}/blocks/${name}`,
      live: `${site}/live/${name}/`,
      source: `blocks/${name}/src`,
      files,
      uses: [...kit].sort(),
      usesAi: [...ai].sort(),
      headings: docSections(readme).map((s) => ({ title: s.title, anchor: s.id })),
      screenshots: {
        folder: `screenshots/${name}`,
        count: shots.length,
        stills: shots
          .filter((f) => f.endsWith(".png"))
          .slice(0, 6)
          .map((f) => `screenshots/${name}/${f}`),
      },
      raw: `${raw}/blocks/${name}/`,
    };
  });
}

/** /raw/manifest.json. `files` keeps its original shape; everything else is the index. */
export function manifest({ site = "", raw = `${site}/raw` } = {}) {
  const guideFiles = ["AGENTS.md", "DESIGN.md", ...guides, "packages/ui/README.md", "specimen/README.md", "CREDITS.md"];
  const all = componentIndex({ site });
  return {
    schema: "sift-design-manifest/2",
    name: "Sift Design",
    description:
      "A reusable visual design system for coding agents. This index lists every component, AI element, block, guide, token file and motion file, with links to source, docs and live demos.",
    howToSearch: "docs/finding-components.md",
    site,
    raw,
    families: families.map((f) => ({
      id: f.id,
      title: f.title,
      doc: f.doc,
      page: `${site}/components/${f.id}`,
      live: `${site}/live/specimen/?section=${f.id}`,
      components: all.filter((c) => c.family === f.id).map((c) => c.name),
      ...(f.id === "charts"
        ? { groups: chartGroups.map((g) => ({ id: g, live: `${site}/live/specimen/?section=charts&charts=${g}` })) }
        : {}),
    })),
    components: all.filter((c) => !c.import.startsWith("@sift-design/ui/ai/")),
    aiElements: all.filter((c) => c.import.startsWith("@sift-design/ui/ai/")),
    charts: chartIndex({ site }),
    blocks: blockIndex({ site, raw }),
    guides: guideFiles
      .filter(exists)
      .map((rel) => ({
        path: rel,
        title: title(rel),
        summary: summary(rel),
        headings: docSections(rel).map((s) => ({ title: s.title, anchor: s.id })),
      })),
    tokens: listDir("tokens", (f) => !f.startsWith("."))
      .flatMap((f) =>
        fs.statSync(path.join(root, "tokens", f)).isDirectory()
          ? listDir(`tokens/${f}`).map((g) => `tokens/${f}/${g}`)
          : [`tokens/${f}`],
      )
      .filter((rel) => !/node_modules|package\.json$/.test(rel)),
    motion: [
      "tokens/motion.ts",
      "packages/ui/src/motion.css",
      ...listDir("packages/ui/src/motion", (f) => f.endsWith(".css")).map((f) => `packages/ui/src/motion/${f}`),
      "packages/ui/src/ai.css",
      ...listDir("packages/ui/src/motion/ai", (f) => f.endsWith(".css")).map((f) => `packages/ui/src/motion/ai/${f}`),
    ].filter(exists),
    files: rawFiles(),
  };
}

export function llmsFiles({ site = "", raw = `${site}/raw` } = {}) {
  const link = (rel, label = title(rel)) => `- [${label}](${raw}/${rel}): ${summary(rel)}`;

  const llms = `# Sift Design

> A reusable visual design system for coding agents: colors, fonts, spacing, animated shadcn/ui components, and motion. Five optional fictional app screens show it in use. Source code, screenshots, and recordings are included. ${site.startsWith("http") ? "" : "Links are relative to this site's origin. "}Individual files can be read or downloaded directly.

Read AGENTS.md first, then DESIGN.md and docs/motion.md before writing UI. Copy the shared styles and components rather than recreating them. Use relevant screenshots as visual references and follow the review checklist. Keep the project's features, data model, storage, and navigation. Sift Design does not require tasks, helpers, a day timeline, local-first storage, or a sidebar, and does not exclude dashboards or chat.

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

## Shared styles and animation settings

- [tokens.css](${raw}/tokens/tokens.css): named CSS variables for colors, corners, shadows, and animations in both themes
- [tokens.json](${raw}/tokens/tokens.json): the same tokens in W3C design token format
- [motion.ts](${raw}/tokens/motion.ts): shared spring settings and animation helpers for the Motion library
- [fonts.css](${raw}/tokens/fonts.css): font loading (Albert Sans files in ${raw}/tokens/fonts/)
- [themes/harbor.css](${raw}/tokens/themes/harbor.css): a worked alternate palette (see docs/retheming.md)

## Component kit

- [Kit README](${raw}/packages/ui/README.md): how to copy the kit into a project
- [theme.css](${raw}/packages/ui/src/theme.css): Tailwind v4 theme mapping onto the tokens
- [motion.css](${raw}/packages/ui/src/motion.css): default component motion (imports ${raw}/packages/ui/src/motion/*.css)
${kitDocs.map((d) => link(d)).join("\n")}

Component sources (copy these over stock shadcn/ui files):
${components.map((c) => `- [${c.replace(".tsx", "")}](${raw}/packages/ui/src/components/${c})`).join("\n")}

AI element sources (chat, reasoning, tools, code output, canvases and voice; import \`@sift-design/ui/ai.css\` after theme.css):
${aiSources.map((c) => `- [ai/${c.replace(".tsx", "")}](${raw}/packages/ui/src/ai/${c})`).join("\n")}

Chart examples (one file per shadcn/ui chart block, built on the kit chart; each also imports specimen/src/charts/shared.tsx). Live at ${site}/live/specimen/?section=charts:
${listDir("specimen/src/charts", (f) => /^chart-.+\.tsx$/.test(f)).map((c) => `- [${c.replace(".tsx", "")}](${raw}/specimen/src/charts/${c})`).join("\n")}

## Find a component or block

- [Component and block index](${site}/raw/manifest.json): JSON with every component, AI element, chart example and block, with its import path, exports, docs anchor, live demo, upstream source and the components it uses
- [Finding components](${raw}/docs/finding-components.md): the index structure and search recipes

## Optional example screens

Blocks are fictional app screens, like shadcn/ui blocks, not a product template or feature checklist. Reuse only the components and interactions that fit the project. Find source paths under blocks/<name>/src/ in the file list, then read individual files at ${raw}/<path>. Directories are not downloads. Try an example at ${site}/live/<name>/ and read its README for behavior, screenshots, and animation examples.

${blocks.map((b) => `- [${b} example](${raw}/blocks/${b}/README.md): ${summary(`blocks/${b}/README.md`)} Source path: blocks/${b}/src/. Live: ${site}/live/${b}/`).join("\n")}
- [Sample content](${raw}/blocks/_shared/LARKSPUR.md): Larkspur, a fictional greenhouse app used in the examples
- [Component examples](${raw}/specimen/README.md): try every component at ${site}/live/specimen/

## Optional

- [Source file list](${site}/raw/manifest.json): the \`files\` array in the index lists every repository path and file size; read each file at ${raw}/<path>
- [Capture script](${raw}/scripts/capture.mjs): screenshots, motion filmstrips and clips, with axe checks

## Credits

- [Credits](${raw}/CREDITS.md): the third-party libraries, fonts and tools Sift Design uses, and the Impeccable skill used to review it
`;

  const full = ["AGENTS.md", "DESIGN.md", ...guides]
    .map((rel) => `<!-- ${raw}/${rel} -->\n\n${fs.readFileSync(path.join(root, rel), "utf8").trim()}\n`)
    .join("\n\n---\n\n");

  return { llms, full };
}
