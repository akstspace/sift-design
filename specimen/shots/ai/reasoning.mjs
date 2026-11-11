const path = "/?section=ai&ai=reasoning";
const reasoning = '[data-specimen="reasoning"]';
const chain = '[data-specimen="chain-of-thought"]';
const finish = async (page) => {
  const reasoningButton = page.getByRole("button", { name: "Finish reasoning", exact: true });
  const chainButton = page.getByRole("button", { name: "Finish crate plan", exact: true });
  if (await reasoningButton.isEnabled()) await reasoningButton.click();
  if (await chainButton.isEnabled()) await chainButton.click();
  await page.waitForTimeout(1400);
};

export default [
  ...["light", "dark"].flatMap((theme) => [
    { name: `ai-reasoning-${theme}`, path, theme, clip: reasoning, prepare: finish },
    { name: `ai-chain-of-thought-${theme}`, path, theme, clip: chain, prepare: finish },
  ]),
  {
    name: "ai-reasoning-mobile",
    path,
    viewport: { width: 390, height: 844 },
    fullPage: true,
    prepare: finish,
  },
  {
    name: "ai-reasoning-streaming",
    path,
    clip: reasoning,
    prepare: async (page) => {
      await page.getByRole("button", { name: "Replay reasoning", exact: true }).click();
      await page.waitForTimeout(1800);
    },
  },
  {
    name: "ai-reasoning-completion-motion",
    path,
    clip: reasoning,
    prepare: async (page) => {
      await page.getByRole("button", { name: "Replay reasoning", exact: true }).click();
    },
    filmstrip: {
      frames: [0, 80, 160, 1040, 1160, 1400],
      trigger: async (page) => {
        await page.getByRole("button", { name: "Finish reasoning", exact: true }).click();
      },
    },
  },
  {
    name: "ai-chain-step-arrival-motion",
    path,
    clip: chain,
    prepare: async (page) => {
      await page.locator(chain).evaluate((element) => {
        element.style.minHeight = "760px";
      });
    },
    filmstrip: {
      frames: [0, 1540, 1640, 1760, 2100],
      trigger: async (page) => {
        await page.getByRole("button", { name: "Replay crate plan", exact: true }).click();
      },
    },
  },
  { name: "ai-reasoning-reduced", path, reduced: true, fullPage: true, prepare: finish },
];
