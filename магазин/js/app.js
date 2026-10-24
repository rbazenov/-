/* ============================================================
   BOXED. — логика прототипа
   Корзина и конструктор работают в браузере (localStorage).
   ============================================================ */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = n => new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽';
  const catIcon = {
    ramen: '🍜', asia: '🌸', sour: '🍋', sweet: '🍫',
    snack: '🥨', drink: '🥤', zero: '💪'
  };
  /* ---------------- состояние ---------------- */
  const STORE_KEY = 'boxed_cart_v1';
  const PROMO_KEY = 'boxed_promo_v1';
  const state = {
    cart: load(),
    promo: loadPromo(),
    builder: { cat: 'all', qty: {} },
    boxFilter: 'all'
  };

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch { return []; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state.cart)); } catch {}
  }
  function loadPromo() {
    try {
      const code = localStorage.getItem(PROMO_KEY);
      return code && CATALOG.promos[code] ? code : null;
    } catch { return null; }
  }
  function savePromo() {
    try {
      if (state.promo) localStorage.setItem(PROMO_KEY, state.promo);
      else localStorage.removeItem(PROMO_KEY);
    } catch {}
  }

  /* ---------------- фокус и доступность ---------------- */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

  let lastFocus = null;
  function rememberFocus(opener) {
    lastFocus = opener || document.activeElement;
  }
  function restoreFocus() {
    if (lastFocus && document.contains(lastFocus)) {
      try { lastFocus.focus({ preventScroll: true }); } catch {}
    }
    lastFocus = null;
  }
  function focusFirst(container) {
    const el = container.querySelector(FOCUSABLE);
    if (el) { try { el.focus({ preventScroll: true }); } catch {} }
    else { container.setAttribute('tabindex', '-1'); container.focus(); }
  }
  /* держим Tab внутри открытого слоя */
  function trapFocus(e, container) {
    if (e.key !== 'Tab' || !container) return;
    const items = $$(FOCUSABLE, container).filter(el => el.offsetParent !== null || el === document.activeElement);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------------- тост ---------------- */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  /* ---------------- модалка ---------------- */
  function openModal(titleHtml, bodyHtml, opener) {
    rememberFocus(opener);
    $('#modalTitleWrap').innerHTML = titleHtml;
    $('#modalBody').innerHTML = bodyHtml;
    $('#modal').classList.add('show');
    $('#modal').setAttribute('aria-hidden', 'false');
    $('#overlay').classList.add('show');
    document.body.classList.add('locked');
    focusFirst($('#modal'));
  }
  function closeModal() {
    const wasOpen = $('#modal').classList.contains('show');
    $('#modal').classList.remove('show');
    $('#modal').setAttribute('aria-hidden', 'true');
    if (!$('#cartDrawer').classList.contains('show')) {
      $('#overlay').classList.remove('show');
      document.body.classList.remove('locked');
      if (wasOpen) restoreFocus();
    }
  }

  /* ---------------- фильтры каталога ---------------- */
  const BOX_FILTERS = [
    { id: 'all', label: 'Все боксы' },
    { id: 'челлендж', label: 'Челлендж' },
    { id: 'свидание', label: 'Свидание' },
    { id: 'подарок', label: 'В подарок' },
    { id: 'бьюти', label: 'Бьюти' },
    { id: 'корпоратив', label: 'Корпоратив' },
    { id: 'зож', label: 'Zero / ЗОЖ' }
  ];

  function renderBoxFilters() {
    $('#chips').innerHTML = BOX_FILTERS.map(f =>
      `<button class="chip ${state.boxFilter === f.id ? 'active' : ''}" type="button" aria-pressed="${state.boxFilter === f.id}" data-filter="${f.id}">${f.label}</button>`
    ).join('');
  }

  function visibleBoxes() {
    if (state.boxFilter === 'all') return CATALOG.boxes;
    return CATALOG.boxes.filter(b => b.occasion.includes(state.boxFilter));
  }

  function heatLabel(h) {
    return h === 0 ? 'без остроты' : '🌶'.repeat(h);
  }

  function renderBoxes() {
    const list = visibleBoxes();
    $('#boxesGrid').innerHTML = list.length ? list.map(b => `
      <article class="card">
        <div class="card__media">
          ${b.badge ? `<div class="card__badge">${b.badge}</div>` : ''}
          <div class="card__heat">${heatLabel(b.heat)}</div>
          <img src="${b.img}" width="900" height="900" alt="Бокс ${b.title}" loading="lazy" decoding="async">
        </div>
        <div class="card__body">
          <h3 class="card__title">${b.title}</h3>
          <p class="card__tag">${b.tagline}</p>
          <div class="card__meta">
            <span>📦 ${b.contents.length} позиций</span>
            <span>⚖ ${(b.weight / 1000).toFixed(2)} кг</span>
            <span>👥 ${b.servings}</span>
          </div>
          <div class="card__price-row">
            <span class="price">${money(b.price)}</span>
            ${b.oldPrice ? `<span class="price-old">${money(b.oldPrice)}</span>` : ''}
          </div>
          <div class="card__actions">
            <button class="btn btn--dark btn--sm" type="button" data-view="${b.id}" aria-label="Состав бокса ${b.title}">Состав</button>
            <button class="btn btn--sm" type="button" data-add="${b.id}" aria-label="Добавить бокс ${b.title} в корзину">В корзину</button>
          </div>
        </div>
      </article>
    `).join('') : `<p style="color:var(--muted)">В этой подборке пока нет боксов — посмотрите все.</p>`;
  }

  /* ---------------- карточка бокса ---------------- */
  function openBox(id, opener) {
    const b = CATALOG.boxes.find(x => x.id === id);
    if (!b) return;
    const html = `
      <div class="product-view">
        <div>
          <img src="${b.img}" width="900" height="900" alt="Бокс ${b.title}" decoding="async">
          <div class="spec">
            <span>📦 ${b.contents.length} позиций</span>
            <span>⚖ ${(b.weight / 1000).toFixed(2)} кг</span>
            <span>👥 ${b.servings}</span>
            <span>${heatLabel(b.heat)}</span>
          </div>
        </div>
        <div>
          <h3>${b.title}</h3>
          <p class="lead">${b.tagline}</p>
          <ul class="contents">
            ${b.contents.map(c => `<li><span>${c.n}</span><b>${c.q > 1 ? '× ' + c.q : ''}</b></li>`).join('')}
          </ul>
          <ul class="extras">
            ${b.extras.map(e => `<li>${e}</li>`).join('')}
          </ul>
          <div class="summary__row" style="margin-top:20px; border-top:1px solid var(--line); padding-top:16px;">
            <span>Доставка</span><b>${b.price >= CATALOG.rules.freeShippingFrom ? 'бесплатно' : money(CATALOG.rules.shipping)}</b>
          </div>
          <div style="display:flex; align-items:center; gap:14px; margin-top:18px;">
            <span class="price">${money(b.price)}</span>
            ${b.oldPrice ? `<span class="price-old">${money(b.oldPrice)}</span>` : ''}
            <button class="btn" type="button" style="margin-left:auto" data-add="${b.id}">Добавить в корзину</button>
          </div>
          <p class="note">Демонстрационный состав. При закупке позиции могут заменяться на аналоги того же вкусового профиля и стоимости.</p>
        </div>
      </div>`;
    openModal(`<div class="kicker" style="margin:0">Готовый бокс</div>`, html, opener);
  }

  /* ---------------- конструктор ---------------- */
  function renderBuilderFilters() {
    $('#builderChips').innerHTML = CATALOG.categories.map(c =>
      `<button class="chip ${state.builder.cat === c.id ? 'active' : ''}" type="button" aria-pressed="${state.builder.cat === c.id}" data-bcat="${c.id}">${c.label}</button>`
    ).join('');
  }

  function renderBuilderItems() {
    const items = CATALOG.items.filter(i => state.builder.cat === 'all' || i.cat === state.builder.cat);
    $('#builderItems').innerHTML = items.map(i => {
      const q = state.builder.qty[i.id] || 0;
      return `
        <div class="item ${q ? 'active' : ''}">
          <div class="item__tile" aria-hidden="true">${catIcon[i.cat] || '🍬'}</div>
          <div class="item__info">
            <div class="item__name">${i.name}</div>
            <div class="item__sub">${i.sub} · ${i.weight} г</div>
            <div class="item__price">${money(i.price)}</div>
          </div>
          <div class="item__qty">
            <button class="qty-btn" type="button" data-qty="${i.id}" data-delta="-1" ${q ? '' : 'disabled'} aria-label="Убрать одну позицию: ${i.name}">−</button>
            <span class="qty-val"><span class="visually-hidden">Количество: </span>${q}</span>
            <button class="qty-btn" type="button" data-qty="${i.id}" data-delta="1" aria-label="Добавить одну позицию: ${i.name}">+</button>
          </div>
        </div>`;
    }).join('');
  }

  function builderStats() {
    const r = CATALOG.rules;
    let count = 0, sum = 0, weight = 0, drinks = 0;
    const lines = [];
    Object.entries(state.builder.qty).forEach(([id, q]) => {
      const it = CATALOG.items.find(x => x.id === id);
      if (!it || !q) return;
      count += q; sum += it.price * q; weight += it.weight * q;
      if (it.cat === 'drink') drinks += q;
      lines.push({ name: it.name, q, price: it.price * q });
    });
    const tier = r.tiers.find(t => count >= t.items);
    const discount = tier ? Math.round(sum * tier.discount) : 0;
    const goods = sum + (count ? r.basePrice : 0) - discount;
    const shipping = count ? (goods >= r.freeShippingFrom ? 0 : r.shipping) : 0;
    return { count, sum, weight, drinks, lines, discount, tier, goods, shipping, total: goods + shipping };
  }

  let sumOpen = false;

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function renderSummary() {
    const s = builderStats();
    const r = CATALOG.rules;

    $('#sumFill').textContent = money(s.sum);
    $('#sumPack').textContent = money(s.count ? r.basePrice : 0);
    $('#sumDiscountRow').hidden = !s.discount;
    if (s.discount) $('#sumDiscount').textContent = '−' + money(s.discount);
    $('#sumShip').textContent = s.count ? (s.shipping ? money(s.shipping) : 'бесплатно') : '—';
    $('#sumTotal').textContent = money(s.total);

    const left = Math.max(0, r.freeShippingFrom - s.goods);
    $('#sumProgress').style.width = Math.min(100, (s.goods / r.freeShippingFrom) * 100) + '%';
    $('#sumProgressText').textContent = s.count
      ? (left > 0 ? `До бесплатной доставки: ${money(left)}` : 'Бесплатная доставка — в заказе 🎉')
      : 'До бесплатной доставки: 2 500 ₽';

    $('#sumList').innerHTML = s.lines.length
      ? s.lines.map(l => `<li><span>${l.name} × ${l.q}</span><span>${money(l.price)}</span></li>`).join('')
      : '';

    const COLLAPSED = 5;
    const list = $('#sumList');
    const more = $('#sumMore');
    const hiddenLines = Math.max(0, s.lines.length - COLLAPSED);
    const isOpen = sumOpen || !hiddenLines;
    list.classList.toggle('is-open', isOpen);
    more.hidden = !hiddenLines;
    more.setAttribute('aria-expanded', String(hiddenLines ? isOpen : true));
    if (hiddenLines) {
      more.textContent = sumOpen
        ? 'Свернуть состав'
        : `Ещё ${hiddenLines} ${plural(hiddenLines, 'позиция', 'позиции', 'позиций')} — показать`;
    }

    let hint;
    if (!s.count) hint = 'Пока пусто — выберите позиции слева';
    else if (s.count < r.minItems) hint = `Добавьте ещё ${r.minItems - s.count} поз. — минимум ${r.minItems} для сборки`;
    else if (s.weight > r.maxWeight) hint = `Перевес: ${(s.weight / 1000).toFixed(2)} кг из ${(r.maxWeight / 1000).toFixed(1)} кг максимум`;
    else if (s.drinks > r.maxDrinks) hint = `Напитков не больше ${r.maxDrinks} шт. — посылка должна остаться лёгкой`;
    else if (s.tier) hint = `Скидка на объём ${Math.round(s.tier.discount * 100)}% применена`;
    else hint = 'От 7 позиций — скидка 3%, от 10 — 7%, от 14 — 12%';
    $('#summaryHint').textContent = hint;

    const ok = s.count >= r.minItems && s.weight <= r.maxWeight && s.drinks <= r.maxDrinks;
    const btn = $('#addCustom');
    btn.disabled = !ok;
    btn.textContent = ok ? `Добавить бокс в корзину · ${money(s.total)}` : 'Добавить бокс в корзину';
  }

  function changeQty(id, delta) {
    const r = CATALOG.rules;
    const item = CATALOG.items.find(x => x.id === id);
    const cur = state.builder.qty[id] || 0;
    const next = Math.max(0, cur + delta);

    if (delta > 0) {
      const s = builderStats();
      if (s.weight + item.weight > r.maxWeight) return toast('Достигнут максимум веса бокса — 2,2 кг');
      if (item.cat === 'drink' && s.drinks + 1 > r.maxDrinks) return toast(`Напитков в боксе — не больше ${r.maxDrinks}`);
    }
    const hadFocus = document.activeElement && document.activeElement.dataset
      && document.activeElement.dataset.qty === id;
    state.builder.qty[id] = next;
    if (!next) delete state.builder.qty[id];
    renderBuilderItems();
    renderSummary();
    if (hadFocus) {
      const pressed = delta > 0 ? 1 : -1;
      const btn = $(`#builderItems [data-qty="${id}"][data-delta="${pressed}"]`);
      const other = $(`#builderItems [data-qty="${id}"][data-delta="${-pressed}"]`);
      if (btn && !btn.disabled) btn.focus();
      else if (other && !other.disabled) other.focus();
    }
  }

  /* ---------------- корзина ---------------- */
  function cartTotals() {
    const subtotal = state.cart.reduce((a, i) => a + i.price * i.qty, 0);
    let discount = 0;
    if (state.promo) {
      const p = CATALOG.promos[state.promo];
      if (p && subtotal >= p.min) {
        discount = p.type === 'percent' ? Math.round(subtotal * p.value / 100) : p.value;
      }
    }
    const after = Math.max(0, subtotal - discount);
    const shipping = subtotal === 0 ? 0 : (after >= CATALOG.rules.freeShippingFrom ? 0 : CATALOG.rules.shipping);
    return { subtotal, discount, after, shipping, total: after + shipping };
  }

  /* Стоимость доставки с учётом способа: ПВЗ — базовая, курьер — базовая + надбавка,
     самовывоз — всегда бесплатно. */
  function shippingFor(method) {
    const r = CATALOG.rules;
    const t = cartTotals();
    if (method === 'pickup') return 0;
    if (method === 'courier') return t.shipping + r.courierFee;
    return t.shipping;
  }

  function addToCart(entry) {
    const existing = state.cart.find(i => i.key === entry.key);
    if (existing) existing.qty += entry.qty || 1;
    else state.cart.push({ ...entry, qty: entry.qty || 1 });
    save(); renderCart(); bump();
  }

  function bump() {
    const el = $('#cartCount');
    if (typeof el.animate !== 'function') return;
    el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 320 });
  }

  function addBox(id) {
    const b = CATALOG.boxes.find(x => x.id === id);
    if (!b) return;
    addToCart({
      key: 'box:' + b.id, type: 'box', id: b.id, title: b.title,
      sub: `${b.contents.length} позиций · ${(b.weight / 1000).toFixed(2)} кг`,
      price: b.price, img: b.img, weight: b.weight
    });
    toast(`«${b.title}» в корзине`);
  }

  function addCustom() {
    const s = builderStats();
    const r = CATALOG.rules;
    if (s.count < r.minItems || s.weight > r.maxWeight || s.drinks > r.maxDrinks) return;
    const sig = Object.entries(state.builder.qty).sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => k + 'x' + v).join('-');
    addToCart({
      key: 'custom:' + sig, type: 'custom', id: sig,
      title: 'Свой бокс',
      sub: s.lines.map(l => `${l.name} ×${l.q}`).join(', '),
      price: s.goods, img: null,
      weight: s.weight
    });
    toast('Свой бокс добавлен в корзину');
    state.builder.qty = {};
    renderBuilderItems(); renderSummary();
    openCart();
  }

  function cartCount() {
    return state.cart.reduce((a, i) => a + i.qty, 0);
  }

  function renderCart() {
    $('#cartCount').textContent = cartCount();
    const t = cartTotals();

    if (!state.cart.length) {
      $('#cartBody').innerHTML = `
        <div class="cart-empty">
          <b>Корзина пуста</b>
          <p>Выберите готовый бокс или соберите свой набор в конструкторе.</p>
          <button class="btn btn--sm" type="button" style="margin-top:18px" data-scroll="#catalog" data-close-cart="1">К боксам</button>
        </div>`;
    } else {
      $('#cartBody').innerHTML = state.cart.map(i => `
        <div class="cart-item">
          ${i.img
            ? `<img class="cart-item__img" src="${i.img}" alt="${i.title}">`
            : `<div class="cart-item__img cart-item__img--custom">📦</div>`}
          <div class="cart-item__body">
            <div class="cart-item__name">${i.title}</div>
            <div class="cart-item__sub">${i.sub || ''}</div>
            <div class="cart-item__row">
              <div class="item__qty">
                <button class="qty-btn" type="button" data-cart-qty="${i.key}" data-delta="-1" aria-label="Убрать одну штуку: ${i.title}">−</button>
                <span class="qty-val"><span class="visually-hidden">Количество: </span>${i.qty}</span>
                <button class="qty-btn" type="button" data-cart-qty="${i.key}" data-delta="1" aria-label="Добавить одну штуку: ${i.title}">+</button>
              </div>
              <span class="cart-item__price">${money(i.price * i.qty)}</span>
            </div>
          </div>
        </div>`).join('');
    }

    $('#cartSubtotal').textContent = money(t.subtotal);
    $('#cartDiscountRow').hidden = !t.discount;
    $('#cartDiscount').textContent = '−' + money(t.discount);
    $('#cartShipping').textContent = t.subtotal === 0 ? '—' : (t.shipping ? money(t.shipping) : 'бесплатно');
    $('#cartTotal').textContent = money(t.total);
    const mcb = $('#mobileCartBtn');
    if (mcb) {
      const cnt = mcb.querySelector('[data-mobile-count]');
      const tot = mcb.querySelector('[data-mobile-total]');
      if (cnt) { cnt.textContent = cartCount(); cnt.hidden = !cartCount(); }
      if (tot) tot.textContent = cartCount() ? money(t.total) : 'Корзина';
    }
    $('#goCheckout').disabled = !state.cart.length;

    if (state.promo) {
      const p = CATALOG.promos[state.promo];
      const msg = $('#promoMsg');
      if (p && t.subtotal >= p.min) { msg.textContent = `Промокод ${state.promo} применён: ${p.label}`; msg.className = 'promo__msg ok'; }
      else { msg.textContent = `Промокод ${state.promo}: минимум ${money(p ? p.min : 0)}`; msg.className = 'promo__msg err'; }
    }
  }

  function openCart(opener) {
    rememberFocus(opener);
    renderCart();
    $('#cartDrawer').classList.add('show');
    $('#cartDrawer').setAttribute('aria-hidden', 'false');
    $('#overlay').classList.add('show');
    document.body.classList.add('locked');
    focusFirst($('#cartDrawer'));
  }
  function closeCart(silent) {
    const wasOpen = $('#cartDrawer').classList.contains('show');
    $('#cartDrawer').classList.remove('show');
    $('#cartDrawer').setAttribute('aria-hidden', 'true');
    if (!$('#modal').classList.contains('show')) {
      $('#overlay').classList.remove('show');
      document.body.classList.remove('locked');
      if (wasOpen && !silent) restoreFocus();
    }
  }

  /* ---------------- оформление ---------------- */
  function openCheckout(opener) {
    if (!state.cart.length) return;
    const t = cartTotals();
    closeCart(true);
    rememberFocus(opener || $('#goCheckout'));
    openModal('<div class="kicker" style="margin:0">Оформление</div>',
      `<div class="product-view checkout-grid">
        <form id="checkoutForm">
          <div class="form-grid">
            <div class="field field--full"><label for="coName">Имя и фамилия</label><input id="coName" required name="name" autocomplete="name" placeholder="Анна Смирнова"></div>
            <div class="field"><label for="coPhone">Телефон</label><input id="coPhone" required name="phone" type="tel" autocomplete="tel" placeholder="+7 900 000-00-00"></div>
            <div class="field"><label for="coEmail">E-mail</label><input id="coEmail" required name="email" type="email" autocomplete="email" placeholder="anna@mail.ru"></div>
            <div class="field field--full"><label for="coCity">Город</label><input id="coCity" required name="city" autocomplete="address-level2" placeholder="Москва"></div>
            <div class="field field--full">
              <label for="coNote">Комментарий (аллергии, пожелания к открытке)</label>
              <textarea id="coNote" name="note" rows="2" placeholder="Без орехов, открытка «С днём рождения, Дима!»"></textarea>
            </div>
          </div>
          <h4 style="margin:22px 0 12px; font-size:15px">Доставка</h4>
          <div class="radio-row" id="shipRow" role="radiogroup" aria-label="Способ доставки">
            <label class="radio active"><input type="radio" name="ship" value="pvz" checked><span class="radio__text">ПВЗ СДЭК · 1–3 дня</span><span class="radio__price">${t.shipping ? money(t.shipping) : 'бесплатно'}</span></label>
            <label class="radio"><input type="radio" name="ship" value="courier"><span class="radio__text">Курьер до двери · 1–2 дня</span><span class="radio__price">${money(t.shipping + CATALOG.rules.courierFee)}</span></label>
            <label class="radio"><input type="radio" name="ship" value="pickup"><span class="radio__text">Самовывоз, Долгопрудный</span><span class="radio__price">бесплатно</span></label>
          </div>
          <h4 style="margin:22px 0 12px; font-size:15px">Оплата</h4>
          <div class="radio-row" role="radiogroup" aria-label="Способ оплаты">
            <label class="radio active"><input type="radio" name="pay" value="card" checked><span class="radio__text">Картой на сайте</span></label>
            <label class="radio"><input type="radio" name="pay" value="onpay"><span class="radio__text">При получении</span></label>
            <label class="radio"><input type="radio" name="pay" value="invoice"><span class="radio__text">По счёту (юрлицо)</span></label>
          </div>
          <button class="btn btn--full" style="margin-top:22px" type="submit">Подтвердить заказ</button>
          <p class="note">Демо-режим: данные формы не отправляются, оплата не списывается.</p>
        </form>
        <div>
          <div style="border:1px solid var(--line); border-radius:14px; padding:20px; background:var(--surface)">
            <h4 style="font-size:15px; margin-bottom:14px">Ваш заказ</h4>
            <ul class="summary__list" style="max-height:none; margin:0">
              ${state.cart.map(i => `<li><span>${i.title} × ${i.qty}</span><span>${money(i.price * i.qty)}</span></li>`).join('')}
            </ul>
            <div class="summary__row" style="margin-top:12px"><span>Товары</span><b>${money(t.subtotal)}</b></div>
            ${t.discount ? `<div class="summary__row summary__row--discount"><span>Скидка</span><b>−${money(t.discount)}</b></div>` : ''}
            <div class="summary__row"><span>Доставка</span><b id="coShip">${t.shipping ? money(t.shipping) : 'бесплатно'}</b></div>
            <div class="summary__total"><span>Итого</span><b id="coTotal">${money(t.total)}</b></div>
            <p class="note">Вес посылки: ${state.cart.reduce((a, i) => a + (i.weight || 900) * i.qty, 0) > 0 ? (state.cart.reduce((a, i) => a + (i.weight || 900) * i.qty, 0) / 1000).toFixed(2) : '—'} кг</p>
          </div>
        </div>
      </div>`);

    $('#checkoutForm').addEventListener('submit', e => {
      e.preventDefault();
      const form = e.target;
      const data = new FormData(form);
      const num = 'BX-' + String(Date.now()).slice(-6);
      const total = $('#coTotal').textContent;
      state.cart = []; state.promo = null; save(); savePromo();
      const pi = $('#promoInput'); if (pi) pi.value = '';
      const pm = $('#promoMsg'); if (pm) { pm.textContent = ''; pm.className = 'promo__msg'; }
      renderCart();
      openModal('', `
        <div class="order-done">
          <div class="order-done__icon">✓</div>
          <h3>Заказ принят</h3>
          <div class="num">${num}</div>
          <p>${data.get('name')}, спасибо! Мы отправим подтверждение на ${data.get('email')} и соберём бокс в течение 24 часов.</p>
          <p style="margin-top:12px">Сумма к оплате: <b style="color:var(--text)">${total}</b></p>
          <button class="btn" type="button" style="margin-top:26px" id="doneClose">Вернуться в магазин</button>
        </div>`);
      $('#doneClose').addEventListener('click', closeModal);
    });
  }

  function openCorp(opener) {
    openModal('<div class="kicker" style="margin:0">Юрлицам</div>', `
      <h3 style="font-size:26px; margin-bottom:8px">Коммерческое предложение</h3>
      <p style="color:var(--muted); font-size:14.5px; max-width:560px">Соберём тираж под ваш бюджет и количество сотрудников. Ответим в течение рабочего дня с расчётом и образцами упаковки.</p>
      <form id="corpForm" style="margin-top:24px">
        <div class="form-grid">
          <div class="field"><label for="corpCompany">Компания</label><input id="corpCompany" required name="company" autocomplete="organization" placeholder="ООО «Ромашка»"></div>
          <div class="field"><label for="corpPerson">Контактное лицо</label><input id="corpPerson" required name="person" autocomplete="name" placeholder="Иван Петров"></div>
          <div class="field"><label for="corpPhone">Телефон</label><input id="corpPhone" required name="phone" type="tel" autocomplete="tel" placeholder="+7 900 000-00-00"></div>
          <div class="field"><label for="corpEmail">E-mail</label><input id="corpEmail" required name="email" type="email" autocomplete="email" placeholder="ivan@company.ru"></div>
          <div class="field"><label for="corpQty">Количество наборов</label>
            <select id="corpQty" name="qty">
              <option>15–30</option><option>30–100</option><option>100–300</option><option>300+</option>
            </select>
          </div>
          <div class="field"><label for="corpBudget">Бюджет на набор</label>
            <select id="corpBudget" name="budget">
              <option>до 3 000 ₽</option><option>3 000–4 500 ₽</option><option>4 500–7 000 ₽</option><option>7 000 ₽+</option>
            </select>
          </div>
          <div class="field field--full"><label for="corpNote">Пожелания</label><textarea id="corpNote" name="note" rows="2" placeholder="Логотип на коробке, доставка по адресам сотрудников"></textarea></div>
        </div>
        <button class="btn" style="margin-top:20px" type="submit">Отправить запрос</button>
        <p class="note">Демо-режим: форма не отправляет данные.</p>
      </form>`, opener);
    $('#corpForm').addEventListener('submit', e => {
      e.preventDefault();
      openModal('', `<div class="order-done">
        <div class="order-done__icon">✓</div>
        <h3>Запрос отправлен</h3>
        <p>Менеджер свяжется с вами в течение рабочего дня и пришлёт расчёт с вариантами упаковки.</p>
        <button class="btn" type="button" style="margin-top:26px" id="corpClose">Понятно</button>
      </div>`);
      $('#corpClose').addEventListener('click', closeModal);
    });
  }

  /* ---------------- события ---------------- */
  document.addEventListener('click', e => {
    const t = e.target;

    const filter = t.closest('[data-filter]');
    if (filter) {
      state.boxFilter = filter.dataset.filter;
      renderBoxFilters(); renderBoxes(); return;
    }

    const bcat = t.closest('[data-bcat]');
    if (bcat) {
      state.builder.cat = bcat.dataset.bcat;
      renderBuilderFilters(); renderBuilderItems(); return;
    }

    const view = t.closest('[data-view]');
    if (view) { openBox(view.dataset.view, view); return; }

    const add = t.closest('[data-add]');
    if (add) { addBox(add.dataset.add); return; }

    const q = t.closest('[data-qty]');
    if (q) { changeQty(q.dataset.qty, Number(q.dataset.delta)); return; }

    const cq = t.closest('[data-cart-qty]');
    if (cq) {
      const item = state.cart.find(i => i.key === cq.dataset.cartQty);
      if (!item) return;
      const key = item.key;
      const pressed = Number(cq.dataset.delta) > 0 ? 1 : -1;
      item.qty += Number(cq.dataset.delta);
      if (item.qty <= 0) state.cart = state.cart.filter(i => i.key !== item.key);
      save(); renderCart();
      if ($('#cartDrawer').classList.contains('show')) {
        const btn = $(`#cartBody [data-cart-qty="${key}"][data-delta="${pressed}"]`);
        const other = $(`#cartBody [data-cart-qty="${key}"][data-delta="${-pressed}"]`);
        if (btn) btn.focus();
        else if (other) other.focus();
        else focusFirst($('#cartDrawer'));
      }
      return;
    }

    const scrollEl = t.closest('[data-scroll]');
    if (scrollEl) {
      if (scrollEl.dataset.closeCart) closeCart();
      closeModal();
      const target = $(scrollEl.dataset.scroll);
      if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 60);
      return;
    }

    if (t.closest('[data-corp]')) { openCorp(t.closest('[data-corp]')); return; }

    const faqQ = t.closest('.faq__q');
    if (faqQ) {
      const open = faqQ.parentElement.classList.toggle('open');
      faqQ.setAttribute('aria-expanded', String(open));
      return;
    }

    if (t.closest('#openCart')) { openCart(t.closest('#openCart')); return; }
    if (t.closest('#mobileCartBtn')) { openCart(t.closest('#mobileCartBtn')); return; }
    if (t.id === 'closeCart') { closeCart(); return; }
    if (t.id === 'closeModal') { closeModal(); return; }
    if (t.id === 'goCheckout') { openCheckout(t.closest('#goCheckout')); return; }
    if (t.id === 'addCustom') { addCustom(); return; }
    if (t.id === 'sumMore') { sumOpen = !sumOpen; renderSummary(); return; }
    if (t.id === 'overlay') { closeCart(); closeModal(); return; }

    if (t.id === 'applyPromo') {
      const code = $('#promoInput').value.trim().toUpperCase();
      const msg = $('#promoMsg');
      if (!code) return;
      if (!CATALOG.promos[code]) {
        state.promo = null;
        savePromo();
        msg.textContent = 'Промокод не найден';
        msg.className = 'promo__msg err';
      } else {
        state.promo = code;
        savePromo();
        renderCart();
        return;
      }
      renderCart();
    }
  });

  document.addEventListener('change', e => {
    const radio = e.target;
    if (radio.matches('input[type="radio"]') && radio.name) {
      $$(`input[name="${radio.name}"]`).forEach(inp => {
        const label = inp.closest('.radio');
        if (label) label.classList.toggle('active', inp.checked);
      });

      if (radio.name === 'ship' && $('#coShip')) {
        const ship = shippingFor(radio.value);
        const base = cartTotals();
        $('#coShip').textContent = ship ? money(ship) : 'бесплатно';
        $('#coTotal').textContent = money(base.after + ship);
      }
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCart(); closeModal(); return; }
    if (e.key === 'Tab') {
      const modal = $('#modal');
      const drawer = $('#cartDrawer');
      if (modal.classList.contains('show')) trapFocus(e, modal);
      else if (drawer.classList.contains('show')) trapFocus(e, drawer);
    }
  });

  /* ---------------- старт ---------------- */
  renderBoxFilters();
  renderBoxes();
  renderBuilderFilters();
  renderBuilderItems();
  renderSummary();
  renderCart();
})();
