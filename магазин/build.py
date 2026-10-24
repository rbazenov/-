#!/usr/bin/env python3
"""
BOXED. — сборка автономной витрины одним файлом.

Берёт index.html, css/style.css, js/catalog.js, js/app.js и assets/*.jpg,
вклеивает всё внутрь HTML (картинки — как base64) и пишет
boxed-standalone.html. Файл открывается с телефона без сервера и сети.

Запуск:  ./build.py          (из папки магазин)
Проверка: ./build.py --check (ничего не пишет, только сверяет актуальность)
"""

from __future__ import annotations

import base64
import mimetypes
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ENTRY = ROOT / "index.html"
OUT = ROOT / "boxed-standalone.html"
# локальные пути («assets/x.jpg»), но не абсолютные URL («https://…/assets/x.jpg»)
ASSET_RE = re.compile(r"(?<![/\w])assets/([A-Za-z0-9._-]+\.jpg)")
BANNER = (
    "<!-- BOXED. — автономная сборка. Источники: index.html, css/style.css,\n"
    "     js/catalog.js, js/app.js, assets/*.jpg. Собрано ./build.py —\n"
    "     правьте исходники, а не этот файл. -->"
)


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "image/jpeg"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def build() -> str:
    html = ENTRY.read_text(encoding="utf-8")
    css = (ROOT / "css/style.css").read_text(encoding="utf-8")
    catalog = (ROOT / "js/catalog.js").read_text(encoding="utf-8")
    app = (ROOT / "js/app.js").read_text(encoding="utf-8")

    # внешние подсказки браузеру в автономном файле не нужны
    html = re.sub(r'\n<link rel="preconnect"[^>]*>', "", html)

    html = html.replace(
        '<link rel="stylesheet" href="css/style.css">',
        "<style>\n" + css.rstrip() + "\n</style>",
        1,
    )
    html = html.replace(
        '<script src="js/catalog.js"></script>',
        "<script>\n" + catalog.rstrip() + "\n</script>",
        1,
    )
    html = html.replace(
        '<script src="js/app.js"></script>',
        "<script>\n" + app.rstrip() + "\n</script>",
        1,
    )

    # картинки: и в разметке (src="assets/..."), и в данных каталога (img: 'assets/...')
    cache: dict[str, str] = {}

    def inline_asset(match: re.Match[str]) -> str:
        name = match.group(1)
        if name not in cache:
            path = ROOT / "assets" / name
            if not path.is_file():
                sys.exit(f"build.py: не найден файл {path.relative_to(ROOT)}")
            cache[name] = data_uri(path)
        return cache[name]

    html = ASSET_RE.sub(inline_asset, html)

    html = html.replace("<html lang=\"ru\">", "<html lang=\"ru\">\n" + BANNER, 1)

    leftover = ASSET_RE.findall(html)
    if leftover:
        sys.exit(f"build.py: остались ссылки на файлы: {sorted(set(leftover))}")
    for marker in ("<script src=", 'href="css/style.css"'):
        if marker in html:
            sys.exit(f"build.py: не удалось вклеить {marker}")

    return html


def main() -> None:
    check_only = "--check" in sys.argv[1:]
    html = build()
    if check_only:
        current = OUT.read_text(encoding="utf-8") if OUT.is_file() else ""
        if current.strip() != html.strip():
            sys.exit("build.py --check: boxed-standalone.html устарел, запустите ./build.py")
        print("boxed-standalone.html актуален")
        return
    OUT.write_text(html, encoding="utf-8")
    print(f"boxed-standalone.html · {OUT.stat().st_size / 1024 / 1024:.2f} МБ")


if __name__ == "__main__":
    main()
