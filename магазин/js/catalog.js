/* ============================================================
   BOXED. — данные каталога (демо-прототип)
   Цены розничные (₽), закупочные — в docs/закупка-50000.md
   Все названия товаров — реальные SKU из матрицы импортёров,
   цены и наличие демонстрационные.
   ============================================================ */

const CATALOG = {
  /* ---------- готовые боксы ---------- */
  boxes: [
    {
      id: 'scoville',
      title: 'Scoville Roulette',
      tagline: '5 уровней остроты. Один бокс — одна дуэль.',
      occasion: ['челлендж', 'вечеринка'],
      price: 2990,
      oldPrice: 3490,
      weight: 1180,
      servings: '3–4 человека',
      img: 'assets/box-scoville.jpg',
      accent: '#c9f24d',
      badge: 'Хит',
      heat: 5,
      contents: [
        { n: 'Samyang Buldak Hot Chicken Ramen, 140 г', q: 2 },
        { n: 'Samyang Buldak Quattro Cheese, 145 г', q: 1 },
        { n: 'Nongshim Shin Ramyun Black, 130 г', q: 1 },
        { n: 'Candy «Toxic Waste» Sour, 42 г', q: 1 },
        { n: 'Xiao Manzu 3D-желе личи, 60 г', q: 2 },
        { n: 'Pocky Chili, 70 г', q: 1 },
        { n: 'Соус острый Red Chili, 40 г', q: 1 },
        { n: 'Карточки «Рулетка Сковилля», 12 шт.', q: 1 }
      ],
      extras: ['Игровые карточки с 12 заданиями', 'Стикеры уровней остроты', 'QR на музыкальный плейлист вечера']
    },
    {
      id: 'asia',
      title: 'Gourmet Asia Date',
      tagline: 'Вечер под дораму: матча, моти и трюфель.',
      occasion: ['свидание', 'подарок', 'гурман'],
      price: 3490,
      oldPrice: 3990,
      weight: 940,
      servings: '2 человека',
      img: 'assets/box-asia.jpg',
      accent: '#d9b25f',
      badge: 'Выбор редакции',
      heat: 1,
      contents: [
        { n: 'Tiny Mico мини-макарон, чёрный трюфель, 60 г', q: 1 },
        { n: 'Tiny Mico бисквит, тирамису, 60 г', q: 1 },
        { n: 'Pocky Matcha, 70 г', q: 2 },
        { n: 'Моти с двойной начинкой, ассорти, 6 шт.', q: 1 },
        { n: 'Meiji Milk Chocolate, 50 г', q: 1 },
        { n: 'Pepsi Zero Strawberry Milkshake, 330 мл', q: 2 },
        { n: 'Hatakosen Ramune Lychee, 200 мл', q: 1 },
        { n: 'Открытка с пожеланием', q: 1 }
      ],
      extras: ['Открытка рукописного шрифта', 'Подборка дорам на вечер (QR)', 'Атласная лента и сургучная печать']
    },
    {
      id: 'sour',
      title: 'Extreme Sour Challenge',
      tagline: 'Кислотный шторм: проверка на прочность.',
      occasion: ['челлендж', 'вечеринка', 'дети 14+'],
      price: 2490,
      oldPrice: 2790,
      weight: 760,
      servings: '2–3 человека',
      img: 'assets/box-sour.jpg',
      accent: '#ff4d3d',
      badge: 'Вирусный',
      heat: 2,
      contents: [
        { n: 'Toxic Waste Sour Candy, 100 г', q: 2 },
        { n: 'Haribo Miami Sauer Mix, 100 г', q: 1 },
        { n: 'Trolli Sour Brite Crawlers, 100 г', q: 2 },
        { n: 'Кислые леденцы с начинкой, 60 г', q: 2 },
        { n: 'Кислый мармелад «Колесо», 80 г', q: 1 },
        { n: 'Повязка на глаза + таймер', q: 1 }
      ],
      extras: ['Рулетка вкусов (5 непредсказуемых позиций)', 'Таблица рекордов для компании', 'Наклейки «Я выжил»']
    },
    {
      id: 'zero',
      title: 'Import Zero & Protein',
      tagline: '12 вкусов без сахара — без компромиссов.',
      occasion: ['фитнес', 'зож', 'подарок'],
      price: 2890,
      oldPrice: 3290,
      weight: 690,
      servings: '1 человек / на месяц',
      img: 'assets/box-zero.jpg',
      accent: '#6ea8ff',
      badge: 'Подписка −10%',
      heat: 0,
      contents: [
        { n: 'Ferrero FULFIL, 3 вкуса', q: 3 },
        { n: 'Snickers Protein Bar, 2 вкуса', q: 2 },
        { n: 'Eat Natural без сахара, 2 шт.', q: 2 },
        { n: 'Monster Ultra Zero, 500 мл', q: 1 },
        { n: 'Coca-Cola Zero Caffeine Free, 330 мл', q: 1 },
        { n: 'Протеиновые чипсы, 2 вкуса', q: 2 },
        { n: 'Дневник дегустатора', q: 1 }
      ],
      extras: ['Карточки КБЖУ по каждой позиции', 'Скидка 10% на подписку', 'Дневник дегустатора']
    },
    {
      id: 'gamer',
      title: 'Night Raid Gamer',
      tagline: 'Ночная сессия: топливо на 6 часов.',
      occasion: ['гейминг', 'подарок', 'вечеринка'],
      price: 2890,
      oldPrice: 3190,
      weight: 1050,
      servings: '2 человека',
      img: 'assets/box-gamer.jpg',
      accent: '#a97bff',
      badge: 'Новинка',
      heat: 1,
      contents: [
        { n: 'Monster Energy Pacific Punch, 500 мл', q: 2 },
        { n: 'Red Bull Zero, 355 мл', q: 1 },
        { n: 'Pringles Smoky Bacon, 165 г', q: 1 },
        { n: 'Lay\'s азиатские вкусы, 2 вида', q: 2 },
        { n: 'Samyang Buldak Cup, 70 г', q: 2 },
        { n: 'Кислый мармелад Trolli, 100 г', q: 1 },
        { n: 'Коллекционный стикерпак', q: 1 }
      ],
      extras: ['Стикерпак с пиксель-артом', 'Плейлист для ночной сессии', 'Промокод партнёрского сервиса']
    },
    {
      id: 'corporate',
      title: 'Corporate NY 2027',
      tagline: 'Небанальный подарок от отдела — отделу.',
      occasion: ['корпоратив', 'новый год', 'подарок'],
      price: 3900,
      oldPrice: 4400,
      weight: 1320,
      servings: '1 человек',
      img: 'assets/box-newyear.jpg',
      accent: '#e0b56b',
      badge: 'От 15 шт.',
      heat: 0,
      contents: [
        { n: 'Milka Germany, 100 г', q: 1 },
        { n: 'Hanuta, 2 шт.', q: 1 },
        { n: 'Kinder Chocolate, 4 шт.', q: 1 },
        { n: 'Haribo Christmas Edition, 100 г', q: 1 },
        { n: 'Tiny Mico, трюфель, 60 г', q: 1 },
        { n: 'Nutella B-ready, 2 шт.', q: 1 },
        { n: 'Кофе в дрипах, 2 шт.', q: 1 },
        { n: 'Открытка с логотипом заказчика', q: 1 }
      ],
      extras: ['Брендирование упаковки логотипом', 'Открытка с подписями команды', 'Договор и закрывающие документы']
    }
  ],

  /* ---------- наполнение конструктора ---------- */
  items: [
    { id: 'i1',  cat: 'ramen',  name: 'Samyang Buldak Original',   sub: '140 г', price: 190, weight: 140 },
    { id: 'i2',  cat: 'ramen',  name: 'Samyang Buldak 3x Spicy',   sub: '140 г', price: 230, weight: 140 },
    { id: 'i3',  cat: 'ramen',  name: 'Nongshim Shin Ramyun Black', sub: '130 г', price: 210, weight: 130 },
    { id: 'i4',  cat: 'ramen',  name: 'Суп том-ям с лапшой',       sub: '90 г',  price: 150, weight: 90 },
    { id: 'i5',  cat: 'asia',   name: 'Pocky Matcha',              sub: '70 г',  price: 240, weight: 70 },
    { id: 'i6',  cat: 'asia',   name: 'Tiny Mico трюфель',         sub: '60 г',  price: 290, weight: 60 },
    { id: 'i7',  cat: 'asia',   name: 'Моти двойная начинка',      sub: '3 шт.', price: 320, weight: 120 },
    { id: 'i8',  cat: 'asia',   name: 'Xiao Manzu 3D-желе',        sub: '60 г',  price: 180, weight: 60 },
    { id: 'i9',  cat: 'sour',   name: 'Toxic Waste Sour',          sub: '42 г',  price: 160, weight: 42 },
    { id: 'i10', cat: 'sour',   name: 'Haribo Miami Sauer',        sub: '100 г', price: 190, weight: 100 },
    { id: 'i11', cat: 'sour',   name: 'Trolli Sour Crawlers',      sub: '100 г', price: 180, weight: 100 },
    { id: 'i12', cat: 'sweet',  name: 'Milka Germany',             sub: '100 г', price: 220, weight: 100 },
    { id: 'i13', cat: 'sweet',  name: 'Hanuta',                    sub: '2 шт.', price: 170, weight: 44 },
    { id: 'i14', cat: 'sweet',  name: 'Kinder Chocolate',          sub: '4 шт.', price: 210, weight: 50 },
    { id: 'i15', cat: 'sweet',  name: 'Meiji Milk Chocolate',      sub: '50 г',  price: 190, weight: 50 },
    { id: 'i16', cat: 'snack',  name: 'Pringles Smoky Bacon',      sub: '165 г', price: 320, weight: 165 },
    { id: 'i17', cat: 'snack',  name: 'Lay\'s азиатский вкус',     sub: '70 г',  price: 150, weight: 70 },
    { id: 'i18', cat: 'snack',  name: 'Протеиновые чипсы',         sub: '60 г',  price: 190, weight: 60 },
    { id: 'i19', cat: 'drink',  name: 'Monster Ultra Zero',        sub: '500 мл', price: 290, weight: 530 },
    { id: 'i20', cat: 'drink',  name: 'Pepsi Strawberry Zero',     sub: '330 мл', price: 180, weight: 350 },
    { id: 'i21', cat: 'drink',  name: 'AriZona Green Tea',         sub: '500 мл', price: 250, weight: 530 },
    { id: 'i22', cat: 'drink',  name: 'Hatakosen Ramune Lychee',   sub: '200 мл', price: 210, weight: 220 },
    { id: 'i23', cat: 'zero',   name: 'Ferrero FULFIL',            sub: '40 г',  price: 200, weight: 40 },
    { id: 'i24', cat: 'zero',   name: 'Snickers Protein',          sub: '47 г',  price: 190, weight: 47 },
    { id: 'i25', cat: 'zero',   name: 'Eat Natural без сахара',    sub: '35 г',  price: 170, weight: 35 }
  ],

  categories: [
    { id: 'all',   label: 'Всё' },
    { id: 'ramen', label: 'Рамен и острое' },
    { id: 'asia',  label: 'Азия' },
    { id: 'sour',  label: 'Кислое' },
    { id: 'sweet', label: 'Шоколад' },
    { id: 'snack', label: 'Снеки' },
    { id: 'drink', label: 'Напитки' },
    { id: 'zero',  label: 'Zero / Protein' }
  ],

  /* ---------- правила конструктора ---------- */
  rules: {
    basePrice: 190,          // брендированная коробка + ложемент + открытка
    freeShippingFrom: 2500,
    shipping: 320,
    minItems: 4,
    maxDrinks: 2,
    maxWeight: 2200,
    tiers: [
      { items: 14, discount: 0.12 },
      { items: 10, discount: 0.07 },
      { items: 7,  discount: 0.03 }
    ]
  },

  promos: {
    START10: { type: 'percent', value: 10, min: 0,    label: '−10% на первый заказ' },
    ASIA500: { type: 'fixed',   value: 500, min: 3000, label: '−500 ₽ от 3 000 ₽' }
  }
};
