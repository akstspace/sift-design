const desktop = [
  ['overview', '/overview'], ['agent', '/use-with-your-agent'], ['doc', '/foundations/color'],
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
};
export default [
  ...['light', 'dark'].flatMap(theme => [
    { name: 'landing-' + theme, path: '/', theme, fullPage: true, prepare: readyLanding },
    { name: 'landing-' + theme + '-mobile', path: '/', theme, fullPage: true, viewport: { width: 390, height: 844 }, prepare: readyLanding },
  ]),
  ...[{ name: 'desktop', viewport: { width: 1440, height: 900 } }, { name: 'mobile', viewport: { width: 390, height: 844 } }].map(({ name, viewport }) => ({ name: 'landing-motion-scroll-' + name, path: '/', viewport, video: { trigger: async page => { for (let i = 0; i < 7; i++) { await page.mouse.wheel(0, 420); await page.waitForTimeout(180); } }, duration: 2200 } })),

  ...desktop.flatMap(([name, path]) => ['light', 'dark'].map(theme => ({ name: `${name}-${theme}`, path, theme }))),
  ...[['overview', '/overview'], ['doc', '/foundations/color'], ['components', '/components']].flatMap(([name, path]) => ['light', 'dark'].map(theme => ({ name: `${name}-${theme}-mobile`, path, theme, viewport: { width: 390, height: 844 } }))),
  { name: 'components-overlays-light', path: '/components/overlays' },
  { name: 'components-display-dark', path: '/components/display', theme: 'dark' },
  { name: 'foundations-light', path: '/foundations' },
  { name: 'command-open-dark', path: '/overview', theme: 'dark', prepare: command },
  { name: 'mobile-rail-light', path: '/overview', viewport: { width: 390, height: 844 }, prepare: async page => page.getByRole('button', { name: 'Open navigation' }).click() },
  { name: 'motion-reduced', path: '/motion', reduced: true, prepare: async page => page.getByRole('button', { name: 'Run spring' }).click() },
  ...[{ label: 'desktop', viewport: { width: 1200, height: 800 } }, { label: 'mobile', viewport: { width: 390, height: 844 } }].flatMap(({ label, viewport }) => [
    { name: `site-motion-page-change-${label}`, path: '/overview', viewport, video: { trigger: label === 'mobile' ? async page => page.getByRole('link', { name: /Use with your agent/ }).last().click() : pageChange, duration: 1000 } },
    { name: `site-motion-command-${label}`, viewport, video: { trigger: command, duration: 1000 } },
  ]),
];
