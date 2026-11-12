const path = "/?section=charts&charts=tooltip";
const clip = '[data-specimen="tooltip-advanced"]';
const at = (selector) => async (page) => {
  await page.locator(selector).scrollIntoViewIfNeeded();
};
const moveToBar = async (page, index) => {
  const box = await page
    .locator(`${clip} .recharts-bar`)
    .first()
    .locator(".recharts-bar-rectangle")
    .nth(index)
    .boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
};

export default [
  ...["light", "dark"].map((theme) => ({ name: `charts-tooltip-${theme}`, path, theme, fullPage: true })),
  { name: "charts-tooltip-mobile", path, viewport: { width: 390, height: 844 }, fullPage: true },
  { name: "charts-tooltip-detail", path, clip, prepare: at(clip) },
  { name: "charts-tooltip-reduced", path, clip, reduced: true, prepare: at(clip) },
  ...[false, true].map((reduced) => ({
    name: `charts-tooltip-glide${reduced ? "-reduced" : ""}`,
    path,
    clip,
    reduced,
    prepare: async (page) => {
      await at(clip)(page);
      await moveToBar(page, 1);
      await page.waitForTimeout(400);
    },
    filmstrip: {
      frames: [0, 40, 80, 140, 220, 320, 480],
      trigger: async (page) => moveToBar(page, 4),
    },
  })),
  {
    name: "charts-tooltip-bar-sequence",
    path,
    clip,
    prepare: at(clip),
    video: {
      duration: 2200,
      trigger: async (page) => {
        for (const index of [0, 1, 2, 3, 4, 5, 2]) {
          await moveToBar(page, index);
          await page.waitForTimeout(160);
        }
      },
    },
  },
];
