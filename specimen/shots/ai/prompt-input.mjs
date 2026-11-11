const path = "/?section=ai&ai=prompt-input";
const main = '[data-specimen="prompt-input"]';
const compact = '[data-specimen="prompt-input-compact"]';
const addPhoto = async (page) => {
  await page.getByRole("button", { name: "Add sample photo", exact: true }).click();
};
const send = async (page) => {
  await page.locator(main).getByRole("button", { name: "Send message", exact: true }).click();
};

export default [
  ...["light", "dark"].flatMap((theme) => [
    { name: `ai-prompt-input-${theme}`, path, theme, clip: main },
    { name: `ai-prompt-input-compact-${theme}`, path, theme, clip: compact },
    { name: `ai-prompt-input-attachment-${theme}`, path, theme, clip: main, prepare: addPhoto },
    {
      name: `ai-prompt-input-reference-${theme}`,
      path,
      theme,
      clip: main,
      prepare: async (page) => {
        await page.getByRole("button", { name: "Add task reference", exact: true }).click();
        await page.getByRole("button", { name: "Search greenhouse records", exact: true }).click();
      },
    },
    {
      name: `ai-prompt-input-error-${theme}`,
      path,
      theme,
      clip: main,
      prepare: async (page) => {
        await page.getByRole("button", { name: "Test send error", exact: true }).click();
        await send(page);
        await page.getByRole("button", { name: "Retry message", exact: true }).waitFor();
      },
    },
  ]),
  {
    name: "ai-prompt-input-mobile",
    path,
    viewport: { width: 390, height: 844 },
    fullPage: true,
    prepare: addPhoto,
  },
  {
    name: "ai-prompt-input-mobile-dark",
    path,
    theme: "dark",
    viewport: { width: 390, height: 844 },
    fullPage: true,
  },
  {
    name: "ai-prompt-input-reduced",
    path,
    reduced: true,
    clip: main,
    prepare: addPhoto,
  },
  {
    name: "ai-prompt-input-attachment-arrival",
    path,
    clip: main,
    filmstrip: { frames: [0, 60, 140, 280, 500], trigger: addPhoto },
  },
  {
    name: "ai-prompt-input-submit-motion",
    path,
    clip: main,
    video: { trigger: send, duration: 3400 },
  },
];
