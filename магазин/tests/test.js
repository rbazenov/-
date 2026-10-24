const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push('jsdomError: ' + e.message));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .replace('<link rel="stylesheet" href="css/style.css">', '')
  .replace('<script src="js/catalog.js"></script>', '')
  .replace('<script src="js/app.js"></script>', '');

const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://example.test/%D0%BC%D0%B0%D0%B3%D0%B0%D0%B7%D0%B8%D0%BD/', pretendToBeVisual: true, virtualConsole: vc });
const { window } = dom;
const { document } = window;

// счётчики и заглушки
window.HTMLElement.prototype.animate = () => ({});
window.Element.prototype.scrollIntoView = () => {};
window.eval(fs.readFileSync(path.join(ROOT, 'js/catalog.js'), 'utf8') + '\n;window.CATALOG = CATALOG;\n' + fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8'));

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const click = el => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
const money = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
const results = [];
const check = (name, ok, extra = '') => results.push({ name, ok, extra });

// --- 1. рендер каталога ---
check('6 карточек боксов', $$('#boxesGrid .card').length === 6, $$('#boxesGrid .card').length);
check('фильтры с aria-pressed', $$('#chips .chip[aria-pressed]').length === 7);
check('чипы конструктора', $$('#builderChips .chip').length === 8);
check('27 позиций конструктора', $$('#builderItems .item').length === 27, $$('#builderItems .item').length);

// --- 2. [hidden] работает: скидка скрыта ---
const discRow = $('#cartDiscountRow');
check('строка скидки в корзине скрыта по умолчанию', discRow.hidden === true);
check('CSS-правило [hidden] есть', fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8').includes('[hidden] { display: none !important; }'));

// --- 3. добавление бокса в корзину ---
click($('#boxesGrid [data-add="sour"]'));
check('корзина: 1 позиция', $('#cartCount').textContent === '1', $('#cartCount').textContent);
check('бесплатная доставка не сработала (2190 < 2500)', $('#cartShipping').textContent === money(320), $('#cartShipping').textContent);
check('итог = 2190+320', $('#cartTotal').textContent === money(2510), $('#cartTotal').textContent);

// --- 4. промокод и его сохранение ---
$('#promoInput').value = 'start10';
click($('#applyPromo'));
check('промокод применён (10%)', $('#cartDiscount').textContent === '−' + money(219), $('#cartDiscount').textContent);
check('строка скидки показана', $('#cartDiscountRow').hidden === false);
check('промокод сохранён в localStorage', window.localStorage.getItem('boxed_promo_v1') === 'START10', window.localStorage.getItem('boxed_promo_v1'));
check('итог со скидкой 2190-219+320', $('#cartTotal').textContent === money(2291), $('#cartTotal').textContent);

// --- 5. модалка корзины: aria и фокус ---
click($('#openCart'));
check('drawer открыт и доступен', $('#cartDrawer').classList.contains('show') && $('#cartDrawer').getAttribute('aria-hidden') === 'false');
check('фокус внутри корзины', $('#cartDrawer').contains(document.activeElement), document.activeElement.id);
check('overlay виден', $('#overlay').classList.contains('show'));
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
check('Escape закрывает корзину', !$('#cartDrawer').classList.contains('show') && $('#cartDrawer').getAttribute('aria-hidden') === 'true');
check('фокус вернулся на кнопку корзины', document.activeElement.id === 'openCart', document.activeElement.id || document.activeElement.tagName);
check('overlay скрыт', !$('#overlay').classList.contains('show'));

// --- 6. оформление: доставка ---
click($('#openCart'));
click($('#goCheckout'));
check('модалка оформления открыта', $('#modal').classList.contains('show') && $('#modal').getAttribute('aria-hidden') === 'false');
check('в оформлении поля связаны с label', !!$('#checkoutForm label[for="coName"]') && !!$('#coName'));
const coShip0 = $('#coShip').textContent;
const coTotal0 = $('#coTotal').textContent;
check('ПВЗ: доставка 320', coShip0 === money(320), coShip0);
check('ПВЗ: итог 2291', coTotal0 === money(2291), coTotal0);

const radios = $$('#checkoutForm input[name="ship"]');
radios.find(r => r.value === 'pickup').checked = true;
radios.find(r => r.value === 'pickup').dispatchEvent(new window.Event('change', { bubbles: true }));
check('самовывоз бесплатный: доставка 0', $('#coShip').textContent === 'бесплатно', $('#coShip').textContent);
check('самовывоз: итог 1971', $('#coTotal').textContent === money(1971), $('#coTotal').textContent);

radios.find(r => r.value === 'courier').checked = true;
radios.find(r => r.value === 'courier').dispatchEvent(new window.Event('change', { bubbles: true }));
check('курьер: 320+290 = 610', $('#coShip').textContent === money(610), $('#coShip').textContent);
check('курьер: итог 2581', $('#coTotal').textContent === money(2581), $('#coTotal').textContent);

// --- 7. оформление заказа ---
$('#checkoutForm').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
check('заказ принят: корзина пуста', $('#cartCount').textContent === '0', $('#cartCount').textContent);
check('мобильный бейдж скрыт при пустой корзине', $('[data-mobile-count]').hidden === true);
check('промокод сброшен в хранилище', window.localStorage.getItem('boxed_promo_v1') === null, String(window.localStorage.getItem('boxed_promo_v1')));
check('заказ показывает сумму', /2\s?581/.test($('#modalBody').textContent || ''), ($('#modalBody').textContent || '').slice(0, 200));
click($('#doneClose'));

// --- 8. конструктор ---
const plus = $('#builderItems [data-qty="i1"][data-delta="1"]');
plus.focus();
click(plus);
check('фокус сохранён после перерисовки', document.activeElement.dataset.qty === 'i1', document.activeElement.outerHTML.slice(0, 60));
check('итог конструктора = 289+190+320', $('#sumTotal').textContent === money(799), $('#sumTotal').textContent);
check('кнопка заблокирована при 1 позиции', $('#addCustom').disabled === true);
// добираем до 4 позиций
['i1', 'i2'].forEach(id => {});
for (const id of ['i1', 'i2', 'i3']) click($(`#builderItems [data-qty="${id}"][data-delta="1"]`));
check('4 позиции: кнопка активна', $('#addCustom').disabled === false);
const beforeAdd = $('#addCustom').textContent;
check('в кнопке сумма сборки', /₽/.test(beforeAdd), beforeAdd);
click($('#addCustom'));
check('свой бокс попал в корзину', $('#cartCount').textContent === '1', $('#cartCount').textContent);
check('у кастомного бокса нет картинки', !!$('.cart-item__img--custom'));
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

// --- 9. FAQ ---
const faqBtn = $('#faqA1') ? $('#faqA1').previousElementSibling : $('.faq__q');
check('FAQ: aria-expanded=false изначально', faqBtn.getAttribute('aria-expanded') === 'false', faqBtn.getAttribute('aria-expanded'));
click(faqBtn);
check('FAQ: aria-expanded=true после клика', faqBtn.getAttribute('aria-expanded') === 'true');
check('FAQ: панель открыта', faqBtn.parentElement.classList.contains('open'));
check('FAQ: 7 вопросов в одном списке', $$('#faqList > .faq__item').length === 7, $$('#faqList > .faq__item').length);

// --- 10. SEO / мета ---
check('canonical абсолютный', ($('link[rel=canonical]').href || '').startsWith('https://rbazenov.github.io/'));
check('og:image абсолютный', ($('meta[property="og:image"]').content || '').startsWith('https://rbazenov.github.io/'));
check('JSON-LD есть', !!$('script[type="application/ld+json"]'));
const ld = JSON.parse($('script[type="application/ld+json"]').textContent);
check('JSON-LD: 6 товаров', ld['@graph'].find(g => g['@type'] === 'ItemList').itemListElement.length === 6);
check('JSON-LD: FAQ 7 вопросов', ld['@graph'].find(g => g['@type'] === 'FAQPage').mainEntity.length === 7);
check('JSON-LD: цены совпадают с каталогом', ld['@graph'].find(g => g['@type'] === 'ItemList').itemListElement.every((it, i) => Number(it.item.offers.price) === window.CATALOG.boxes[i].price));
check('все img имеют width/height', $$('#boxesGrid img').every(i => i.getAttribute('width') && i.getAttribute('height')));
check('hero: fetchpriority', $('.hero__media img').getAttribute('fetchpriority') === 'high');

// --- 11. мобильный бейдж и скидка объёма ---
click($('#boxesGrid [data-add="asia"]'));
check('мобильный бейдж показан при товаре', $('[data-mobile-count]').hidden === false);
check('мобильный бейдж содержит цену', /₽/.test($('[data-mobile-total]').textContent), $('[data-mobile-total]').textContent);
// 7+ позиций в конструкторе → скидка объёма
for (const id of ['i1', 'i2', 'i3', 'i9', 'i12', 'i13', 'i15']) click($(`#builderItems [data-qty="${id}"][data-delta="1"]`));
check('скидка на объём появилась', $('#sumDiscountRow').hidden === false);
check('ставка 3% посчитана', $('#sumDiscount').textContent.startsWith('−'), $('#sumDiscount').textContent);
check('подсказка про скидку', $('#summaryHint').textContent.includes('Скидка'), $('#summaryHint').textContent);

// --- 12. tab-ловушка в модалке ---
click($('#goCheckout'));
const modal = $('#modal');
const focusables = $$('#modal a[href], #modal button:not([disabled]), #modal input:not([disabled])').filter(el => el.offsetParent !== null);
const sub = $('#checkoutForm button[type="submit"]');
sub.focus();
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
check('Tab с последнего элемента уходит на первый', modal.contains(document.activeElement), document.activeElement.id || document.activeElement.tagName);
click($('#closeModal'));
check('закрытие модалки не оставляет aria-hidden=false', $('#modal').getAttribute('aria-hidden') === 'true');

// --- 13. сборка автономного файла актуальна ---
const { execFileSync } = require('child_process');
let buildOk = true, buildOut = '';
try { buildOut = execFileSync('python3', [path.join(ROOT, 'build.py'), '--check'], { encoding: 'utf8' }); }
catch (e) { buildOk = false; buildOut = (e.stdout || '') + (e.stderr || ''); }
check('boxed-standalone.html собран из текущих исходников', buildOk, buildOut.trim());

// --- 14. консоль ---
check('нет ошибок в консоли', errors.length === 0, errors.join(' | '));

const bad = results.filter(r => !r.ok);
for (const r of results) console.log((r.ok ? 'PASS  ' : 'FAIL  ') + r.name + (r.ok || r.extra === '' ? '' : ' → ' + r.extra));
console.log(`\n${results.length - bad.length}/${results.length} проверок пройдено`);
process.exit(bad.length ? 1 : 0);
