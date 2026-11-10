import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, hasTouch: mobile });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const open = async path => { await page.goto(`http://localhost:5305/${path}`); await page.evaluate(() => document.fonts.ready); };
    await open('?state=empty');
    await page.getByRole('button', { name: 'Why was the propagation house too warm?', exact: true }).click();
    await page.getByRole('button', { name: 'Stop', exact: true }).waitFor();
    await page.waitForTimeout(650);
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
    const text = await page.locator('.turn-assistant').innerText();
    await page.waitForTimeout(800);
    assert.equal(await page.locator('.turn-assistant').innerText(), text, 'Stop cancels batches');
    assert.equal(await page.locator('.change-list').count(), 0, 'Stop cannot claim completed changes');
    await page.getByRole('button', { name: 'New conversation', exact: true }).click();
    assert.equal(await page.locator('.suggestion').count(), 3);
    await page.getByRole('textbox').fill('Keep this draft through the morph.');
    await page.getByRole('button', { name: 'Expand assistant', exact: true }).click();
    await page.getByRole('button', { name: 'Dock assistant', exact: true }).click();
    assert.equal(await page.getByRole('textbox').inputValue(), 'Keep this draft through the morph.');
    await page.getByRole('button', { name: 'Attach bench 4 image', exact: true }).click();
    assert.equal(await page.locator('[data-slot="attachment"]').count(), 1);
    await page.getByRole('button', { name: 'Remove bench 4 image' }).click();
    assert.equal(await page.locator('[data-slot="attachment"]').count(), 0);
    await open('?state=error');
    await page.getByRole('textbox').fill('A draft that must survive retry.');
    const beforeUsers = await page.locator('.turn-user').count();
    await page.evaluate(() => { const view = document.querySelector('[data-slot="message-scroller-viewport"]'); view.scrollTop = view.scrollHeight; });
    await page.getByRole('button', { name: 'Retry reply' }).click();
    assert.equal(await page.getByRole('textbox').inputValue(), 'A draft that must survive retry.');
    assert.equal(await page.locator('.turn-user').count(), beforeUsers, 'Retry does not duplicate the request');
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
    await open('?state=changes');
    await page.evaluate(() => { const view = document.querySelector('[data-slot="message-scroller-viewport"]'); view.scrollTop = view.scrollHeight; });
    const change = page.locator('.change-list a').first();
    await change.focus();
    await change.click();
    await page.getByRole('dialog', { name: 'Prepare Saturday market crates' }).waitFor();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    assert.equal(await change.evaluate(el => el === document.activeElement), true, 'Task link restores focus');
    await open('');
    const tools = page.getByRole('button', { name: 'Read 14 tasks in Retail benches' }).first();
    assert.equal(await tools.getAttribute('aria-expanded'), 'false');
    await tools.click();
    assert.equal(await tools.getAttribute('aria-expanded'), 'true');
    await tools.click();
    await page.evaluate(() => { const view = document.querySelector('[data-slot="message-scroller-viewport"]'); view.scrollTop = view.scrollHeight; view.dispatchEvent(new Event('scroll')); });
    await page.getByRole('textbox').fill('Why was the propagation house too warm?');
    await page.getByRole('button', { name: 'Send message', exact: true }).click();
    await page.waitForTimeout(1200);
    const gap = await page.locator('[data-slot="message-scroller-viewport"]').evaluate(el => el.scrollHeight - el.clientHeight - el.scrollTop);
    assert.ok(gap < 45, `Pinned reader stays pinned (${gap})`);
    const viewport = page.locator('[data-slot="message-scroller-viewport"]');
    await viewport.hover(); await page.mouse.wheel(0, -1000); await page.waitForTimeout(180);
    const top = await viewport.evaluate(el => el.scrollTop);
    await page.waitForTimeout(700);
    assert.ok(Math.abs(await viewport.evaluate(el => el.scrollTop) - top) < 5, 'Reading position survives batches');
    await page.getByRole('button', { name: 'Jump to newest', exact: true }).click();
    await page.waitForTimeout(200);
    assert.ok(await viewport.evaluate(el => el.scrollHeight - el.clientHeight - el.scrollTop) < 45);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No horizontal overflow');
    for (const theme of ['light', 'dark']) {
      await open(`?theme=${theme}`);
      assert.equal(await page.getByRole('log').getAttribute('aria-relevant'), 'additions', 'Conversation announces additions only');
      await page.getByRole('button', { name: 'Close assistant', exact: true }).click();
      const launcher = page.getByRole('button', { name: 'Open Ask Larkspur', exact: true });
      await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Open Ask Larkspur');
      assert.equal(await launcher.evaluate(el => !el.inert && el === document.activeElement), true, 'Close restores focus after launcher becomes interactive');
      await page.locator('.assistant').waitFor({ state: 'detached' });
      await page.keyboard.press('Enter');
      await page.getByRole('textbox').waitFor();
      await page.getByRole('textbox').focus();
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Open Ask Larkspur');
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    await open('');
    await page.clock.runFor(500);
    const reducedTools = page.getByRole('button', { name: 'Read 14 tasks in Retail benches' });
    for (const expanded of [true, false]) {
      await reducedTools.evaluate(el => el.click());
      const heights = [];
      for (let frame = 0; frame < 10; frame++) {
        await page.clock.runFor(17);
        heights.push(await page.locator('.tool-row').evaluate(el => el.getBoundingClientRect().height));
      }
      assert.ok(heights.every(height => Math.abs(height - heights.at(-1)) < .5), `Reduced-motion disclosure geometry is immediate (${heights})`);
      assert.equal(await reducedTools.getAttribute('aria-expanded'), String(expanded));
    }
    assert.deepEqual(errors, []);
    results.push({ viewport: mobile ? '390x844' : '1440x900', checks: 'stop, new conversation, draft continuity, attachment, retry preservation, task focus return, disclosure, pinned scroll, unpinned scroll, jump newest, overflow, launcher focus return (light/dark, button/Escape), additions-only live region, immediate reduced-motion disclosure, runtime errors', status: 'passed' });
    await context.close();
  }
  console.log(JSON.stringify(results, null, 2));
} finally { await browser.close(); }
