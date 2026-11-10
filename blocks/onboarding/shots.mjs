const mobile = { width: 390, height: 844 };
const click = (name) => async p => { await p.getByRole('button', { name, exact: true }).click(); };
// Intercept an actual fixture request to make the pending state inspectable. The app never delays a response.
async function checking(p) { await p.route('**/fixtures/*.json', route => new Promise(resolve => { p.once('close', resolve); })); }
const retry = click('Retry sensor hub');
const replay = click('Replay opening');
const forward = click('Continue');
const back = click('Back');
const handoff = click('Open workspace');
const themeSwitch = async p => { await p.getByRole('radio', {name:'Dark', exact:true}).click(); };
const output = [];
for (const [suffix, viewport] of [['', undefined], ['-mobile', mobile]]) {
  for (const theme of ['light', 'dark']) {
    output.push({ name: `01-welcome-${theme}${suffix}`, theme, viewport });
    output.push({ name: `07-settings-${theme}${suffix}`, path: '/?view=settings', theme, viewport, fullPage: true });
  }
  output.push(
    { name: `02-connections-failed-light${suffix}`, path: '/?step=connections', viewport },
    { name: `02-connections-checking-light${suffix}`, path: '/?step=connections', viewport, prepare: async p => { await checking(p); await p.reload({waitUntil:'domcontentloaded'}); } },
    { name: `03-connections-ready-light${suffix}`, path: '/?step=connections', viewport, prepare: retry },
    { name: `04-defaults-light${suffix}`, path: '/?step=defaults', viewport },
    { name: `05-optional-light${suffix}`, path: '/?step=optional', viewport },
    { name: `06-helper-light${suffix}`, path: '/?step=helper', viewport },
    { name: `08-restore-confirmation-light${suffix}`, path: '/?view=settings', viewport, prepare: click('Restore backup') },
    { name: `09-workspace-light${suffix}`, path: '/?view=workspace&helper=Climate%20watch', viewport },
    { name: `10-reduced-opening-light${suffix}`, reduced: true, viewport },
  );
  for (const [name, path, trigger, duration] of [
    ['assembly', '/', replay, 1500],
    ['forward', '/?step=connections', forward, 1300],
    ['back', '/?step=defaults', back, 1300],
    ['retry', '/?step=connections', retry, 1600],
    ['handoff', '/?step=helper', handoff, 1800],
    ['theme', '/?view=settings', themeSwitch, 1300],
  ]) output.push({ name: `onboarding-motion-${name}${suffix}`, path, viewport, video: { trigger, duration, width: viewport ? 390 : 960 } });
}
for (const [name, path, trigger] of [
  ['assembly', '/', replay],
  ['push', '/?step=connections', forward],
  ['handoff', '/?step=helper', handoff],
]) output.push({ name: `11-filmstrip-${name}`, path, filmstrip: { trigger, frames: [0, 70, 150, 280, 520] } });
// Cover every setup and workspace state in both palettes, not only the welcome.
for (const shot of [...output]) {
  if (!shot.video && !shot.filmstrip && !shot.reduced && shot.name.includes('-light') && !shot.name.startsWith('01-') && !shot.name.startsWith('07-')) {
    output.push({ ...shot, name: shot.name.replace('-light', '-dark'), theme: 'dark' });
  }
}
// Show the full small-screen flow, including skip actions below the viewport.
for (const shot of output) {
  if (shot.viewport && !shot.video && !shot.filmstrip && !shot.name.startsWith('08-')) shot.fullPage = true;
}
export default output;
