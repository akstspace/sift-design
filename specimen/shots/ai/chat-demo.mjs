const path = "/?section=ai&ai=chat-demo";
const clip = '[data-specimen="chat"]';
const ask = async (page) => {
  await page.getByRole("button", { name: "Why is bench 4 drying out faster?", exact: true }).click();
};
const complete = async (page) => {
  await ask(page);
  await page.getByRole("button", { name: "Retry answer", exact: true }).waitFor();
};

export default [
  { name: "ai-chat-empty-light", path, clip },
  { name: "ai-chat-empty-dark", path, clip, theme: "dark" },
  { name: "ai-chat-answer-light", path, clip, prepare: complete },
  { name: "ai-chat-answer-dark", path, clip, theme: "dark", prepare: complete },
  { name: "ai-chat-mobile", path, clip, viewport: { width: 390, height: 900 } },
  {
    name: "ai-chat-approval",
    path,
    clip,
    prepare: async (page) => {
      await page.getByRole("button", { name: "Draft the Hollins Florist order confirmation", exact: true }).click();
      await page.getByRole("button", { name: "Approve simulated send", exact: true }).waitFor();
    },
  },
  {
    name: "ai-chat-exchange",
    path,
    clip,
    video: { trigger: ask, duration: 9000 },
  },
  {
    name: "ai-chat-exchange-reduced",
    path,
    clip,
    reduced: true,
    video: { trigger: ask, duration: 9000 },
  },
];
