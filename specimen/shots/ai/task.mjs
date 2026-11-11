const path = "/?section=ai&ai=task";
const at = (name) => async (page) => {
  await page.locator(`[data-specimen="${name}"]`).scrollIntoViewIfNeeded();
};
const settled = async (page) => {
  await page.getByRole("button", { name: "Edit plan", exact: true }).waitFor();
  await page.waitForFunction(() => document.querySelector('[data-slot="plan"]')?.getAttribute("aria-busy") === "false");
};
export default [
  ...["light", "dark"].flatMap((theme) =>
    ["plan", "task", "queue"].map((name) => ({
      name: `ai-task-${name}-${theme}`,
      path,
      theme,
      clip: `[data-specimen="${name}"]`,
      prepare: async (page) => {
        await settled(page);
        await at(name)(page);
      },
    })),
  ),
  { name: "ai-task-mobile", path, viewport: { width: 390, height: 844 }, fullPage: true, prepare: settled },
  { name: "ai-task-reduced", path, reduced: true, fullPage: true, prepare: settled },
  {
    name: "ai-task-plan-editing",
    path,
    clip: '[data-specimen="plan"]',
    prepare: async (page) => {
      await settled(page);
      await page.getByRole("button", { name: "Edit plan", exact: true }).click();
    },
  },
  {
    name: "ai-task-queue-arrival",
    path,
    clip: '[data-specimen="queue"]',
    prepare: async (page) => {
      await at("queue")(page);
      await page.getByLabel("New todo", { exact: true }).fill("Check the mint price cards");
    },
    filmstrip: {
      frames: [0, 60, 140, 260, 420, 700],
      trigger: async (page) => {
        await page.getByRole("button", { name: "Add todo", exact: true }).click();
      },
    },
  },
  {
    name: "ai-task-plan-streaming",
    path,
    clip: '[data-specimen="plan"]',
    prepare: at("plan"),
    video: {
      duration: 2800,
      trigger: async (page) => {
        await page.getByRole("button", { name: "Replay plan", exact: true }).click();
      },
    },
  },
  {
    name: "ai-task-queue-completion",
    path,
    clip: '[data-specimen="queue"]',
    prepare: at("queue"),
    filmstrip: {
      frames: [0, 40, 80, 140, 260],
      trigger: async (page) => {
        await page.getByRole("checkbox", { name: "Move 24 basil pots to the herb bench", exact: true }).click();
      },
    },
  },
];
