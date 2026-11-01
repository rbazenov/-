import { chromium } from 'playwright';

const root = '/home/user/physiology-mvp';
const browser = await chromium.launch();
const errors = [];

// Прокручивается страница целиком, а не список внутри: карточки уводят шапку вверх.
async function openSubject(page, id = 'physiology') {
  await page.goto(`file://${root}/prototype.html`);
  await page.locator(`[data-subject-id="${id}"] button`).click();
  const start = page.getByRole('button', { name: 'Начать', exact: true });
  if (await start.count()) await start.waitFor();
  else await page.getByRole('button', { name: 'Продолжить с того же места' }).waitFor();
}

for (const [width, height] of [[390, 780], [360, 640], [1280, 900]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('http://**/*', (r) => r.abort());
  await openSubject(page);

  const before = await page.evaluate(() => {
    const list = document.querySelector('.topic-grid');
    const sticky = [...document.querySelectorAll('.app *')].filter((el) => {
      const pos = getComputedStyle(el).position;
      return pos === 'sticky' || pos === 'fixed';
    });
    return {
      headerTop: Math.round(document.querySelector('.top').getBoundingClientRect().top),
      listInnerScroll: list.scrollHeight > list.clientHeight + 1,
      listOverflow: getComputedStyle(list).overflowY,
      stickyCount: sticky.length,
      docScrollable: document.documentElement.scrollHeight > window.innerHeight + 1,
    };
  });

  if (before.listInnerScroll) throw new Error(`${width}px: у списка осталась своя прокрутка`);
  if (before.listOverflow === 'auto' || before.listOverflow === 'scroll') {
    throw new Error(`${width}px: у списка остался overflow-y ${before.listOverflow}`);
  }
  if (before.stickyCount) throw new Error(`${width}px: найден приклеенный блок (${before.stickyCount})`);

  await page.evaluate(() => window.scrollTo(0, 320));
  await page.waitForTimeout(200);

  const after = await page.evaluate(() => {
    const header = document.querySelector('.top').getBoundingClientRect();
    const firstTopic = document.querySelector('.topic-grid li strong').getBoundingClientRect();
    return {
      scrollY: Math.round(window.scrollY),
      headerTop: Math.round(header.top),
      headerGone: header.bottom <= 0,
      headerMovedBy: Math.round(header.top + window.scrollY),
      firstTopicAboveFold: firstTopic.top < window.innerHeight,
    };
  });

  if (!before.docScrollable) {
    console.log(`${width}x${height}: контент помещается в окно, прокрутка не нужна.`);
    if (after.scrollY !== 0) throw new Error(`${width}px: страница прокрутилась без содержимого`);
    await page.close();
    continue;
  }
  if (after.scrollY === 0) throw new Error(`${width}px: страница не прокручивается`);
  if (!after.headerGone) throw new Error(`${width}px: шапка не уехала вверх (top=${after.headerTop})`);
  console.log(`PASS ${width}x${height}: прокрутка страницы ${after.scrollY}px, шапка ушла вверх (${after.headerTop}px).`);
  await page.screenshot({ path: `/home/user/.cache/preview-tools/page-scroll-${width}.png` });
  await page.close();
}

// Экран теории на низком окне тоже уводит шапку вверх, а не держит её на месте.
const theory = await browser.newPage({ viewport: { width: 390, height: 560 } });
theory.on('pageerror', (e) => errors.push(String(e)));
await theory.route('http://**/*', (r) => r.abort());
await openSubject(theory);
await theory.getByRole('button', { name: 'Начать', exact: true }).click();
await theory.getByRole('button', { name: 'К вопросу' }).waitFor();
await theory.evaluate(() => window.scrollTo(0, 200));
await theory.waitForTimeout(150);
const theoryInfo = await theory.evaluate(() => ({
  scrollY: Math.round(window.scrollY),
  headerBottom: Math.round(document.querySelector('.top').getBoundingClientRect().bottom),
}));
if (theoryInfo.scrollY === 0) throw new Error('теория: страница не прокручивается');
if (theoryInfo.headerBottom > 0) throw new Error('теория: шапка осталась видимой при прокрутке');
console.log(`PASS теория 390x560: шапка также уходит вверх при прокрутке.`);
await theory.close();

if (errors.length) throw new Error(`Runtime errors: ${errors.join('; ')}`);
await browser.close();
console.log('PASS: без ошибок JavaScript.');
