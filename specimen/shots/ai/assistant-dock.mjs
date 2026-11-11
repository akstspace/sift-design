const path = "/?section=ai&ai=assistant-dock";
const clip = (name) => `[data-specimen="${name}"]`;
const openDock = async (page) => {
  await page.getByRole("button", { name: "Toggle chat", exact: true }).click();
  await page.getByRole("region", { name: "Larkspur assistant", exact: true }).waitFor();
};
const showCommands = async (page) => {
  await page.getByRole("button", { name: "Show commands", exact: true }).click();
  await page.locator(`${clip("slash-menu")} [role="listbox"]`).waitFor();
};
export default [
  ...["light", "dark"].flatMap((theme) =>
    ["assistant-dock", "conversation-notice", "slash-menu"].map((name) => ({
      name: `ai-${name}-${theme}`,
      path,
      theme,
      clip: clip(name),
    })),
  ),
  ...["light", "dark"].map((theme) => ({
    name: `ai-assistant-dock-open-${theme}`,
    path,
    theme,
    clip: clip("assistant-dock"),
    prepare: openDock,
  })),
  {
    name: "ai-assistant-dock-question",
    path,
    clip: clip("assistant-dock"),
    prepare: async (page) => {
      await page.getByRole("button", { name: "Question", exact: true }).click();
    },
  },
  {
    name: "ai-conversation-notice-details",
    path,
    clip: clip("conversation-notice"),
    prepare: async (page) => {
      await page.getByRole("button", { name: "Details", exact: true }).click();
    },
  },
  { name: "ai-slash-menu-open", path, clip: clip("slash-menu"), prepare: showCommands },
  { name: "ai-assistant-dock-mobile", path, viewport: { width: 390, height: 844 }, fullPage: true },
  {
    name: "ai-assistant-dock-mobile-open",
    path,
    viewport: { width: 390, height: 844 },
    clip: clip("assistant-dock"),
    prepare: openDock,
  },
  { name: "ai-assistant-dock-reduced", path, reduced: true, clip: clip("assistant-dock"), prepare: openDock },
  {
    name: "ai-assistant-dock-morph",
    path,
    clip: clip("assistant-dock"),
    filmstrip: {
      frames: [0, 40, 80, 140, 220, 320, 480],
      trigger: async (page) => {
        await page.getByRole("button", { name: "Toggle chat", exact: true }).click();
      },
    },
  },
  {
    name: "ai-assistant-dock-state-motion",
    path,
    clip: clip("assistant-dock"),
    video: {
      duration: 2400,
      trigger: async (page) => {
        await page.getByRole("button", { name: "Working", exact: true }).click();
        await page.waitForTimeout(800);
        await page.getByRole("button", { name: "Question", exact: true }).click();
      },
    },
  },
];
