const path = "/?section=ai&ai=agent-actions";
const clip = (name) => `[data-specimen="${name}"]`;
const button = (page, name) => page.getByRole("button", { name, exact: true });
export default [
  ...["light", "dark"].flatMap((theme) =>
    ["action-card", "agent-review", "activity-log"].map((name) => ({
      name: `ai-${name}-${theme}`,
      path,
      theme,
      clip: clip(name),
    })),
  ),
  { name: "ai-agent-actions-mobile", path, viewport: { width: 390, height: 844 }, fullPage: true },
  { name: "ai-action-card-reduced", path, reduced: true, clip: clip("action-card") },
  {
    name: "ai-action-card-read-open",
    path,
    clip: clip("action-card"),
    prepare: async (page) => {
      await page.locator('[data-emphasis="read"] button').first().click();
      await page.waitForTimeout(500);
    },
  },
  {
    name: "ai-action-card-running",
    path,
    clip: clip("action-card"),
    prepare: async (page) => {
      await button(page, "Replay move").click();
      await page.waitForTimeout(400);
    },
  },
  {
    name: "ai-action-card-replay-motion",
    path,
    clip: clip("action-card"),
    video: {
      duration: 2600,
      trigger: async (page) => {
        await button(page, "Replay move").click();
      },
    },
  },
  {
    name: "ai-agent-review-motion",
    path,
    clip: clip("agent-review"),
    video: {
      duration: 1800,
      trigger: async (page) => {
        await button(page, "Looks good").click();
      },
    },
  },
  {
    name: "ai-activity-log-arrival",
    path,
    clip: clip("activity-log"),
    filmstrip: {
      frames: [0, 40, 80, 140, 220, 320, 480],
      trigger: async (page) => {
        await button(page, "Add entry").click();
      },
    },
  },
];
