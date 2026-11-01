import { chromium } from 'playwright';

const root = '/home/user/physiology-mvp';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

async function open(subjectId) {
  await page.goto(`file://${root}/prototype.html`);
  await page.locator(`[data-subject-id="${subjectId}"] button`).click();
  await page.getByRole('button', { name: 'Начать', exact: true }).waitFor();
}

// Ни на одном предмете нет плашки-предупреждения о черновике: статус виден меткой на главной.
for (const id of ['physiology', 'tourism', 'topography']) {
  await open(id);
  if (await page.locator('.banner').count()) throw new Error(`${id}: draft banner is back on the subject screen`);
  const body = await page.locator('body').innerText();
  if (body.includes('редакторский черновик')) throw new Error(`${id}: draft warning text is still rendered`);
  if (await page.locator('.top-actions button').count() !== 1) throw new Error(`${id}: header must have exactly one button`);
  const backText = await page.locator('.top-actions button').innerText();
  if (backText.trim() !== '← Главная') throw new Error(`${id}: header button is «${backText}»`);
  if (await page.locator('.screen button:has-text("Сброс")').count()) throw new Error(`${id}: reset button is back`);
}
console.log('PASS: no draft banner on any subject; header holds only «← Главная».');

// Баннер не появляется и на учебных экранах.
await open('tourism');
await page.getByRole('button', { name: 'Начать', exact: true }).click();
await page.getByRole('button', { name: 'К вопросу' }).waitFor();
if (await page.locator('.banner').count()) throw new Error('theory still shows a banner');
await page.getByRole('button', { name: 'К вопросу' }).click();
await page.locator('.option').first().waitFor();
if (await page.locator('.banner').count()) throw new Error('question still shows a banner');
console.log('PASS: theory and question screens have no banner.');

// Статус черновика по-прежнему доступен на главной странице.
await page.goto(`file://${root}/prototype.html`);
const draftBadges = await page.locator('.badge-draft').count();
if (draftBadges < 2) throw new Error(`landing lost draft badges: ${draftBadges}`);
console.log('PASS: draft status stays visible on the landing page badges.');

if (errors.length) throw new Error(`Runtime errors: ${errors.join('; ')}`);
await browser.close();
console.log('PASS: no runtime errors.');
