#!/usr/bin/env python3
"""Validate all pilot subject banks.

Muscle keeps the original Douglas attribution/approval contract. New subjects
are starter drafts and must not inherit organizer-reported physiology approval.
"""
from __future__ import annotations
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOUGLAS_NOTICE = "Download for free at https://pressbooks.bccampus.ca/dcbiol11031109"
REFERENCE_OBJECTIVES = {"MUS-05", "MUS-07", "MUS-08"}
CJK = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]")

SUBJECTS = [
    {
        "folder": "muscle",
        "prefix": "MUS",
        "cards": 16,
        "practice": 48,
        "delayed": 12,
        "practice_per_objective": 3,
        "delayed_per_objective": None,
        "allow_approved": True,
        "required_notice": DOUGLAS_NOTICE,
    },
    {
        "folder": "tourism",
        "prefix": "TOUR",
        "cards": 4,
        "practice": 12,
        "delayed": 4,
        "practice_per_objective": 3,
        "delayed_per_objective": 1,
        "allow_approved": False,
        "required_notice": None,
    },
    {
        "folder": "topography",
        "prefix": "TOPO",
        "cards": 4,
        "practice": 12,
        "delayed": 4,
        "practice_per_objective": 3,
        "delayed_per_objective": 1,
        "allow_approved": False,
        "required_notice": None,
    },
]


def fail(msg: str) -> None:
    raise SystemExit(f"CONTENT VALIDATION FAILED: {msg}")


