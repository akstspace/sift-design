// Close-up motion clips for the website: one component in frame, recorded at 2x.
const item = (page, name) => page.locator(`[data-specimen="${name}"]`);
const center = (selector) => async (page) => {
  await page.locator(selector).first().evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(200);
};
const pause = (page, ms) => page.waitForTimeout(ms);
export default [
  {
    name: "clip-dropdown-menu",
    path: "/?section=overlays",
    viewport: { width: 720, height: 500 },
    prepare: center('[data-specimen="dropdown-menu"]'),
    video: {
      duration: 500,
      trigger: async (page) => {
        await item(page, "dropdown-menu").getByRole("button", { name: "Task actions", exact: true }).click();
        await pause(page, 900);
        await page.getByRole("menuitem", { name: "Move to area" }).hover();
        await pause(page, 900);
        await page.keyboard.press("Escape");
        await page.keyboard.press("Escape");
        await pause(page, 500);
      },
    },
  },
  {
    name: "clip-segmented",
    path: "/?section=controls",
    viewport: { width: 720, height: 440 },
    prepare: center('[data-demo="segments"]'),
    video: {
      duration: 400,
      trigger: async (page) => {
        const group = page.locator('[data-demo="segments"]');
        for (const name of ["Done", "In progress", "Open", "Done", "Open"]) {
          await group.getByRole("radio", { name, exact: true }).click();
          await pause(page, 520);
        }
      },
    },
  },
  {
    name: "clip-push-pop",
    path: "/?section=display",
    viewport: { width: 720, height: 500 },
    prepare: center('[data-page-demo="push"]'),
    video: {
      duration: 500,
      trigger: async (page) => {
        await page.getByRole("button", { name: "Pot on 120 lavender plugs", exact: true }).click();
        await pause(page, 1000);
        await page.getByRole("button", { name: "Back to task list", exact: true }).click();
      },
    },
  },
  {
    name: "clip-sheet",
    path: "/?section=overlays",
    viewport: { width: 900, height: 560 },
    prepare: center('[data-specimen="sheet"]'),
    video: {
      duration: 600,
      trigger: async (page) => {
        await item(page, "sheet").getByRole("button", { name: "Open task details", exact: true }).click();
        await pause(page, 1200);
        await page.keyboard.press("Escape");
      },
    },
  },
];
