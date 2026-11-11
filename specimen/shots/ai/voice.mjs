const path = "/?section=ai&ai=voice";
const microphone = '[data-specimen="mic-selector"]';
const voice = '[data-specimen="voice-selector"]';
const openMicrophones = async (page) => {
  await page.getByRole("button", { name: "Microphone: Desk microphone", exact: true }).click();
};
const openVoices = async (page) => {
  await page.getByRole("button", { name: "Browse voices", exact: true }).click();
};

export default [
  ...["light", "dark"].flatMap((theme) => [
    { name: `ai-mic-selector-${theme}`, path, theme, clip: microphone },
    { name: `ai-voice-selector-${theme}`, path, theme, clip: voice },
    { name: `ai-mic-selector-open-${theme}`, path, theme, prepare: openMicrophones },
    { name: `ai-voice-selector-open-${theme}`, path, theme, prepare: openVoices },
  ]),
  { name: "ai-voice-mobile", path, viewport: { width: 390, height: 844 }, fullPage: true },
  {
    name: "ai-voice-dialog-mobile-dark",
    path,
    theme: "dark",
    viewport: { width: 390, height: 844 },
    prepare: openVoices,
  },
  { name: "ai-voice-reduced", path, reduced: true, prepare: openVoices },
  {
    name: "ai-voice-choice-filmstrip",
    path,
    prepare: openVoices,
    filmstrip: {
      frames: [0, 60, 140, 260, 420, 700],
      trigger: async (page) => {
        await page.getByRole("option", { name: /Hazel/ }).click();
      },
    },
  },
  {
    name: "ai-microphone-open-filmstrip",
    path,
    filmstrip: { frames: [0, 60, 140, 260, 420, 700], trigger: openMicrophones },
  },
];
