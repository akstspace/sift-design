const path = "/?section=ai&ai=audio";
const parts = ["audio-player", "transcription", "speech-input"];

export default [
  ...parts.flatMap((part) =>
    ["light", "dark"].map((theme) => ({
      name: `ai-${part}-${theme}`,
      path,
      theme,
      clip: `[data-specimen="${part}"]`,
    })),
  ),
  {
    name: "ai-audio-mobile",
    path,
    viewport: { width: 390, height: 844 },
    fullPage: true,
  },
  {
    name: "ai-speech-input-listening",
    path,
    clip: '[data-specimen="speech-input"]',
    video: {
      trigger: async (page) => page.getByRole("button", { name: "Start recording", exact: true }).click(),
      duration: 3800,
    },
  },
  {
    name: "ai-audio-transcript-selection",
    path,
    clip: '[data-specimen="transcription"]',
    filmstrip: {
      trigger: async (page) => page.locator('[data-slot="transcription-segment"]').nth(1).click(),
      frames: [0, 60, 140, 240],
    },
  },
  {
    name: "ai-speech-input-reduced",
    path,
    reduced: true,
    clip: '[data-specimen="speech-input"]',
    prepare: async (page) => {
      await page.getByRole("button", { name: "Start recording", exact: true }).click();
      await page.waitForTimeout(500);
    },
  },
];
