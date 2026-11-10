#!/usr/bin/env node
// Builds a block (or the specimen, or the site), serves it, and captures the reference images listed in
// its shots file. Uses the installed Chrome, so no browser download.
//
//   node scripts/capture.mjs <block|specimen|site> [--shots shots.mjs] [--only a,b] [--axe] [--no-build]
//
// A shots file default-exports an array. Every shot has a `name` and may set:
//   path        URL path and query, default "/"            (theme is added for you)
//   viewport    { width, height }, default 1440 x 900
//   theme       "light" | "dark", default "light"
//   reduced     true to emulate prefers-reduced-motion: reduce
//   fullPage    true for a full-height capture (the window grows to the page)
//   clip        CSS selector or { x, y, width, height } to crop to
//   prepare     async (page) => {} run before the capture (open a menu, ...)
//
// Motion is recorded two ways:
//   filmstrip: { trigger: async (page) => {}, frames: [0, 60, 120, 200, 360] }
//     Freezes time (page clock for JS, Web Animations for CSS) and composites
//     the frames side by side with their timestamps: <name>.png
//   video: { trigger: async (page) => {}, duration: 1200 }
//     Records the real thing at 2x through Chrome's screencast and writes
//     <name>.mp4 (H.264) for the website, <name>.jpg as its poster, and
//     <name>.webp (animated, via gif2webp from libwebp) for READMEs, because
//     GitHub plays repository media inline only as images.
//
// Output goes to screenshots/<name>/. With --axe, every still is also
// checked with axe-core; results land in screenshots/<example>/axe.json, or
// <shots-name>-axe.json when --shots names another file.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build, preview } from "vite";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const example = args.find((a) => !a.startsWith("--") && !isFlagValue(a));
function isFlagValue(a) {
  const i = args.indexOf(a);
  return i > 0 && (args[i - 1] === "--shots" || args[i - 1] === "--only");
}
function flag(name) {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
}
if (!example) {
  console.error("usage: node scripts/capture.mjs <block|specimen|site> [--shots file] [--only a,b] [--axe] [--no-build]");
  process.exit(2);
}
// A block under blocks/, or an app folder at the repo root ("specimen", "site").
const exampleDir = fs.existsSync(path.join(root, "blocks", example)) ? path.join(root, "blocks", example) : path.join(root, example);
const shotsFile = path.resolve(exampleDir, flag("--shots") ?? "shots.mjs");
const only = flag("--only")?.split(",");
const withAxe = args.includes("--axe");
const outDir = path.join(root, "screenshots", example);
fs.mkdirSync(outDir, { recursive: true });

const shots = (await import(pathToFileURL(shotsFile).href + "?t=" + Date.now())).default.filter(
  (s) => !only || only.includes(s.name),
);

// Each run builds into its own folder, so parallel captures never serve each
// other's half-written assets. --no-build reuses the last private build.
const buildDir = path.join(root, ".cache", "capture", example + "-" + path.basename(shotsFile, ".mjs"));
if (!args.includes("--no-build") || !fs.existsSync(buildDir)) {
  await build({ root: exampleDir, logLevel: "warn", build: { outDir: buildDir, emptyOutDir: true } });
}
const server = await preview({ root: exampleDir, logLevel: "warn", build: { outDir: buildDir }, preview: { port: 0, strictPort: false, open: false } });
const base = server.resolvedUrls.local[0].replace(/\/$/, "");

const browser = await chromium.launch({ channel: "chrome" });
const axeResults = [];
let failures = 0;