def load(folder: str, name: str):
    path = ROOT / "content" / "pilot" / folder / name
    if not path.exists():
        fail(f"missing {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def item_id(item: dict) -> str:
    return item.get("card_id") or item.get("question_id") or "<unknown>"


def check_text_fields(item: dict, kind: str) -> None:
    for key, value in item.items():
        if isinstance(value, str) and CJK.search(value):
            fail(f"{kind} {item_id(item)} field {key} contains unexpected CJK characters")


def check_review(item: dict, kind: str, allow_approved: bool) -> None:
    status = item.get("review_status")
    obj = item.get("learning_objective_id")
    if status not in {"draft", "approved"}:
        fail(f"{kind} {item_id(item)} has unsupported review_status {status}")
    if status == "approved":
        if not allow_approved:
            fail(f"{kind} {item_id(item)} approved in a draft-only subject")
        if obj not in REFERENCE_OBJECTIVES:
            fail(f"{kind} {item_id(item)} approved outside organizer-reported reference set")
        if not item.get("reviewer"):
            fail(f"approved {kind} missing reviewer provenance")
        if not item.get("review_note_ru"):
            fail(f"approved {kind} missing review_note_ru")
    else:
        if item.get("reviewer") not in (None, ""):
            fail(f"draft {kind} should not name a reviewer")


def check_attribution(item: dict, kind: str, required_notice: str | None) -> None:
    attribution = item.get("attribution") or {}
    if required_notice is not None and attribution.get("required_notice") != required_notice:
        fail(f"{kind} {item_id(item)} missing required Douglas attribution notice")
    if required_notice is None and not attribution.get("required_notice"):
        fail(f"{kind} {item_id(item)} missing source attribution notice")
    for field in ["source_title", "publisher", "source_url", "chapter_url", "license", "license_url", "changes_ru", "no_endorsement_ru"]:
        if not attribution.get(field):
            fail(f"{kind} {item_id(item)} attribution missing {field}")
    if not item.get("source_refs"):
        fail(f"{kind} {item_id(item)} missing source refs")
    for ref in item["source_refs"]:
        if not ref.get("source_id") or not ref.get("url"):
            fail(f"{kind} {item_id(item)} source ref missing id/url")


def check_question(q: dict, card_ids: set[str], expected_role: str, allow_approved: bool, required_notice: str | None) -> None:
    qid = q["question_id"]
    if q["card_id"] not in card_ids:
        fail(f"question {qid} references unknown card")
    opts = q["options"]
    if len(opts) != 4:
        fail(f"question {qid} must have 4 options")
    ids = [o["option_id"] for o in opts]
    if ids != ["a", "b", "c", "d"]:
        fail(f"question {qid} option ids must be a,b,c,d in order")
    correct = [o for o in opts if o["is_correct"]]
    if len(correct) != 1:
        fail(f"question {qid} must have exactly one correct option")
    if correct[0]["option_id"] != q["correct_option_id"]:
        fail(f"question {qid} correct_option_id mismatch")
    for o in opts:
        if not o["explanation_ru"]:
            fail(f"question {qid} option {o['option_id']} missing explanation")
        if re.match(r"^(Верно:|Конечно[,!.]|Безусловно[,!.])", o["explanation_ru"]):
            fail(f"question {qid} option {o['option_id']} explanation starts with a chatbot-style prefix")
        if not o["is_correct"] and not o.get("hint_ru"):
            fail(f"question {qid} wrong option {o['option_id']} missing hint")
        if CJK.search(o.get("text_ru", "")) or CJK.search(o.get("explanation_ru", "")):
            fail(f"question {qid} option contains unexpected CJK characters")
    if re.match(r"^(Верно:|Конечно[,!.]|Безусловно[,!.])", q.get("explanation_correct_ru", "")):
        fail(f"question {qid} explanation_correct_ru starts with a chatbot-style prefix")
    if q["assessment_role"] != expected_role:
        fail(f"question {qid} must have assessment_role={expected_role}")
    check_text_fields(q, "question")
    check_review(q, "question", allow_approved)
    check_attribution(q, "question", required_notice)


def validate_subject(spec: dict) -> tuple[int, int, int, int, int]:
    folder = spec["folder"]
    cards = load(folder, "cards.json")
    questions = load(folder, "questions.json")
    delayed = load(folder, "delayed_checks.json")
    if len(cards) != spec["cards"]:
        fail(f"{folder}: expected {spec['cards']} cards, got {len(cards)}")
    if len(questions) != spec["practice"]:
        fail(f"{folder}: expected {spec['practice']} practice questions, got {len(questions)}")
    if len(delayed) != spec["delayed"]:
        fail(f"{folder}: expected {spec['delayed']} delayed checks, got {len(delayed)}")

    expected_objectives = {f"{spec['prefix']}-{i:02d}" for i in range(1, spec["cards"] + 1)}
    card_ids = set()
    objectives = set()
    for c in cards:
        cid = c["card_id"]
        if cid in card_ids:
            fail(f"{folder}: duplicate card id {cid}")
        card_ids.add(cid)
        objectives.add(c["learning_objective_id"])
        if not (250 <= len(c["body_ru"]) <= 750):
            fail(f"{folder}: card {cid} body length {len(c['body_ru'])} outside pilot range")
        if c["asset_refs"]:
            fail(f"{folder}: card {cid} uses assets before asset license audit")
        if not c.get("key_chain_ru"):
            fail(f"{folder}: card {cid} missing key chain")
        check_text_fields(c, "card")
        check_review(c, "card", spec["allow_approved"])
        check_attribution(c, "card", spec["required_notice"])
    if objectives != expected_objectives:
        fail(f"{folder}: objectives mismatch: {sorted(objectives)}")

    qids = set()
    practice_counts = {obj: 0 for obj in objectives}
    practice_prompts = set()
    for q in questions:
        qid = q["question_id"]
        if qid in qids:
            fail(f"{folder}: duplicate question id {qid}")
        qids.add(qid)
        obj = q["learning_objective_id"]
        if obj not in practice_counts:
            fail(f"{folder}: question {qid} references unknown objective {obj}")
        practice_counts[obj] += 1
        practice_prompts.add(q["prompt_ru"].strip().lower())
        check_question(q, card_ids, "practice", spec["allow_approved"], spec["required_notice"])
    for obj, n in practice_counts.items():
        if n != spec["practice_per_objective"]:
            fail(f"{folder}: objective {obj} has {n} practice questions, expected {spec['practice_per_objective']}")

    delayed_ids = set()
    delayed_counts = {obj: 0 for obj in objectives}
    for q in delayed:
        qid = q["question_id"]
        if qid in delayed_ids or qid in qids:
            fail(f"{folder}: duplicate delayed/question id {qid}")
        delayed_ids.add(qid)
        obj = q["learning_objective_id"]
        if obj not in objectives:
            fail(f"{folder}: delayed {qid} references unknown objective")
        delayed_counts[obj] += 1
        if q["prompt_ru"].strip().lower() in practice_prompts:
            fail(f"{folder}: delayed {qid} duplicates a practice prompt")
        check_question(q, card_ids, "delayed_check", spec["allow_approved"], spec["required_notice"])
    if spec.get("delayed_per_objective") is not None:
        for obj, n in delayed_counts.items():
            if n != spec["delayed_per_objective"]:
                fail(f"{folder}: objective {obj} has {n} delayed checks, expected {spec['delayed_per_objective']}")

    approved_cards = sum(c["review_status"] == "approved" for c in cards)
    approved_questions = sum(q["review_status"] == "approved" for q in questions)
    print(f"OK {folder}: {len(cards)} cards, {len(questions)} practice questions, {len(delayed)} delayed checks")
    if spec["allow_approved"]:
        print(f"  Organizer-reported approved reference items: {approved_cards} cards, {approved_questions} questions")
    else:
        print("  Draft-only subject: no approval inherited from physiology.")
    return len(cards), len(questions), len(delayed), approved_cards, approved_questions


def main() -> int:
    totals = [0, 0, 0, 0, 0]
    for spec in SUBJECTS:
        result = validate_subject(spec)
        totals = [a + b for a, b in zip(totals, result)]
    print(f"TOTAL: {totals[0]} cards, {totals[1]} practice questions, {totals[2]} delayed checks")
    print("New tourism/topography items remain draft and require subject-editor approval before student release.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
