const path = "/?section=ai&ai=attachments";
const clip = (name) => `[data-specimen="${name}"]`;
const scrollTo = (name) => async (page) => {
  await page.locator(clip(name)).scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
};

export default [
  ...["light", "dark"].flatMap((theme) =>
    ["attachments", "artifact", "web-preview"].map((name) => ({
      name: `ai-${name}-${theme}`,
      path,
      theme,
      clip: clip(name),
      prepare: scrollTo(name),
    })),
  ),
  ...["attachments", "artifact", "web-preview"].map((name) => ({
    name: `ai-${name}-mobile`,
    path,
    viewport: { width: 390, height: 844 },
    clip: clip(name),
    prepare: scrollTo(name),
  })),
  {
    name: "ai-attachments-arrival",
    path,
    clip: clip("attachments"),
    prepare: scrollTo("attachments"),
    filmstrip: {
      frames: [0, 60, 140, 280, 540],
      trigger: async (page) => {
        await page.getByRole("button", { name: "Add sample file", exact: true }).click();
      },
    },
  },
  {
    name: "ai-attachments-remove",
    path,
    clip: clip("attachments"),
    prepare: scrollTo("attachments"),
    video: {
      duration: 1000,
      trigger: async (page) => {
        await page.getByRole("button", { name: "Remove Herb bench.svg from grid view", exact: true }).click();
      },
    },
  },
  {
    name: "ai-artifact-open",
    path,
    clip: clip("artifact"),
    prepare: async (page) => {
      await scrollTo("artifact")(page);
      await page.getByRole("button", { name: "Close artifact", exact: true }).click();
      await page.waitForTimeout(400);
    },
    filmstrip: {
      frames: [0, 60, 140, 280, 540],
      trigger: async (page) => {
        await page.getByRole("button", { name: "Open checklist", exact: true }).click();
      },
    },
  },
  {
    name: "ai-web-preview-console",
    path,
    clip: clip("web-preview"),
    prepare: async (page) => {
      await scrollTo("web-preview")(page);
      await page.getByRole("button", { name: /^Console/ }).click();
      await page.waitForTimeout(400);
    },
    video: {
      duration: 1200,
      trigger: async (page) => {
        await page.frameLocator("iframe").getByRole("button", { name: "Herbs", exact: true }).click();
      },
    },
  },
  {
    name: "ai-attachments-reduced",
    path,
    reduced: true,
    clip: clip("attachments"),
    prepare: async (page) => {
      await scrollTo("attachments")(page);
      await page.getByRole("button", { name: "Add sample file", exact: true }).click();
    },
  },
];
