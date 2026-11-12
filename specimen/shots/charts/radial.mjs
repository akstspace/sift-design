const path = "/?section=charts&charts=radial";
const textCard = '[data-specimen="radial-text"]';
const scrollTo = (selector) => async (page) => {
  await page.locator(selector).scrollIntoViewIfNeeded();
};

export default [
  ...["light", "dark"].map((theme) => ({ name: `charts-radial-${theme}`, path, theme, fullPage: true })),
  { name: "charts-radial-mobile", path, viewport: { width: 390, height: 844 }, fullPage: true },
  { name: "charts-radial-reduced", path, reduced: true, fullPage: true },
  {
    name: "charts-radial-tooltip",
    path,
    clip: '[data-specimen="radial-simple"]',
    prepare: async (page) => {
      await page
        .locator('[data-specimen="radial-simple"] svg.recharts-surface')
        .hover({ position: { x: 170, y: 125 } });
    },
  },
  ...[false, true].map((reduced) => ({
    name: `charts-radial-crate-filmstrip${reduced ? "-reduced" : ""}`,
    path,
    reduced,
    clip: textCard,
    prepare: scrollTo(textCard),
    filmstrip: {
      frames: [0, 40, 80, 140, 220, 320, 480, 640],
      trigger: async (page) => {
        await page.getByRole("button", { name: "Pack one crate", exact: true }).click();
      },
    },
  })),
  {
    name: "charts-radial-crate-reversal",
    path,
    clip: textCard,
    prepare: scrollTo(textCard),
    video: {
      duration: 1200,
      trigger: async (page) => {
        await page.getByRole("button", { name: "Pack one crate", exact: true }).click();
        await page.waitForTimeout(100);
        await page.getByRole("button", { name: "Undo last crate", exact: true }).click();
      },
    },
  },
];
