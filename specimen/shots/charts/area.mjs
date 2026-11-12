const path = "/?section=charts&charts=area";
const interactive = '[data-specimen="area-interactive"]';
const variants = ["default", "linear", "step", "legend", "stacked", "stacked-expand", "icons", "gradient", "axes"];
// Center the card, so no control sits half under the sticky page header.
const at = (selector) => async (page) => {
  await page.locator(selector).evaluate((element) => element.scrollIntoView({ block: "center" }));
};
const changeRange = async (page) => {
  await page.getByRole("combobox", { name: "Time range", exact: true }).click();
  await page.getByRole("option", { name: "Last 7 days", exact: true }).click();
};

export default [
  ...["light", "dark"].map((theme) => ({ name: `charts-area-${theme}`, path, theme, fullPage: true })),
  ...variants.flatMap((variant) =>
    ["light", "dark"].map((theme) => ({
      name: `charts-area-${variant}-${theme}`,
      path,
      theme,
      clip: `[data-specimen="area-${variant}"]`,
      prepare: at(`[data-specimen="area-${variant}"]`),
    })),
  ),
  { name: "charts-area-mobile", path, viewport: { width: 390, height: 844 }, fullPage: true },
  { name: "charts-area-reduced", path, reduced: true, fullPage: true },
  {
    name: "charts-area-tooltip",
    path,
    clip: '[data-specimen="area-axes"]',
    prepare: async (page) => {
      const chart = page.locator('[data-specimen="area-axes"] [data-slot="chart"]');
      await chart.scrollIntoViewIfNeeded();
      const box = await chart.boundingBox();
      await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.4);
      await page.waitForTimeout(250);
    },
  },
  {
    name: "charts-area-range-filmstrip",
    path,
    clip: interactive,
    prepare: at(interactive),
    filmstrip: { trigger: changeRange, frames: [0, 40, 80, 140, 220, 320, 480, 600] },
  },
  {
    name: "charts-area-range-reduced",
    path,
    reduced: true,
    clip: interactive,
    prepare: at(interactive),
    filmstrip: { trigger: changeRange, frames: [0, 40, 80, 140, 220] },
  },
  {
    name: "charts-area-table-filmstrip",
    path,
    clip: '[data-specimen="area-default"]',
    prepare: at('[data-specimen="area-default"]'),
    filmstrip: {
      frames: [0, 40, 80, 140, 220, 320, 480],
      trigger: async (page) => {
        await page
          .locator('[data-specimen="area-default"]')
          .getByRole("button", { name: "Show data", exact: true })
          .click();
      },
    },
  },
];
