import { chromium } from 'playwright';

const root = '/home/user/physiology-mvp';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.route('http://**/*', (r) => r.abort());
await page.route('https://**/*', (r) => r.abort());
await page.goto(`file://${root}/prototype.html`);

// Physiology: no mixed-status banner on home, theory, question or summary.
await page.locator('[data-subject-id="physiology"] button').click();
await page.getByRole('button', { name: 'Начать', exact: true }).waitFor();
if (await page.locator('.banner').count()) throw new Error('physiology home still shows a banner');
if (await page.locator('.top-actions button').count()) throw new Error('header still shows a reset button');
await page.screenshot({ path: '/home/user/.cache/preview-tools/physiology-home-no-banner.png', fullPage: true });
await page.getByRole('button', { name: 'Начать', exact: true }).click();
await page.getByRole('button', { name: 'К вопросу' }).waitFor();
if (await page.locator('.banner').count()) throw new Error('physiology theory still shows a banner');
if (await page.locator('.top-actions button').count()) throw new Error('header still shows a reset button on theory');
await page.screenshot({ path: '/home/user/.cache/preview-tools/physiology-theory-no-banner.png', fullPage: true });
await page.getByRole('button', { name: 'К вопросу' }).click();
if (await page.locator('.banner').count()) throw new Error('physiology question still shows a banner');
const bodyText = await page.locator('body').innerText();
if (bodyText.includes('Эталонные карточки')) throw new Error('mixed-status wording still present');
console.log('PASS: physiology screens have no mixed-status banner and no header reset button.');

// Draft subjects keep their warning.
await page.goto(`file://${root}/prototype.html`);
await page.locator('[data-subject-id="tourism"] button').click();
await page.locator('.banner').waitFor();
const draftText = await page.locator('.banner').innerText();
if (!draftText.includes('черновик')) throw new Error('tourism draft warning missing');
console.log('PASS: draft subjects keep the draft warning.');

if (errors.length) throw new Error(`Runtime errors: ${errors.join('; ')}`);
await browser.close();
console.log('PASS: no runtime errors.');
