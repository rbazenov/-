#!/usr/bin/env bash
# Запуск витрины: ./serve.sh [порт]
# Слушаем 0.0.0.0, чтобы страница открывалась через live-preview песочницы.
set -euo pipefail
PORT="${1:-8000}"
cd "$(dirname "$0")"
echo "BOXED. → http://localhost:${PORT}/  (0.0.0.0:${PORT})"
exec python3 -m http.server "$PORT" --bind 0.0.0.0
