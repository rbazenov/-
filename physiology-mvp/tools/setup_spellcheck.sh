#!/usr/bin/env bash
# Готовит словарь ru_RU для tools/spellcheck.py.
# Debian hunspell-ru, лицензия LGPL-2.1+ (см. /usr/share/doc/hunspell-ru/copyright).
set -euo pipefail

TARGET="${RU_HUNSPELL_DIR:-$HOME/.cache/spell/ru}"
BASE="$TARGET/usr/share/hunspell/ru_RU"

if [[ -f "$BASE.dic" && -f "$BASE.aff" ]]; then
  echo "Словарь уже установлен: $BASE"
  exit 0
fi

python -c "import spylls" 2>/dev/null || python -m pip install --quiet spylls

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cd "$WORK"
apt-get download hunspell-ru >/dev/null
mkdir -p "$TARGET"
for deb in hunspell-ru_*.deb; do
  dpkg-deb -x "$deb" "$TARGET"
done
cd - >/dev/null

if [[ ! -f "$BASE.dic" || ! -f "$BASE.aff" ]]; then
  echo "Не удалось получить $BASE.dic и $BASE.aff" >&2
  exit 1
fi
echo "Словарь установлен: $BASE"
