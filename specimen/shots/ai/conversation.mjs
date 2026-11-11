const path = "/?section=ai&ai=conversation";
const conversation = '[data-specimen="conversation"]';
const suggestion = '[data-specimen="suggestion"]';
const at = (selector) => async (page) => {
  await page.locator(selector).scrollIntoViewIfNeeded();
};
const scrollEarlier = async (page) => {
  await page.locator(`${conversation} .conversation-viewport`).evaluate((element) => {
    element.dispatchEvent(new WheelEvent("wheel", { deltaY: -500, bubbles: true }));
    element.scrollTop = 0;
  });
};

export default [
  ...["light", "dark"].flatMap((theme) => [
    { name: `ai-conversation-${theme}`, path, theme, clip: conversation },
    { name: `ai-suggestion-${theme}`, path, theme, clip: suggestion, prepare: at(suggestion) },
    {
      name: `ai-conversation-empty-${theme}`,
      path,
      theme,
      clip: conversation,
      prepare: async (page) => {
        await page.getByRole("button", { name: "Show empty state", exact: true }).click();
      },
    },
    {
      name: `ai-conversation-jump-${theme}`,
      path,
      theme,
      clip: conversation,
      prepare: async (page) => {
        await scrollEarlier(page);
        await page.waitForTimeout(450);
      },
    },
  ]),
  ...[conversation, suggestion].map((clip, index) => ({
    name: `ai-${index === 0 ? "conversation" : "suggestion"}-mobile`,
    path,
    clip,
    viewport: { width: 390, height: 844 },
    prepare: at(clip),
  })),
  {
    name: "ai-conversation-jump-filmstrip",
    path,
    clip: conversation,
    prepare: at(conversation),
    filmstrip: { frames: [0, 60, 140, 240, 420], trigger: scrollEarlier },
  },
  {
    name: "ai-conversation-reduced",
    path,
    clip: conversation,
    reduced: true,
    prepare: async (page) => {
      await scrollEarlier(page);
      await page.waitForTimeout(180);
    },
  },
];
