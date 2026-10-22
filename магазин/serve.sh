#!/usr/bin/env bash
# Запуск витрины: ./serve.sh [порт]   (по умолчанию 8000)
# Слушаем 0.0.0.0, чтобы страница открывалась через live-preview песочницы.
set -euo pipefail
PORT="${1:-8000}"
case "$PORT" in
  ''|*[!0-9]*) echo "Порт должен быть числом, например: ./serve.sh 8000" >&2; exit 1 ;;
esac
cd "$(dirname "$0")"
echo "BOXED. → http://localhost:${PORT}/"
exec python3 -m http.server "$PORT" --bind 0.0.0.0
