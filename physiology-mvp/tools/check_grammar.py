#!/usr/bin/env python3
"""Check Russian text for recurring grammar, punctuation and typography errors.

Complements tools/spellcheck.py: the dictionary catches unknown words, this
script catches agreement, spacing and dash/quote problems. Reports only.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CYRILLIC = re.compile(r"[А-Яа-яЁё]")

# (name, regex, hint)
RULES: list[tuple[str, re.Pattern[str], str]] = [
    ("предлог", re.compile(r"\bс (степенью|стороны|слов|согласия|скоростью)\b", re.I), "нужно «со»"),
    ("в течении", re.compile(r"\bв течении\b", re.I), "предлог пишется «в течение»"),
    ("в продолжении", re.compile(r"\bв продолжении\b", re.I), "предлог пишется «в продолжение»"),
    ("по приезду", re.compile(r"\bпо (приезду|приходу|возвращению)\b", re.I), "предлог требует «по приезде»"),
    ("согласно", re.compile(r"\bсогласно (приказа|порядка|плана|правила)\b", re.I), "согласно требует дательного падежа"),
    ("более лучший", re.compile(r"\bболее (лучше|лучший|худше)\b", re.I), "двойная сравнительная степень"),
    ("два пробела", re.compile(r"[А-Яа-яЁё] {2,}[А-Яа-яЁё]"), "лишний пробел"),
    ("пробел перед знаком", re.compile(r"[А-Яа-яЁё] +[,.;:!?]"), "пробел перед знаком препинания"),
    ("нет пробела после запятой", re.compile(r"[А-Яа-яЁё],[А-Яа-яЁё]"), "нужен пробел после запятой"),
    ("нет пробела после точки", re.compile(r"[А-Яа-яЁё]{3}\.[А-Яа-яЁё]"), "нужен пробел после точки"),
    ("дефис вместо тире", re.compile(r"[А-Яа-яЁё] - [А-Яа-яЁё]"), "в русском тексте нужно тире «—»"),
    ("двойное тире", re.compile(r"—\s*—"), "повтор тире"),
    # Атрибуты JSX/HTML (aria-label="…") — это код, а не текст статьи.
    ("прямые кавычки", re.compile(r'(?<![=\w])"[А-Яа-яЁё][^"<>{}]{2,}"'), "в русском тексте нужны «ёлочки»"),
    ("латиница в слове", re.compile(r"[А-Яа-яЁё]+[a-zA-Z]+[А-Яа-яЁё]*|[a-zA-Z]+[А-Яа-яЁё]+"), "смешение алфавитов"),
    ("повтор слова", re.compile(r"\b([А-Яа-яЁё]{4,})\s+\1\b", re.I), "повтор слова подряд"),
    ("точка в конце заголовка", re.compile(r"^[А-ЯA-Z][^.!?]{5,}\.$"), "проверить заголовок"),
    ("двойной знак", re.compile(r"[,;]{2,}|\.{2,}(?!\.)|[!?]{3,}"), "повтор знака препинания"),
    ("число без пробела", re.compile(r"\d(?:м|км|см|мм|кг|г|ч|мин|с)(?=[ ,.;:!?)]|$)"), "между числом и единицей нужен пробел"),
    ("тире без пробела", re.compile(r"[А-Яа-яЁё]—|—[А-Яа-яЁё]"), "тире отделяется пробелами"),
    ("строчная после точки", re.compile(r"[А-Яа-яЁё]\. [а-яё]{3,}"), "предложение начинается с заглавной"),
]

# Парность скобок и кавычек проверяется отдельно: регулярного выражения мало.
PAIRS = [("«", "»"), ("(", ")")]

CHAT = re.compile(r"^(Верно:|Конечно[,!.]|Безусловно[,!.])")


def collect() -> list[tuple[str, str, bool]]:
    """Return (location, text, is_title)."""
    out: list[tuple[str, str, bool]] = []
    for path in sorted((ROOT / "content" / "pilot").glob("*/*.json")):
        for item in json.loads(path.read_text(encoding="utf-8")):
            iid = item.get("card_id") or item.get("question_id") or "?"
            base = f"{path.parent.name}/{path.name}:{iid}"
            for key in ("title", "body_ru", "prompt_ru", "explanation_correct_ru", "change_note_ru"):
                if isinstance(item.get(key), str):
                    out.append((f"{base}:{key}", item[key], key == "title"))
            for chain in item.get("key_chain_ru", []):
                out.append((f"{base}:key_chain_ru", chain, True))
            for opt in item.get("options", []):
                for key in ("text_ru", "explanation_ru", "hint_ru"):
                    if isinstance(opt.get(key), str):
                        out.append((f"{base}:{opt['option_id']}.{key}", opt[key], False))
    for name in ("App.tsx", "content.ts", "session.ts"):
        path = ROOT / "apps" / "web" / "src" / name
        for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            if CYRILLIC.search(line):
                out.append((f"apps/web/src/{name}:{n}", line, False))
    return out


def main() -> int:
    findings = 0
    for location, text, is_title in collect():
        for name, pattern, hint in RULES:
            if name == "точка в конце заголовка" and not is_title:
                continue
            if name != "точка в конце заголовка" and is_title:
                continue
            for match in pattern.finditer(text):
                findings += 1
                start = max(0, match.start() - 40)
                end = min(len(text), match.end() + 40)
                print(f"[{name}] {location}\n    …{text[start:end].strip()}…\n    {hint}")
        if CHAT.match(text):
            findings += 1
            print(f"[префикс бота] {location}\n    {text[:90]}")
        if not is_title:
            for left, right in PAIRS:
                if text.count(left) != text.count(right):
                    findings += 1
                    print(f"[парность {left}{right}] {location}\n    …{text[:110]}…")
    print(f"\nНайдено замечаний: {findings}")
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
