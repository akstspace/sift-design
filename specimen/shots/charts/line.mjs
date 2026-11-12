const path = "/?section=charts&charts=line";
const clip = '[data-specimen="line-interactive"]';
const frames = [0, 40, 80, 140, 220, 320, 480];
const selectBedding = async (page) => page.locator('button[data-metric="bedding"]').click();
const hoverDot = async (page) => {
  const point = page.locator('[data-specimen="line-dots-colors"] .recharts-line-dots circle').nth(3);
  await point.scrollIntoViewIfNeeded();
  await point.hover();
  await page.waitForTimeout(250);
};
export default [
  ...["light", "dark"].map((theme) => ({ name: `charts-line-${theme}`, path, theme, fullPage: true })),
  { name: "charts-line-mobile", path, viewport: { width: 390, height: 844 }, fullPage: true },
  { name: "charts-line-reduced", path, reduced: true, fullPage: true },
  { name: "charts-line-tooltip", path, clip: '[data-specimen="line-dots-colors"]', prepare: hoverDot },
  { name: "charts-line-selection", path, clip, filmstrip: { frames, trigger: selectBedding } },
  { name: "charts-line-selection-reduced", path, clip, reduced: true, filmstrip: { frames, trigger: selectBedding } },
];
