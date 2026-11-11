const path = "/?section=ai&ai=persona";
const clip = '[data-specimen="persona"]';

export default [
  ...["light", "dark"].map((theme) => ({ name: `ai-persona-${theme}`, path, clip, theme })),
  {
    name: "ai-persona-mobile",
    path,
    clip,
    viewport: { width: 390, height: 844 },
  },
  {
    name: "ai-persona-reduced",
    path,
    clip,
    reduced: true,
    prepare: async (page) => {
      await page.getByRole("radio", { name: "Thinking", exact: true }).click();
    },
  },
  {
    name: "ai-persona-speaking",
    path,
    clip,
    filmstrip: {
      trigger: async (page) => {
        await page.getByRole("button", { name: "Simulate speaking", exact: true }).click();
      },
      frames: [0, 80, 160, 320, 640, 1000],
    },
  },
];
