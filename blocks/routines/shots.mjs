const mobile = { width: 390, height: 844 };
const by = (page, name) => page.getByRole('button', { name, exact: true });
const openEditor = page => by(page, 'Order sweep').click();
const changeSchedule = page => by(page, 'Interval').click();
const resumeClimate = page => page.locator('.helper-row').filter({ hasText: 'Climate watch' }).getByRole('button', { name: 'Resume', exact: true }).click();
const push = page => by(page, 'View run').click();
const pop = page => by(page, 'Back to helpers').click();
const live = page => by(page, 'Start live preview').click();
export default [
  { name: '01-helpers-light', fullPage: true },
  { name: '02-helpers-dark', theme: 'dark', fullPage: true },
  { name: '03-helpers-light-mobile', viewport: mobile, fullPage: true },
  { name: '04-helpers-dark-mobile', viewport: mobile, theme: 'dark', fullPage: true },
  { name: '05-editor-light', path: '/?edit=order-sweep' },
  { name: '06-editor-dark', path: '/?edit=order-sweep', theme: 'dark' },
  { name: '07-editor-light-mobile', path: '/?edit=order-sweep', viewport: mobile },
  { name: '08-editor-dark-mobile', path: '/?edit=order-sweep', viewport: mobile, theme: 'dark' },
  { name: '09-cron-light', path: '/?edit=order-sweep', prepare: async page => { await by(page, 'Cron').click(); await page.locator('.next-preview').scrollIntoViewIfNeeded(); } },
  { name: '10-interval-dark', path: '/?edit=order-sweep', theme: 'dark', prepare: async page => { await changeSchedule(page); await page.locator('.next-preview').scrollIntoViewIfNeeded(); } },
  { name: '11-validation-light', path: '/?new=1', prepare: page => by(page, 'Save helper').click() },
  { name: '12-unsaved-light', path: '/?edit=order-sweep', prepare: async page => { await page.getByLabel('Name', { exact: true }).fill('Order sweep updated'); await by(page, 'Cancel').click(); } },
  { name: '13-live-light', path: '/?run=run-106' },
  { name: '14-live-dark', path: '/?run=run-106', theme: 'dark' },
  { name: '15-live-light-mobile', path: '/?run=run-106', viewport: mobile, fullPage: true },
  { name: '16-completed-light', path: '/?run=run-104', fullPage: true },
  { name: '17-completed-dark-mobile', path: '/?run=run-104', theme: 'dark', viewport: mobile, fullPage: true },
  { name: '18-expanded-tool-light', path: '/?run=run-104', prepare: page => page.getByRole('button', { name: 'Read orders inbox Done' }).click() },
  { name: '19-failed-run-dark', path: '/?run=run-105', theme: 'dark' },
  { name: '20-history-light', path: '/?view=history' },
  { name: '21-history-dark-mobile', path: '/?view=history', viewport: mobile, theme: 'dark', fullPage: true },
  { name: '22-sign-in-light', prepare: page => by(page, 'Sign in').click() },
  { name: '23-cancel-dark', path: '/?run=run-106', theme: 'dark', prepare: page => by(page, 'Cancel run').click() },
  { name: '24-empty-light', path: '/?state=empty' },
  { name: '25-empty-dark-mobile', path: '/?state=empty', theme: 'dark', viewport: mobile },
  { name: '26-error-light', path: '/?state=error' },
  { name: '27-error-dark-mobile', path: '/?state=error', theme: 'dark', viewport: mobile },
  { name: '28-save-error-light', path: '/?edit=order-sweep&saveError=1', prepare: page => by(page, 'Save helper').click() },
  { name: '29-no-results-light', prepare: page => page.getByLabel('Search helpers').fill('seedlings') },
  { name: '30-reduced-motion-mobile', viewport: mobile, reduced: true, path: '/?edit=order-sweep' },
  { name: '35-preview-light-mobile', path: '/?edit=order-sweep', viewport: mobile, prepare: page => page.locator('.next-preview').scrollIntoViewIfNeeded() },
  { name: '36-cron-validation-dark-mobile', path: '/?edit=order-sweep', viewport: mobile, theme: 'dark', prepare: async page => { await by(page, 'Cron').click(); await page.getByLabel('Cron expression').fill('61 25 * * *'); await page.locator('.next-preview').scrollIntoViewIfNeeded(); } },
  { name: '37-delete-confirmation-light', path: '/?edit=stock-count', prepare: page => by(page, 'Delete helper').click() },
  { name: '38-cancelled-run-light', path: '/?run=run-106', prepare: async page => { await by(page, 'Cancel run').click(); await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel run', exact: true }).click(); } },
  { name: '31-editor-filmstrip', filmstrip: { trigger: openEditor, frames: [0, 80, 160, 260, 420] } },
  { name: '32-schedule-filmstrip', path: '/?edit=order-sweep', filmstrip: { trigger: changeSchedule, frames: [0, 80, 160, 260, 420] } },
  { name: '33-status-filmstrip', filmstrip: { trigger: resumeClimate, frames: [0, 60, 140, 240, 380] } },
  { name: '34-push-filmstrip-mobile', viewport: mobile, filmstrip: { trigger: push, frames: [0, 80, 160, 280, 440] } },
  ...[false, true].flatMap(isMobile => {
    const suffix = isMobile ? '-mobile' : '-desktop';
    const viewport = isMobile ? mobile : undefined;
    return [
      { name: `routines-motion-editor${suffix}`, viewport, video: { trigger: async page => { await openEditor(page); await page.waitForTimeout(650); await by(page, 'Cancel').click(); }, duration: 1600, width: isMobile ? 390 : 960 } },
      { name: `routines-motion-schedule${suffix}`, viewport, path: '/?edit=order-sweep', video: { trigger: async page => { await changeSchedule(page); await page.waitForTimeout(650); await by(page, 'Cron').click(); await page.waitForTimeout(650); await by(page, 'Weekdays').click(); }, duration: 2200, width: isMobile ? 390 : 960 } },
      { name: `routines-motion-status${suffix}`, viewport, prepare: isMobile ? page => page.locator('.helper-row').filter({ hasText: 'Climate watch' }).scrollIntoViewIfNeeded() : undefined, video: { trigger: resumeClimate, duration: 1200, width: isMobile ? 390 : 960 } },
      { name: `routines-motion-push-pop${suffix}`, viewport, video: { trigger: async page => { await push(page); await page.waitForTimeout(750); await pop(page); }, duration: 1900, width: isMobile ? 390 : 960 } },
      { name: `routines-motion-live-log${suffix}`, viewport, path: '/?run=run-106', video: { trigger: live, duration: 16500, width: isMobile ? 390 : 960 } },
    ];
  }),
];
