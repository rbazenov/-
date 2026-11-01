#!/usr/bin/env python3
"""Синхронизирует столбец title_or_prompt в редакторских матрицах с банками.

Идемпотентно. Меняет только формулировки: item_id, статусы, решения редактора,
источники и лицензии остаются как есть. Идентификатор вопроса берётся из
question_id, а не из card_id, иначе строки карточек получают чужие вопросы.
"""
from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MATRICES = [
    ROOT / "reviews" / "new-subjects-review-matrix.csv",
    ROOT / "reviews" / "expanded-bank-review-matrix.csv",
]


def build_lookup() -> dict[str, str]:
    lookup: dict[str, str] = {}
    for bank in sorted((ROOT / "content" / "pilot").glob("*/*.json")):
        for item in json.loads(bank.read_text(encoding="utf-8")):
            item_id = item.get("question_id") or item.get("card_id")
            text = item.get("title") or item.get("prompt_ru")
            if not item_id or not text:
                continue
            if item_id in lookup and lookup[item_id] != text:
                raise SystemExit(f"Конфликт формулировок для {item_id} в {bank}")
            lookup[item_id] = text
    return lookup


def main() -> int:
    lookup = build_lookup()
    total = 0
    for path in MATRICES:
        if not path.exists():
            print(f"Нет файла: {path.relative_to(ROOT)}")
            continue
        with path.open(encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            fields = list(reader.fieldnames or [])
            rows = list(reader)
        if "title_or_prompt" not in fields or "item_id" not in fields:
            raise SystemExit(f"Неожиданные столбцы в {path.name}: {fields}")
        missing = [r["item_id"] for r in rows if r["item_id"] not in lookup]
        if missing:
            raise SystemExit(f"{path.name}: идентификаторы отсутствуют в банках: {missing}")
        changed = 0
        for row in rows:
            correct = lookup[row["item_id"]]
            if row["title_or_prompt"] != correct:
                row["title_or_prompt"] = correct
                changed += 1
        if changed:
            with path.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=fields)
                writer.writeheader()
                writer.writerows(rows)
        total += changed
        print(f"{path.relative_to(ROOT)}: строк {len(rows)}, исправлено формулировок {changed}")
    print(f"Всего исправлено: {total}. Статусы и решения редактора не изменены.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
