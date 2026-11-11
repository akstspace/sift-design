const path = "/?section=ai&ai=message";
const message = '[data-specimen="message"]';
const shimmer = '[data-specimen="shimmer"]';
const finish = async (page) => {
  const button = page.getByRole("button", { name: "Finish response", exact: true });
  if (await button.isVisible()) await button.click();
};
const thinking = async (page) => {
  await finish(page);
  await page.getByRole("button", { name: "Replay thinking", exact: true }).click();
};
export default [
  ...["light", "dark"].flatMap((theme) => [
    { name: `ai-message-${theme}`, path, theme, clip: message, prepare: finish },
    { name: `ai-shimmer-${theme}`, path, theme, clip: shimmer, prepare: thinking },
  ]),
  { name: "ai-message-mobile", path, viewport: { width: 390, height: 844 }, clip: message, prepare: finish },
  { name: "ai-shimmer-mobile", path, viewport: { width: 390, height: 844 }, clip: shimmer, prepare: thinking },
  { name: "ai-message-reduced", path, reduced: true, clip: message, prepare: finish },
  { name: "ai-shimmer-reduced", path, reduced: true, clip: shimmer, prepare: thinking },
  {
    name: "ai-message-branch-filmstrip",
    path,
    clip: message,
    prepare: finish,
    filmstrip: {
      frames: [0, 60, 140, 220, 360, 600],
      trigger: async (page) => {
        await page.getByRole("button", { name: "Next branch", exact: true }).click();
      },
    },
  },
  {
    name: "ai-message-stream",
    path,
    clip: message,
    prepare: finish,
    video: {
      duration: 4200,
      trigger: async (page) => {
        await page.getByRole("button", { name: "Replay response", exact: true }).click();
      },
    },
  },
];
