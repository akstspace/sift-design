#!/usr/bin/env node
// Check the landing page's shared gutters, reflow, interactions, motion and accessibility.
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build, preview } from "vite";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = path.join(root, "site");
const outDir = path.join(root, ".cache", "test-landing");
const errors = [];
// The same WCAG 2.2 AA rule set the reference captures use.
const wcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const sections = [
  ".landing-header",
  ".landing-hero",
  ".landing-stage",
  ".landing-agent",
  ".landing-components",
  ".landing-motion",
  ".landing-palette",
  ".landing-close",
  ".landing-footer",
];
await build({ root: appRoot, logLevel: "error", build: { outDir, emptyOutDir: true } });
const server = await preview({
  root: appRoot,
  logLevel: "error",
  build: { outDir },
  preview: { port: 0, open: false },
});
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch({ channel: "chrome" });
let cases = 0;

// Sections rise in the first time they are seen. Pass over the page so all of them have.
const passOver = (page) =>
  page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 320) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 700));
  });

try {
  for (const theme of ["light", "dark"]) {
    for (const width of [2000, 1440, 1024, 960, 820, 768, 390, 360, 320]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        permissions: ["clipboard-read", "clipboard-write"],
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(`${width}px ${theme}: ${error.message}`));
      await page.goto(`${url}?theme=${theme}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await passOver(page);

      const geometry = await page.evaluate((selectors) => {
        const box = (node) => {
          const rect = node.getBoundingClientRect();
          const style = getComputedStyle(node);
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            left: rect.x + parseFloat(style.paddingLeft),
            edge: rect.right - parseFloat(style.paddingRight),
          };
        };
        return {
          sections: selectors.map((selector) => ({ selector, ...box(document.querySelector(selector)) })),
          steps: box(document.querySelector(".agent-copy")),
          prompt: box(document.querySelector(".landing-prompt")),
          documentWidth: document.documentElement.scrollWidth,
          hidden: [
            ...document.querySelectorAll("main h2:not(.sr-only), .sheet-label, .lane, .role-swatches li"),
          ].filter((node) => Number(getComputedStyle(node.closest('[style*="opacity"]') ?? node).opacity) < 0.99)
            .length,
          overflow: [
            ...document.querySelectorAll(
              ".landing-hero *, .landing-agent *, .sheet *, .spring-lab *, .landing-palette *",
            ),
          ]
            .filter((node) => {
              const rect = node.getBoundingClientRect();
              return (
                rect.width &&
                !node.closest(".landing-block-tabs") &&
                !node.matches(".lane-run") &&
                (rect.x < -1 || rect.right > innerWidth + 1)
              );
            })
            .map((node) => node.className.baseVal ?? node.className),
        };
      }, sections);
      const guide = geometry.sections[1];
      for (const section of geometry.sections) {
        assert.ok(Math.abs(section.left - guide.left) < 1, `${width}px ${section.selector}: shared left gutter`);
        assert.ok(Math.abs(section.edge - guide.edge) < 1, `${width}px ${section.selector}: shared right gutter`);
      }
      assert.ok(geometry.documentWidth <= width, `${width}px: no page overflow`);
      assert.deepEqual(geometry.overflow, [], `${width}px: content stays within the viewport`);
      assert.equal(geometry.hidden, 0, `${width}px: every section has revealed after being seen`);
      if (width >= 960)
        assert.ok(geometry.prompt.x > geometry.steps.x + geometry.steps.width - 1, "prompt sits beside the steps");
      else
        assert.ok(
          geometry.prompt.y > geometry.steps.y && Math.abs(geometry.prompt.x - geometry.steps.x) < 1,
          "narrow layouts stack in reading order",
        );

      // The prompt: the copy is the whole text, and each step lights its own sentences.
      const card = page.locator(".landing-prompt");
      const text = await page.locator("#landing-agent-prompt").textContent();
      await card.getByRole("button", { name: "Copy agent prompt", exact: true }).click();
      await card.getByRole("button", { name: "Copied", exact: true }).waitFor();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), text, "copy retains the complete prompt");
      if (width < 960) {
        await card.getByRole("button", { name: "Show full prompt", exact: true }).click();
        await page.waitForFunction(() => {
          const node = document.querySelector(".landing-prompt-excerpt");
          return (
            Math.abs(node.getBoundingClientRect().height - node.firstElementChild.getBoundingClientRect().height) < 1
          );
        });
        await card.getByRole("button", { name: "Show less", exact: true }).click();
      } else
        assert.equal(
          await card.getByRole("button", { name: "Show full prompt" }).count(),
          0,
          "wide screens show the whole prompt",
        );
      for (const step of [1, 2, 3, 4]) {
        await page
          .locator(".agent-step")
          .nth(step - 1)
          .hover();
        assert.ok(
          (await page.locator(".prompt-sentence[data-match]").count()) > 0,
          `step ${step} highlights its sentences`,
        );
      }

      // Live components on the sheet.
      await page.getByRole("radio", { name: "List", exact: true }).click();
      assert.equal(await page.getByRole("radio", { name: "List", exact: true }).getAttribute("data-state"), "on");
      await page.getByRole("checkbox", { name: "Water the seedling trays", exact: true }).click();
      await page.getByText("2 of 3", { exact: true }).waitFor();
      await page.getByRole("tab", { name: "Week", exact: true }).click();
      await page.getByText("across two houses", { exact: false }).waitFor();
      await page.getByRole("button", { name: "Bench actions", exact: true }).click();
      await page.getByRole("menuitem", { name: "Water now" }).waitFor();
      await page.keyboard.press("Escape");

      // The spring lab played once on sight; a lane click turns its puck around.
      const lane = page.getByRole("button", { name: /^Play spring\.smooth/ });
      const puck = () => lane.locator(".lane-puck").evaluate((node) => node.getBoundingClientRect().x);
      const end = await puck();
      await lane.click();
      await page.waitForTimeout(900);
      assert.ok((await puck()) < end - 20, "a lane click sends its puck back");

      if (width === 1440) {
        const axe = await new AxeBuilder({ page }).withTags(wcag).include(".landing").analyze();
        assert.deepEqual(
          axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`),
          [],
          `${theme}: zero axe violations`,
        );
        // Palette and theme switches re-theme the whole page, then switch back.
        await page.locator('[data-group="palette"] [data-value="harbor"]').click();
        await page.waitForFunction(() => document.documentElement.dataset.palette === "harbor");
        await page.waitForTimeout(900);
        const harborAxe = await new AxeBuilder({ page }).withTags(wcag).include(".landing").analyze();
        assert.deepEqual(
          harborAxe.violations.map((v) => v.id),
          [],
          `${theme} Harbor: zero axe violations`,
        );
        await page.locator('[data-group="palette"] [data-value="default"]').click();
        await page.waitForFunction(() => !document.documentElement.dataset.palette);
      }

      // Emulate enlarged user text in the regions most likely to clip.
      if (width === 360) {
        await page.addStyleTag({
          content:
            ".landing-prompt-code, .hero-lede, .agent-step p { font-size: 28px !important; letter-spacing: .12em !important; word-spacing: .16em !important; line-height: 1.5 !important; }",
        });
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          "enlarged text reflows",
        );
      }
      cases++;
      await context.close();
    }
  }

  // Reduced motion: everything is visible at once and nothing travels.
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(`reduced: ${error.message}`));
  await page.goto(url, { waitUntil: "networkidle" });
  await passOver(page);
  assert.equal(
    await page.locator("#lab-calm").getAttribute("data-state"),
    "checked",
    "the lab starts in reduced motion",
  );
  assert.equal(
    await page.evaluate(
      () =>
        [...document.querySelectorAll(".hero-word")].filter(
          (n) =>
            getComputedStyle(n).transform !== "none" && getComputedStyle(n).transform !== "matrix(1, 0, 0, 1, 0, 0)",
        ).length,
    ),
    0,
    "no hero travel",
  );
  cases++;
  await context.close();

  assert.deepEqual(errors, [], "no browser errors");
  console.log(
    `PASS ${cases} landing cases: both themes, 2000–320px, shared gutters, reveals, reflow, clipboard, step highlights, live components, spring lab, axe in both palettes, enlarged text and reduced motion.`,
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