function urlFor(shot) {
  const u = new URL((shot.path ?? "/").replace(/^\//, ""), base + "/");
  u.searchParams.set("theme", shot.theme ?? "light");
  return u.href;
}

async function open(shot, extra = {}) {
  const context = await browser.newContext({
    viewport: shot.viewport ?? { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: shot.theme === "dark" ? "dark" : "light",
    reducedMotion: shot.reduced ? "reduce" : "no-preference",
    ...extra,
  });
  const page = await context.newPage();
  page.on("console", (m) => m.type() === "error" && console.log(`  [${shot.name}] console error: ${m.text()}`));
  page.on("pageerror", (e) => console.log(`  [${shot.name}] page error: ${e.message}`));
  return { context, page };
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  // Wait for running animations to finish, but never forever (spinners loop).
  for (let i = 0; i < 30; i++) {
    const running = await page.evaluate(
      () => document.getAnimations().filter((a) => a.playState === "running" && a.effect?.getComputedTiming().iterations !== Infinity).length,
    );
    if (!running) break;
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(150);
}

async function clipFor(page, clip) {
  if (!clip) return undefined;
  if (typeof clip !== "string") return clip;
  const box = await page.locator(clip).first().boundingBox();
  if (!box) throw new Error(`clip selector not found: ${clip}`);
  const pad = 16;
  const vp = page.viewportSize();
  const x = Math.max(0, box.x - pad);
  const y = Math.max(0, box.y - pad);
  return { x, y, width: Math.min(vp.width - x, box.width + pad * 2), height: Math.min(vp.height - y, box.height + pad * 2) };
}

async function still(shot) {
  const { context, page } = await open(shot);
  await page.goto(urlFor(shot), { waitUntil: "networkidle" });
  await settle(page);
  if (shot.prepare) {
    await shot.prepare(page);
    await settle(page);
  }
  if (shot.fullPage) {
    // Grow the window to the page's height instead of stitching a scroll
    // capture, so full-height rails and sticky layouts render as they would
    // in a tall window rather than stopping after the first screen.
    const width = page.viewportSize().width;
    for (let i = 0; i < 3; i++) {
      const height = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
      if (height === page.viewportSize().height) break;
      await page.setViewportSize({ width, height });
      await settle(page);
    }
  }
  const file = path.join(outDir, shot.name + ".png");
  await page.screenshot({ path: file, clip: await clipFor(page, shot.clip), animations: "allow" });
  if (withAxe) {
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    axeResults.push({
      shot: shot.name,
      violations: result.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, targets: v.nodes.map((n) => n.target.join(" ")) })),
    });
    if (result.violations.length) console.log(`  [${shot.name}] axe: ${result.violations.map((v) => v.id).join(", ")}`);
  }
  await context.close();
  return file;
}

async function filmstrip(shot) {
  const { frames, trigger } = shot.filmstrip;
  const { context, page } = await open(shot);
  await page.clock.install();
  await page.goto(urlFor(shot), { waitUntil: "networkidle" });
  await page.clock.runFor(1500);
  await settle(page);
  if (shot.prepare) {
    await shot.prepare(page);
    await page.clock.runFor(1500);
    await settle(page);
  }
  const clip = await clipFor(page, shot.clip);
  await page.evaluate(() => {
    window.__before = new Set(document.getAnimations());
    window.__seen = new Map();
  });
  await trigger(page);
  const images = [];
  let now = 0;
  for (const t of frames) {
    await page.clock.runFor(Math.max(0, t - now));
    now = t;
    // CSS and Web Animations run on the real timeline: pin each new one to t.
    await page.evaluate((t) => {
      for (const a of document.getAnimations()) {
        if (window.__before.has(a)) continue;
        if (!window.__seen.has(a)) window.__seen.set(a, t);
        a.pause();
        a.currentTime = t - window.__seen.get(a);
      }
    }, t);
    images.push({ t, data: (await page.screenshot({ clip, animations: "allow" })).toString("base64") });
  }
  await context.close();

  // Composite the frames with their timestamps on the theme's ground color.
  const dark = shot.theme === "dark";
  const sheet = await browser.newPage({ deviceScaleFactor: 1 });
  const cols = Math.min(images.length, shot.filmstrip.columns ?? 5);
  await sheet.setContent(`<!doctype html><html><body style="margin:0;background:${dark ? "#18191b" : "#ebe9e4"};color:${dark ? "#b5b7b9" : "#6b5b5b"};font:500 22px ui-monospace,Menlo,monospace">
    <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:28px;padding:32px;width:${cols * 760}px">
    ${images.map((i) => `<figure style="margin:0"><img style="width:100%;display:block;border-radius:12px;outline:1px solid ${dark ? "#3b3e41" : "#cfc8c3"}" src="data:image/png;base64,${i.data}"><figcaption style="margin-top:12px">${i.t} ms</figcaption></figure>`).join("")}
    </div></body></html>`);
  await sheet.waitForLoadState("load");
  const file = path.join(outDir, shot.name + ".png");
  await sheet.locator("div").first().screenshot({ path: file });
  await sheet.close();
  return file;
}

// The screencast always delivers frames at the window's device scale, which
// viewport emulation cannot raise. A second browser runs at a real 2x scale and
// each window is sized so its viewport matches the shot.
let videoBrowser;
async function openForVideo(shot, viewport) {
  videoBrowser ??= await chromium.launch({ channel: "chrome", args: ["--force-device-scale-factor=2", "--hide-scrollbars"] });
  const context = await videoBrowser.newContext({
    viewport: null,
    colorScheme: shot.theme === "dark" ? "dark" : "light",
    reducedMotion: shot.reduced ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => console.log(`  [${shot.name}] page error: ${e.message}`));
  const cdp = await context.newCDPSession(page);
  const { windowId } = await cdp.send("Browser.getWindowForTarget");
  let bounds = { width: viewport.width, height: viewport.height };
  for (let i = 0; i < 3; i++) {
    await cdp.send("Browser.setWindowBounds", { windowId, bounds });
    const [w, h] = await page.evaluate(() => [innerWidth, innerHeight]);
    if (w === viewport.width && h === viewport.height) break;
    bounds = { width: bounds.width + viewport.width - w, height: bounds.height + viewport.height - h };
  }
  // The window is sized by hand, so report the shot's viewport to triggers that ask.
  page.viewportSize = () => viewport;
  return { context, page, cdp };
}

async function video(shot) {
  // Recorded through Chrome's screencast at 2x, so text stays sharp, then encoded
  // from the same frames as an H.264 MP4 with a JPEG poster for the website, and
  // an animated WebP for READMEs, since GitHub only plays repository media
  // inline as images. (AV1 was tried and came out larger on UI recordings.)
  const viewport = shot.viewport ?? { width: 1440, height: 900 };
  fs.mkdirSync(path.join(root, ".cache"), { recursive: true });
  const tmp = fs.mkdtempSync(path.join(root, ".cache", "video-"));
  const { context, page, cdp } = await openForVideo(shot, viewport);
  await page.goto(urlFor(shot), { waitUntil: "networkidle" });
  await settle(page);
  if (shot.prepare) {
    await shot.prepare(page);
    await settle(page);
  }
  const frames = [];
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    frames.push({ data, t: metadata.timestamp ?? Date.now() / 1000 });
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: viewport.width * 2, maxHeight: viewport.height * 2 });
  await page.waitForTimeout(350);
  await shot.video.trigger(page);
  await page.waitForTimeout(shot.video.duration ?? 1200);
  const end = Date.now() / 1000;
  await cdp.send("Page.stopScreencast");
  await context.close();
  if (!frames.length) throw new Error("no frames recorded");

  // Frames arrive only when something changes; give each one its real duration.
  const list = frames.map((frame, i) => {
    const file = path.join(tmp, `f${String(i).padStart(5, "0")}.jpg`);
    fs.writeFileSync(file, Buffer.from(frame.data, "base64"));
    const next = frames[i + 1]?.t ?? Math.max(end, frame.t + 0.4);
    return `file '${file}'\nduration ${Math.max(0.001, next - frame.t).toFixed(4)}`;
  });
  const last = path.join(tmp, `f${String(frames.length - 1).padStart(5, "0")}.jpg`);
  const listFile = path.join(tmp, "frames.txt");
  fs.writeFileSync(listFile, list.join("\n") + `\nfile '${last}'\n`);
  const input = ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", listFile];
  // Crop boxes can be fractional CSS pixels; H.264 needs even dimensions.
  const even = (n) => 2 * Math.round(n);
  const box = shot.video.crop;
  const crop = box ? `crop=${even(box.width)}:${even(box.height)}:${even(box.x)}:${even(box.y)},` : "";
  const siteWidth = Math.min(viewport.width * 2, shot.video.siteWidth ?? 1600);
  const scale = `${crop}fps=30,scale='trunc(min(${siteWidth},iw)/2)*2':-2:flags=lanczos`;
  const base = path.join(outDir, shot.name);
  execFileSync("ffmpeg", [...input, "-vf", `${scale},format=yuv420p`, "-c:v", "libx264", "-preset", "veryslow", "-crf", "30", "-movflags", "+faststart", "-an", base + ".mp4"]);
  execFileSync("ffmpeg", [...input, "-vf", scale, "-frames:v", "1", "-q:v", "4", base + ".jpg"]);
  const gif = path.join(tmp, "recording.gif");
  const gifWidth = Math.min(viewport.width, shot.video.width ?? 960);
  execFileSync("ffmpeg", [...input, "-vf",
    `${crop}fps=30,scale=${gifWidth}:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`, gif]);
  execFileSync("gif2webp", ["-quiet", "-lossy", "-q", "65", "-m", "4", "-mixed", gif, "-o", base + ".webp"]);
  fs.rmSync(base + ".gif", { force: true });
  fs.rmSync(tmp, { recursive: true, force: true });
  return base + ".mp4";
}

for (const shot of shots) {
  try {
    const file = shot.filmstrip ? await filmstrip(shot) : shot.video ? await video(shot) : await still(shot);
    console.log(`ok   ${path.relative(root, file)}`);
  } catch (error) {
    failures++;
    console.log(`FAIL ${shot.name}: ${error.message}`);
  }
}

if (withAxe) {
  // One report per shots file: shots.mjs -> axe.json, shots/overlays.mjs -> overlays-axe.json.
  const axeName = path.basename(shotsFile) === "shots.mjs" ? "axe.json" : path.basename(shotsFile, ".mjs") + "-axe.json";
  const axeFile = path.join(outDir, axeName);
  const kept = only && fs.existsSync(axeFile)
    ? JSON.parse(fs.readFileSync(axeFile, "utf8")).filter((r) => !only.includes(r.shot))
    : [];
  const all = [...kept, ...axeResults].sort((a, b) => a.shot.localeCompare(b.shot));
  fs.writeFileSync(axeFile, JSON.stringify(all, null, 2) + "\n");
  const count = all.reduce((n, r) => n + r.violations.length, 0);
  console.log(`axe: ${count} violation group(s) across ${all.length} capture(s)`);
}

await browser.close();
await videoBrowser?.close();
await new Promise((resolve) => server.httpServer.close(resolve));
process.exit(failures ? 1 : 0);
