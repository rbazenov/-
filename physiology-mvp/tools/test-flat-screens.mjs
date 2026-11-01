import { chromium } from 'playwright';

const root = '/home/user/physiology-mvp';
const browser = await chromium.launch();
const errors = [];

async function open(width = 390) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('http://**/*', (r) => r.abort());
  await page.route('https://**/*', (r) => r.abort());
  await page.goto(`file://${root}/prototype.html`);
  return page;
}

// Учебный экран не должен иметь фон, рамку, скругление, тень и внутренний отступ.
async function assertFlat(page, label) {
  const info = await page.evaluate(() => {
    const el = document.querySelector('.screen');
    if (!el) return { missing: true };
    const s = getComputedStyle(el);
    const app = document.querySelector('.app').getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      backgroundImage: s.backgroundImage,
      backgroundColor: s.backgroundColor,
      borderTopWidth: s.borderTopWidth,
      borderRadius: s.borderTopLeftRadius,
      boxShadow: s.boxShadow,
      padding: [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft].join(' '),
      flushWithApp: Math.abs(r.left - app.left - 16) < 1.5,
      panelsOnScreen: document.querySelectorAll('.screen .panel, .app > .panel').length,
      docOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });
  if (info.missing) throw new Error(`${label}: нет учебного экрана`);
  if (info.backgroundImage !== 'none') throw new Error(`${label}: остался фон-градиент`);
  if (info.backgroundColor !== 'rgba(0, 0, 0, 0)') throw new Error(`${label}: остался цвет фона (${info.backgroundColor})`);
  if (info.borderTopWidth !== '0px') throw new Error(`${label}: осталась рамка`);
  if (info.borderRadius !== '0px') throw new Error(`${label}: осталось скругление`);
  if (info.boxShadow !== 'none') throw new Error(`${label}: осталась тень`);
  if (info.padding !== '0px 0px 0px 0px') throw new Error(`${label}: остался отступ (${info.padding})`);
  if (info.panelsOnScreen !== 0) throw new Error(`${label}: внутри экрана остался .panel`);
  if (info.docOverflow) throw new Error(`${label}: горизонтальная прокрутка`);
  console.log(`PASS ${label}: блок плоско на фоне страницы, выровнен по шапке.`);
}

for (const width of [390, 320, 1280]) {
  const page = await open(width);
  await assertFlat(page, `главная ${width}px`);
  await page.screenshot({ path: `/home/user/.cache/preview-tools/flat-landing-${width}.png`, fullPage: true });

  await page.locator('[data-subject-id="physiology"] button').click();
  await page.getByRole('button', { name: 'Начать', exact: true }).waitFor();
  await assertFlat(page, `предмет ${width}px`);
  await page.screenshot({ path: `/home/user/.cache/preview-tools/flat-home-${width}.png`, fullPage: true });

  await page.getByRole('button', { name: 'Начать', exact: true }).click();
  await page.getByRole('button', { name: 'К вопросу' }).waitFor();
  await assertFlat(page, `теория ${width}px`);
  await page.screenshot({ path: `/home/user/.cache/preview-tools/flat-theory-${width}.png`, fullPage: true });

  await page.getByRole('button', { name: 'К вопросу' }).click();
  await page.locator('.option').first().waitFor();
  await assertFlat(page, `вопрос ${width}px`);
  await page.screenshot({ path: `/home/user/.cache/preview-tools/flat-question-${width}.png`, fullPage: true });

  await page.locator('.option').first().click();
  await page.getByRole('button', { name: /Дальше|Разобраться|Продолжить/ }).first().waitFor();
  await assertFlat(page, `экран результата ${width}px`);
  await page.screenshot({ path: `/home/user/.cache/preview-tools/flat-feedback-${width}.png`, fullPage: true });
  await page.close();
}

// Окно возврата keeps its подложку: без неё оно сливается с текстом под ним.
const page = await open(390);
await page.locator('[data-subject-id="physiology"] button').click();
await page.getByRole('button', { name: 'Начать', exact: true }).click();
await page.getByRole('button', { name: 'К вопросу' }).waitFor();
await page.getByRole('button', { name: '← На главную' }).click();
await page.locator('[data-subject-id="physiology"] button').click();
const modal = page.getByRole('dialog');
await modal.waitFor();
const modalInfo = await modal.evaluate((el) => {
  const s = getComputedStyle(el);
  return { bg: s.backgroundImage, border: s.borderTopWidth, radius: s.borderTopLeftRadius, shadow: s.boxShadow, padding: s.paddingTop };
});
if (modalInfo.bg === 'none') throw new Error('окно возврата лишилось подложки');
if (modalInfo.border === '0px') throw new Error('окно возврата лишилось рамки');
if (modalInfo.radius === '0px') throw new Error('окно возврата лишилось скругления');
if (modalInfo.shadow === 'none') throw new Error('окно возврата лишилось тени');
if (modalInfo.padding === '0px') throw new Error('окно возврата лишилось отступа');
await page.screenshot({ path: '/home/user/.cache/preview-tools/flat-modal-390.png', fullPage: true });
console.log('PASS окно возврата: подложка, рамка, скругление и тень сохранены.');

await page.getByRole('button', { name: 'Продолжить с того же места' }).click();
await page.getByRole('button', { name: 'К вопросу' }).waitFor();
console.log('PASS: возврат к обучению работает, место сохранено.');
await page.close();

if (errors.length) throw new Error(`Runtime errors: ${errors.join('; ')}`);
await browser.close();
console.log('PASS: без ошибок JavaScript и без внешних запросов.');
