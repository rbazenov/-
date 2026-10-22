/* ============================================================
   BOXED. — данные каталога (демо-прототип)
   Цены розничные (₽). Закупочные цены в публичную сборку не входят.
   Все названия товаров — реальные SKU из матрицы импортёров,
   цены и наличие демонстрационные.
   ============================================================ */

const CATALOG = {
  /* ---------- готовые боксы ----------
     Составы и розничные цены. Закупка по позициям хранится отдельно и в
     публичный репозиторий не попадает. */
  boxes: [
    {
      id: 'sour',
      title: 'Extreme Sour Challenge',
      tagline: 'Кислотный шторм: 9 позиций и проверка на прочность.',
      occasion: ['челлендж', 'вечеринка', 'подарок'],
      price: 2190,
      oldPrice: 2590,
      weight: 410,
      servings: '2–3 человека',
      img: 'assets/box-sour.jpg',
      accent: '#ff4d3d',
      badge: 'Лучший вход',
      heat: 2,
      contents: [
        { n: 'Toxic Waste Red Sour Candy, 42 г', q: 1 },
        { n: 'Toxic Waste Blue Drum Candy, 42 г', q: 1 },
        { n: 'Trolli Wurrli неоновые червячки, 150 г', q: 1 },
        { n: 'Skittles Sour, 40 г', q: 1 },
        { n: 'Драже «Ведьмина кислота», 10 г', q: 1 },
        { n: 'Мармелад «Монстры», 12 г', q: 1 },
        { n: 'Мармеладные палочки Sour Milk, 16 г', q: 1 },
        { n: 'Мармелад Souk Belt в кислой обсыпке, 18 г', q: 1 },
        { n: 'Мармелад Xuancai Bobotang, 18 г', q: 1 }
      ],
      extras: ['Рулетка вкусов на 12 заданий', 'Таблица рекордов для компании', 'Наклейки «Я выжил»']
    },
    {
      id: 'beauty',
      title: 'K-Beauty & Snack',
      tagline: 'Половина бокса — уход, вторая — азиатские вкусы.',
      occasion: ['свидание', 'подарок', 'бьюти'],
      price: 2490,
      oldPrice: 2890,
      weight: 640,
      servings: '1 человек',
      img: 'assets/box-beauty.jpg',
      accent: '#e9b7b0',
      badge: 'Выбор редакции',
      heat: 0,
      contents: [
        { n: 'Патчи для глаз BIOAQUA с полипептидами, 7,5 г', q: 1 },
        { n: 'Патчи для губ ROREC с экстрактом вишни, 8 г', q: 1 },
        { n: 'Тканевая маска BIOAQUA «Утёнок», 25 г', q: 1 },
        { n: 'Тканевая маска с экстрактом улитки, 25 г', q: 1 },
        { n: 'Бальзам для губ BIOAQUA, 2,7 г', q: 1 },
        { n: 'Крем для рук BIOAQUA с мёдом, 30 г', q: 1 },
        { n: 'Печенье Tiny Mico Cheese Sandwich, 72 г', q: 1 },
        { n: 'Жевательные конфеты Wisichi Pectin, 50 г', q: 1 },
        { n: 'Драже Skittles Fruits, 40 г', q: 1 },
        { n: 'Чипсы Pringles Paprika, 40 г', q: 1 },
        { n: 'Напиток Cantabile Blueberry Ade, 230 мл', q: 1 }
      ],
      extras: ['Открытка в стиле kawaii', 'Мини-гид по уходу на вечер', 'Скидка 15% на повторный заказ']
    },
    {
      id: 'scoville',
      title: 'Scoville Roulette',
      tagline: 'Пять уровней остроты: от рамена до кислой бомбы.',
      occasion: ['челлендж', 'вечеринка'],
      price: 2890,
      oldPrice: 3390,
      weight: 890,
      servings: '3–4 человека',
      img: 'assets/box-scoville.jpg',
      accent: '#c9f24d',
      badge: 'Хит',
      heat: 5,
      contents: [
        { n: 'Samyang Buldak 3x Spicy Extreme, 140 г', q: 1 },
        { n: 'Samyang Buldak Quattro Cheese, 145 г', q: 1 },
        { n: '«Лэйча Лэйча» лапша с острой говядиной, 119 г', q: 1 },
        { n: 'DAOZHIXIANG острая лапша, 260 г', q: 1 },
        { n: 'Toxic Waste Red Sour Candy, 42 г', q: 1 },
        { n: 'Toxic Waste Blue Drum Candy, 42 г', q: 1 },
        { n: 'Skittles Sour, 40 г', q: 1 },
        { n: 'Драже «Ведьмина кислота», 10 г', q: 1 },
        { n: 'Чипсы-соломка остро-пряные, 22 г', q: 1 }
      ],
      extras: ['Карточки «Рулетка Сковилля», 12 шт.', 'Стикеры уровней остроты', 'QR на плейлист вечера']
    },
    {
      id: 'zero',
      title: 'Zero Sugar Taster',
      tagline: '10 позиций без сахара: от конфет до энергетика.',
      occasion: ['фитнес', 'зож', 'подарок'],
      price: 2490,
      oldPrice: 2790,
      weight: 1460,
      servings: '1 человек / на месяц',
      img: 'assets/box-zero.jpg',
      accent: '#6ea8ff',
      badge: 'Тест ниши',
      heat: 0,
      contents: [
        { n: 'Scandic Spicy Apple без сахара, 14 г', q: 1 },
        { n: 'Scandic Mango Shake без сахара, 14 г', q: 1 },
        { n: 'Scandic Arctic Mint без сахара, 14 г', q: 1 },
        { n: 'Scandic Spicy Cola без сахара, 14 г', q: 1 },
        { n: 'Scandic Wild Berries без сахара, 14 г', q: 1 },
        { n: 'Scandic Citrus Mix без сахара, 14 г', q: 1 },
        { n: 'Холодный кофе Cantabile Black Americano, 230 мл', q: 1 },
        { n: 'Monster Ultra White Zero, 330 мл', q: 1 },
        { n: 'Coca-Cola Zero, 330 мл', q: 1 },
        { n: 'Fanta Orange Zero, 330 мл', q: 1 }
      ],
      extras: ['Карточки «0 сахара» по каждой позиции', 'Дневник дегустатора', 'Подборка zero-напитков на месяц']
    },
    {
      id: 'asia',
      title: 'Gourmet Asia Date',
      tagline: 'Вечер на двоих: трюфель, тирамису и белый манго.',
      occasion: ['свидание', 'подарок', 'гурман'],
      price: 3990,
      oldPrice: 4490,
      weight: 1160,
      servings: '2 человека',
      img: 'assets/box-asia.jpg',
      accent: '#d9b25f',
      badge: 'Премиум',
      heat: 1,
      contents: [
        { n: 'Печенье Tiny Mico Black Truffle, 72 г', q: 1 },
        { n: 'Печенье Tiny Mico Love Tiramisu, 88 г', q: 1 },
        { n: 'Печенье Tiny Mico Lemon Cheesecake, 80 г', q: 1 },
        { n: 'Шоколад ChocoLake White Mango, 190 г', q: 1 },
        { n: 'Напиток Cantabile Blueberry Ade, 230 мл', q: 1 },
        { n: 'Напиток Cantabile Blue Lemon Ade, 230 мл', q: 1 },
        { n: 'Жевательные конфеты Wisichi Pectin, 50 г', q: 1 },
        { n: 'Вафли Knoppers Joghurt, 25 г', q: 1 },
        { n: 'Вафли Knoppers Black & White, 25 г', q: 1 }
      ],
      extras: ['Открытка рукописного шрифта', 'Подборка дорам на вечер (QR)', 'Атласная лента и сургучная печать']
    },
    {
      id: 'corporate',
      title: 'Corporate NY 2027',
      tagline: 'Тираж от 15 наборов: брендирование и документы.',
      occasion: ['корпоратив', 'новый год', 'подарок'],
      price: 4490,
      oldPrice: 4990,
      weight: 1240,
      servings: '1 человек',
      img: 'assets/box-newyear.jpg',
      accent: '#e0b56b',
      badge: 'От 15 шт.',
      heat: 0,
      contents: [
        { n: 'Шоколад ChocoLake White Mango, 190 г', q: 1 },
        { n: 'Мармелад Haribo Tropifrutti, 340 г', q: 1 },
        { n: 'Чипсы Pringles Texas BBQ, 165 г', q: 1 },
        { n: 'Печенье Milky Way Biscuits, 108 г', q: 1 },
        { n: 'Вафли Knoppers Joghurt, 25 г', q: 1 },
        { n: 'Вафли Knoppers Black & White, 25 г', q: 1 },
        { n: 'Напиток Cantabile Blue Lemon Ade, 230 мл', q: 1 },
        { n: 'Кислая карамель XIUDOU ассорти, 60 г', q: 1 }
      ],
      extras: ['Брендирование упаковки логотипом', 'Открытка с подписями команды', 'Договор и закрывающие документы']
    }
  ],

  /* ---------- наполнение конструктора ----------
     Только позиции, которые реально есть в прайсах.
     weight — вес одной штуки в граммах. */
  items: [
    { id: 'i1',  cat: 'ramen', name: 'Samyang Buldak 3x Spicy Extreme', sub: '140 г', price: 289, weight: 148 },
    { id: 'i2',  cat: 'ramen', name: 'Samyang Buldak Quattro Cheese', sub: '145 г', price: 279, weight: 154 },
    { id: 'i3',  cat: 'ramen', name: '«Лэйча Лэйча» лапша с острой говядиной', sub: '119 г', price: 159, weight: 119 },
    { id: 'i4',  cat: 'ramen', name: 'DAOZHIXIANG острая лапша', sub: '260 г', price: 349, weight: 260 },
    { id: 'i5',  cat: 'asia',  name: 'Tiny Mico Black Truffle', sub: '72 г', price: 199, weight: 110 },
    { id: 'i6',  cat: 'asia',  name: 'Tiny Mico Love Tiramisu', sub: '88 г', price: 189, weight: 122 },
    { id: 'i7',  cat: 'asia',  name: 'ChocoLake White Mango', sub: '190 г', price: 1490, weight: 210 },
    { id: 'i8',  cat: 'asia',  name: 'Wisichi Pectin Candy', sub: '50 г', price: 129, weight: 58 },
    { id: 'i9',  cat: 'sour',  name: 'Toxic Waste Red Sour Candy', sub: '42 г', price: 229, weight: 68 },
    { id: 'i10', cat: 'sour',  name: 'Toxic Waste Blue Drum Candy', sub: '42 г', price: 229, weight: 68 },
    { id: 'i11', cat: 'sour',  name: 'Trolli Wurrli кислые червячки', sub: '150 г', price: 269, weight: 154 },
    { id: 'i12', cat: 'sour',  name: 'Skittles Sour', sub: '40 г', price: 169, weight: 42 },
    { id: 'i13', cat: 'sweet', name: 'Haribo Tropifrutti', sub: '340 г', price: 479, weight: 350 },
    { id: 'i14', cat: 'sweet', name: 'Milky Way Biscuits', sub: '108 г', price: 479, weight: 120 },
    { id: 'i15', cat: 'sweet', name: 'Knoppers Joghurt', sub: '25 г', price: 99, weight: 26 },
    { id: 'i16', cat: 'sweet', name: 'Кислая карамель XIUDOU ассорти', sub: '60 г', price: 219, weight: 60 },
    { id: 'i17', cat: 'snack', name: 'Pringles Texas BBQ', sub: '165 г', price: 399, weight: 212 },
    { id: 'i18', cat: 'snack', name: 'Pringles Paprika', sub: '40 г', price: 169, weight: 66 },
    { id: 'i19', cat: 'snack', name: 'Чипсы-соломка остро-пряные', sub: '22 г', price: 59, weight: 22 },
    { id: 'i20', cat: 'drink', name: 'Cantabile Blueberry Ade', sub: '230 мл', price: 229, weight: 242 },
    { id: 'i21', cat: 'drink', name: 'Cantabile Blue Lemon Ade', sub: '230 мл', price: 229, weight: 236 },
    { id: 'i22', cat: 'drink', name: 'Monster Ultra White Zero', sub: '330 мл', price: 219, weight: 354 },
    { id: 'i23', cat: 'drink', name: 'Coca-Cola Zero', sub: '330 мл', price: 189, weight: 341 },
    { id: 'i24', cat: 'zero',  name: 'Scandic без сахара, ассорти', sub: '14 г', price: 109, weight: 30 },
    { id: 'i25', cat: 'zero',  name: 'Cantabile Black Americano без сахара', sub: '230 мл', price: 229, weight: 242 },
    { id: 'i26', cat: 'asia',  name: 'Моти Kubota ассорти, 8 шт', sub: 'Япония', price: 590, weight: 215 },
    { id: 'i27', cat: 'asia',  name: 'Палочки Pocky Matcha', sub: 'Япония', price: 229, weight: 45 }
  ],

  categories: [
    { id: 'all',   label: 'Всё' },
    { id: 'ramen', label: 'Рамен и острое' },
    { id: 'asia',  label: 'Азия' },
    { id: 'sour',  label: 'Кислое' },
    { id: 'sweet', label: 'Шоколад' },
    { id: 'snack', label: 'Снеки' },
    { id: 'drink', label: 'Напитки' },
    { id: 'zero',  label: 'Zero / без сахара' }
  ],

  /* ---------- правила конструктора ---------- */
  rules: {    basePrice: 190,          // брендированная коробка + ложемент + открытка
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
