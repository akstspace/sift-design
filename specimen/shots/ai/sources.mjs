const path = "/?section=ai&ai=sources";
const focusCitation = async (page) => {
  await page.getByRole("button", { name: "Citation 1, 3 sources", exact: true }).focus();
  await page.waitForTimeout(200);
};
export default [
  ...["light", "dark"].flatMap((theme) => [
    {
      name: `sources-list-${theme}`,
      path,
      theme,
      clip: '[data-specimen="sources"]',
      prepare: async (page) => {
        await page.locator('[data-specimen="sources"]').getByRole("button", { name: "Used 4 sources" }).click();
      },
    },
    {
      name: `sources-inline-citation-${theme}`,
      path,
      theme,
      clip: '[data-specimen="inline-citation"]',
      prepare: focusCitation,
    },
    { name: `sources-image-${theme}`, path, theme, clip: '[data-specimen="image"]' },
  ]),
  { name: "sources-mobile", path, viewport: { width: 390, height: 844 }, fullPage: true },
  {
    name: "sources-citation-mobile",
    path,
    viewport: { width: 390, height: 844 },
    fullPage: true,
    prepare: focusCitation,
  },
  {
    name: "sources-image-loading",
    path,
    clip: '[data-specimen="image"]',
    prepare: async (page) => {
      await page.getByRole("button", { name: "Generate again" }).click();
    },
  },
  {
    name: "sources-citation-crossfade",
    path,
    prepare: focusCitation,
    filmstrip: {
      frames: [0, 40, 80, 140, 220],
      trigger: async (page) => {
        await page.getByRole("button", { name: "Next source" }).click();
      },
    },
  },
  {
    name: "sources-generate-reveal",
    path,
    clip: '[data-specimen="image"]',
    video: {
      duration: 1600,
      trigger: async (page) => {
        await page.getByRole("button", { name: "Generate again" }).click();
      },
    },
  },
  { name: "sources-reduced", path, reduced: true, fullPage: true, prepare: focusCitation },
];
