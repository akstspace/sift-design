const path = "/?section=ai&ai=file-tree";
const sections = ["file-tree", "schema-display", "environment-variables"];
const at = (slug) => async (page) => {
  await page.locator(`[data-specimen="${slug}"]`).scrollIntoViewIfNeeded();
};
export default [
  ...["light", "dark"].flatMap((theme) =>
    sections.map((slug) => ({
      name: `ai-${slug}-${theme}`,
      path,
      theme,
      clip: `[data-specimen="${slug}"]`,
      prepare: at(slug),
    })),
  ),
  ...sections.map((slug) => ({
    name: `ai-${slug}-mobile`,
    path,
    viewport: { width: 390, height: 844 },
    clip: `[data-specimen="${slug}"]`,
    prepare: at(slug),
  })),
  {
    name: "ai-schema-display-bench",
    path,
    clip: '[data-specimen="schema-display"]',
    prepare: async (page) => {
      await page.getByRole("button", { name: "Read bench", exact: true }).click();
      await at("schema-display")(page);
    },
  },
  {
    name: "ai-file-tree-selection",
    path,
    clip: '[data-specimen="file-tree"]',
    prepare: at("file-tree"),
    filmstrip: {
      frames: [0, 40, 80, 140, 260, 420],
      trigger: async (page) => {
        await page.locator('[data-slot="file-tree-file"][data-path="larkspur-app/src/api/benches.ts"]').click();
      },
    },
  },
  {
    name: "ai-file-tree-disclosure",
    path,
    clip: '[data-specimen="file-tree"]',
    prepare: at("file-tree"),
    filmstrip: {
      frames: [0, 40, 80, 140, 260, 420],
      trigger: async (page) => {
        await page.getByRole("button", { name: "Collapse api", exact: true }).click();
      },
    },
  },
  {
    name: "ai-environment-variables-reveal",
    path,
    clip: '[data-specimen="environment-variables"]',
    prepare: at("environment-variables"),
    filmstrip: {
      frames: [0, 40, 80, 140, 260, 420],
      trigger: async (page) => {
        await page.getByRole("switch", { name: "Toggle value visibility" }).click();
      },
    },
  },
  { name: "ai-file-tree-reduced", path, reduced: true, fullPage: true },
];
