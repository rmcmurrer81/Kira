"""Deterministic starter for Kira Storyworld Continuity Agent."""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass


@dataclass(frozen=True)
class Scene:
    number: int
    location: str
    character: str
    action: str
    uses_fact: str | None = None
    learns_fact: str | None = None
    prop: str | None = None
    prop_state: str | None = None


def check_continuity(scenes: list[Scene]) -> list[dict[str, object]]:
    learned: dict[tuple[str, str], int] = {}
    prop_state: dict[str, tuple[str, int]] = {}
    problems: list[dict[str, object]] = []

    for scene in sorted(scenes, key=lambda item: item.number):
        if scene.uses_fact:
            learned_in = learned.get((scene.character, scene.uses_fact))
            if learned_in is None or learned_in >= scene.number:
                problems.append(
                    {
                        "type": "KNOWLEDGE_BEFORE_LEARNING",
                        "scene": scene.number,
                        "character": scene.character,
                        "fact": scene.uses_fact,
                    }
                )
        if scene.learns_fact:
            learned[(scene.character, scene.learns_fact)] = scene.number

        if scene.prop and scene.prop_state:
            previous = prop_state.get(scene.prop)
            if previous and previous[0] == "broken" and scene.prop_state == "intact":
                problems.append(
                    {
                        "type": "PROP_STATE_JUMP",
                        "scene": scene.number,
                        "prop": scene.prop,
                        "previous_scene": previous[1],
                        "previous_state": previous[0],
                        "new_state": scene.prop_state,
                    }
                )
            prop_state[scene.prop] = (scene.prop_state, scene.number)
    return problems


def demo_scenes() -> list[Scene]:
    return [
        Scene(1, "Observatory", "Mara", "finds a locked console", uses_fact="launch code"),
        Scene(2, "Archive", "Mara", "reads the maintenance log", learns_fact="launch code"),
        Scene(3, "Workshop", "Ilan", "drops the glass compass", prop="glass compass", prop_state="broken"),
        Scene(4, "Rooftop", "Ilan", "uses the glass compass", prop="glass compass", prop_state="intact"),
    ]


def self_test() -> None:
    problems = check_continuity(demo_scenes())
    assert {item["type"] for item in problems} == {
        "KNOWLEDGE_BEFORE_LEARNING",
        "PROP_STATE_JUMP",
    }
    print("SELF_TEST_PASS")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0
    print(json.dumps(check_continuity(demo_scenes()), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
