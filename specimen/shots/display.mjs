const path = "/?section=display";
const demo = '[data-specimen="sidebar"]';
const frames = [0, 60, 120, 200, 360, 520];
const at = (selector) => async page => { await page.locator(selector).evaluate(el => window.scrollTo({top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: "instant"})); };
const click = name => async page => { await page.getByRole("button", { name, exact: true }).click(); };
const pause = (page, ms = 800) => page.waitForTimeout(ms);
const drag = async (page, selector, distance) => {
  const box = await page.locator(selector).boundingBox();
  const x = box.x + box.width * .8, y = box.y + box.height * .5;
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + distance, y, { steps: 18 }); await page.mouse.up();
};
const pageFrame = '[data-specimen="page-transitions"]';
const motionShots = [
  { what: "sidebar-collapse", selector: demo, trigger: click("Collapse navigation"), desktop: true },
  { what: "nav-selection", selector: demo, trigger: click("Helpers"), desktop: true },
  { what: "push-pop", selector: '[data-page-demo="push"]', trigger: async page => { await click("Pot on 120 lavender plugs")(page); await pause(page); await click("Back to task list")(page); } },
  { what: "sibling", selector: '[data-page-demo="siblings"]', trigger: async page => { await page.getByRole("tab", { name: "Helpers", exact: true }).click(); await pause(page); await page.getByRole("tab", { name: "Today’s work", exact: true }).click(); } },
  { what: "accordion", selector: '[data-specimen="accordion"]', trigger: async page => { await click("Why did Climate watch file this task?")(page); await pause(page); await click("Why did Climate watch file this task?")(page); } },
  { what: "list-reflow", selector: '[data-specimen="item"]', trigger: async page => { await click("Insert maintenance task")(page); await pause(page); await click("Reverse task order")(page); await pause(page); await click("Remove first task")(page); } },
  { what: "carousel-drag", selector: '[data-specimen="carousel"]', trigger: async page => { await drag(page, '[data-specimen="carousel"] [data-slot="carousel-content"]', -200); await pause(page); await drag(page, '[data-specimen="carousel"] [data-slot="carousel-content"]', 260); } },
  { what: "message-arrival", selector: '[data-specimen="message-bubble-and-message-scroller"]', trigger: async page => { await click("Hand the misting check to John")(page); await pause(page); await click("Reverse follow-ups")(page); await pause(page); await click("Remove follow-ups")(page); } },
];
export default [
  ...motionShots.flatMap(shot => (shot.desktop ? [false] : [false, true]).map(mobile => ({ name: `display-motion-${shot.what}${mobile ? "-mobile" : ""}`, path, viewport: mobile ? { width:390, height:844 } : {width:1100,height:760}, prepare: at(shot.selector), video: { trigger: shot.trigger, duration:1200, width: mobile ? 390 : 960 } }))),
  { name: "display-motion-sidebar-dismiss-mobile", path, viewport: {width:390,height:844}, prepare: click("Open navigation"), video: {trigger: async page => { await drag(page,'[data-mobile="true"]',-200); },duration:1000,width:390} },
  {name:"display-sibling-filmstrip",path,clip:pageFrame,prepare:at(pageFrame),filmstrip:{frames:[0,60,140,260,420,700],trigger:async page => { await page.getByRole("tab",{name:"Helpers",exact:true}).click(); }}},
  ...[false,true].map(mobile => ({ name: `display-page-transitions${mobile ? "-mobile" : ""}`, path, clip: pageFrame, viewport:mobile ? {width:390,height:1000} : {width:1440,height:1000},prepare:at(pageFrame) })),
  {name:"display-push-filmstrip",path,viewport:{width:390,height:844},clip:'[data-page-demo="push"]',prepare:at('[data-page-demo="push"]'),filmstrip:{frames:[0,60,140,260,420,700],trigger:click("Pot on 120 lavender plugs")}},
  {name:"display-list-reflow-filmstrip",path,clip:'[data-specimen="item"]',prepare:async page => {await page.locator('[data-specimen="item"]').evaluate(el => el.style.minHeight="420px");await at('[data-specimen="item"]')(page);},filmstrip:{frames:[0,60,140,260,420,700],trigger:click("Insert maintenance task")}},
  ...["light", "dark"].flatMap(theme => [
    { name: `display-${theme}`, path, theme, fullPage: true },
    { name: `display-conversation-${theme}`, path, theme, clip: '[data-specimen="message-bubble-and-message-scroller"]', prepare: at('[data-specimen="message-bubble-and-message-scroller"]') },
    { name: `display-sidebar-expanded-${theme}`, path, theme, clip: demo },
    { name: `display-sidebar-collapsed-${theme}`, path, theme, clip: demo, prepare: async page => { await page.getByRole("button", { name: "Collapse navigation", exact: true }).click(); } },
    { name: `display-mobile-sheet-${theme}`, path, theme, viewport: { width: 390, height: 844 }, prepare: async page => { await page.getByRole("button", { name: "Open navigation", exact: true }).click(); } },
    ...["chart", "table", "empty", "alert"].map(component => ({ name: `display-${component}-${theme}`, path, theme, viewport: { width: 1440, height: 1000 }, clip: `[data-specimen="${component}"]`, prepare: at(`[data-specimen="${component}"]`) })),
  ]),
  { name: "display-mobile-dark", path, theme: "dark", fullPage: true, viewport: { width: 390, height: 844 } },
  { name: "display-message-arrival", path, clip: '[data-specimen="message-bubble-and-message-scroller"]', prepare: async page => { await page.getByRole("button", { name: "Hand the misting check to John" }).click(); } },
  { name: "display-chart-data", path, clip: '[data-specimen="chart"]', viewport: { width: 1440, height: 1100 }, prepare: async page => { await page.getByText("View chart data", { exact: true }).click(); } },
  { name: "display-mobile-light", path, fullPage: true, viewport: { width: 390, height: 844 } },
  { name: "display-reduced-motion", path, reduced: true, clip: demo },
  { name: "display-chart-tooltip", path, clip: '[data-specimen="chart"]', prepare: async page => { await page.locator('[data-specimen="chart"]').scrollIntoViewIfNeeded(); await page.locator('.recharts-bar-rectangle path').first().hover(); } },
  { name: "display-sidebar-collapse-filmstrip", path, clip: demo, filmstrip: { frames, trigger: async page => { await page.getByRole("button", { name: "Collapse navigation", exact: true }).click(); } } },
  { name: "display-accordion-open-filmstrip", path, clip: '[data-specimen="accordion"]', prepare: async page => {
    await page.locator('[data-specimen="accordion"]').evaluate(el => { el.style.minHeight = "320px"; window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: "instant" }); });
  }, filmstrip: { frames: [0, 60, 120, 220, 360], trigger: async page => { await page.getByRole("button", { name: "Why did Climate watch file this task?" }).click(); } } },
  { name: "display-nav-selection-filmstrip", path, clip: demo, filmstrip: { frames: [0, 40, 80, 140, 260, 360], trigger: async page => { await page.getByRole("button", { name: "Helpers", exact: true }).click(); } } },
];
