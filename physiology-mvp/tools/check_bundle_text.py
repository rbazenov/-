#!/usr/bin/env python3
"""Проверяет, что каждая строка банков дословно попала в автономную сборку.

Сборщик экранирует не-ASCII как \\uXXXX и \\xXX, поэтому обе формы раскрываются
перед сравнением. Ловит расхождение между content/pilot и prototype.html.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ESCAPES = [
    (re.compile(r"\\u([0-9a-fA-F]{4})"), 16),
    (re.compile(r"\\x([0-9a-fA-F]{2})"), 16),
]


def decode(text: str) -> str:
    for pattern, base in ESCAPES:
        text = pattern.sub(lambda m: chr(int(m.group(1), base)), text)
    return text


def strings(item: dict):
    for key in ("title", "body_ru", "prompt_ru", "explanation_correct_ru"):
        if isinstance(item.get(key), str):
            yield key, item[key]
    for value in item.get("key_chain_ru", []):
        yield "key_chain_ru", value
    for option in item.get("options", []):
        for key in ("text_ru", "explanation_ru", "hint_ru"):
            if isinstance(option.get(key), str):
                yield f"{option['option_id']}.{key}", option[key]


def main() -> int:
    bundle = ROOT / "prototype.html"
    if not bundle.exists():
        sys.exit("Нет prototype.html. Сначала выполните npm run build:standalone.")
    decoded = decode(bundle.read_text(encoding="utf-8"))
    total = 0
    missing: list[str] = []
    for bank in sorted((ROOT / "content" / "pilot").glob("*/*.json")):
        for item in json.loads(bank.read_text(encoding="utf-8")):
            item_id = item.get("question_id") or item.get("card_id")
            for key, value in strings(item):
                total += 1
                if value not in decoded:
                    missing.append(f"{bank.parent.name}/{bank.name}:{item_id}:{key}")
    print(f"Строк проверено: {total}; отсутствует в сборке: {len(missing)}")
    for entry in missing[:20]:
        print(f"  {entry}")
    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
