// Аудит доступности стартовой страницы через axe-core в jsdom.
// Проверяет разметку и ARIA; проверки, которым нужен реальный layout
// (контраст, порядок табуляции), отключены — их видно только в браузере.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .replace('<link rel="stylesheet" href="css/style.css">', '')
  .replace('<script src="js/catalog.js"></script>', '')
  .replace('<script src="js/app.js"></script>', '');

const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://example.test/', pretendToBeVisual: true });
const { window } = dom;

// jsdom без canvas: заглушка, чтобы axe не сыпал ошибками
window.HTMLCanvasElement.prototype.getContext = () => null;

window.eval(
  fs.readFileSync(path.join(ROOT, 'js/catalog.js'), 'utf8') +
  '\n;window.CATALOG = CATALOG;\n' +
  fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8')
);
window.eval(fs.readFileSync(path.join(__dirname, 'node_modules/axe-core/axe.min.js'), 'utf8'));

window.axe
  .run(window.document, {
    rules: {
      'color-contrast': { enabled: false },
      'region': { enabled: false }
    }
  })
  .then(res => {
    if (!res.violations.length) {
      console.log('axe: нарушений не найдено');
      process.exit(0);
    }
    console.log('axe: нарушений — ' + res.violations.length);
    for (const v of res.violations) {
      console.log(`\n[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length})`);
      v.nodes.slice(0, 3).forEach(n => console.log('   ', n.target.join(' ')));
    }
    process.exit(1);
  })
  .catch(err => { console.error(err); process.exit(2); });
