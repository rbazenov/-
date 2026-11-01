#!/usr/bin/env python3
"""Create starter banks for tourism and topography.

Idempotent: overwrites the two new subject folders only. Does not touch muscle.
All new items are draft. Sources are public-domain U.S. government materials or
MChS pages whose site footer declares CC BY 4.0. Russian university texts are
curriculum references only and are not copied into these banks.
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ACCESS_DATE = "2026-11-01"

NPS_LICENSE_URL = "https://www.nps.gov/aboutus/disclaimer.htm"
USGS_LICENSE_URL = "https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits"
CC_BY_URL = "https://creativecommons.org/licenses/by/4.0/"
MCHS_LICENSE_URL = "https://mchs.gov.ru/chek-listy/informaciya-o-sayte/ob-ispolzovanii-informacii-sayta-i-obrabotke-personalnyh-dannyh"

SOURCES = {
    "nps_trip_planning": {
        "source_title": "NPS Trip Planning Guide",
        "publisher": "U.S. National Park Service",
        "year": 2026,
        "source_url": "https://www.nps.gov/subjects/healthandsafety/trip-planning-guide.htm",
        "chapter_url": "https://www.nps.gov/subjects/healthandsafety/upload/Trip-Planning-Guide-Package-508c.pdf",
        "locator": "Trip Planning Guide: before, during and after the trip; проверено 01.11.2026",
        "license": "Public domain (U.S. government work)",
        "license_url": NPS_LICENSE_URL,
        "required_notice": "Источник: U.S. National Park Service. Материал подготовлен сотрудниками NPS и находится в общественном достоянии США; логотипы и сторонние изображения не использованы.",
        "copyright_notice": "Служебные материалы NPS обычно находятся в общественном достоянии США, если не указано иное; сторонние материалы и логотипы исключены.",
    },
    "nps_ten_essentials": {
        "source_title": "Ten Essentials",
        "publisher": "U.S. National Park Service",
        "year": 2026,
        "source_url": "https://www.nps.gov/articles/10essentials.htm",
        "chapter_url": "https://www.nps.gov/articles/10essentials.htm",
        "locator": "Ten Essentials: ten categories/systems; проверено 01.11.2026",
        "license": "Public domain (U.S. government work)",
        "license_url": NPS_LICENSE_URL,
        "required_notice": "Источник: U.S. National Park Service. Материал подготовлен сотрудниками NPS и находится в общественном достоянии США; логотипы и сторонние изображения не использованы.",
        "copyright_notice": "Служебные материалы NPS обычно находятся в общественном достоянии США, если не указано иное; сторонние материалы и логотипы исключены.",
    },
    "nps_wilderness_safety": {
        "source_title": "Wilderness Safety — Olympic National Park",
        "publisher": "U.S. National Park Service",
        "year": 2026,
        "source_url": "https://www.nps.gov/olym/planyourvisit/wilderness-safety.htm",
        "chapter_url": "https://www.nps.gov/olym/planyourvisit/wilderness-safety.htm",
        "locator": "Wilderness Safety: itinerary, weakest member, turn back, bad weather; проверено 01.11.2026",
        "license": "Public domain (U.S. government work)",
        "license_url": NPS_LICENSE_URL,
        "required_notice": "Источник: U.S. National Park Service. Материал подготовлен сотрудниками NPS и находится в общественном достоянии США; логотипы и сторонние изображения не использованы.",
        "copyright_notice": "Служебные материалы NPS обычно находятся в общественном достоянии США, если не указано иное; сторонние материалы и логотипы исключены. Парковые рекомендации не выдаются за нормы РФ.",
    },
    "nps_compass_course": {
        "source_title": "Compass Course — Using a Compass",
        "publisher": "U.S. National Park Service",
        "year": 2024,
        "source_url": "https://www.nps.gov/teachers/classrooms/compass-course.htm",
        "chapter_url": "https://www.nps.gov/buff/learn/education/classrooms/upload/Compass_Course_508.pdf",
        "locator": "Compass Course: azimuth/bearing, compass parts, GPS backup; проверено 01.11.2026",
        "license": "Public domain (U.S. government work)",
        "license_url": NPS_LICENSE_URL,
        "required_notice": "Источник: U.S. National Park Service. Материал подготовлен сотрудниками NPS и находится в общественном достоянии США; логотипы и сторонние изображения не использованы.",
        "copyright_notice": "Служебные материалы NPS обычно находятся в общественном достоянии США, если не указано иное; сторонние материалы и логотипы исключены.",
    },
    "nps_navigating_time": {
        "source_title": "Navigating Through Time: From Wayfinding to Satellite",
        "publisher": "U.S. National Park Service",
        "year": 2016,
        "source_url": "https://www.nps.gov/common/uploads/teachers/lessonplans/Navigating_Through_Time_ver20160526_508.pdf",
        "chapter_url": "https://www.nps.gov/common/uploads/teachers/lessonplans/Navigating_Through_Time_ver20160526_508.pdf",
        "locator": "How to use a compass: housing, orienting arrow, direction-of-travel arrow; проверено 01.11.2026",
        "license": "Public domain (U.S. government work)",
        "license_url": NPS_LICENSE_URL,
        "required_notice": "Источник: U.S. National Park Service. Использован только служебный текст о компасе; сторонние фото, рисунки и комиксы не использованы.",
        "copyright_notice": "Служебные материалы NPS обычно находятся в общественном достоянии США, если не указано иное; сторонние материалы и логотипы исключены.",
    },
    "usgs_topo_symbols": {
        "source_title": "Topographic Map Symbols",
        "publisher": "U.S. Geological Survey",
        "year": 2026,
        "source_url": "https://www.usgs.gov/media/files/topographic-map-symbols",
        "chapter_url": "https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/atoms/files/Topographic%20Map%20Symbols.pdf",
        "locator": "What is a Topographic Map? Reading Topographic Maps; проверено 01.11.2026",
        "license": "Public domain",
        "license_url": USGS_LICENSE_URL,
        "required_notice": "Credit: U.S. Geological Survey, U.S. Department of the Interior.",
        "copyright_notice": "Материалы, подготовленные USGS, обычно находятся в общественном достоянии США; сторонние изображения могут иметь отдельные права.",
    },
    "usgs_finding_way": {
        "source_title": "Finding Your Way With Map and Compass",
        "publisher": "U.S. Geological Survey",
        "year": 2001,
        "source_url": "https://www.usgs.gov/educational-resources/finding-your-way-map-and-compass",
        "chapter_url": "https://pubs.usgs.gov/fs/2001/0035/report.pdf",
        "locator": "Map scale, cardinal points, bearing; проверено 01.11.2026",
        "license": "Public domain",
        "license_url": USGS_LICENSE_URL,
        "required_notice": "Credit: U.S. Geological Survey, U.S. Department of the Interior.",
        "copyright_notice": "Материалы, подготовленные USGS, обычно находятся в общественном достоянии США; сторонние изображения могут иметь отдельные права.",
    },
    "mchs_51_recommendations": {
        "source_title": "Рекомендации туристским и альпинистским группам",
        "publisher": "ГУ МЧС России по Мурманской области",
        "year": 2026,
        "source_url": "https://51.mchs.gov.ru/deyatelnost/poleznaya-informaciya/registraciya-turistskih-grupp/rekomendacii-turistskim-i-alpinistskim-gruppam",
        "chapter_url": "https://51.mchs.gov.ru/deyatelnost/poleznaya-informaciya/registraciya-turistskih-grupp/rekomendacii-turistskim-i-alpinistskim-gruppam",
        "locator": "Пункты 1–13: безопасный маршрут, темп по слабейшему, видимость, усталость, регистрация; проверено 01.11.2026",
        "license": "CC BY 4.0",
        "license_url": CC_BY_URL,
        "required_notice": "Источник: ГУ МЧС России по Мурманской области. Адаптация: учебный проект, 2026. Материалы сайта МЧС России доступны по CC BY 4.0 (указано в футере сайта).",
        "copyright_notice": "В футере сайта МЧС России указано: все материалы сайта доступны по лицензии Creative Commons Attribution 4.0.",
    },
    "mchs_33_registration": {
        "source_title": "МЧС России напоминает о необходимости регистрации туристов и туристических групп",
        "publisher": "ГУ МЧС России по Владимирской области",
        "year": 2025,
        "source_url": "https://33.mchs.gov.ru/deyatelnost/press-centr/novosti/5540927",
        "chapter_url": "https://33.mchs.gov.ru/deyatelnost/press-centr/novosti/5540927",
        "locator": "19.06.2025: 10 рабочих дней, состав заявки, подтверждение регистрации, уведомление о возвращении; проверено 01.11.2026",
        "license": "CC BY 4.0",
        "license_url": CC_BY_URL,
        "required_notice": "Источник: ГУ МЧС России по Владимирской области, 19.06.2025. Адаптация: учебный проект, 2026. Материалы сайта МЧС России доступны по CC BY 4.0 (указано в футере сайта).",
        "copyright_notice": "В футере сайта МЧС России указано: все материалы сайта доступны по лицензии Creative Commons Attribution 4.0. Срок и форму подачи нужно сверять с актуальным порядком МЧС.",
    },
}


def attribution(source_id: str, changes: str) -> dict:
    s = SOURCES[source_id]
    return {
        "source_title": s["source_title"],
        "editor": None,
        "publisher": s["publisher"],
        "year": s["year"],
        "source_url": s["source_url"],
        "chapter_url": s["chapter_url"],
        "locator": s["locator"],
        "copyright_notice": s["copyright_notice"],
        "license": s["license"],
        "license_url": s["license_url"],
        "required_notice": s["required_notice"],
        "changes_ru": changes,
        "no_endorsement_ru": "Источник не проверял и не одобрял эту учебную адаптацию. Материал остаётся черновиком до предметной редактуры.",
    }


def source_ref(source_id: str, locator: str | None = None) -> dict:
    s = SOURCES[source_id]
    ref = {"source_id": source_id, "url": s["chapter_url"], "title": s["source_title"]}
    if locator:
        ref["locator"] = locator
    return ref


def card(topic: str, num: int, title: str, body: str, chain: list[str], primary: str, refs: list[tuple[str, str]], changes: str) -> dict:
    cid = f"card-{topic.lower()}-{num:02d}-v1"
    obj = f"{topic.upper()}-{num:02d}"
    return {
        "card_id": cid,
        "topic_id": topic.lower(),
        "learning_objective_id": obj,
        "title": title,
        "body_ru": body,
        "key_chain_ru": chain,
        "source_refs": [source_ref(sid, loc) for sid, loc in refs],
        "source_locator": SOURCES[primary]["locator"],
        "asset_refs": [],
        "license": SOURCES[primary]["license"],
        "adaptation_type": "original_russian_summary_from_verified_source",
        "change_note_ru": changes,
        "review_status": "draft",
        "reviewer": None,
        "version": 1,
        "attribution": attribution(primary, changes),
    }


def option(oid: str, text: str, correct: bool, explanation: str, hint: str | None = None) -> dict:
    return {
        "option_id": oid,
        "text_ru": text,
        "is_correct": correct,
        "explanation_ru": explanation,
        "hint_ru": None if correct else (hint or "Вернитесь к карточке и выделите главный критерий выбора."),
    }


def question(topic: str, card_num: int, variant: int, prompt: str, options: list[dict], difficulty: str, role: str, tags: list[str], primary: str, refs: list[tuple[str, str]], changes: str) -> dict:
    obj = f"{topic.upper()}-{card_num:02d}"
    cid = f"card-{topic.lower()}-{card_num:02d}-v1"
    qid = f"q-{topic.lower()}-{card_num:02d}-{variant:02d}-v1" if role == "practice" else f"d-{topic.lower()}-{card_num:02d}-v1"
    correct = next(o for o in options if o["is_correct"])
    return {
        "question_id": qid,
        "learning_objective_id": obj,
        "card_id": cid,
        "prompt_ru": prompt,
        "options": options,
        "correct_option_id": correct["option_id"],
        "explanation_correct_ru": correct["explanation_ru"],
        "difficulty": difficulty,
        "assessment_role": role,
        "misconception_tags": tags,
        "source_id": primary,
        "source_refs": [source_ref(sid, loc) for sid, loc in refs],
        "license": SOURCES[primary]["license"],
        "adaptation_type": "original_question_based_on_source",
        "review_status": "draft",
        "reviewer": None,
        "version": 1,
        "attribution": attribution(primary, changes),
    }


def write_subject(folder: str, cards: list[dict], practice: list[dict], delayed: list[dict]) -> None:
    from style_pass import process_item

    out = ROOT / "content" / "pilot" / folder
    out.mkdir(parents=True, exist_ok=True)
    for name, data in [("cards.json", cards), ("questions.json", practice), ("delayed_checks.json", delayed)]:
        for item in data:
            process_item(item)
        (out / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def tourism() -> None:
    cards = [
        card(
            "tour", 1,
            "Спортивно-оздоровительный туризм: цель и границы",
            "Спортивно-оздоровительный туризм в этом модуле — учебные походы и активный отдых, где важны посильная нагрузка, туристские навыки и безопасность, а не спортивный разряд. Маршрут выбирают по подготовке участников, погоде и наличию безопасных выходов. Оздоровительный эффект не возникает автоматически: перегрузка, неподходящее снаряжение и игнорирование условий могут навредить. Поэтому план строят от возможностей группы, а не от желания пройти дистанцию любой ценой.",
            ["Цель похода", "Возможности группы", "Посильный маршрут", "Безопасное возвращение"],
            "nps_wilderness_safety",
            [("nps_wilderness_safety", "itinerary, weakest member, turn back"), ("mchs_51_recommendations", "пункты 1–7")],
            "Оригинальное русское резюме: цель и границы учебного модуля сформулированы через безопасность и посильность; парковые советы США не выдаются за нормы РФ.",
        ),
        card(
            "tour", 2,
            "План похода и уведомление МЧС",
            "До выхода фиксируют маршрут, сроки, состав группы, контакты, места ночевок, опасные участки, аварийные выходы и порядок связи. Полезно оставить план доверенному человеку и договориться о контрольном времени. Для маршрутов повышенного риска в России действует порядок информирования МЧС: региональные памятки 2025 года указывают срок не позднее чем за 10 рабочих дней до начала. Актуальный срок, форму и исключения нужно проверять на сайте МЧС перед подачей. После возвращения группу снимают с контроля по уведомлению участников.",
            ["План маршрута", "Контакты и сроки", "Уведомление МЧС", "Сообщение о возвращении"],
            "mchs_33_registration",
            [("mchs_33_registration", "10 рабочих дней, состав заявки, возвращение"), ("nps_trip_planning", "trusted contact, backup plan")],
            "Оригинальное русское резюме российского порядка регистрации и общего планирования; срок приведён по памятке МЧС 2025 года с оговоркой о проверке актуальности.",
        ),
        card(
            "tour", 3,
            "Снаряжение: десять систем",
            "Подход «десять систем» помогает не забыть базовые функции: навигация, защита от солнца, дополнительная одежда, свет, аптечка, огонь, ремонтный набор, запас еды, вода и её обработка, аварийное укрытие. Конкретные вещи зависят от маршрута, сезона и длительности. Перед выходом проверьте исправность снаряжения, запас батарей, срок годности аптечки и умение пользоваться картой и компасом. Бумажная карта и компас остаются резервом, даже если есть телефон или GPS.",
            ["Функция безопасности", "Подбор под маршрут", "Проверка исправности", "Резерв навигации"],
            "nps_ten_essentials",
            [("nps_ten_essentials", "ten categories/systems"), ("nps_trip_planning", "check gear, battery")],
            "Оригинальное русское резюме десяти категорий NPS; список адаптирован как проверка функций, а не универсальный перечень предметов.",
        ),
        card(
            "tour", 4,
            "Группа на маршруте: темп, видимость, разворот",
            "Темп движения задаёт не самый сильный, а самый уставший или менее подготовленный участник. Группу не разделяют без отдельного плана и связи; на привалах проверяют людей и снаряжение. При тумане, метели, темноте, признаках сильной усталости или ухудшении погоды движение может стать опаснее остановки. Разворот или ожидание включают в план заранее. Если связь пропала или маршрут потерян, группа действует по заранее оговорённому аварийному плану и не сокращает путь за счёт безопасности.",
            ["Слабейший участник", "Общий темп", "Контроль условий", "Разворот или укрытие"],
            "mchs_51_recommendations",
            [("mchs_51_recommendations", "пункты 4–11"), ("nps_wilderness_safety", "track location, turn back, bad weather")],
            "Оригинальное русское резюме рекомендаций МЧС и NPS о темпе, видимости и решении прекратить движение; конкретные горные советы не обобщены на все маршруты.",
        ),
    ]

    practice = []
    delayed = []

    def add(card_num, variant, prompt, opts, difficulty, tags, primary, refs, changes, role="practice"):
        q = question("tour", card_num, variant, prompt, opts, difficulty, role, tags, primary, refs, changes)
        (practice if role == "practice" else delayed).append(q)

    add(1, 1, "Что соответствует спортивно-оздоровительному подходу к учебному походу?", [
        option("a", "Пройти максимум километров, даже если группа устала", False, "Это ставит дистанцию выше безопасности и посильности.", "Ищите критерий, связанный с возможностями участников."),
        option("b", "Выбрать маршрут по подготовке группы и условиям", True, "Верно: посильность и безопасность важнее спортивного результата.", None),
        option("c", "Ориентироваться только на самого сильного участника", False, "Темп и сложность должны учитывать всю группу.", "Кто задаёт безопасный темп?"),
        option("d", "Считать любой поход автоматически полезным", False, "Польза зависит от нагрузки, условий и подготовки.", "Есть ли условия, при которых поход вредит?"),
    ], "baseline", ["goal_over_distance"], "nps_wilderness_safety", [("nps_wilderness_safety", "weakest member")], "Оригинальный вопрос по принципу посильности маршрута.")

    add(1, 2, "Группа планирует поход выходного дня. Какой план наиболее безопасен?", [
        option("a", "Маршрут с запасом времени и безопасным выходом", True, "Верно: запас времени и аварийный выход снижают риск срыва плана.", None),
        option("b", "Самый длинный маршрут без остановок", False, "Длина без учёта отдыха и выходов повышает риск.", "Что будет при усталости или погоде?"),
        option("c", "Маршрут, который прошёл один сильный студент", False, "Индивидуальный результат не равен возможностям группы.", "Чьи возможности нужно учитывать?"),
        option("d", "Маршрут без карты, потому что есть телефон", False, "Телефон может разрядиться или потерять связь.", "Нужен ли резерв навигации?"),
    ], "application", ["route_selection"], "mchs_51_recommendations", [("mchs_51_recommendations", "пункты 1–2")], "Оригинальный вопрос по выбору безопасного маршрута.")

    add(1, 3, "Почему оздоровительный эффект похода нельзя считать гарантированным?", [
        option("a", "Потому что туризм не связан с физической нагрузкой", False, "Поход обычно включает физическую нагрузку.", "Есть ли нагрузка в походе?"),
        option("b", "Потому что погода не влияет на организм", False, "Погода и условия напрямую влияют на риск.", "Что происходит при переохлаждении или жаре?"),
        option("c", "Потому что перегрузка и ошибки подготовки могут навредить", True, "Верно: эффект зависит от посильности, снаряжения и условий.", None),
        option("d", "Потому что важна только скорость прохождения", False, "Скорость не является главным критерием оздоровительного похода.", "Что важнее скорости?"),
    ], "application", ["health_not_automatic"], "nps_wilderness_safety", [("nps_wilderness_safety", "limitations, weather")], "Оригинальный вопрос о условиях оздоровительного эффекта.")

    add(2, 1, "Что нужно сделать до выхода на маршрут повышенного риска в России?", [
        option("a", "Сообщить маршрут только после возвращения", False, "Уведомление нужно до начала, чтобы спасатели знали план.", "Когда информация полезна для поиска?"),
        option("b", "Подать уведомление в МЧС в установленный срок", True, "Верно: для таких маршрутов действует порядок информирования МЧС.", None),
        option("c", "Оставить план только в телефоне руководителя", False, "План должен быть доступен доверенному контакту и службам.", "Кто увидит план, если телефон недоступен?"),
        option("d", "Не фиксировать аварийные выходы", False, "Аварийные выходы — важная часть заявки и плана.", "Что делать при срыве основного маршрута?"),
    ], "baseline", ["registration_required"], "mchs_33_registration", [("mchs_33_registration", "10 рабочих дней")], "Оригинальный вопрос о необходимости уведомления МЧС.")

    add(2, 2, "Какой срок указывают региональные памятки МЧС 2025 года для уведомления о маршруте повышенного риска?", [
        option("a", "Не позднее чем за 10 рабочих дней до начала", True, "Верно: такой срок указан в памятке; актуальность нужно проверять перед подачей.", None),
        option("b", "За 10 минут до старта", False, "Это не соответствует памятке о заблаговременном уведомлении.", "Срок измеряется минутами или днями?"),
        option("c", "В течение суток после возвращения", False, "После возвращения сообщают о завершении, а не подают первичное уведомление.", "Разделите уведомление до и сообщение после."),
        option("d", "Только если погода уже ухудшилась", False, "Срок уведомления связан с началом маршрута, а не с погодой.", "Когда подают заявку?"),
    ], "baseline", ["deadline_confusion"], "mchs_33_registration", [("mchs_33_registration", "10 рабочих дней")], "Оригинальный вопрос о сроке из памятки МЧС 2025 года с оговоркой об актуальности.")

    add(2, 3, "Что должно быть в плане похода для доверенного контакта и МЧС?", [
        option("a", "Только название региона", False, "Нужны маршрут, сроки, состав и связь.", "Что поможет найти группу?"),
        option("b", "Только список еды", False, "Снаряжение важно, но не заменяет маршрут и контакты.", "Какие данные нужны для поиска?"),
        option("c", "Маршрут, сроки, состав, контакты и аварийные выходы", True, "Верно: эти данные позволяют контролировать выход и искать группу при задержке.", None),
        option("d", "Только фото участников", False, "Фото не заменяют маршрут и контрольные сроки.", "Что важнее для поиска?"),
    ], "application", ["plan_contents"], "mchs_33_registration", [("mchs_33_registration", "состав заявки"), ("nps_trip_planning", "trip plan")], "Оригинальный вопрос о составе плана и заявки.")

    add(3, 1, "Что означает подход «снаряжение как системы»?", [
        option("a", "Купить самые дорогие вещи", False, "Цена не заменяет нужную функцию.", "Что должна обеспечивать вещь?"),
        option("b", "Проверить функции: навигация, тепло, свет, вода, аптечка и укрытие", True, "Верно: системы закрывают базовые риски маршрута.", None),
        option("c", "Взять только то, что помещается в карманы", False, "Объём важен, но не должен исключать жизненные функции.", "Что будет при ночёвке или травме?"),
        option("d", "Одинаковый список для любого сезона", False, "Состав зависит от сезона, маршрута и длительности.", "Меняются ли условия?"),
    ], "baseline", ["gear_systems"], "nps_ten_essentials", [("nps_ten_essentials", "ten categories")], "Оригинальный вопрос о функциональном подходе к снаряжению.")

    add(3, 2, "Перед выходом группа проверяет снаряжение. Что важнее всего?", [
        option("a", "Цвет рюкзаков", False, "Цвет вторичен по сравнению с исправностью и функциями.", "Что влияет на безопасность?"),
        option("b", "Наличие модных брендов", False, "Бренд не гарантирует пригодность к маршруту.", "Что нужно проверить практически?"),
        option("c", "Исправность, запас батарей, аптечка и умение пользоваться картой", True, "Верно: снаряжение должно работать и быть понятным группе.", None),
        option("d", "Вес только самого лёгкого участника", False, "Нагрузку распределяют по возможностям участников.", "Кто несёт групповое снаряжение?"),
    ], "application", ["gear_check"], "nps_ten_essentials", [("nps_ten_essentials", "check gear"), ("nps_trip_planning", "battery")], "Оригинальный вопрос о проверке снаряжения.")

    add(3, 3, "Почему бумажная карта остаётся полезной при наличии GPS?", [
        option("a", "GPS всегда ошибается", False, "GPS может работать точно, но зависит от питания и условий.", "Есть ли внешние зависимости?"),
        option("b", "Бумажная карта не требует батарей и служит резервом", True, "Верно: резерв навигации важен при отказе электроники.", None),
        option("c", "Карта заменяет аптечку", False, "Навигация и медицина — разные системы.", "Разделите функции снаряжения."),
        option("d", "Карта нужна только для соревнований", False, "Карта полезна в учебных и туристских походах.", "Где ещё нужна навигация?"),
    ], "application", ["navigation_backup"], "nps_ten_essentials", [("nps_ten_essentials", "navigation, physical map")], "Оригинальный вопрос о резерве навигации.")

    add(4, 1, "Кто задаёт безопасный темп движения группы?", [
        option("a", "Самый быстрый участник", False, "Быстрый темп может оторвать слабых участников.", "Кто рискует отстать?"),
        option("b", "Самый уставший или менее подготовленный участник", True, "Верно: темп по слабейшему сохраняет группу вместе.", None),
        option("c", "Тот, у кого больше снаряжения", False, "Вес не определяет безопасный темп для всех.", "Что важнее веса?"),
        option("d", "Случайный прохожий", False, "Темп определяется возможностями группы.", "Кто входит в группу?"),
    ], "baseline", ["pace_weakest"], "mchs_51_recommendations", [("mchs_51_recommendations", "пункт 5")], "Оригинальный вопрос о темпе по слабейшему участнику.")

    add(4, 2, "Туман усиливается, видимость падает. Какое решение лучше соответствует безопасности?", [
        option("a", "Ускориться и разделиться", False, "Разделение и спешка повышают риск потери людей.", "Что делает группу уязвимее?"),
        option("b", "Оценить условия, замедлиться, переждать или повернуть", True, "Верно: при плохой видимости движение может быть опаснее остановки.", None),
        option("c", "Идти по памяти без карты", False, "Память не заменяет контроль местоположения.", "Как проверить маршрут?"),
        option("d", "Продолжать любой ценой", False, "План должен допускать разворот или укрытие.", "Есть ли запасной вариант?"),
    ], "application", ["visibility_turnback"], "mchs_51_recommendations", [("mchs_51_recommendations", "пункты 9, 11"), ("nps_wilderness_safety", "bad weather")], "Оригинальный вопрос о решении при ухудшении видимости.")

    add(4, 3, "Участник показывает признаки сильной усталости на холоде. Что сделать в первую очередь?", [
        option("a", "Оставить его одного ждать группу", False, "Оставлять уставшего участника одного опасно.", "Что важнее сохранения темпа?"),
        option("b", "Прекратить опасное движение, укрыться и оценить состояние", True, "Верно: усталость на холоде требует остановки, укрытия и помощи.", None),
        option("c", "Увеличить темп, чтобы быстрее финишировать", False, "Увеличение нагрузки может ухудшить состояние.", "Что происходит при перегрузке?"),
        option("d", "Спрятать аптечку, чтобы не тратить время", False, "Аптечка и оценка состояния важны.", "Что нужно при ухудшении состояния?"),
    ], "application", ["fatigue_cold"], "mchs_51_recommendations", [("mchs_51_recommendations", "пункт 11")], "Оригинальный вопрос о действиях при усталости и холоде.")

    add(1, 1, "Через неделю группа вспоминает поход: маршрут был посильным, но один участок чуть не привёл к перегрузке. Какой вывод лучше всего переносится на следующий план?", [
        option("a", "В следующий раз идти ещё быстрее", False, "Скорость не устраняет причину перегрузки.", "Что вызвало риск?"),
        option("b", "Заранее учитывать слабые места группы и запасной вариант", True, "Верно: перенос опыта означает планировать по возможностям и иметь выход.", None),
        option("c", "Отказаться от любого планирования", False, "Планирование снижает риск повторения ошибки.", "Как не повторить ошибку?"),
        option("d", "Считать разряд главной целью", False, "В оздоровительном модуле важнее посильность и безопасность.", "Какова цель модуля?"),
    ], "transfer", ["goal_transfer"], "nps_wilderness_safety", [("nps_wilderness_safety", "lessons learned, weakest member")], "Оригинальный отложенный вопрос на перенос принципа посильности.", role="delayed_check")

    add(2, 1, "Группа подала уведомление в МЧС, но маршрут изменился до старта. Что лучше сделать?", [
        option("a", "Ничего: старая заявка всё равно действует", False, "Изменение маршрута требует актуализации информации.", "Что знают спасатели о новом плане?"),
        option("b", "Обновить сведения и сообщить доверенному контакту", True, "Верно: актуальный маршрут и контакты важны для контроля и поиска.", None),
        option("c", "Сообщить только после возвращения", False, "До выхода службы должны знать актуальный план.", "Когда информация нужна?"),
        option("d", "Удалить заявку", False, "Удаление не заменяет корректное уведомление.", "Как сохранить контроль?"),
    ], "transfer", ["registration_update"], "mchs_33_registration", [("mchs_33_registration", "состав заявки"), ("nps_trip_planning", "notify changes")], "Оригинальный отложенный вопрос об актуализации плана.", role="delayed_check")

    add(3, 1, "В походе разрядился телефон с единственной картой. Какая подготовка заранее снизила бы риск?", [
        option("a", "Взять только внешний аккумулятор без карты", False, "Аккумулятор полезен, но бумажная карта независима от питания.", "Есть ли полностью резервный способ?"),
        option("b", "Иметь бумажную карту, компас и запас питания", True, "Верно: резерв навигации и питания снижает зависимость от одного устройства.", None),
        option("c", "Надеяться на связь в любой точке", False, "Связь может отсутствовать.", "Можно ли гарантировать связь?"),
        option("d", "Оставить карту дома для облегчения рюкзака", False, "Облегчение не должно убирать базовую навигацию.", "Какая функция важна?"),
    ], "transfer", ["gear_transfer"], "nps_ten_essentials", [("nps_ten_essentials", "navigation, extra battery")], "Оригинальный отложенный вопрос о резерве навигации.", role="delayed_check")

    add(4, 1, "На обратном пути группа отстаёт от контрольного времени, погода ухудшается. Какое решение наиболее зрелое?", [
        option("a", "Разделиться, чтобы сильные ушли быстрее", False, "Разделение повышает риск и усложняет поиск.", "Что важнее скорости?"),
        option("b", "Оценить состояние, укрыться или повернуть и связаться по плану", True, "Верно: безопасность и связь важнее соблюдения графика любой ценой.", None),
        option("c", "Идти ночью без света", False, "Темнота без света резко повышает риск.", "Что нужно при темноте?"),
        option("d", "Скрыть задержку от контактов", False, "Контрольное время существует, чтобы сообщить о проблеме.", "Кто должен знать о задержке?"),
    ], "transfer", ["group_transfer"], "mchs_51_recommendations", [("mchs_51_recommendations", "пункты 7, 9, 11"), ("nps_trip_planning", "control time")], "Оригинальный отложенный вопрос о решении группы при задержке.", role="delayed_check")

    write_subject("tourism", cards, practice, delayed)


def topography() -> None:
    cards = [
        card(
            "topo", 1,
            "Топографическая карта: масштаб и знаки",
            "Топографическая карта показывает местность в уменьшенном виде: объекты, расстояния и форму поверхности. Масштаб 1:25 000 означает, что 1 см на карте соответствует 250 м на местности. Чем меньше знаменатель, тем крупнее масштаб и подробнее участок. Условные знаки читают по легенде конкретной карты: цвета и символы могут отличаться у разных серий. Перед выходом проверяют дату обновления, масштаб и легенду, а не полагаются на память о другой карте.",
            ["Карта", "Масштаб", "Легенда", "Проверка актуальности"],
            "usgs_topo_symbols",
            [("usgs_topo_symbols", "Reading Topographic Maps"), ("usgs_finding_way", "map scale")],
            "Оригинальное русское резюме USGS о масштабе, знаках и чтении карты; примеры пересчёта добавлены для учебного применения.",
        ),
        card(
            "topo", 2,
            "Рельеф: горизонтали и крутизна",
            "Горизонтали соединяют точки с одинаковой высотой. Разность высот между соседними горизонталями называют сечением рельефа; его указывают на карте. Если горизонтали расположены близко, склон обычно круче; если далеко — пологче. Утолщённые горизонтали помогают считать высоту. По рисунку горизонталей можно представить холм, долину или седловину, но для точного вывода смотрят подписи высот и легенду. Горизонтали не следует путать с дорогами или тропами.",
            ["Горизонтали", "Сечение рельефа", "Плотность линий", "Крутизна склона"],
            "usgs_topo_symbols",
            [("usgs_topo_symbols", "contours, contour interval, steep slopes")],
            "Оригинальное русское резюме USGS о горизонталях и крутизне; терминология адаптирована для учебного курса.",
        ),
        card(
            "topo", 3,
            "Компас и азимут",
            "Магнитная стрелка компаса помогает определить направление на север. Азимут — угол от северного направления по часовой стрелке до направления на объект; его выражают в градусах от 0 до 360. Различайте север карты и магнитный север: для точной работы учитывают поправку, если она указана. Компас держат вдали от металла и электроники, дают стрелке успокоиться и сверяют направление с ориентиром. При отказе GPS нужны карта и компас.",
            ["Стрелка компаса", "Север", "Азимут", "Проверка направления"],
            "nps_compass_course",
            [("nps_compass_course", "azimuth/bearing"), ("usgs_finding_way", "cardinal points, bearing"), ("nps_navigating_time", "compass parts")],
            "Оригинальное русское резюме NPS и USGS о компасе и азимуте; добавлена оговорка о магнитном и картографическом севере.",
        ),
        card(
            "topo", 4,
            "Ориентирование карты и контроль пути",
            "Ориентировать карту — значит совместить её направления с местностью. Это делают по компасу или по заметным ориентирам: дороге, реке, просеке, вершине. Затем сопоставляют объекты вокруг с картой и контролируют путь по линейным ориентирам, расстоянию и времени. Если место не узнаётся, лучше остановиться, восстановить последнюю известную точку и проверить направление, чем идти наугад. Электронная карта удобна, но должна иметь резерв: бумагу, компас и заряд.",
            ["Ориентирование карты", "Ориентиры", "Контроль пути", "Восстановление точки"],
            "nps_wilderness_safety",
            [("nps_wilderness_safety", "track location, lost"), ("usgs_finding_way", "topographic map, direction"), ("nps_compass_course", "GPS backup")],
            "Оригинальное русское резюме NPS и USGS о контроле местоположения; порядок действий при потере ориентировки дан как учебный алгоритм.",
        ),
    ]

    practice = []
    delayed = []

    def add(card_num, variant, prompt, opts, difficulty, tags, primary, refs, changes, role="practice"):
        q = question("topo", card_num, variant, prompt, opts, difficulty, role, tags, primary, refs, changes)
        (practice if role == "practice" else delayed).append(q)

    add(1, 1, "Что означает масштаб 1:25 000?", [
        option("a", "1 см на карте равен 250 м на местности", True, "Верно: 25 000 см = 250 м.", None),
        option("b", "1 см на карте равен 25 м на местности", False, "Это соответствовало бы масштабу 1:2 500.", "Переведите сантиметры в метры."),
        option("c", "1 см на карте равен 2,5 км на местности", False, "Это соответствовало бы масштабу 1:250 000.", "Сколько метров в 25 000 см?"),
        option("d", "Карта увеличена в 25 000 раз", False, "Масштаб показывает уменьшение, а не увеличение.", "Что делает карта с размерами местности?"),
    ], "baseline", ["scale_conversion"], "usgs_finding_way", [("usgs_finding_way", "map scale")], "Оригинальный вопрос о пересчёте масштаба.")

    add(1, 2, "Какая карта крупнее по масштабу?", [
        option("a", "1:100 000", False, "Больший знаменатель означает более мелкий масштаб.", "Сравните знаменатели."),
        option("b", "1:25 000", True, "Верно: меньший знаменатель даёт более крупный масштаб.", None),
        option("c", "1:200 000", False, "Это более мелкий масштаб.", "Где знаменатель меньше?"),
        option("d", "Масштаб не влияет на детальность", False, "Масштаб связан с степенью уменьшения и детальностью.", "Что показывает масштаб?"),
    ], "baseline", ["scale_comparison"], "usgs_finding_way", [("usgs_finding_way", "map scale")], "Оригинальный вопрос о сравнении масштабов.")

    add(1, 3, "Почему перед выходом смотрят легенду конкретной карты?", [
        option("a", "Все карты используют одинаковые цвета", False, "Цвета и символы могут отличаться у разных серий.", "Можно ли переносить знаки без проверки?"),
        option("b", "Условные знаки могут отличаться, и их смысл задан легендой", True, "Верно: легенда объясняет символы именно этой карты.", None),
        option("c", "Легенда заменяет компас", False, "Легенда объясняет знаки, но не определяет направление.", "Разделите функции легенды и компаса."),
        option("d", "Легенда нужна только для соревнований", False, "Легенда нужна при чтении любой тематической карты.", "Где ещё читают знаки?"),
    ], "application", ["legend_use"], "usgs_topo_symbols", [("usgs_topo_symbols", "symbols may differ")], "Оригинальный вопрос о необходимости легенды.")

    add(2, 1, "Что показывают горизонтали на топографической карте?", [
        option("a", "Точки с одинаковой высотой", True, "Верно: горизонталь соединяет точки равной высоты.", None),
        option("b", "Только дороги", False, "Дороги обозначают другими знаками.", "Что означает слово горизонталь?"),
        option("c", "Границы государств", False, "Границы имеют отдельные условные знаки.", "Связаны ли горизонтали с высотой?"),
        option("d", "Направление ветра", False, "Ветер не показывают горизонталями рельефа.", "Что показывает рельеф?"),
    ], "baseline", ["contour_definition"], "usgs_topo_symbols", [("usgs_topo_symbols", "contours")], "Оригинальный вопрос об определении горизонталей.")

    add(2, 2, "На карте горизонтали расположены очень близко. Что это обычно означает?", [
        option("a", "Пологий склон", False, "Пологий склон обычно даёт более редкие горизонтали.", "Как меняется высота на коротком расстоянии?"),
        option("b", "Крутой склон", True, "Верно: близкие горизонтали означают быстрое изменение высоты.", None),
        option("c", "Обязательно болото", False, "Болото обозначают отдельными знаками.", "Что именно показывает плотность горизонталей?"),
        option("d", "Отсутствие рельефа", False, "Отсутствие рельефа не даёт плотных горизонталей.", "Есть ли изменение высоты?"),
    ], "application", ["contour_density"], "usgs_topo_symbols", [("usgs_topo_symbols", "steep slopes")], "Оригинальный вопрос о крутизне по плотности горизонталей.")

    add(2, 3, "Что такое сечение рельефа?", [
        option("a", "Расстояние между соседними горизонталями по высоте", True, "Верно: это разность высот между соседними горизонталями.", None),
        option("b", "Длина маршрута в километрах", False, "Это расстояние, а не высотный интервал.", "Сечение связано с высотой или длиной?"),
        option("c", "Цвет карты", False, "Цвет не определяет высотный интервал.", "Что измеряют в метрах по высоте?"),
        option("d", "Количество дорог на карте", False, "Дороги не задают сечение рельефа.", "Что сравнивают между горизонталями?"),
    ], "baseline", ["contour_interval"], "usgs_topo_symbols", [("usgs_topo_symbols", "contour interval")], "Оригинальный вопрос о сечении рельефа.")

    add(3, 1, "Что такое азимут?", [
        option("a", "Угол от северного направления по часовой стрелке до направления на объект", True, "Верно: азимут отсчитывают от севера по часовой стрелке.", None),
        option("b", "Расстояние до объекта в метрах", False, "Расстояние и направление — разные величины.", "Азимут измеряют в метрах или градусах?"),
        option("c", "Высота объекта над уровнем моря", False, "Высота не является направлением.", "Что показывает компас?"),
        option("d", "Скорость движения группы", False, "Скорость не связана с определением азимута.", "Что измеряют в градусах?"),
    ], "baseline", ["azimuth_definition"], "nps_compass_course", [("nps_compass_course", "azimuth/bearing"), ("usgs_finding_way", "bearing")], "Оригинальный вопрос об определении азимута.")

    add(3, 2, "Какое направление соответствует азимуту 90 градусов?", [
        option("a", "Север", False, "Север соответствует 0 или 360 градусам.", "Откуда начинают отсчёт?"),
        option("b", "Восток", True, "Верно: восток находится на 90 градусах по часовой стрелке от севера.", None),
        option("c", "Юг", False, "Юг соответствует 180 градусам.", "Сколько градусов до юга?"),
        option("d", "Запад", False, "Запад соответствует 270 градусам.", "Пройдите круг по часовой стрелке."),
    ], "baseline", ["cardinal_azimuth"], "usgs_finding_way", [("usgs_finding_way", "north 0, east 90, south 180, west 270")], "Оригинальный вопрос о сторонах горизонта и азимуте.")

    add(3, 3, "Почему компас держат вдали от металла и электроники?", [
        option("a", "Чтобы стрелка не отклонялась от магнитного направления", True, "Верно: металл и устройства могут искажать показания стрелки.", None),
        option("b", "Чтобы компас стал тяжелее", False, "Вес не является целью.", "Что влияет на стрелку?"),
        option("c", "Чтобы карта стала крупнее", False, "Масштаб карты не меняется от положения компаса.", "Что именно искажается?"),
        option("d", "Чтобы не тратить батареи компаса", False, "Обычный магнитный компас не требует батарей.", "Как работает магнитная стрелка?"),
    ], "application", ["compass_interference"], "nps_compass_course", [("nps_compass_course", "compass reading"), ("nps_navigating_time", "compass needle")], "Оригинальный вопрос о помехах компасу.")

    add(4, 1, "Что значит ориентировать карту?", [
        option("a", "Совместить направления карты с направлениями местности", True, "Верно: карта должна быть развёрнута соответственно местности.", None),
        option("b", "Сложить карту пополам", False, "Складывание не связано с направлением.", "Что сравнивают с местностью?"),
        option("c", "Запомнить все названия", False, "Память полезна, но не заменяет ориентирование.", "Что делают с направлением карты?"),
        option("d", "Увеличить масштаб карты", False, "Масштаб уже задан картой.", "Меняется ли масштаб при повороте?"),
    ], "baseline", ["map_orientation"], "nps_wilderness_safety", [("nps_wilderness_safety", "track location"), ("usgs_finding_way", "direction")], "Оригинальный вопрос об ориентировании карты.")

    add(4, 2, "Группа перестала узнавать местность. Какой шаг наиболее разумен?", [
        option("a", "Идти быстрее в случайном направлении", False, "Случайное движение уводит от последней известной точки.", "Что нужно восстановить сначала?"),
        option("b", "Остановиться и восстановить последнюю известную точку", True, "Верно: остановка и анализ снижают риск уйти дальше от маршрута.", None),
        option("c", "Разделиться для поиска дороги", False, "Разделение повышает риск потери участников.", "Что важнее скорости поиска?"),
        option("d", "Выбросить карту", False, "Карта остаётся основным средством восстановления маршрута.", "Какой инструмент помогает?"),
    ], "application", ["lost_stop"], "nps_wilderness_safety", [("nps_wilderness_safety", "lost, stay put")], "Оригинальный вопрос о действиях при потере ориентировки.")

    add(4, 3, "Какой набор лучше поддерживает контроль пути?", [
        option("a", "Только телефон без резерва", False, "Телефон зависит от заряда и связи.", "Что будет при отказе устройства?"),
        option("b", "Карта, компас, ориентиры, расстояние и время", True, "Верно: сочетание инструментов и наблюдений помогает контролировать путь.", None),
        option("c", "Только скорость шага", False, "Скорость без направления не даёт контроля маршрута.", "Что ещё нужно кроме скорости?"),
        option("d", "Только название конечного пункта", False, "Название не показывает текущее положение.", "Как понять, где вы сейчас?"),
    ], "application", ["route_control"], "usgs_finding_way", [("usgs_finding_way", "map and compass"), ("nps_wilderness_safety", "track location")], "Оригинальный вопрос о контроле пути.")

    add(1, 1, "На карте 1:50 000 измерили 4 см до моста. Каково расстояние на местности?", [
        option("a", "200 м", False, "Это было бы верно для 1:5 000.", "Переведите 50 000 см в метры."),
        option("b", "2 км", True, "Верно: 1 см = 500 м, значит 4 см = 2 000 м.", None),
        option("c", "20 км", False, "Это завышение в десять раз.", "Сколько метров в одном сантиметре карты?"),
        option("d", "500 м", False, "Это расстояние для 1 см, а не для 4 см.", "Умножьте на число сантиметров."),
    ], "transfer", ["scale_transfer"], "usgs_finding_way", [("usgs_finding_way", "map scale")], "Оригинальный отложенный вопрос на пересчёт расстояния.", role="delayed_check")

    add(2, 1, "Сечение рельефа 10 м. Две точки лежат на горизонталях, между которыми четыре интервала сечения. Какова разность высот?", [
        option("a", "10 м", False, "Это один интервал, а не четыре.", "Сколько интервалов между точками?"),
        option("b", "20 м", False, "Это два интервала.", "Умножьте сечение на число интервалов."),
        option("c", "40 м", True, "Верно: 4 интервала по 10 м дают 40 м.", None),
        option("d", "100 м", False, "Это десять интервалов.", "Сколько интервалов указано?"),
    ], "transfer", ["contour_transfer"], "usgs_topo_symbols", [("usgs_topo_symbols", "contour interval, index contours")], "Оригинальный отложенный вопрос на расчёт разности высот.", role="delayed_check")

    add(3, 1, "Студент хочет идти на восток, но ставит на компасе 270 градусов. Какая ошибка допущена?", [
        option("a", "Выбран азимут запада вместо востока", True, "Верно: восток — 90 градусов, запад — 270.", None),
        option("b", "Выбран азимут севера", False, "Север — 0 или 360 градусов.", "Где находится восток на круге?"),
        option("c", "Азимут вообще не используется", False, "Азимут как раз задаёт направление.", "Что означает 270 градусов?"),
        option("d", "Ошибка только в единицах измерения", False, "Градусы верны, неверно выбрано направление.", "Сравните стороны горизонта."),
    ], "transfer", ["azimuth_transfer"], "usgs_finding_way", [("usgs_finding_way", "cardinal points")], "Оригинальный отложенный вопрос о переносе азимута на стороны горизонта.", role="delayed_check")

    add(4, 1, "После снегопада тропа исчезла, но на карте видна просека и известна последняя точка. Что лучше сделать?", [
        option("a", "Идти прямо без сверки с картой", False, "Без сверки легко уйти в сторону.", "Что помогает удержать направление?"),
        option("b", "Ориентировать карту, выбрать линейный ориентир и контролировать направление", True, "Верно: просека и ориентированная карта помогают восстановить контроль пути.", None),
        option("c", "Ждать, пока тропа снова станет видимой, без оценки условий", False, "Ожидание без оценки погоды и состояния может быть опасным.", "Что ещё нужно оценить?"),
        option("d", "Разделиться и искать тропу в разных сторонах", False, "Разделение повышает риск.", "Как сохранить группу?"),
    ], "transfer", ["orientation_transfer"], "nps_wilderness_safety", [("nps_wilderness_safety", "track location"), ("usgs_finding_way", "direction")], "Оригинальный отложенный вопрос о восстановлении контроля пути.", role="delayed_check")

    write_subject("topography", cards, practice, delayed)


if __name__ == "__main__":
    tourism()
    topography()
    print("Wrote tourism and topography starter banks: 4 cards / 12 practice / 4 delayed each. All draft.")
