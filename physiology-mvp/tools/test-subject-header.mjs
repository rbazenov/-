import { chromium } from 'playwright';

const root = '/home/user/physiology-mvp';
const browser = await chromium.launch();
const errors = [];

for (const width of [390, 360, 320, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('http://**/*', (r) => r.abort());
  await page.route('https://**/*', (r) => r.abort());
  await page.goto(`file://${root}/prototype.html`);
  await page.locator('[data-subject-id="physiology"] button').click();
  await page.getByRole('button', { name: 'Начать', exact: true }).waitFor();

  const info = await page.evaluate(() => {
    const intro = document.querySelector('.subject-intro');
    const panel = document.querySelector('.screen');
    const text = document.querySelector('.subject-intro-text');
    const back = document.querySelector('.subject-intro-back');
    const list = document.querySelector('.topic-grid');
    const items = [...list.querySelectorAll('li')].map((li) => {
      const r = li.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), h: Math.round(r.height), overflow: li.scrollWidth > li.clientWidth + 1 };
    });
    const ir = intro.getBoundingClientRect();
    const tr = text.getBoundingClientRect();
    const br = back.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    return {
      introOutsideScreen: !panel.contains(intro),
      introAboveScreen: ir.bottom <= pr.top + 1,
      backInsideScreen: panel.contains(back),
      sameRow: Math.abs(tr.y - br.y) < 2,
      textLeftOfButton: tr.right <= br.left + 1,
      listCols: getComputedStyle(list).gridTemplateColumns.split(' ').length,
      items,
      docOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });

  if (!info.introOutsideScreen) throw new Error(`${width}px: intro is still inside the screen container`);
  if (!info.introAboveScreen) throw new Error(`${width}px: intro is not above the topic list`);
  if (info.backInsideScreen) throw new Error(`${width}px: back button is still inside the screen container`);
  if (!info.sameRow || !info.textLeftOfButton) throw new Error(`${width}px: text and button are not two columns`);
  if (info.listCols !== 2) throw new Error(`${width}px: topic list has ${info.listCols} columns`);
  if (info.docOverflow) throw new Error(`${width}px: horizontal page overflow`);
  if (info.items[0].y !== info.items[1].y) throw new Error(`${width}px: first two topics are not on one row`);
  if (info.items[0].h !== info.items[1].h) throw new Error(`${width}px: topics in a row differ in height`);
  if (info.items.some((i) => i.overflow)) throw new Error(`${width}px: topic text overflows`);

  await page.screenshot({ path: `/home/user/.cache/preview-tools/subject-header-${width}.png`, fullPage: true });
  console.log(`PASS ${width}px: intro above the topic list in two columns; topic list in two columns.`);
  await page.close();
}

// Navigation and study flow still work from the new header.
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on('pageerror', (e) => errors.push(String(e)));
await page.route('http://**/*', (r) => r.abort());
await page.route('https://**/*', (r) => r.abort());
await page.goto(`file://${root}/prototype.html`);
await page.locator('[data-subject-id="physiology"] button').click();
await page.locator('.subject-intro-back').click();
await page.locator('[data-subject-id="tourism"]').waitFor();
await page.locator('[data-subject-id="physiology"] button').click();
await page.getByRole('button', { name: 'Начать', exact: true }).click();
await page.getByRole('button', { name: 'К вопросу' }).waitFor();
console.log('PASS: header button returns to the landing page; study flow starts.');

if (errors.length) throw new Error(`Runtime errors: ${errors.join('; ')}`);
await browser.close();
console.log('PASS: no runtime errors.');
