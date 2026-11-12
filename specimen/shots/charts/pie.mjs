const path = "/?section=charts&charts=pie";
const interactive = '[data-specimen="pie-interactive"]';
const active = '[data-specimen="pie-donut-active"]';
const frames = [0, 40, 80, 140, 220, 320, 480];
const ready = async (page) => {
  await page.locator(interactive).scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
};
const selectJune = async (page) => {
  await page.getByRole("combobox", { name: "Revenue month" }).click();
  await page.getByRole("option", { name: "June", exact: true }).click();
};
const emphasis = async (page) => {
  await page.getByRole("button", { name: "Emphasise Bedding", exact: true }).click();
};

export default [
  { name: "charts-pie-light", path, fullPage: true, prepare: ready },
  { name: "charts-pie-dark", path, theme: "dark", fullPage: true, prepare: ready },
  { name: "charts-pie-mobile", path, viewport: { width: 390, height: 844 }, fullPage: true, prepare: ready },
  { name: "charts-pie-reduced", path, reduced: true, fullPage: true, prepare: ready },
  {
    name: "charts-pie-tooltip",
    path,
    clip: '[data-specimen="pie-simple"]',
    prepare: async (page) => {
      const card = page.locator('[data-specimen="pie-simple"]');
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
      const box = await card.locator(".recharts-sector").first().boundingBox();
      await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.4);
      await page.waitForTimeout(240);
    },
  },
  { name: "charts-pie-month", path, clip: interactive, prepare: ready, filmstrip: { trigger: selectJune, frames } },
  {
    name: "charts-pie-sector",
    path,
    clip: active,
    prepare: async (page) => {
      await page.locator(active).scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
    },
    filmstrip: { trigger: emphasis, frames },
  },
  {
    name: "charts-pie-sector-reversal",
    path,
    clip: interactive,
    prepare: ready,
    video: {
      duration: 1000,
      trigger: async (page) => {
        const button = page.getByRole("button", { name: "Inspect Bedding revenue", exact: true });
        await button.click();
        await page.waitForTimeout(100);
        await button.click();
      },
    },
  },
];
