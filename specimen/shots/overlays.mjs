const item = (page, name) => page.locator(`[data-specimen="${name}"]`);
const click = (name, label) => async page => { await item(page, name).evaluate(el => el.scrollIntoView({ block: "center" })); await page.waitForTimeout(50); await item(page, name).getByRole("button", { name: label, exact: true }).click(); };
const cases = [
  ["dialog", click("dialog", "Rename task"), '[data-slot="dialog-content"]'],
  ["alert-dialog", click("alert-dialog", "Delete task"), '[data-slot="alert-dialog-content"]'],
  ["sheet", click("sheet", "Open task details"), '[data-slot="sheet-content"]'],
  ["drawer", click("drawer", "Plan market crates"), '[data-slot="drawer-content"]'],
  ["popover", click("popover", "Set reminder"), '[data-slot="popover-content"]'],
  ["hover-card", async page => { await item(page, "hover-card").getByRole("link").focus(); await page.waitForTimeout(300); }, '[data-slot="hover-card-content"]'],
  ["tooltip", async page => { await item(page, "tooltip").getByRole("button", { name: "Search tasks" }).hover(); await page.waitForTimeout(400); }, '[data-slot="tooltip-content"]'],
  ["dropdown-menu", click("dropdown-menu", "Task actions"), '[data-slot="dropdown-menu-content"]'],
  ["context-menu", async page => { await item(page, "context-menu").locator('[data-slot="context-menu-trigger"]').click({ button: "right" }); }, '[data-slot="context-menu-content"]'],
  ["menubar", async page => { await item(page, "menubar").getByRole("menuitem", { name: "Work", exact: true }).click(); }, '[data-slot="menubar-content"]'],
  ["navigation-menu", click("navigation-menu", "Growing areas"), '[data-slot="navigation-menu-viewport"]'],
  ["select", async page => { await item(page, "select").getByRole("combobox").click(); }, '[data-slot="select-content"]'],
  ["combobox", async page => { await item(page, "combobox").evaluate(el => el.scrollIntoView({ block: "center" })); await page.waitForTimeout(50); await item(page, "combobox").getByRole("combobox").fill("Pri"); }, '[data-slot="combobox-content"]'],
  ["command", click("command", "Open command palette"), '[data-slot="dialog-content"]'],
  ["sonner", click("sonner", "Save market checklist"), '[data-sonner-toast]'],
];
const path = "/?section=overlays";
export default [
  ...["light", "dark"].flatMap(theme => [
    { name: `overlays-section-${theme}`, path, theme, fullPage: true },
    { name: `overlays-section-mobile-${theme}`, path, theme, viewport: { width: 390, height: 900 }, fullPage: true },
    ...cases.map(([name, prepare, clip]) => ({ name: `overlays-${name}-${theme}`, path, theme, prepare, clip })),
    { name: `overlays-submenu-${theme}`, path, theme, prepare: async page => { await click("dropdown-menu", "Task actions")(page); await page.getByRole("menuitem", { name: "Move to area" }).hover(); await page.waitForTimeout(300); } },
    ...["sheet", "drawer"].map(name => ({ name: `overlays-${name}-mobile-${theme}`, path, theme, viewport: { width: 390, height: 844 }, prepare: cases.find(c => c[0] === name)[1] })),
  ]),
  ...["dialog", "sheet", "dropdown-menu", "sonner"].map(name => ({
    name: `overlays-${name}-filmstrip`, path, viewport: { width: 900, height: 700 },
    prepare: async page => { await item(page, name).scrollIntoViewIfNeeded(); },
    filmstrip: { trigger: cases.find(c => c[0] === name)[1], frames: [0, 80, 160, 280, 480, 720] },
  })),

  ...["dropdown-menu", "dialog", "alert-dialog", "sheet"].map(name => ({
    name: `overlays-motion-${name}`, path, viewport: { width: 1000, height: 760 },
    prepare: async page => { await item(page, name).evaluate(el => el.scrollIntoView({ block: "center" })); },
    video: { duration: 500, trigger: async page => { await cases.find(c => c[0] === name)[1](page); await page.waitForTimeout(850); await page.keyboard.press("Escape"); await page.waitForTimeout(500); } },
  })),
  ...["sheet", "drawer"].map(name => ({
    name: `overlays-motion-mobile-${name}-drag`, path, viewport: { width: 390, height: 844 },
    prepare: async page => { await item(page, name).evaluate(el => el.scrollIntoView({ block: "center" })); },
    video: { duration: 600, width: 390, trigger: async page => {
      await cases.find(c => c[0] === name)[1](page); await page.waitForTimeout(900);
      const box = await page.locator(`[data-slot="${name}-content"]`).boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + 28); await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + 4, { steps: 6 });
      await page.mouse.move(box.x + box.width / 2, box.y + 220, { steps: 12 }); await page.mouse.up();
    } },
  })),
  { name: "overlays-motion-toast-stack-swipe", path, viewport: { width: 1000, height: 760 },
    prepare: async page => { await item(page, "sonner").evaluate(el => el.scrollIntoView({ block: "center" })); },
    video: { duration: 600, trigger: async page => {
      await cases.find(c => c[0] === "sonner")[1](page); await page.waitForTimeout(500);
      await item(page, "sonner").getByRole("button", { name: "Show connection error" }).click(); await page.waitForTimeout(600);
      const toast = page.locator('[data-sonner-toast][data-front="true"]'); await toast.hover(); await page.waitForTimeout(500);
      const box = await toast.boundingBox(); await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
      await page.mouse.move(box.x + box.width + 160, box.y + box.height / 2, { steps: 14 }); await page.mouse.up();
    } },
  },
  { name: "overlays-dialog-reduced", path, reduced: true, prepare: click("dialog", "Rename task"), clip: '[data-slot="dialog-content"]' },
];
