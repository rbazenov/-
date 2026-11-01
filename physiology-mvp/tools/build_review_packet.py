#!/usr/bin/env python3
"""Build a subject-editor review packet from the draft muscle-physiology content.

The packet is for a human subject editor. It does not approve content and does
not change review_status in the JSON bank.
"""
from __future__ import annotations

import csv
import json
import re
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content" / "pilot" / "muscle"
OUT = ROOT / "reviews" / "muscle-reference-review.docx"
PACKET_DATE = "01.11.2026"
REFERENCE_OBJECTIVES = {"MUS-05", "MUS-07", "MUS-08"}
ACCENT = RGBColor(0x1F, 0x4E, 0x79)
MUTED = RGBColor(0x5A, 0x5A, 0x5A)


def load_json(name: str):
    return json.loads((CONTENT / name).read_text(encoding="utf-8"))


def load_objectives() -> dict[str, tuple[str, str]]:
    text = (ROOT / "docs" / "PILOT_MODULE.md").read_text(encoding="utf-8")
    result: dict[str, tuple[str, str]] = {}
    for match in re.finditer(r"^### (MUS-\d+)\. (.+)\n(.+)$", text, flags=re.MULTILINE):
        result[match.group(1)] = (match.group(2).strip(), match.group(3).strip())
    return result


def source_checked_on() -> str:
    path = ROOT / "sources" / "pilot-chapters.csv"
    with path.open(encoding="utf-8", newline="") as fh:
        rows = list(csv.DictReader(fh))
    dates = sorted({row["checked_on"] for row in rows if row.get("checked_on")})
    return ", ".join(dates) if dates else "не указана"


