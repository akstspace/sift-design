#!/usr/bin/env node
// Builds the hostable website into site/dist:
//
//   /                     the Sift Design site (site/)
//   /live/<name>/         every block and the component specimen, running
//   /raw/...              the reference itself, as plain files agents can fetch
//                         (DESIGN.md, AGENTS.md, docs, tokens, kit sources and
//                         docs, block sources and notes, screenshots, motion
//                         clips), same layout as the repo so relative links work
//   /raw/manifest.json    the component, block and guide index, and every raw file with its size
//   /llms.txt             the agent entry point
//   /llms-full.txt        AGENTS.md, DESIGN.md and every guide in one file
//   /404.html, .nojekyll  for static hosts such as GitHub Pages
//
//   node scripts/build-site.mjs [--skip-live]
//
// To serve from a path other than the root, as a GitHub Pages project site does:
//
//   SITE_BASE=/sift-design/ SITE_URL=https://<owner>.github.io/sift-design \
//   RAW_URL=https://raw.githubusercontent.com/<owner>/sift-design/main \
//   node scripts/build-site.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { blocks, llmsFiles, manifest, rawFiles } from "./reference.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "site", "dist");
const base = (process.env.SITE_BASE ?? "/").replace(/\/?$/, "/");
const siteUrl = (process.env.SITE_URL ?? base).replace(/\/$/, "");
const live = [...blocks.map((name) => ({ name, dir: path.join(root, "blocks", name) })), { name: "specimen", dir: path.join(root, "specimen") }];

// The site reads this as import.meta.env.VITE_RAW_URL (see site/src/base.ts).
if (process.env.RAW_URL) process.env.VITE_RAW_URL = process.env.RAW_URL;

console.log("site");
await build({
  root: path.join(root, "site"),
  base,
  logLevel: "warn",
  build: { outDir: out, emptyOutDir: true },
});

if (!process.argv.includes("--skip-live")) {
  for (const { name, dir } of live) {
    console.log("live", name);
    await build({
      root: dir,
      base: `${base}live/${name}/`,
      logLevel: "warn",
      build: { outDir: path.join(out, "live", name), emptyOutDir: true },
    });
  }
}

// The raw reference, at the same paths as in the repo so relative links work.
const files = rawFiles();
for (const { path: rel } of files) {
  const to = path.join(out, "raw", rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(path.join(root, rel), to);
}
const index = manifest({ site: siteUrl, raw: process.env.RAW_URL?.replace(/\/$/, "") });
fs.writeFileSync(path.join(out, "raw", "manifest.json"), JSON.stringify(index, null, 2) + "\n");

// The agent entry points. On a host that serves .ts files with the wrong
// content type, RAW_URL points their links at a raw-file host instead.
const { llms, full } = llmsFiles({ site: siteUrl, raw: process.env.RAW_URL?.replace(/\/$/, "") });
fs.writeFileSync(path.join(out, "llms.txt"), llms);
fs.writeFileSync(path.join(out, "llms-full.txt"), full);

// Static hosts: serve the app for any unknown route, and serve folders that
// start with an underscore (blocks/_shared) as they are.
fs.copyFileSync(path.join(out, "index.html"), path.join(out, "404.html"));
// Pages has no SPA rewrites. Give known routes real index files so direct
// visits return 200; keep 404.html only for genuinely unknown paths.
const content = fs.readFileSync(path.join(root, "site/src/content.ts"), "utf8");
const routes = new Set([...content.matchAll(/path: "(\/[a-z/-]+)"/g)].map((match) => match[1]));
for (const [group, names] of Object.entries({
  foundations: ["principles", "color", "typography", "layout"],
  components: ["controls", "overlays", "display", "ai"],
  charts: ["area", "bar", "line", "pie", "radar", "radial", "tooltip"],
  patterns: ["components", "writing", "data-visualization", "accessibility"],
  blocks,
})) {
  for (const name of names) routes.add(`/${group}/${name}`);
}
for (const route of routes) {
  const dir = path.join(out, route.slice(1));
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(path.join(out, "index.html"), path.join(dir, "index.html"));
}
fs.writeFileSync(path.join(out, ".nojekyll"), "");

const size = files.reduce((n, f) => n + f.size, 0);
console.log(`raw: ${files.length} files, ${(size / 1e6).toFixed(1)} MB; llms.txt and llms-full.txt written to ${path.relative(root, out)}`);
