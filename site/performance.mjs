import fs from 'node:fs';
import { chromium } from 'playwright';
import { preview } from 'vite';
const server = await preview({ root: new URL('.', import.meta.url).pathname, preview: { port: 0 }, logLevel: 'warn' });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    await page.goto(server.resolvedUrls.local[0]);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(900);
    await page.evaluate(() => {
      window.__frames = []; window.__tasks = []; window.__sample = true;
      new PerformanceObserver(entries => window.__tasks.push(...entries.getEntries().map(entry => ({ duration: entry.duration, start: entry.startTime })))).observe({ type: 'longtask', buffered: false });
      let last;
      const tick = now => { if (last) window.__frames.push(now - last); last = now; if (window.__sample) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    for (let i = 0; i < 20; i++) { await page.mouse.wheel(0, 280); await page.waitForTimeout(100); }
    await page.waitForTimeout(250);
    const sample = await page.evaluate(() => { window.__sample = false; return { frames: window.__frames, longTasks: window.__tasks, overflow: document.documentElement.scrollWidth > innerWidth }; });
    const sorted = [...sample.frames].sort((a, b) => a - b);
    const baseline = sorted[Math.floor(sorted.length / 2)];
    results.push({ viewport, sampledFrames: sample.frames.length, baselineMs: +baseline.toFixed(2), p95Ms: +sorted[Math.floor(sorted.length * .95)].toFixed(2), droppedFrames: sample.frames.reduce((sum, ms) => sum + Math.max(0, Math.round(ms / baseline) - 1), 0), longTasks: sample.longTasks, horizontalOverflow: sample.overflow, note: 'Installed Chrome, headless, synthetic wheel input; measures this environment, not a physical high-refresh display.' });
    await page.close();
  }
  fs.writeFileSync(new URL('../screenshots/site/performance.json', import.meta.url), JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results, null, 2));
} finally { await browser.close(); await server.close(); }
