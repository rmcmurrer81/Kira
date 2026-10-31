"""Local planning and transcript-parsing starter for Kira AccessLine.

No dialing capability is present in this file.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass

E164 = re.compile(r"^\+[1-9]\d{7,14}$")
DEFAULT_QUESTIONS = (
    "Is there a step-free entrance?",
    "Is an elevator available?",
    "Is there an accessible restroom?",
    "Is seating available while waiting?",
    "Is advance notice required for an accessibility accommodation?",
)


@dataclass(frozen=True)
class CallPlan:
    venue: str
    phone: str
    questions: tuple[str, ...]
    user_approved: bool


def validate_plan(plan: CallPlan) -> None:
    if not plan.venue.strip():
        raise ValueError("venue is required")
    if not E164.fullmatch(plan.phone):
        raise ValueError("phone must be in E.164 format, such as +12125551234")
    if not plan.questions or any(not question.strip() for question in plan.questions):
        raise ValueError("at least one non-empty question is required")
    if not plan.user_approved:
        raise PermissionError("a real call requires a fresh user approval")


def disclosure(plan: CallPlan) -> str:
    return (
        "Hello. I am an automated accessibility assistant calling on behalf of a "
        f"visitor who is considering {plan.venue}. May I ask a few brief questions?"
    )


def classify_answer(text: str) -> str:
    normalized = " ".join(text.casefold().split())
    if any(token in normalized for token in ("do not call", "stop", "not willing", "no questions")):
        return "RECIPIENT_DECLINED"
    if re.search(r"\b(yes|available|we do|there is)\b", normalized):
        return "YES"
    if re.search(r"\b(no|not available|we don't|there isn't)\b", normalized):
        return "NO"
    return "UNKNOWN"


def build_report(plan: CallPlan, answers: list[str]) -> dict[str, object]:
    if len(answers) > len(plan.questions):
        raise ValueError("more answers than planned questions")
    rows = []
    for index, question in enumerate(plan.questions):
        answer = answers[index] if index < len(answers) else ""
        classification = classify_answer(answer)
        rows.append({"question": question, "answer": answer, "result": classification})
        if classification == "RECIPIENT_DECLINED":
            break
    return {"venue": plan.venue, "phone": plan.phone, "results": rows}


def demo() -> dict[str, object]:
    plan = CallPlan("Example Community Center", "+12125551234", DEFAULT_QUESTIONS, True)
    validate_plan(plan)
    answers = [
        "Yes, the side entrance is step-free.",
        "Yes, there is an elevator.",
        "I am not sure about the restroom.",
    ]
    return {"disclosure": disclosure(plan), "report": build_report(plan, answers)}


def self_test() -> None:
    result = demo()
    rows = result["report"]["results"]
    assert rows[0]["result"] == "YES"
    assert rows[2]["result"] == "UNKNOWN"
    assert classify_answer("Please stop. We are not willing to answer.") == "RECIPIENT_DECLINED"
    print("SELF_TEST_PASS")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0
    print(json.dumps(demo(), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
