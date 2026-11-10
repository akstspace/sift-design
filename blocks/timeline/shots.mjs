const mobile = { width: 390, height: 844 };
const moveDay = async page => { await page.getByRole('button', { name: 'Previous day', exact: true }).click(); };
const week = async page => { await page.getByRole('button', { name: 'Week', exact: true }).click(); };
const filter = async page => { await page.getByRole('button', { name: 'Growing', exact: true }).click(); };
const hover = async page => { const target = page.locator('.ribbon-hit').first(); await target.focus(); };
export default [
  { name: '01-day-light' },
  { name: '02-day-dark', theme: 'dark' },
  { name: '03-day-light-mobile', viewport: mobile, fullPage: true },
  { name: '04-day-dark-mobile', theme: 'dark', viewport: mobile, fullPage: true },
  { name: '05-tooltip-light', prepare: hover },
  { name: '06-edit-light', path: '/?open=edit' },
  { name: '07-edit-dark', path: '/?open=edit', theme: 'dark' },
  { name: '08-edit-light-mobile', path: '/?open=edit', viewport: mobile },
  { name: '09-validation-light', path: '/?open=edit', prepare: async page => { await page.getByLabel('End time', { exact: true }).fill('12:00'); await page.getByRole('button', { name: 'Save changes', exact: true }).click(); } },
  { name: '10-week-light', path: '/?view=week' },
  { name: '11-week-dark', path: '/?view=week', theme: 'dark' },
  { name: '12-week-light-mobile', path: '/?view=week', viewport: mobile, fullPage: true },
  { name: '13-table-light', path: '/?display=table' },
  { name: '14-table-dark-mobile', path: '/?display=table', theme: 'dark', viewport: mobile, fullPage: true },
  { name: '15-paused-light', path: '/?state=paused' },
  { name: '16-paused-dark-mobile', path: '/?state=paused', theme: 'dark', viewport: mobile, fullPage: true },
  { name: '17-empty-light', path: '/?state=empty', fullPage: true },
  { name: '18-empty-dark-mobile', path: '/?state=empty', theme: 'dark', viewport: mobile, fullPage: true },
  { name: '19-task-time-light', path: '/?task=FG-142' },
  { name: '20-task-time-dark-mobile', path: '/?task=FG-142', theme: 'dark', viewport: mobile },
  { name: '21-reduced-motion', reduced: true, prepare: moveDay },
  { name: '25-filter-light', prepare: filter, fullPage: true },
  { name: '26-breakdown-dark-mobile', theme: 'dark', viewport: mobile, fullPage: true, prepare: async page => { await page.getByRole('button', { name: 'Show breakdown', exact: true }).click(); } },
  { name: '27-unsaved-draft-light', path: '/?open=edit', prepare: async page => { await page.getByLabel('What you worked on', { exact: true }).fill('Lavender session draft'); await page.keyboard.press('Escape'); } },
  { name: '22-day-navigation-filmstrip', filmstrip: { trigger: moveDay, frames: [0, 70, 140, 240, 400] }, clip: 'main' },
  { name: '23-day-week-filmstrip', filmstrip: { trigger: week, frames: [0, 70, 140, 240, 400] }, clip: 'main' },
  { name: '24-edit-filmstrip', path: '/?open=edit', filmstrip: { trigger: async page => { await page.getByLabel('End time', { exact: true }).fill('13:40'); await page.getByLabel('Category', { exact: true }).selectOption('5'); await page.getByRole('button', { name: 'Save changes', exact: true }).click(); }, frames: [0, 70, 140, 240, 400] } },
  { name: 'timeline-motion-interruption-dark', theme: 'dark', video: { trigger: async page => { await moveDay(page); await page.waitForTimeout(80); await page.getByRole('button', { name: 'Next day', exact: true }).click(); await page.waitForTimeout(80); await moveDay(page); }, duration: 1600 } },
  ...[false, true].flatMap(isMobile => {
    const size = isMobile ? { viewport: mobile } : {};
    const suffix = isMobile ? '-mobile' : '';
    return [
      { name: `timeline-motion-day-navigation${suffix}`, ...size, video: { trigger: async page => { await moveDay(page); await page.waitForTimeout(650); await page.getByRole('button', { name: 'Next day', exact: true }).click(); }, duration: 1800 } },
      { name: `timeline-motion-day-rail${suffix}`, ...size, prepare: async page => { await page.locator('.sessions-heading').scrollIntoViewIfNeeded(); }, video: { trigger: async page => { await page.getByRole('button', { name: 'Previous day', exact: true }).evaluate(el => el.click()); }, duration: 1400 } },
      { name: `timeline-motion-day-week${suffix}`, ...size, video: { trigger: async page => { await week(page); await page.waitForTimeout(650); await page.getByRole('button', { name: 'Day', exact: true }).click(); }, duration: 1800 } },
      { name: `timeline-motion-edit${suffix}`, ...size, path: '/?open=edit&breakdown=1', video: { trigger: async page => { await page.getByLabel('End time', { exact: true }).fill('13:40'); await page.getByLabel('Category', { exact: true }).selectOption('5'); await page.getByRole('button', { name: 'Save changes', exact: true }).click(); }, duration: 1800 } },
      { name: `timeline-motion-filter${suffix}`, ...size, video: { trigger: async page => { await filter(page); await page.waitForTimeout(650); await page.getByRole('button', { name: 'Show all', exact: true }).click(); }, duration: 1800 } },
      { name: `timeline-motion-tooltip${suffix}`, ...size, video: { trigger: async page => { await page.locator('.ribbon-hit').first().focus(); await page.waitForTimeout(450); await page.locator('.ribbon-hit').nth(1).focus(); await page.waitForTimeout(450); await page.locator('.ribbon-hit').nth(2).focus(); }, duration: 1600 } },
    ];
  }),
];
