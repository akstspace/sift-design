const path = "/?section=controls";
const groups = ["button", "button-group", "input", "input-group", "textarea", "native-select", "input-otp", "checkbox", "radio-group", "switch", "slider", "toggle", "toggle-group", "tabs", "calendar", "label-and-field", "kbd", "form"];
const focus = name => async page => { await page.locator(`[data-specimen="${name}"]`).scrollIntoViewIfNeeded(); };
const shots = [
  ...["light", "dark"].map(theme => ({ name: `controls-section-${theme}`, path, theme, fullPage: true })),
  ...["light", "dark"].map(theme => ({ name: `controls-section-mobile-${theme}`, path, theme, viewport: { width: 390, height: 900 }, fullPage: true })),
  ...["light", "dark"].map(theme => ({ name: theme === "light" ? "controls-form-mobile" : "controls-form-mobile-dark", path, theme, viewport: { width: 390, height: 1120 }, clip: '[data-specimen="form"]', prepare: async page => {
    await page.locator('[data-specimen="form"]').scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Save task", exact: true }).click();
    await page.getByText("Give the task a specific title, at least 4 characters.").last().waitFor();
    await page.locator('[data-specimen="form"]').scrollIntoViewIfNeeded();
  } })),
  ...["light", "dark"].flatMap(theme => groups.map(group => ({ name: `controls-${group}-${theme}`, path, theme, clip: `[data-specimen="${group}"]`, prepare: focus(group) }))),
  { name: "controls-input-focus", path, clip: '[data-specimen="input"]', prepare: async page => { await focus("input")(page); await page.getByLabel("Find greenhouse work").focus(); } },
  { name: "controls-button-hover", path, clip: '[data-specimen="button"]', prepare: async page => { await focus("button")(page); await page.locator('[data-demo="press"]').hover(); } },
  { name: "controls-form-valid", path, clip: '[data-specimen="form"]', prepare: async page => {
    await focus("form")(page);
    await page.getByLabel("Task title", { exact: true }).fill("Pot on 120 lavender plugs");
    await page.getByLabel("Area", { exact: true }).selectOption("Propagation house");
    await page.getByRole("button", { name: "Save task", exact: true }).click();
    await page.getByText("Saved locally: Pot on 120 lavender plugs.").waitFor();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("larkspur-task-draft")));
    if (saved.title !== "Pot on 120 lavender plugs") throw new Error("The form did not save the valid draft");
  } },
];
for (const theme of ["light", "dark"]) {
  for (const [name, group, trigger] of [
    ["segments-travel", "toggle-group", page => page.locator('[data-demo="segments"]').getByRole("radio", { name: "Done", exact: true }).click()],
    ["tabs-travel", "tabs", page => page.locator('[data-demo="tabs"]').getByRole("tab", { name: "Orders", exact: true }).click()],
    ["switch-toggle", "switch", page => page.locator('[data-demo="switch"]').click()],
    ["checkbox-check", "checkbox", page => page.locator('[data-demo="check"]').click()],
    ["button-press", "button", async page => { const b = await page.locator('[data-demo="press"]').boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); }],
    ["calendar-next", "calendar", page => page.getByRole("button", { name: /next month/i }).click()],
  ]) shots.push({ name: `controls-${name}-${theme}`, path, theme, clip: `[data-specimen="${group}"]`, prepare: focus(group), filmstrip: { trigger, frames: [0, 60, 140, 280, 480] } });
}
shots.push({ name: "controls-tabs-reduced", path, reduced: true, clip: '[data-specimen="tabs"]', prepare: focus("tabs"), filmstrip: { trigger: page => page.locator('[data-demo="tabs"]').getByRole("tab", { name: "Orders" }).click(), frames: [0, 60, 140, 220] } });
// Real-time recordings include interruption and return travel, not a single posed frame.
async function press(page) {
  const target = page.locator('[data-demo="press"]');
  const box = await target.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.waitForTimeout(180); await page.mouse.up();
}
async function sliderDrag(page) {
  const track = await page.locator('[data-specimen="slider"] [data-slot="slider-track"]').first().boundingBox();
  await page.mouse.move(track.x + track.width * 0.55, track.y + track.height / 2);
  await page.mouse.down();
  await page.mouse.move(track.x + track.width * 0.88, track.y + track.height / 2, { steps: 18 });
  await page.waitForTimeout(120);
  await page.mouse.move(track.x + track.width * 0.32, track.y + track.height / 2, { steps: 22 });
  await page.mouse.up();
}
const recordings = [
  ["button", "button", press],
  ["switch", "switch", async page => { const control = page.locator('[data-demo="switch"]'); await control.click(); await page.waitForTimeout(90); await control.click(); await page.waitForTimeout(130); await control.click(); }],
  ["segmented", "toggle-group", async page => { const group = page.locator('[data-demo="segments"]'); await group.getByRole("radio", { name: "Done", exact: true }).click(); await page.waitForTimeout(120); await group.getByRole("radio", { name: "In progress", exact: true }).click(); await page.waitForTimeout(350); await group.getByRole("radio", { name: "Open", exact: true }).click(); }],
  ["tabs", "tabs", async page => { const group = page.locator('[data-demo="tabs"]'); await group.getByRole("tab", { name: "Orders", exact: true }).click(); await page.waitForTimeout(180); await group.getByRole("tab", { name: "Growing", exact: true }).click(); }],
  ["slider", "slider", sliderDrag],
  ["checkbox", "checkbox", async page => { const control = page.locator('[data-demo="check"]'); await control.click(); await page.waitForTimeout(160); await control.click(); await page.waitForTimeout(90); await control.click(); }],
];
for (const mobile of [false, true]) for (const [name, group, trigger] of recordings) {
  shots.push({ name: `controls-motion-${name}${mobile ? "-mobile" : ""}`, path,
    viewport: mobile ? { width: 390, height: 844 } : { width: 960, height: 720 },
    prepare: async page => { await page.locator(`[data-specimen="${group}"]`).scrollIntoViewIfNeeded(); },
    video: { trigger, duration: 900, width: mobile ? 390 : 960 },
  });
}
export default shots;
