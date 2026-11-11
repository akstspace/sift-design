const path = "/?section=ai&ai=canvas";
const slugs = ["canvas", "node", "edge", "connection", "controls", "panel", "toolbar"];
const run = async (page) => {
  await page.locator('[data-specimen="canvas"]').getByRole("button", { name: "Run", exact: true }).click();
};

export default [
  ...["light", "dark"].flatMap((theme) =>
    slugs.map((slug) => ({
      name: `ai-${slug}-${theme}`,
      path,
      theme,
      clip: `[data-specimen="${slug}"]`,
      viewport: { width: 1280, height: 1000 },
    })),
  ),
  ...slugs.map((slug) => ({
    name: `ai-${slug}-mobile`,
    path,
    clip: `[data-specimen="${slug}"]`,
    viewport: { width: 390, height: 1000 },
  })),
  {
    name: "ai-canvas-run",
    path,
    clip: '[data-specimen="canvas"]',
    video: { trigger: run, duration: 6400 },
  },
  {
    name: "ai-edge-reduced",
    path,
    reduced: true,
    clip: '[data-specimen="edge"]',
    prepare: async (page) => {
      await page.getByRole("button", { name: "Run edge activity", exact: true }).click();
    },
  },
  {
    name: "ai-connection-linked",
    path,
    clip: '[data-specimen="connection"]',
    prepare: async (page) => {
      await page.getByRole("button", { name: "Connect steps", exact: true }).click();
    },
  },
];
