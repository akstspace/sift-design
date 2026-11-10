const mobile = { width: 390, height: 844 };
const expand = page => page.getByRole('button', { name: 'Expand assistant', exact: true }).click();
const tools = page => page.getByRole('button', { name: 'Read 14 tasks in Retail benches' }).click();
const send = async page => { await page.getByRole('textbox', { name: 'Message Ask Larkspur' }).fill('Give Sam the crate check for Friday and add the bench 4 note.'); await page.getByRole('button', { name: 'Send message', exact: true }).click(); };
const grow = page => page.getByRole('textbox', { name: 'Message Ask Larkspur' }).fill('Please check bench 4 before Friday.\nKeep the pepper starts separate from the market stock.\nAsk John to inspect the growing tips.\nAdd his observations to the task.');
const streamAway = async page => { await send(page); await page.waitForTimeout(850); const view = page.locator('[data-slot="message-scroller-viewport"]'); await view.hover(); await page.mouse.wheel(0, -800); };
const newest = page => page.getByRole('button', { name: 'Jump to newest', exact: true }).click();
const bottom = page => page.evaluate(() => { const el = document.querySelector('[data-slot="message-scroller-viewport"]'); el.scrollTop = el.scrollHeight; el.dispatchEvent(new Event('scroll')); });
export default [
  ...['light', 'dark'].flatMap(theme => [
    { name: `01-docked-${theme}`, theme },
    { name: `02-full-page-${theme}`, path: '/?view=full', theme },
    { name: `03-docked-${theme}-mobile`, theme, viewport: mobile },
    { name: `04-full-page-${theme}-mobile`, path: '/?view=full', theme, viewport: mobile },
    { name: `05-empty-${theme}`, path: '/?state=empty', theme },
    { name: `06-empty-${theme}-mobile`, path: '/?state=empty', theme, viewport: mobile },
  ]),
  { name: '07-tools-open-light', prepare: tools },
  { name: '08-climate-checklist-dark', path: '/?state=climate', theme: 'dark', prepare: async page => page.getByRole('button', { name: 'Checked the climate log for Propagation house' }).click() },
  { name: '09-attachment-light', path: '/?state=attachment' },
  { name: '10-attachment-dark-mobile', path: '/?state=attachment', theme: 'dark', viewport: mobile },
  { name: '11-recovery-notice-light', path: '/?state=notice' },
  { name: '12-recovery-notice-dark-mobile', path: '/?state=notice', theme: 'dark', viewport: mobile },
  { name: '13-error-light', path: '/?state=error', prepare: bottom },
  { name: '14-error-dark-mobile', path: '/?state=error', theme: 'dark', viewport: mobile, prepare: bottom },
  { name: '15-attributed-changes-light', path: '/?state=changes', prepare: bottom },
  { name: '16-attributed-changes-dark-mobile', path: '/?state=changes', theme: 'dark', viewport: mobile, prepare: bottom },
  { name: '17-task-change-light', path: '/?state=changes#task-market' },
  { name: '18-streaming-light', prepare: send },
  { name: '19-reader-unpinned-dark-mobile', theme: 'dark', viewport: mobile, prepare: streamAway },
  { name: '19-stopped-light', prepare: async page => { await send(page); await page.waitForTimeout(650); await page.getByRole('button', { name: 'Stop', exact: true }).click(); await bottom(page); } },
  { name: '19-history-dark-mobile', path: '/?state=notice', theme: 'dark', viewport: mobile, prepare: async page => page.getByRole('button', { name: 'View conversation history' }).click() },
  { name: '20-reduced-motion-light', path: '/?view=full&state=empty', reduced: true },
  ...[false, true].flatMap(isMobile => {
    const suffix = isMobile ? '-mobile' : '';
    const viewport = isMobile ? mobile : undefined;
    return [
      { name: `21-morph-filmstrip-light${suffix}`, viewport, filmstrip: { trigger: expand, frames: [0, 70, 140, 240, 420] } },
      { name: `22-tools-filmstrip-light${suffix}`, viewport, filmstrip: { trigger: tools, frames: [0, 60, 120, 220, 400] } },
      { name: `23-composer-filmstrip-light${suffix}`, viewport, filmstrip: { trigger: grow, frames: [0, 60, 120, 220, 400] } },
      { name: `assistant-motion-morph${suffix}`, viewport, video: { trigger: async page => { await expand(page); await page.waitForTimeout(750); await page.getByRole('button', { name: 'Dock assistant' }).click(); }, duration: 1900 } },
      { name: `assistant-motion-tools${suffix}`, viewport, video: { trigger: async page => { await tools(page); await page.waitForTimeout(750); await tools(page); }, duration: 1800 } },
      { name: `assistant-motion-composer${suffix}`, viewport, video: { trigger: async page => { await grow(page); await page.waitForTimeout(800); await page.getByRole('textbox').fill('Thanks, keep it with the task.'); }, duration: 1900 } },
      { name: `assistant-motion-arrival-stream-stop${suffix}`, viewport, video: { trigger: async page => { await send(page); await page.waitForTimeout(1000); await page.getByRole('button', { name: 'Stop', exact: true }).click(); }, duration: 2400 } },
      { name: `assistant-motion-jump-newest${suffix}`, viewport, prepare: streamAway, video: { trigger: async page => { await page.waitForTimeout(650); await newest(page); }, duration: 1800 } },
    ];
  }),
];
