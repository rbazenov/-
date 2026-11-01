import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const appRoot = path.join(projectRoot, 'apps/web');
const require = createRequire(path.join(appRoot, 'package.json'));
const { build } = require('esbuild');
const result = await build({
  absWorkingDir: appRoot,
  entryPoints: [path.join(appRoot, 'src/main.tsx')],
  outdir: 'embedded',
  entryNames: 'prototype',
  bundle: true,
  write: false,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  legalComments: 'inline',
  alias: { '@content': path.join(projectRoot, 'content') },
  define: {
    'process.env.NODE_ENV': '"production"',
    'import.meta.env.PROD': 'false',
    'import.meta.env.DEV': 'false',
    'import.meta.env.VITE_PREVIEW_MODE': '"standalone"',
  },
});

const js = result.outputFiles.find((file) => file.path.endsWith('.js'))?.text;
const css = result.outputFiles.find((file) => file.path.endsWith('.css'))?.text;
if (!js || !css) throw new Error('Standalone build did not produce both JavaScript and CSS.');
const safeJS = js.replace(/<\/script/gi, '<\\/script');
const safeCSS = css.replace(/<\/style/gi, '<\\/style');
const favicon = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" rx="16" fill="%230f172a"/%3E%3Cpath d="M14 38h10l6-18 8 28 6-10h6" fill="none" stroke="%2338bdf8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/%3E%3C/svg%3E';
const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0f172a">
<meta name="description" content="Автономный редакторский прототип: физиология мышечной деятельности, основы спортивно-оздоровительного туризма, топография и ориентирование. Новые предметы — стартовые черновики.">
<link rel="icon" href="${favicon}">
<title>Учебные карточки — интерактивный прототип</title>
<style>${safeCSS}</style>
</head>
<body>
<div id="root"><main class="app"><section class="screen"><h1>Учебные карточки</h1><p>Загрузка интерактивного прототипа…</p><noscript><p>Для работы карточек необходимо разрешить JavaScript в просмотрщике.</p></noscript></section></main></div>
<script>${safeJS}</script>
</body>
</html>
`;
const primary = path.join(projectRoot, 'prototype.html');
const workspaceEntry = path.resolve(projectRoot, '../index.html');
await mkdir(path.dirname(primary), { recursive: true });
await writeFile(primary, html, 'utf8');
await writeFile(workspaceEntry, html, 'utf8');
console.log(`Standalone prototype: ${primary} (${Buffer.byteLength(html)} bytes)`);
console.log(`Workspace preview entry: ${workspaceEntry}`);
console.log('All application code, styles and content are embedded. No server or network is required.');
