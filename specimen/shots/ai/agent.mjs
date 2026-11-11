const path = "/?section=ai&ai=agent";
const clip = (name) => `[data-specimen="${name}"]`;
export default [
  ...["light", "dark"].flatMap((theme) =>
    ["agent", "sandbox", "jsx-preview"].map((name) => ({
      name: `ai-${name}-${theme}`,
      path,
      theme,
      clip: clip(name),
      prepare: async (page) => {
        await page.waitForTimeout(2100);
        if (name === "agent") await page.getByRole("button", { name: "read_inventory", exact: true }).click();
      },
    })),
  ),
  {
    name: "ai-agent-mobile",
    path,
    viewport: { width: 390, height: 844 },
    fullPage: true,
    prepare: async (page) => page.waitForTimeout(2100),
  },
  { name: "ai-agent-reduced", path, reduced: true, fullPage: true },
  {
    name: "ai-jsx-preview-stream",
    path,
    clip: clip("jsx-preview"),
    prepare: async (page) => page.locator(clip("jsx-preview")).scrollIntoViewIfNeeded(),
    video: {
      trigger: async (page) => page.getByRole("button", { name: "Replay JSX", exact: true }).click(),
      duration: 3200,
    },
  },
  {
    name: "ai-sandbox-tabs",
    path,
    clip: clip("sandbox"),
    prepare: async (page) => {
      await page.waitForTimeout(2100);
      await page.locator(clip("sandbox")).scrollIntoViewIfNeeded();
    },
    filmstrip: {
      trigger: async (page) => page.getByRole("tab", { name: "Code", exact: true }).click(),
      frames: [0, 60, 140, 260, 420],
    },
  },
];
