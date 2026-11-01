import { chromium } from 'playwright';

const root = '/home/user/physiology-mvp';
const browser = await chromium.launch();
const errors = [];

async function openQuestion(page) {
  await page.goto(`file://${root}/prototype.html`);
  await page.locator('[data-subject-id="physiology"] button').click();
  const start = page.getByRole('button', { name: 'Начать', exact: true });
  if (await start.count()) await start.click();
  else await page.getByRole('button', { name: 'Продолжить с того же места' }).click();
  await page.getByRole('button', { name: 'К вопросу' }).click();
  await page.locator('.option').first().waitFor();
}

const ringState = (page) => page.evaluate(() => {
  const chosen = document.querySelector('.option.chosen');
  if (!chosen) return { chosen: false };
  const after = getComputedStyle(chosen, '::after');
  return {
    chosen: true,
    tag: chosen.tagName,
    radius: getComputedStyle(chosen).borderRadius,
    content: after.content,
    conic: after.backgroundImage.includes('conic-gradient'),
    animations: after.animationName,
    mask: after.maskComposite || after.webkitMaskComposite || '',
    pointerEvents: after.pointerEvents,
    opacity: Number(after.opacity),
    angle: after.getPropertyValue('--option-ring-angle'),
  };
});

// 1. После выбора варианта: скругление и переливающаяся обводка на выбранном контейнере.
const page = await browser.newPage({ viewport: { width: 390, height: 820 } });
page.on('pageerror', (e) => errors.push(String(e)));
await page.route('http://**/*', (r) => r.abort());
await openQuestion(page);
await page.locator('.option').nth(1).click();
await page.locator('.option.static').first().waitFor();
await page.waitForTimeout(300);

const start = await ringState(page);
if (!start.chosen) throw new Error('выбранный вариант не помечен классом chosen');
if (start.radius !== '16px') throw new Error(`у контейнера нет скругления: ${start.radius}`);
if (!start.conic) throw new Error('обводка не является переливающимся градиентом');
if (!/option-ring-turn/.test(start.animations)) throw new Error('нет вращения градиента');
if (!/option-ring-fade/.test(start.animations)) throw new Error('нет плавного затухания');
if (!/exclude/.test(start.mask)) throw new Error('обводка не вырезана по маске (рамка вместо кольца)');
if (start.pointerEvents !== 'none') throw new Error('обводка перехватывает нажатия');
console.log('PASS: выбранный ответ получил скругление 16px и переливающуюся обводку.');

// 2. Обводка действительно идёт по кругу.
const angle1 = parseFloat(start.angle);
await page.waitForTimeout(600);
const mid = await ringState(page);
const angle2 = parseFloat(mid.angle);
if (!(angle2 > angle1)) throw new Error(`градиент не вращается: ${angle1} -> ${angle2}`);
console.log(`PASS: градиент вращается по кругу (${angle1.toFixed(0)}° -> ${angle2.toFixed(0)}°).`);

// 3. Обводка плавно гаснет: после двух оборотов её прозрачность падает до нуля.
await page.waitForTimeout(3600);
const faded = await ringState(page);
if (!(faded.opacity < 0.05)) throw new Error(`обводка не погасла: opacity ${faded.opacity}`);
console.log(`PASS: обводка плавно гаснет (opacity ${faded.opacity}).`);

// 4. Скругление остаётся у всех вариантов, не только у выбранного.
const radii = await page.evaluate(() => [...document.querySelectorAll('.option')].map((o) => getComputedStyle(o).borderRadius));
if (new Set(radii).size !== 1 || radii[0] !== '16px') throw new Error(`скругление не у всех вариантов: ${radii}`);
console.log('PASS: у всех вариантов на экране разбора одинаковое скругление.');

// 5. Неверный ответ: обводка есть, цветовая метка осталась красной.
await openQuestion(page);
await page.locator('.option').nth(2).click();
await page.locator('.option.static').first().waitFor();
await page.waitForTimeout(300);
const wrong = await page.evaluate(() => {
  const chosen = document.querySelector('.option.chosen');
  return {
    cls: chosen.className,
    radius: getComputedStyle(chosen).borderRadius,
    ring: getComputedStyle(chosen, '::after').animationName,
  };
});
if (!/wrong|correct/.test(wrong.cls)) throw new Error(`выбранный вариант без цветовой метки: ${wrong.cls}`);
if (wrong.radius !== '16px' || !/option-ring/.test(wrong.ring)) throw new Error('у неверного ответа нет кольца');
console.log('PASS: обводка работает и для неверного ответа, цветовая метка сохранена.');

// 6. Уменьшенная анимация: кольца нет, скругление остаётся.
const calm = await browser.newContext({ viewport: { width: 390, height: 820 }, reducedMotion: 'reduce' });
const calmPage = await calm.newPage();
calmPage.on('pageerror', (e) => errors.push(String(e)));
await calmPage.route('http://**/*', (r) => r.abort());
await openQuestion(calmPage);
await calmPage.locator('.option').nth(1).click();
await calmPage.locator('.option.static').first().waitFor();
const calmInfo = await calmPage.evaluate(() => {
  const chosen = document.querySelector('.option.chosen');
  const after = getComputedStyle(chosen, '::after');
  return { display: after.display, radius: getComputedStyle(chosen).borderRadius };
});
if (calmInfo.display !== 'none') throw new Error('при prefers-reduced-motion обводка всё равно показана');
if (calmInfo.radius !== '16px') throw new Error('при prefers-reduced-motion потерялось скругление');
console.log('PASS: при prefers-reduced-motion кольцо не показывается, скругление сохранено.');
await page.screenshot({ path: '/home/user/.cache/preview-tools/option-ring-390.png' });
await calm.close();
await page.close();

if (errors.length) throw new Error(`Runtime errors: ${errors.join('; ')}`);
await browser.close();
console.log('PASS: без ошибок JavaScript.');
