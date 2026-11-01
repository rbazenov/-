import { chromium } from 'playwright';

const root = '/home/user/physiology-mvp';
const HINT_KEY = 'study-mvp-swipe-hint-v1';
const browser = await chromium.launch();
const errors = [];

async function openTheory(page) {
  await page.goto(`file://${root}/prototype.html`);
  await page.locator('[data-subject-id="physiology"] button').click();
  const start = page.getByRole('button', { name: 'Начать', exact: true });
  if (await start.count()) await start.click();
  else await page.getByRole('button', { name: 'Продолжить с того же места' }).click();
  await page.getByRole('button', { name: 'К вопросу' }).waitFor();
  await page.waitForTimeout(400);
}

// 1. Новый пользователь видит жест на экране теории.
const fresh = await browser.newContext({ viewport: { width: 390, height: 780 }, hasTouch: true });
const page = await fresh.newPage();
page.on('pageerror', (e) => errors.push(String(e)));
await page.route('http://**/*', (r) => r.abort());
await page.goto(`file://${root}/prototype.html`);
await page.evaluate(() => { try { localStorage.removeItem('study-mvp-swipe-hint-v1'); } catch {} });
await openTheory(page);

const hint = page.locator('.swipe-hint');
if (!(await hint.count())) throw new Error('новый пользователь не увидел жест-подсказку');
const info = await hint.evaluate((el) => {
  const dot = el.querySelector('.swipe-hint-dot');
  const trail = el.querySelector('.swipe-hint-trail');
  const row = el.closest('.hint-row');
  const hr = row.getBoundingClientRect();
  const er = el.getBoundingClientRect();
  const dotAnim = getComputedStyle(dot).animation;
  return {
    ariaHidden: el.getAttribute('aria-hidden'),
    pointerEvents: getComputedStyle(el).pointerEvents,
    insideHintRow: er.top >= hr.top - 9 && er.bottom <= hr.bottom + 9,
    dotAnimated: /swipe-hint-dot/.test(dotAnim),
    trailAnimated: /swipe-hint-trail/.test(getComputedStyle(trail).animation),
    iterations: getComputedStyle(dot).animationIterationCount,
    overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
  };
});
if (info.ariaHidden !== 'true') throw new Error('подсказка не скрыта от скринридера');
if (info.pointerEvents !== 'none') throw new Error('подсказка перехватывает нажатия');
if (!info.insideHintRow) throw new Error('жест не привязан к строке-подсказке');
if (!info.dotAnimated || !info.trailAnimated) throw new Error('анимация пальца или следа не запущена');
if (info.iterations !== '2') throw new Error(`ожидалось 2 повтора жеста, получено ${info.iterations}`);
if (info.overflowX) throw new Error('появилась горизонтальная прокрутка');
await page.screenshot({ path: '/home/user/.cache/preview-tools/swipe-hint-390.png' });
console.log('PASS: новый пользователь видит жест «провести влево» у строки-подсказки.');

// 2. Отметка о показе сохранена — второй раз не показываем.
const stored = await page.evaluate(() => { try { return localStorage.getItem('study-mvp-swipe-hint-v1'); } catch { return null; } });
if (stored !== '1') throw new Error('отметка о показе не сохранена');
await openTheory(page);
if (await page.locator('.swipe-hint').count()) throw new Error('жест показан повторно после перезагрузки');
console.log('PASS: повторно жест не показывается (отметка в localStorage).');

// 3. Касание гасит подсказку сразу.
await page.evaluate(() => { try { localStorage.removeItem('study-mvp-swipe-hint-v1'); } catch {} });
await openTheory(page);
if (!(await page.locator('.swipe-hint').count())) throw new Error('жест не показан в новом контексте');
await page.touchscreen.tap(195, 300);
await page.waitForTimeout(150);
if (await page.locator('.swipe-hint').count()) throw new Error('касание не скрыло подсказку');
console.log('PASS: касание экрана сразу убирает подсказку.');

// 4. Автоскрытие по таймеру.
await page.evaluate(() => { try { localStorage.removeItem('study-mvp-swipe-hint-v1'); } catch {} });
await openTheory(page);
await page.waitForTimeout(5700);
if (await page.locator('.swipe-hint').count()) throw new Error('подсказка не исчезла по таймеру');
console.log('PASS: подсказка исчезает сама через 5,4 с.');

// 5. На экране вопроса жеста нет.
await page.getByRole('button', { name: 'К вопросу' }).click();
await page.locator('.option').first().waitFor();
if (await page.locator('.swipe-hint').count()) throw new Error('жест остался на экране вопроса');
console.log('PASS: на экране вопроса подсказки нет.');
await fresh.close();

// 6. Пользователь с reduced-motion анимацию не получает.
const calm = await browser.newContext({ viewport: { width: 390, height: 780 }, reducedMotion: 'reduce' });
const calmPage = await calm.newPage();
calmPage.on('pageerror', (e) => errors.push(String(e)));
await calmPage.route('http://**/*', (r) => r.abort());
await calmPage.goto(`file://${root}/prototype.html`);
await calmPage.evaluate(() => { try { localStorage.removeItem('study-mvp-swipe-hint-v1'); } catch {} });
await openTheory(calmPage);
const visible = await calmPage.locator('.swipe-hint').isVisible().catch(() => false);
if (visible) throw new Error('при prefers-reduced-motion жест всё равно показан');
console.log('PASS: при prefers-reduced-motion жест не показывается.');
await calm.close();

if (errors.length) throw new Error(`Runtime errors: ${errors.join('; ')}`);
await browser.close();
console.log('PASS: без ошибок JavaScript.');
