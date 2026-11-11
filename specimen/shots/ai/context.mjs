const path = "/?section=ai&ai=context";
const clip = (name) => `[data-specimen="${name}"]`;
const scroll = (name) => async (page) => {
  await page.locator(clip(name)).scrollIntoViewIfNeeded();
};
const add = async (page) => {
  await page.getByRole("button", { name: "Add growing records", exact: true }).click();
};
export default [
  ...["light", "dark"].flatMap((theme) =>
    ["context", "model-selector", "open-in-chat"].map((name) => ({
      name: `ai-${name}-${theme}`,
      path,
      theme,
      clip: clip(name),
      prepare: scroll(name),
    })),
  ),
  { name: "ai-context-mobile", path, viewport: { width: 390, height: 844 }, fullPage: true },
  { name: "ai-context-mobile-dark", path, theme: "dark", viewport: { width: 390, height: 844 }, fullPage: true },
  {
    name: "ai-context-warning",
    path,
    clip: clip("context"),
    prepare: async (page) => {
      await add(page);
      await add(page);
      await add(page);
    },
  },
  {
    name: "ai-context-details",
    path,
    prepare: async (page) => {
      await page.getByRole("button", { name: /Context usage:/ }).click();
    },
    fullPage: true,
  },
  {
    name: "ai-model-selector-search",
    path,
    prepare: async (page) => {
      await page.getByRole("button", { name: /Meadowlark 3/ }).click();
      await page.getByRole("combobox").fill("Quarry");
    },
    fullPage: true,
  },
  {
    name: "ai-open-in-chat-menu",
    path,
    prepare: async (page) => {
      await page.getByRole("button", { name: "Open in", exact: true }).click();
    },
    fullPage: true,
  },
  {
    name: "ai-context-value-filmstrip",
    path,
    clip: clip("context"),
    prepare: scroll("context"),
    filmstrip: { frames: [0, 60, 140, 280, 540], trigger: add },
  },
  {
    name: "ai-context-reduced",
    path,
    reduced: true,
    clip: clip("context"),
    filmstrip: { frames: [0, 80, 160], trigger: add },
  },
];
