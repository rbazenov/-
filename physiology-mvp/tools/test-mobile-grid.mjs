import { chromium } from 'playwright';

const root = '/home/user/physiology-mvp';
const browser = await chromium.launch();
const errors = [];

for (const width of [390, 360, 320]) {
  const page = await browser.newPage({ viewport: { width, height: 844 } });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('http://**/*', (r) => r.abort());
  await page.route('https://**/*', (r) => r.abort());
  await page.goto(`file://${root}/prototype.html`);
  await page.locator('[data-subject-id="physiology"]').waitFor();

  const info = await page.evaluate(() => {
    const list = document.querySelector('.subject-list');
    const cols = getComputedStyle(list).gridTemplateColumns.split(' ').length;
    const cards = [...document.querySelectorAll('.subject-card')].map((c) => {
      const r = c.getBoundingClientRect();
      const visible = (sel) => {
        const el = c.querySelector(sel);
        if (!el) return false;
        const s = getComputedStyle(el);
        return s.display !== 'none' && s.clipPath !== 'inset(50%)' && r.width > 0;
      };
      return {
        id: c.dataset.subjectId,
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
        title: visible('strong'),
        desc: visible('.subject-desc'),
        button: visible('.subject-action'),
        module: visible('.subject-module'),
        badge: visible('.badge'),
        overflow: c.scrollWidth > c.clientWidth + 1,
      };
    });
    return { cols, cards, docOverflow: document.documentElement.scrollWidth > window.innerWidth + 1 };
  });

  if (info.cols !== 2) throw new Error(`${width}px: expected 2 columns, got ${info.cols}`);
  if (info.docOverflow) throw new Error(`${width}px: horizontal page overflow`);
  for (const c of info.cards) {
    if (!c.title || !c.desc || !c.button) throw new Error(`${width}px ${c.id}: title/description/button must stay visible`);
    if (c.module || c.badge) throw new Error(`${width}px ${c.id}: module line or badge still visible`);
    if (c.overflow) throw new Error(`${width}px ${c.id}: card content overflows`);
  }
  // Rows: first two cards share a row, third starts the next row.
  if (info.cards[0].y !== info.cards[1].y) throw new Error(`${width}px: first two cards are not on one row`);
  if (info.cards[2].y <= info.cards[0].y) throw new Error(`${width}px: third card is not on the second row`);
  if (info.cards[0].h !== info.cards[1].h) throw new Error(`${width}px: row cards have different heights`);

  await page.screenshot({ path: `/home/user/.cache/preview-tools/mobile-grid-${width}.png`, fullPage: true });
  console.log(`PASS ${width}px: 2 columns, rows aligned, card = title + description + button.`);
  await page.close();
}

// Desktop keeps the single-column list with full card metadata.
const wide = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await wide.route('http://**/*', (r) => r.abort());
await wide.route('https://**/*', (r) => r.abort());
await wide.goto(`file://${root}/prototype.html`);
await wide.locator('[data-subject-id="physiology"]').waitFor();
const wideCols = await wide.evaluate(() => getComputedStyle(document.querySelector('.subject-list')).gridTemplateColumns.split(' ').length);
if (wideCols !== 1) throw new Error(`1280px: expected 1 column, got ${wideCols}`);
await wide.screenshot({ path: '/home/user/.cache/preview-tools/desktop-grid.png', fullPage: true });
console.log('PASS 1280px: single column preserved.');

// Tap target still works from the tiled layout.
const tap = await browser.newPage({ viewport: { width: 390, height: 844 } });
await tap.route('http://**/*', (r) => r.abort());
await tap.route('https://**/*', (r) => r.abort());
await tap.goto(`file://${root}/prototype.html`);
await tap.locator('[data-subject-id="tourism"] button').click();
await tap.getByRole('button', { name: 'Начать', exact: true }).waitFor();
console.log('PASS: tile button opens the subject.');

if (errors.length) throw new Error(`Runtime errors: ${errors.join('; ')}`);
await browser.close();
console.log('PASS: no runtime errors.');
