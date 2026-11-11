const path = "/?section=ai&ai=tool";
const clip = (name) => `[data-specimen="${name}"]`;
const replay = async (page) => {
  await page.getByRole("button", { name: "Replay sensor check", exact: true }).click();
};
export default [
  ...["light", "dark"].flatMap((theme) =>
    ["tool", "compact-tool", "code-block", "snippet"].map((name) => ({
      name: `ai-${name}-${theme}`,
      path,
      theme,
      clip: clip(name),
    })),
  ),
  { name: "ai-tool-mobile", path, viewport: { width: 390, height: 844 }, fullPage: true },
  { name: "ai-tool-reduced", path, reduced: true, clip: clip("tool") },
  {
    name: "ai-tool-approval",
    path,
    clip: clip("tool"),
    prepare: async (page) => {
      await replay(page);
      await page.getByRole("button", { name: "Approve sensor check", exact: true }).waitFor();
    },
  },
  {
    name: "ai-code-block-json",
    path,
    clip: clip("code-block"),
    prepare: async (page) => {
      await page.getByRole("combobox", { name: "Code language", exact: true }).click();
      await page.getByRole("option", { name: "JSON", exact: true }).click();
    },
  },
  {
    name: "ai-tool-status-motion",
    path,
    clip: clip("tool"),
    prepare: async (page) => {
      await replay(page);
      await page.getByRole("button", { name: "Approve sensor check", exact: true }).waitFor();
    },
    video: {
      duration: 2800,
      trigger: async (page) => {
        await page.getByRole("button", { name: "Approve sensor check", exact: true }).click();
      },
    },
  },
];
