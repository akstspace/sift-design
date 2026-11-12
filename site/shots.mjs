const desktop = [
  ['overview', '/overview'], ['agent', '/use-with-your-agent'], ['doc', '/foundations/color'],
  ['principles', '/foundations/principles'],
  ['motion', '/motion'], ['components', '/components'], ['blocks', '/blocks'],
  ['harbor', '/retheming?palette=harbor'],
];
const pageChange = async page => page.getByRole('link', { name: 'Use with your agent', exact: true }).first().click();
const command = async page => page.getByRole('button', { name: /Find a page or heading/ }).click();
const readyLanding = async page => {
  // A full-page reference includes offscreen sections and their lazy preview.
  await page.evaluate(() => {
    document.querySelectorAll('.long-section').forEach(node => { node.style.contentVisibility = 'visible'; });
    document.querySelectorAll('iframe').forEach(frame => { frame.loading = 'eager'; });
  });
  await page.locator('.block-layer[data-layer="shown"] iframe').waitFor({ state: 'attached' });
  await page.locator('.block-loading').waitFor({ state: 'hidden' });
  // Sections rise in the first time they are seen; pass over each one so a full-page capture shows them.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 320) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(700);
};
// The prompt card sits below the hero; bring its top near the top of the viewport.
const readyPrompt = async page => {
  await readyLanding(page);
  await page.locator('.landing-prompt').evaluate(node => scrollTo(0, node.getBoundingClientRect().top + scrollY - 24));
  await page.waitForTimeout(300);
};
export default [
  ...['light', 'dark'].flatMap(theme => [
    { name: `prompt-${theme}`, path: '/', theme, clip: '.landing-prompt', prepare: readyPrompt },
    { name: `prompt-${theme}-mobile`, path: '/', theme, viewport: { width: 390, height: 844 }, clip: '.landing-prompt', prepare: readyPrompt },
  ]),
  { name: 'prompt-expanded', path: '/', viewport: { width: 390, height: 1300 }, clip: '.landing-prompt', prepare: async page => { await readyPrompt(page); await page.getByRole('button', { name: 'Show full prompt', exact: true }).click(); await page.waitForTimeout(700); } },
  { name: 'prompt-reduced', path: '/', reduced: true, clip: '.landing-prompt', prepare: readyPrompt },
  { name: 'prompt-expand-filmstrip', path: '/', viewport: { width: 390, height: 1300 }, clip: '.landing-prompt', prepare: readyPrompt, filmstrip: { trigger: async page => page.getByRole('button', { name: 'Show full prompt', exact: true }).click(), frames: [0, 60, 120, 200, 400] } },
  { name: 'prompt-motion-expand', path: '/', viewport: { width: 390, height: 844 }, video: { trigger: async page => { await page.getByRole('button', { name: 'Show full prompt', exact: true }).click(); await page.waitForTimeout(650); await page.getByRole('button', { name: 'Show less', exact: true }).click(); }, duration: 1000 } },
  ...['light', 'dark'].flatMap(theme => [
    { name: 'landing-' + theme, path: '/', theme, fullPage: true, prepare: readyLanding },
    { name: 'landing-' + theme + '-mobile', path: '/', theme, fullPage: true, viewport: { width: 390, height: 844 }, prepare: readyLanding },
    { name: 'landing-top-' + theme, path: '/', theme, viewport: { width: 1440, height: 1100 }, prepare: readyLanding },
  ]),
  { name: 'landing-tablet-dark', path: '/', theme: 'dark', viewport: { width: 820, height: 1180 }, prepare: readyLanding },
  { name: 'landing-wide-dark', path: '/', theme: 'dark', viewport: { width: 2000, height: 1200 }, prepare: readyLanding },
  { name: 'landing-reduced', path: '/', reduced: true, viewport: { width: 1440, height: 1100 }, prepare: readyLanding },
  ...[{ name: 'desktop', viewport: { width: 1440, height: 900 } }, { name: 'mobile', viewport: { width: 390, height: 844 } }].map(({ name, viewport }) => ({ name: 'landing-motion-scroll-' + name, path: '/', viewport, video: { trigger: async page => { for (let i = 0; i < 7; i++) { await page.mouse.wheel(0, 420); await page.waitForTimeout(180); } }, duration: 2200 } })),

  ...desktop.flatMap(([name, path]) => ['light', 'dark'].map(theme => ({ name: `${name}-${theme}`, path, theme }))),
  ...[['overview', '/overview'], ['agent', '/use-with-your-agent'], ['principles', '/foundations/principles'], ['foundations', '/foundations'], ['doc', '/foundations/color'], ['components', '/components']].flatMap(([name, path]) => ['light', 'dark'].map(theme => ({ name: `${name}-${theme}-mobile`, path, theme, viewport: { width: 390, height: 844 } }))),
  { name: 'components-overlays-light', path: '/components/overlays' },
  { name: 'components-display-dark', path: '/components/display', theme: 'dark' },
  ...['light', 'dark'].map(theme => ({ name: `charts-${theme}`, path: '/charts', theme })),
  { name: 'charts-pie-dark-mobile', path: '/charts/pie', theme: 'dark', viewport: { width: 390, height: 844 } },
  { name: 'foundations-light', path: '/foundations' },
  { name: 'foundations-dark', path: '/foundations', theme: 'dark' },
  { name: 'command-open-dark', path: '/overview', theme: 'dark', prepare: command },
  { name: 'mobile-rail-light', path: '/overview', viewport: { width: 390, height: 844 }, prepare: async page => page.getByRole('button', { name: 'Open navigation' }).click() },
  { name: 'motion-reduced', path: '/motion', reduced: true, prepare: async page => page.getByRole('button', { name: 'Run spring' }).click() },
  ...['light', 'dark'].map(theme => ({ name: `review-${theme}`, path: '/review', theme, fullPage: true })),
  ...['light', 'dark'].flatMap(theme => [
    { name: `data-visualization-${theme}`, path: '/patterns/data-visualization', theme, fullPage: true },
    { name: `data-visualization-${theme}-mobile`, path: '/patterns/data-visualization', theme, fullPage: true, viewport: { width: 390, height: 844 } },
    ...[['typography', '/foundations/typography'], ['motion', '/motion'], ['review', '/review']].map(([name, path]) => ({ name: `${name}-${theme}-mobile`, path, theme, fullPage: true, viewport: { width: 390, height: 844 } })),
  ]),
  ...[{ label: 'desktop', viewport: { width: 1200, height: 800 } }, { label: 'mobile', viewport: { width: 390, height: 844 } }].flatMap(({ label, viewport }) => [
    { name: `site-motion-page-change-${label}`, path: '/overview', viewport, video: { trigger: label === 'mobile' ? async page => page.getByRole('link', { name: /Use with your agent/ }).last().click() : pageChange, duration: 1000 } },
    { name: `site-motion-command-${label}`, viewport, video: { trigger: command, duration: 1000 } },
  ]),
];
