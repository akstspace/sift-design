const path = "/?section=charts&charts=bar";
const clip = '[data-specimen="bar-interactive"]';
const frames = [0, 40, 80, 140, 220, 320, 480];

export default [
  ...["light", "dark"].map((theme) => ({ name: `charts-bar-${theme}`, path, theme, fullPage: true })),
  { name: "charts-bar-mobile", path, viewport: { width: 390, height: 844 }, fullPage: true },
  { name: "charts-bar-reduced", path, reduced: true, fullPage: true },
  {
    name: "charts-bar-tooltip",
    path,
    clip,
    prepare: async (page) => {
      const box = await page.locator(`${clip} .recharts-surface`).boundingBox();
      await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.4);
      await page.waitForTimeout(300);
    },
  },
  {
    name: "charts-bar-metric-filmstrip",
    path,
    clip,
    filmstrip: {
      frames,
      trigger: async (page) => page.getByRole("button", { name: /^Wholesale/ }).click(),
    },
  },
  {
    name: "charts-bar-active-hover",
    path,
    clip: '[data-specimen="bar-active"]',
    filmstrip: {
      frames,
      trigger: async (page) => {
        await page.locator('[data-specimen="bar-active"] .recharts-bar-rectangle').first().hover();
      },
    },
  },
];
