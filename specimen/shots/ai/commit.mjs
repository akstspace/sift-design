const path = "/?section=ai&ai=commit";
const commit = '[data-specimen="commit"]';
const packages = '[data-specimen="package-info"]';
const toggle = (page) =>
  page.getByRole("button", { name: "Raise the misting threshold on bench 4", exact: true }).click();

export default [
  ...["light", "dark"].flatMap((theme) => [
    { name: `ai-commit-${theme}`, path, theme, clip: commit },
    { name: `ai-commit-collapsed-${theme}`, path, theme, clip: commit, prepare: toggle },
    { name: `ai-package-info-${theme}`, path, theme, clip: packages },
  ]),
  { name: "ai-commit-mobile", path, viewport: { width: 390, height: 844 }, clip: commit },
  { name: "ai-package-info-mobile", path, viewport: { width: 390, height: 844 }, clip: packages },
  { name: "ai-commit-reduced", path, reduced: true, clip: commit },
  {
    name: "ai-commit-expand",
    path,
    clip: commit,
    prepare: async (page) => {
      await toggle(page);
      await page.waitForTimeout(650);
      await page.locator(commit).evaluate((element) => {
        element.style.minHeight = "440px";
      });
    },
    filmstrip: { trigger: toggle, frames: [0, 60, 140, 280, 500] },
  },
  {
    name: "ai-package-info-apply",
    path,
    clip: packages,
    filmstrip: {
      trigger: async (page) => {
        await page.getByRole("switch", { name: "Apply @larkspur/sensors", exact: true }).click();
      },
      frames: [0, 60, 140, 280, 500],
    },
  },
];
