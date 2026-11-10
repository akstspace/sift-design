const shots = [];
for (const theme of ["light", "dark"]) {
  shots.push({ name: `retheme-harbor-${theme}`, path: "/?palette=harbor", theme, fullPage: true });
  shots.push({ name: `retheme-harbor-controls-${theme}`, path: "/?palette=harbor&section=controls", theme, fullPage: true });
  shots.push({ name: `retheme-harbor-buttons-${theme}`, path: "/?palette=harbor&section=controls", theme, clip: '[data-specimen="button"]', prepare: async page => {
    await page.locator('[data-specimen="button"]').scrollIntoViewIfNeeded();
  } });
  shots.push({ name: `retheme-harbor-field-${theme}`, path: "/?palette=harbor&section=controls", theme, clip: '[data-specimen="input"]', prepare: async page => {
    await page.locator('[data-specimen="input"]').scrollIntoViewIfNeeded();
    await page.getByLabel("Find greenhouse work").focus();
  } });
  shots.push({ name: `retheme-harbor-mobile-${theme}`, path: "/?palette=harbor&section=controls", theme, viewport: { width: 390, height: 900 }, fullPage: true });
}
export default shots;
