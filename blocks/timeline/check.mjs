import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    await page.goto('http://127.0.0.1:5304/');
    await page.getByRole('heading', { name: 'Time spent', exact: true }).waitFor();
    assert.equal(await page.locator('.totals').innerText().then(t => t.includes('5h 35m')), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.getByRole('button', { name: 'Previous day', exact: true }).click();
    await page.waitForTimeout(500);
    assert.equal(await page.locator('.day-navigation').innerText().then(t => t.includes('9 November')), true);
    await page.getByRole('button', { name: 'Next day', exact: true }).click();
    await page.waitForTimeout(500);
    const category = page.getByRole('button', { name: 'Growing', exact: true });
    await category.click();
    await page.waitForTimeout(500);
    assert.equal(await page.locator('.session-rail > li').count(), 2);
    assert.equal(await page.locator('.ribbon-hit').first().locator('.data-fill').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(1, 124, 93)');
    await page.getByRole('button', { name: 'Show all', exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Edit Finished potting the lavender plugs', exact: true }).click();
    await page.getByLabel('End time', { exact: true }).fill('12:00');
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await page.getByRole('alert').waitFor();
    assert.equal(await page.getByLabel('What you worked on', { exact: true }).inputValue(), 'Finished potting the lavender plugs');
    await page.getByLabel('End time', { exact: true }).fill('13:40');
    await page.getByLabel('Category', { exact: true }).selectOption('5');
    await page.getByLabel('Linked task', { exact: true }).selectOption('FG-144');
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await page.waitForTimeout(600);
    assert.equal(await page.locator('.totals').innerText().then(t => t.includes('5h 15m')), true);
    const edited = page.locator('.session-rail > li').filter({ hasText: 'Finished potting the lavender plugs' });
    assert.equal(await edited.innerText().then(t => t.includes('Research')), true);
    assert.equal(await edited.innerText().then(t => t.includes('Sow the second batch')), true);
    await page.getByRole('button', { name: 'Week', exact: true }).click();
    await page.waitForTimeout(600);
    assert.equal(await page.locator('.week-chart-row').count(), 7);
    await page.getByRole('button', { name: 'Day', exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Table', exact: true }).click();
    await page.waitForTimeout(500);
    assert.equal(await page.locator('.table-scroll tbody tr').count(), 10);
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    assert.equal(await page.locator('.tracker-notice').innerText().then(t => t.includes('Paused by you')), true);
    await page.getByRole('button', { name: 'Resume', exact: true }).click();
    await page.goto('http://127.0.0.1:5304/?state=empty');
    await page.getByRole('heading', { name: 'Nothing recorded for this day' }).waitFor();
    await page.getByRole('button', { name: 'Add time', exact: true }).first().click();
    await page.getByLabel('What you worked on', { exact: true }).fill('Checked the propagation benches');
    await page.getByRole('button', { name: 'Add time', exact: true }).last().click();
    await page.waitForTimeout(500);
    assert.equal(await page.locator('.session-rail > li').count(), 1);
    await page.close();
    console.log(`PASS ${viewport.width}px: navigation, fixed category colors, filters, validation, edits, task linking, weekly bars, table, paused reason, empty/add`);
  }
} finally { await browser.close(); }
