const mobile = { width: 390, height: 844 };
const click = name => async page => { await page.getByRole('button', { name, exact: true }).click(); };
const openInspector = async page => { await page.locator('[data-task="FG-104"] .task-title').click(); };
const complete = async page => {
  await page.getByRole('button', { name: 'Complete Pot on 120 lavender plugs', exact: true }).click();
  await page.getByLabel('Completion note').fill('All 120 plugs potted, labelled and moved to the sheltered bench.');
  await page.getByRole('button', { name: 'Mark done', exact: true }).click();
};
const drag = async page => {
  const source = page.locator('[data-task="FG-104"]');
  if (page.viewportSize().width < 768) {
    const handle = await source.getByRole('button', { name: 'Drag Pot on 120 lavender plugs', exact: true }).boundingBox();
    const touch = await page.context().newCDPSession(page);
    await touch.send('Emulation.setTouchEmulationEnabled', { enabled: true });
    const x = handle.x + 12, y = handle.y + 12;
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await page.waitForTimeout(260);
    for (let i = 1; i <= 8; i++) {
      await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (325 - x) * i / 8, y: y + 15 }] });
      await page.waitForTimeout(20);
    }
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await touch.detach();
  } else {
    const from = await source.boundingBox();
    const to = await page.locator('[data-column="In progress"]').boundingBox();
    await page.mouse.move(from.x + 90, from.y + 40); await page.mouse.down();
    await page.mouse.move(from.x + 110, from.y + 36, { steps: 5 });
    await page.waitForTimeout(250); await page.mouse.move(to.x + 100, to.y + 110, { steps: 18 }); await page.waitForTimeout(280); await page.mouse.up();
  }
};
const stills = [
  { name: '01-today-light' }, { name: '02-today-dark', theme: 'dark' },
  { name: '03-today-light-mobile', viewport: mobile }, { name: '04-today-dark-mobile', viewport: mobile, theme: 'dark' },
  { name: '05-icon-rail-light', path: '/?rail=collapsed' },
  { name: '06-all-tasks-list-light', path: '/?page=all&view=list' },
  { name: '07-all-tasks-list-dark', path: '/?page=all&view=list', theme: 'dark' },
  { name: '08-areas-light', path: '/?page=areas' },
  { name: '09-area-detail-dark', path: '/?page=areas&area=Propagation%20house', theme: 'dark' },
  { name: '10-inspector-light', path: '/?open=FG-104' },
  { name: '11-inspector-dark', path: '/?open=FG-104', theme: 'dark' },
  { name: '12-inspector-light-mobile', path: '/?open=FG-104', viewport: mobile },
  { name: '13-full-page-dark', path: '/?open=FG-104&full=1', theme: 'dark' },
  { name: '14-empty-light', path: '/?state=empty' },
  { name: '15-no-matches-dark', path: '/?search=orchid', theme: 'dark' },
  { name: '16-error-light', path: '/?state=error' },
  { name: '17-create-light', path: '/?state=editing' },
  { name: '18-live-dark', theme: 'dark', prepare: async page => { await page.locator('[data-live-trigger]').click(); await page.waitForTimeout(1100); } },
  { name: '19-completion-reason-light', prepare: async page => { await page.getByRole('button', { name: 'Complete Pot on 120 lavender plugs', exact: true }).click(); await page.getByLabel('Completion note').fill('All 120 plugs potted, labelled and watered.'); } },
  { name: '20-completion-undo-light', prepare: complete },
  { name: '21-mobile-navigation-dark', viewport: mobile, theme: 'dark', prepare: click('Toggle navigation') },
  { name: '22-list-dark-mobile', path: '/?view=list', viewport: mobile, theme: 'dark' },
  { name: '23-areas-light-mobile', path: '/?page=areas', viewport: mobile },
  { name: '24-filters-light', prepare: click('Filters') },
  { name: '25-reduced-inspector-dark', path: '/?open=FG-104', theme: 'dark', reduced: true },
];
const films = [
  { name: '26-filmstrip-rail', filmstrip: { trigger: click('Toggle navigation'), frames: [0, 80, 160, 260, 420] } },
  { name: '27-filmstrip-area', path: '/?page=areas', filmstrip: { trigger: click('Propagation house Seedlings, cuttings and the next batch. 3 open'), frames: [0, 80, 160, 260, 420] } },
  { name: '28-filmstrip-inspector', filmstrip: { trigger: openInspector, frames: [0, 60, 120, 220, 420] } },
];
const interactions = [
  ['rail-collapse', '/', async page => { await click('Toggle navigation')(page); await page.waitForTimeout(650); await click(page.viewportSize().width < 768 ? 'Close navigation' : 'Toggle navigation')(page); }, 1800],
  ['page-change', '/', async page => { for (const destination of ['All tasks', 'Areas', 'Today']) { if (page.viewportSize().width < 768) { await click('Toggle navigation')(page); await page.waitForTimeout(400); } await click(destination)(page); await page.waitForTimeout(650); } }, 2500],
  ['area-drill', '/?page=areas', async page => { await page.locator('.area-row').first().click(); await page.waitForTimeout(850); await click('All areas')(page); }, 2200],
  ['inspector', '/', async page => { await openInspector(page); await page.waitForTimeout(800); await click('Close task')(page); }, 2100],
  ['drag-drop', '/', drag, 2400],
  ['live-arrival', '/', async page => { await page.locator('[data-live-trigger]').click(); }, 2100],
  ['completion-undo', '/', async page => { await complete(page); await page.waitForTimeout(800); await click('Undo')(page); }, 2900],
];
const videos = interactions.flatMap(([what, path, trigger, duration]) => [
  { name: `workbench-motion-${what}`, path, video: { trigger, duration } },
  { name: `workbench-motion-${what}-mobile`, path, viewport: mobile, video: { trigger, duration } },
]);
videos.push({ name: 'workbench-motion-mobile-rail-sheet', viewport: mobile, video: { trigger: async page => { await click('Toggle navigation')(page); await page.waitForTimeout(750); await click('Close navigation')(page); }, duration: 2000 } });
export default [...stills, ...films, ...videos];
