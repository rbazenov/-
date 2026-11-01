#!/usr/bin/env bash
# Готовит словарь ru_RU и модуль spylls для tools/spellcheck.py.
#
# Основной источник словаря — Debian hunspell-ru (LGPL-2.1+, см. /usr/share/doc/hunspell-ru/copyright).
# Запасной источник — npm-пакет dictionary-ru (BSD-3-Clause, wooorm/dictionaries): тот же
# hunspell-словарь, но ставится без apt-зеркал и без прав root.
#
# Словарь и модули живут в $HOME/.cache и не входят в снимок рабочей области.
set -euo pipefail

TARGET="${RU_HUNSPELL_DIR:-$HOME/.cache/spell/ru}"
BASE="$TARGET/usr/share/hunspell/ru_RU"

install_spylls() {
  if python3 -c "import spylls" 2>/dev/null; then
    echo "Модуль spylls уже установлен."
    return 0
  fi
  # PEP 668 запрещает установку в системный Python: сначала пробуем обычный pip,
  # затем пользовательский каталог с --break-system-packages.
  if python3 -m pip install --quiet spylls 2>/dev/null; then
    echo "Модуль spylls установлен."
    return 0
  fi
  if python3 -m pip install --quiet --user --break-system-packages spylls 2>/dev/null; then
    echo "Модуль spylls установлен в пользовательский каталог."
    return 0
  fi
  echo "Не удалось установить spylls: поставьте его вручную (pip install --user spylls)." >&2
  return 1
}

install_spylls

if [[ -f "$BASE.dic" && -f "$BASE.aff" ]]; then
  echo "Словарь уже установлен: $BASE"
  exit 0
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$(dirname "$BASE")"

if command -v apt-get >/dev/null && (cd "$WORK" && apt-get download hunspell-ru >/dev/null 2>&1); then
  for deb in "$WORK"/hunspell-ru_*.deb; do
    dpkg-deb -x "$deb" "$TARGET"
  done
  SOURCE="Debian hunspell-ru"
elif command -v npm >/dev/null && (cd "$WORK" && npm pack dictionary-ru >/dev/null 2>&1); then
  tar xzf "$WORK"/dictionary-ru-*.tgz -C "$WORK"
  cp "$WORK/package/index.aff" "$BASE.aff"
  cp "$WORK/package/index.dic" "$BASE.dic"
  SOURCE="npm dictionary-ru (BSD-3-Clause)"
else
  echo "Не удалось получить словарь ru_RU: недоступны и apt-зеркала, и npm." >&2
  echo "Скачайте hunspell ru_RU вручную и укажите путь через RU_HUNSPELL_BASE." >&2
  exit 1
fi

if [[ ! -f "$BASE.dic" || ! -f "$BASE.aff" ]]; then
  echo "Не удалось получить $BASE.dic и $BASE.aff" >&2
  exit 1
fi

echo "Словарь установлен: $BASE (источник: $SOURCE)"
echo "Проверка: python3 tools/spellcheck.py"
