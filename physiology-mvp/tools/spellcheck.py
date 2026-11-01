#!/usr/bin/env python3
"""Spell-check the Russian text of the app: content banks, UI strings, docs.

Uses the Debian ru_RU hunspell dictionary via spylls. Domain terms and proper
names live in tools/spellcheck-allow.txt. The script reports unknown words with
context; it does not edit files.
"""
from __future__ import annotations

import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

from spylls.hunspell import Dictionary

ROOT = Path(__file__).resolve().parents[1]
ALLOW_FILE = ROOT / "tools" / "spellcheck-allow.txt"
# Порядок поиска словаря: переменная окружения, кэш рабочей области, системный путь.
DICT_CANDIDATES = [
    os.environ.get("RU_HUNSPELL_BASE"),
    str(Path.home() / ".cache" / "spell" / "ru" / "usr" / "share" / "hunspell" / "ru_RU"),
    "/usr/share/hunspell/ru_RU",
]


def find_dictionary_base() -> str:
    for candidate in DICT_CANDIDATES:
        if candidate and Path(candidate + ".dic").exists() and Path(candidate + ".aff").exists():
            return candidate
    sys.exit(
        "Словарь ru_RU не найден. Запустите tools/setup_spellcheck.sh "
        "или укажите RU_HUNSPELL_BASE=/путь/к/ru_RU."
    )
WORD = re.compile(r"[А-Яа-яЁё]+(?:-[А-Яа-яЁё]+)*")
CYRILLIC = re.compile(r"[А-Яа-яЁё]")


def load_allow() -> set[str]:
    if not ALLOW_FILE.exists():
        return set()
    words = set()
    for line in ALLOW_FILE.read_text(encoding="utf-8").splitlines():
        line = line.split("#", 1)[0].strip()
        if line:
            words.add(line.lower())
    return words


def texts_from_json(path: Path):
    data = json.loads(path.read_text(encoding="utf-8"))
    for item in data:
        iid = item.get("card_id") or item.get("question_id") or "?"
        for key in ("title", "body_ru", "prompt_ru", "explanation_correct_ru", "source_locator", "change_note_ru", "review_note_ru"):
            if isinstance(item.get(key), str):
                yield f"{path.name}:{iid}:{key}", item[key]
        for chain_item in item.get("key_chain_ru", []):
            yield f"{path.name}:{iid}:key_chain_ru", chain_item
        for opt in item.get("options", []):
            for key in ("text_ru", "explanation_ru", "hint_ru"):
                if isinstance(opt.get(key), str):
                    yield f"{path.name}:{iid}:{opt['option_id']}:{key}", opt[key]
        attribution = item.get("attribution", {})
        for key in ("source_title", "copyright_notice", "changes_ru", "no_endorsement_ru", "required_notice"):
            if isinstance(attribution.get(key), str):
                yield f"{path.name}:{iid}:attribution.{key}", attribution[key]
        for ref in item.get("source_refs", []):
            for key in ("title", "locator"):
                if isinstance(ref.get(key), str):
                    yield f"{path.name}:{iid}:source_refs.{key}", ref[key]


def texts_from_code(path: Path):
    """Pull single/double-quoted literals, JSX text and comments containing Cyrillic."""
    text = path.read_text(encoding="utf-8")
    for n, line in enumerate(text.splitlines(), start=1):
        if CYRILLIC.search(line):
            yield f"{path.relative_to(ROOT)}:{n}", line


# В отчёте о проверке исходные ошибки приводятся дословно: «пологче» → «пологий».
# Кавычки слева от стрелки — цитаты ошибок, а не текст приложения.
REPORT = "docs/SPELLCHECK.md"
QUOTED_BEFORE = re.compile(r"(?:«[^»]*»(?:,\s*)?)+(?=\s*→)")


def texts_from_markdown(path: Path):
    relative = path.relative_to(ROOT).as_posix()
    for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if relative == REPORT:
            line = QUOTED_BEFORE.sub("", line)
        if CYRILLIC.search(line):
            yield f"{relative}:{n}", line


def texts_from_csv(path: Path):
    import csv

    with path.open(encoding="utf-8", newline="") as handle:
        for n, row in enumerate(csv.reader(handle), start=1):
            for cell in row:
                if CYRILLIC.search(cell):
                    yield f"{path.relative_to(ROOT)}:{n}", cell


def main() -> int:
    dictionary = Dictionary.from_files(find_dictionary_base())
    allow = load_allow()
    unknown: dict[str, list[str]] = defaultdict(list)

    sources = []
    for path in sorted((ROOT / "content" / "pilot").glob("*/*.json")):
        sources.extend(texts_from_json(path))
    for name in ("App.tsx", "content.ts", "session.ts", "types.ts"):
        path = ROOT / "apps" / "web" / "src" / name
        if path.exists():
            sources.extend(texts_from_code(path))
    for path in [ROOT / "apps" / "web" / "index.html", ROOT / "apps" / "web" / "public" / "manifest.webmanifest"]:
        if path.exists():
            sources.extend(texts_from_code(path))
    for path in sorted((ROOT / "docs").glob("*.md")) + [ROOT / "README.md"]:
        sources.extend(texts_from_markdown(path))
    for path in sorted((ROOT / "reviews").glob("*.md")):
        sources.extend(texts_from_markdown(path))
    for folder in ("sources", "reviews"):
        for path in sorted((ROOT / folder).glob("*.csv")):
            sources.extend(texts_from_csv(path))

    for location, text in sources:
        for match in WORD.finditer(text):
            word = match.group(0)
            lower = word.lower()
            if lower in allow:
                continue
            parts = lower.split("-")
            if all(p in allow for p in parts if p):
                continue
            if dictionary.lookup(lower) or dictionary.lookup(word):
                continue
            if all(dictionary.lookup(p) or p in allow for p in parts if p) and "-" in lower:
                continue
            if len(unknown[lower]) < 4:
                start = max(0, match.start() - 45)
                end = min(len(text), match.end() + 45)
                unknown[lower].append(f"{location}: …{text[start:end].strip()}…")

    if not unknown:
        print("No unknown words.")
        return 0
    print(f"Unknown words: {len(unknown)}\n")
    for word in sorted(unknown):
        print(f"{word}")
        for sample in unknown[word][:2]:
            print(f"    {sample}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
