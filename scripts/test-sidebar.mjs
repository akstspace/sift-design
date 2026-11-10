#!/usr/bin/env node
// Regression coverage for the real sidebar in standalone and iframe contexts.
// Builds private test output; no persistent dev server or browser download.
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, preview } from 'vite';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const servers = [];
let browser;
const panelSelector = '[data-slot="sidebar"][data-mobile="true"]';
const overlaySelector = '.sift-mobile-rail-overlay';
const errors = [];

async function serve(app) {
  const appRoot = path.join(root, app);
  const outDir = path.join(root, '.cache', 'test-sidebar', path.basename(app));
  await build({ root: appRoot, logLevel: 'error', build: { outDir, emptyOutDir: true } });
  const server = await preview({ root: appRoot, logLevel: 'error', build: { outDir }, preview: { port: 0, open: false } });
  servers.push(server);
  return server.resolvedUrls.local[0];
}

async function sample(frame, action, duration = 700) {
  return frame.evaluate(async ({ action, duration, panelSelector, overlaySelector }) => {
    const samples = [];
    const start = performance.now();
    document.querySelector(action === 'open' ? '[data-slot="sidebar-trigger"]' : '[aria-label="Close navigation"]').click();
    await new Promise(resolve => {
      const tick = () => {
        const panel = document.querySelector(panelSelector);
        const overlay = document.querySelector(overlaySelector);
        samples.push({
          t: performance.now() - start,
          x: panel ? panel.getBoundingClientRect().x : null,
          state: panel?.dataset.state,
          inert: panel?.inert,
          panelPointer: panel && getComputedStyle(panel).pointerEvents,
          overlayPointer: overlay && getComputedStyle(overlay).pointerEvents,
          opacity: overlay ? Number(getComputedStyle(overlay).opacity) : 0,
          pointer: getComputedStyle(document.body).pointerEvents,
          transitionDuration: panel && getComputedStyle(panel).transitionDuration,
          animationName: overlay && getComputedStyle(overlay).animationName,
          vaul: panel?.hasAttribute('data-vaul-drawer'),
          transform: panel && getComputedStyle(panel).transform,
        });
        if (performance.now() - start >= duration) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    return samples;
  }, { action, duration, panelSelector, overlaySelector });
}

async function closed(frame) {
  await frame.locator(panelSelector).waitFor({ state: 'detached', timeout: 1200 });
  assert.equal(await frame.locator(overlaySelector).count(), 0, 'backdrop is removed');
  assert.equal(await frame.evaluate(() => getComputedStyle(document.body).pointerEvents), 'auto', 'body unlocks');
  assert.equal(await frame.locator('#root [inert]').count(), 0, 'background is no longer inert');
  assert.equal(await frame.evaluate(() => !!document.activeElement?.matches('[data-slot="sidebar-trigger"]')), true, 'focus returns to trigger');
}

async function open(frame) {
  await frame.locator('[data-slot="sidebar-trigger"]').click();
  await frame.locator(`${panelSelector}[data-state="open"]`).waitFor();
}

async function runCase(base, { width, theme, embedded = false, reduced = false }) {
  const context = await browser.newContext({ viewport: { width: embedded ? 1440 : width, height: 844 }, reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: true });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const url = `${base}?theme=${theme}`;
  let frame = page.mainFrame();
  if (embedded) {
    await page.setContent(`<iframe title="Workbench regression" src="${url}" style="width:${width}px;height:800px;border:0"></iframe>`);
    frame = await (await page.locator('iframe').elementHandle()).contentFrame();
  } else await page.goto(url);
  await frame.locator('[data-slot="sidebar-trigger"]').waitFor();
  await frame.evaluate(() => document.fonts.ready);

  const opening = await sample(frame, 'open');
  assert.ok(opening.every(s => !s.vaul && s.transitionDuration === '0s' && s.animationName === 'none'), 'one animation owner, no Vaul or CSS transitions');
  if (reduced) assert.ok(opening.every(s => s.transform === 'none'), 'reduced motion has no automatic travel');
  else assert.ok(Math.abs(opening.find(s => s.t >= 400).x) < 10, 'opening visually settles within 400ms');

  // Modal focus remains inside while open, including wrapping at both ends.
  for (let i = 0; i < 16; i++) {
    await page.keyboard.press(i < 8 ? 'Tab' : 'Shift+Tab');
    assert.equal(await frame.evaluate(selector => document.activeElement?.closest(selector) !== null, panelSelector), true, 'focus stays in open navigation');
  }
  const closing = await sample(frame, 'close');
  assert.ok(closing.every(s => s.x === null || (s.state === 'closed' && s.inert && s.panelPointer === 'none' && s.overlayPointer === 'none' && s.pointer === 'auto')), 'closing visuals immediately release input');
  assert.ok(closing.filter(s => s.t >= 220).every(s => s.opacity === 0), 'backdrop stays invisible after its exit fade');
  await closed(frame);

  for (const method of ['escape', 'backdrop', 'destination', 'early-close', 'repeat', 'repeat']) {
    await open(frame);
    if (method === 'escape' || method === 'early-close') await page.keyboard.press('Escape');
    else if (method === 'backdrop') await frame.locator(overlaySelector).click({ position: { x: width - 8, y: 120 } });
    else if (method === 'destination') await frame.getByRole('button', { name: 'All tasks', exact: true }).click();
    else await frame.getByRole('button', { name: 'Close navigation', exact: true }).click();
    try { await closed(frame); }
    catch (error) { console.error('Dismissal failed:', method, await frame.evaluate(() => ({ active: document.activeElement?.outerHTML, body: document.body.style.cssText }))); throw error; }
  }

  // Reopening during exit must reverse the same panel, not add a second portal.
  await open(frame);
  await frame.evaluate(selector => { window.__sidebarPanel = document.querySelector(selector); }, panelSelector);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(50);
  await page.keyboard.press('Control+b');
  await frame.locator(`${panelSelector}[data-state="open"]`).waitFor();
  assert.equal(await frame.evaluate(selector => window.__sidebarPanel === document.querySelector(selector), panelSelector), true, 'rapid reversal retains panel identity');
  assert.equal(await frame.locator(overlaySelector).count(), 1, 'rapid reversal keeps one backdrop');
  await page.keyboard.press('Escape');
  await closed(frame);

  // Touch input follows 1:1 and cancellation springs back without a second smoother.
  await open(frame);
  await page.waitForTimeout(550);
  const cdp = await context.newCDPSession(page);
  const box = await frame.locator(panelSelector).boundingBox();
  const x = box.x + 220, y = box.y + 100;
  const touch = (type, offset = 0) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x: x + offset, y }] });
  await touch('touchStart');
  for (const offset of [-10, -20, -30]) { await touch('touchMove', offset); await page.waitForTimeout(40); }
  const draggedX = await frame.locator(panelSelector).evaluate(el => el.getBoundingClientRect().x);
  assert.ok(draggedX < -15 && draggedX > -40, 'drag directly follows touch');
  await page.waitForTimeout(120);
  await touch('touchEnd');
  await page.waitForTimeout(550);
  assert.ok(Math.abs(await frame.locator(panelSelector).evaluate(el => el.getBoundingClientRect().x)) < 1, 'short drag returns to open');
  await touch('touchStart');
  for (const offset of [-30, -80, -140, -210]) { await touch('touchMove', offset); await page.waitForTimeout(25); }
  await touch('touchEnd');
  await closed(frame);
  await cdp.detach();

  // Resize through both the Sheet and Sidebar breakpoints while open/closed.
  const resize = async nextWidth => {
    if (embedded) await page.locator('iframe').evaluate((el, value) => { el.style.width = `${value}px`; }, nextWidth);
    else await page.setViewportSize({ width: nextWidth, height: 844 });
  };
  await open(frame);
  await resize(700);
  await page.waitForTimeout(150);
  assert.equal(await frame.locator(`${panelSelector}[data-state="open"]`).count(), 1, 'crossing 640px does not switch modal primitive');
  await resize(1024);
  await frame.locator(panelSelector).waitFor({ state: 'detached' });
  assert.equal(await frame.locator(overlaySelector).count(), 0, 'wide layout removes modal');
  await resize(width);
  await page.waitForTimeout(150);
  assert.equal(await frame.locator(panelSelector).count(), 0, 'returning to mobile stays closed');
  await open(frame);
  await page.keyboard.press('Escape');
  await closed(frame);
  console.log(`PASS ${width}px ${theme}${embedded ? ' iframe' : ''}${reduced ? ' reduced motion' : ''}`);
  await context.close();
}

try {
  const workbench = await serve('blocks/workbench');
  const specimen = await serve('specimen');
  browser = await chromium.launch({ channel: 'chrome' });
  for (const theme of ['light', 'dark']) {
    for (const width of [390, 700]) await runCase(workbench, { width, theme });
    await runCase(workbench, { width: 390, theme, embedded: true });
    await runCase(workbench, { width: 390, theme, reduced: true });
  }
  for (const width of [390, 1024]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${specimen}?section=overlays`);
    await page.locator('[data-specimen="sheet"]').getByRole('button', { name: 'Open task details', exact: true }).click();
    const content = page.locator('[data-slot="sheet-content"]');
    assert.equal(await content.getAttribute('data-vaul-drawer-direction'), width === 390 ? 'bottom' : null, 'ordinary Sheet keeps responsive behavior');
    await page.keyboard.press('Escape');
    await content.waitFor({ state: 'detached' });
    await page.close();
  }
  assert.deepEqual(errors, [], 'no browser errors');
  console.log('PASS ordinary Sheet mobile/desktop behavior; no browser errors');
} finally {
  await browser?.close();
  await Promise.all(servers.map(server => new Promise(resolve => server.httpServer.close(resolve))));
}
