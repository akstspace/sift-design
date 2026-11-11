const path = "/?section=ai&ai=confirmation";
const click = (name) => async (page) => page.getByRole("button", { name, exact: true }).click();

export default [
  ...["light", "dark"].flatMap((theme) =>
    ["confirmation", "question", "checkpoint"].map((name) => ({
      name: `${name}-${theme}`,
      path,
      theme,
      clip: `[data-specimen="${name}"]`,
    })),
  ),
  ...["confirmation", "question", "checkpoint"].map((name) => ({
    name: `${name}-mobile`,
    path,
    viewport: { width: 390, height: 844 },
    clip: `[data-specimen="${name}"]`,
  })),
  {
    name: "confirmation-accepted",
    path,
    clip: '[data-specimen="confirmation"]',
    prepare: click("Approve"),
  },
  {
    name: "confirmation-rejected",
    path,
    clip: '[data-specimen="confirmation"]',
    prepare: click("Deny"),
  },
  {
    name: "question-submitted",
    path,
    clip: '[data-specimen="question"]',
    prepare: async (page) => {
      await page.getByRole("radio", { name: "Bench 4 · Full sun" }).click();
      await click("Submit answer")(page);
    },
  },
  {
    name: "confirmation-decision-filmstrip",
    path,
    clip: '[data-specimen="confirmation"]',
    filmstrip: { frames: [0, 40, 80, 140, 220, 360], trigger: click("Approve") },
  },
  {
    name: "checkpoint-restore-filmstrip",
    path,
    clip: '[data-specimen="checkpoint"]',
    filmstrip: { frames: [0, 40, 80, 140, 220, 360], trigger: click("Restore checkpoint") },
  },
  {
    name: "question-reduced-motion",
    path,
    reduced: true,
    clip: '[data-specimen="question"]',
  },
];