def shade(cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def para(doc, text: str = "", *, bold: bool = False, size: float | None = None,
         color: RGBColor | None = None, space_after: float = 6):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = bold
    if size:
        run.font.size = Pt(size)
    if color:
        run.font.color.rgb = color
    p.paragraph_format.space_after = Pt(space_after)
    return p


def bullet(doc, text: str):
    p = doc.add_paragraph(text, style="List Bullet")
    p.paragraph_format.space_after = Pt(3)
    return p


def checkline(doc, text: str):
    p = doc.add_paragraph()
    p.add_run("☐ ").font.size = Pt(11)
    p.add_run(text)
    p.paragraph_format.space_after = Pt(3)
    return p


def comment_box(doc, label: str = "Комментарий / правки по ID:") -> None:
    table = doc.add_table(rows=1, cols=1)
    table.style = "Table Grid"
    cell = table.cell(0, 0)
    shade(cell, "F7F9FC")
    cell.text = label + "\n\n"
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def meta_table(doc, rows: list[tuple[str, str]]) -> None:
    table = doc.add_table(rows=0, cols=2)
    table.style = "Table Grid"
    for key, value in rows:
        cells = table.add_row().cells
        cells[0].text = key
        cells[1].text = value
        shade(cells[0], "EEF3F8")
        for paragraph in cells[0].paragraphs:
            for run in paragraph.runs:
                run.bold = True
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def page_break(doc) -> None:
    doc.add_page_break()


def add_page_number(footer_paragraph) -> None:
    footer_paragraph.add_run("Стр. ")
    run = footer_paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = "PAGE"
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.append(begin)
    run._r.append(instr)
    run._r.append(end)


def option_letter(option_id: str) -> str:
    return option_id.upper()


def build() -> None:
    cards = [c for c in load_json("cards.json") if c["learning_objective_id"] in REFERENCE_OBJECTIVES]
    questions = [q for q in load_json("questions.json") if q["learning_objective_id"] in REFERENCE_OBJECTIVES]
    objectives = load_objectives()
    assert len(cards) == 3 and len(questions) == 9
    assert all(item["learning_objective_id"] in REFERENCE_OBJECTIVES for item in cards + questions)

    doc = Document()
    props = doc.core_properties
    props.title = "Физиология мышечной деятельности — предметная проверка эталонного комплекта"
    props.subject = "Черновик для предметного редактора"
    props.author = "Проект «Физиология человека»"
    props.comments = "Эталон отмечен как утверждённый со слов организатора; независимая предметная экспертиза не зафиксирована."

    normal = doc.styles["Normal"]
    normal.font.name = "Arial"
    normal.font.size = Pt(10.5)
    for name in ("Heading 1", "Heading 2", "Heading 3"):
        style = doc.styles[name]
        style.font.name = "Arial"
        style.font.color.rgb = ACCENT
    for section in doc.sections:
        section.top_margin = Cm(1.7)
        section.bottom_margin = Cm(1.7)
        section.left_margin = Cm(1.8)
        section.right_margin = Cm(1.8)
        header = section.header.paragraphs[0]
        header.text = "Физиология мышечной деятельности • редакторская проверка"
        header.runs[0].font.size = Pt(8)
        header.runs[0].font.color.rgb = MUTED
        footer = section.footer.paragraphs[0]
        footer.text = "Черновик • не для студентов • "
        footer.runs[0].font.size = Pt(8)
        footer.runs[0].font.color.rgb = MUTED
        add_page_number(footer)
        footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT

    # Cover.
    doc.add_heading("Предметная проверка эталонного комплекта", level=0)
    para(doc, "Модуль «Физиология мышечной деятельности»", bold=True, size=14, color=ACCENT)
    para(doc, "Для преподавателя / предметного редактора", size=12, color=MUTED)
    meta_table(doc, [
        ("Проект", "Мобильные карточки по физиологии человека"),
        ("Аудитория", "Студенты физфака ЧГИФК"),
        ("Комплект", "3 карточки • 9 тренировочных вопросов • ключи и подсказки"),
        ("Статус контента", "Approved со слов организатора; ФИО предметного редактора не предоставлено"),
        ("Механика прототипа", "Принята организатором 01.11.2026; это не утверждение содержания"),
        ("Дата комплекта", PACKET_DATE),
        ("Иллюстрации", "Иллюстрации учебника не использованы"),
    ])
    para(doc, "Ограничение: комплект отмечен как утверждённый со слов организатора. ФИО и компетенция предметного редактора не предоставлены; расширенный банк остаётся черновиком.", bold=True)
    doc.add_heading("Как проходить проверку", level=1)
    for text in [
        "Часть 1: проверьте научную корректность, терминологию и мобильную длину трёх карточек.",
        "Часть 2: оцените вопросы и варианты ответа без ключей: есть ли один однозначно лучший ответ.",
        "Часть 3: сверьте ключи, объяснения и подсказки; подсказка после первой ошибки не должна механически раскрывать ответ.",
        "Часть 4: внесите решение по каждому ID и общее решение. Если нужны правки, укажите точную замену или комментарий.",
    ]:
        bullet(doc, text)
    para(doc, "Проверка ИИ или организатора продукта не заменяет предметного редактора. Для расширенного банка статус approved появляется только после явного решения редактора.", color=MUTED)
    page_break(doc)

    # Part 1: cards.
    doc.add_heading("Часть 1. Теоретические карточки", level=1)
    para(doc, "Редакторская версия. Текст дан так, как он подготовлен для мобильного прототипа.", color=MUTED)
    for index, card in enumerate(cards, start=1):
        objective_id = card["learning_objective_id"]
        objective_title, objective_text = objectives.get(objective_id, (objective_id, ""))
        doc.add_heading(f"Карточка {index}/3 — {card['title']}", level=2)
        meta_table(doc, [
            ("ID", card["card_id"]),
            ("Учебная цель", f"{objective_id}. {objective_title}"),
            ("Версия / статус", f"v{card['version']} / {card['review_status']}"),
        ])
        if objective_text:
            para(doc, "Ожидаемый результат: " + objective_text, color=MUTED)
        doc.add_heading("Текст карточки", level=3)
        para(doc, card["body_ru"])
        doc.add_heading("Причинная цепочка", level=3)
        para(doc, " → ".join(card["key_chain_ru"]))
        doc.add_heading("Источник и адаптация", level=3)
        for ref in card["source_refs"]:
            bullet(doc, f"{ref['locator']} — {ref['url']}")
        para(doc, "Изменения: " + card["change_note_ru"])
        para(doc, "Лицензия: " + card["license"] + " — https://creativecommons.org/licenses/by/4.0/")
        para(doc, card["attribution"]["required_notice"], color=MUTED)
        para(doc, card["attribution"]["no_endorsement_ru"], color=MUTED)
        doc.add_heading("Отметки редактора", level=3)
        for text in [
            "Физиологический механизм корректен.",
            "Терминология соответствует курсу ЧГИФК.",
            "Длина и плотность текста подходят для мобильного экрана.",
            "Причинная цепочка не создаёт ложных упрощений.",
            "Атрибуция и отметка об адаптации сохранены.",
        ]:
            checkline(doc, text)
        comment_box(doc)
        if index < len(cards):
            page_break(doc)
    page_break(doc)

    # Part 2: questions without answer key.
    doc.add_heading("Часть 2. Вопросы без ключей", level=1)
    para(doc, "Сначала оцените формулировку и варианты ответа. Ключи и объяснения — в части 3.", color=MUTED)
    difficulty_ru = {"baseline": "базовый", "application": "применение", "transfer": "перенос"}
    for index, question in enumerate(questions, start=1):
        doc.add_heading(f"Вопрос {index}/9 — {question['question_id']}", level=2)
        meta_table(doc, [
            ("Учебная цель", question["learning_objective_id"]),
            ("Карточка", question["card_id"]),
            ("Уровень", difficulty_ru.get(question["difficulty"], question["difficulty"])),
            ("Роль", "тренировочный вопрос"),
        ])
        para(doc, question["prompt_ru"], bold=True)
        for option in question["options"]:
            para(doc, f"{option_letter(option['option_id'])}. {option['text_ru']}", space_after=4)
        doc.add_heading("Отметки редактора", level=3)
        for text in [
            "Есть один однозначно лучший ответ.",
            "Неправильные варианты правдоподобны, но не двусмысленны.",
            "Вопрос проверяет заявленную учебную цель.",
            "Сложность и спортивный контекст подходят аудитории.",
        ]:
            checkline(doc, text)
        comment_box(doc)
        if index < len(questions):
            page_break(doc)
    page_break(doc)

    # Part 3: answer key and feedback.
    doc.add_heading("Часть 3. Ключи и объяснения", level=1)
    para(doc, "Только для редактора. В студенческом интерфейсе правильный ответ после первой ошибки не раскрывается.", bold=True)
    for index, question in enumerate(questions, start=1):
        doc.add_heading(f"{index}. {question['question_id']}", level=2)
        correct = next(o for o in question["options"] if o["option_id"] == question["correct_option_id"])
        para(doc, f"Правильный ответ: {option_letter(correct['option_id'])}. {correct['text_ru']}", bold=True)
        para(doc, "Объяснение правильного ответа: " + question["explanation_correct_ru"])
        doc.add_heading("Разбор неправильных вариантов и подсказки", level=3)
        for option in question["options"]:
            if option["is_correct"]:
                continue
            para(doc, f"{option_letter(option['option_id'])}. {option['text_ru']}", bold=True, space_after=2)
            para(doc, "Разбор: " + option["explanation_ru"], space_after=2)
            if option.get("hint_ru"):
                para(doc, "Подсказка после первой ошибки: " + option["hint_ru"], color=MUTED, space_after=6)
        checkline(doc, "Ключ, объяснения и подсказки корректны; подсказка не раскрывает ответ механически.")
        comment_box(doc, "Правки к ключу / объяснениям / подсказкам:")
    page_break(doc)

    # Part 4: attribution and decision.
    doc.add_heading("Часть 4. Источники и решение редактора", level=1)
    attribution = cards[0]["attribution"]
    doc.add_heading("Атрибуция основного источника", level=2)
    para(doc, f"{attribution['source_title']} / ред. {attribution['editor']}. {attribution['publisher']}, {attribution['year']}.")
    para(doc, "Книга: " + attribution["source_url"])
    para(doc, "Главы: " + attribution["locator"])
    para(doc, attribution["copyright_notice"], color=MUTED)
    para(doc, "Лицензия: " + attribution["license"] + " — " + attribution["license_url"])
    para(doc, attribution["required_notice"])
    para(doc, "Изменения: " + attribution["changes_ru"])
    para(doc, attribution["no_endorsement_ru"], color=MUTED)
    para(doc, "Дата проверки источников по реестру: " + source_checked_on() + ". Отдельные иллюстрации не включены; их аудит не заменяет проверку текста.", color=MUTED)

    doc.add_heading("Сводное решение по элементам", level=2)
    para(doc, "Для каждого ID укажите: утвердить / нужны правки / отклонить. При правках опишите точную замену или проблему.", color=MUTED)
    table = doc.add_table(rows=1, cols=4)
    table.style = "Table Grid"
    headers = ["ID", "Тип", "Решение", "Комментарий"]
    for cell, text in zip(table.rows[0].cells, headers):
        cell.text = text
        shade(cell, "EEF3F8")
        for run in cell.paragraphs[0].runs:
            run.bold = True
    for card in cards:
        cells = table.add_row().cells
        cells[0].text = card["card_id"]
        cells[1].text = "карточка"
    for question in questions:
        cells = table.add_row().cells
        cells[0].text = question["question_id"]
        cells[1].text = "вопрос"
    doc.add_paragraph()

    doc.add_heading("Общее решение", level=2)
    for text in [
        "Эталонный комплект утверждён без правок.",
        "Эталонный комплект утверждён после внесения указанных правок.",
        "Требуется повторная проверка после правок.",
        "Комплект отклонён; причины указаны выше.",
    ]:
        checkline(doc, text)
    meta_table(doc, [
        ("Редактор (ФИО)", ""),
        ("Должность / компетенция", ""),
        ("Дата", ""),
        ("Критические замечания", ""),
    ])
    comment_box(doc, "Итоговый комментарий редактора:")
    para(doc, "После проверки: применить правки, зафиксировать редактора и дату. Расширенный банк уже подготовлен (16 карточек / 48 тренировочных / 12 отложенных вопросов), но остаётся черновиком до предметного утверждения.", color=MUTED)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT)
    print(f"Review packet: {OUT}")
    print(f"Cards: {len(cards)}; questions: {len(questions)}; reference set: organizer-reported approved")


if __name__ == "__main__":
    build()
