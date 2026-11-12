const path = "/?section=charts&charts=radar";
const card = '[data-specimen="radar-default"]';
const at = (selector) => async (page) => {
  await page.locator(selector).scrollIntoViewIfNeeded();
};

export default [
  ...["light", "dark"].map((theme) => ({ name: `charts-radar-${theme}`, path, theme, fullPage: true })),
  { name: "charts-radar-mobile", path, viewport: { width: 390, height: 844 }, fullPage: true },
  { name: "charts-radar-reduced", path, reduced: true, fullPage: true },
  {
    name: "charts-radar-tooltip",
    path,
    clip: card,
    prepare: async (page) => {
      await at(card)(page);
      await page.locator(`${card} .recharts-surface`).focus();
      await page.keyboard.press("ArrowRight");
    },
  },
  {
    name: "charts-radar-labels-mobile",
    path,
    viewport: { width: 390, height: 844 },
    clip: '[data-specimen="radar-label-custom"]',
    prepare: at('[data-specimen="radar-label-custom"]'),
  },
  {
    name: "charts-radar-data-filmstrip",
    path,
    clip: card,
    prepare: at(card),
    filmstrip: {
      frames: [0, 40, 80, 140, 220, 320, 480],
      trigger: async (page) => {
        await page.locator(card).getByRole("button", { name: "Show data", exact: true }).click();
      },
    },
  },
];
