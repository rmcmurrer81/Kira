from datetime import date, datetime, timedelta, timezone

import incubator_core as core


def run_tests() -> None:
    now = datetime(2026, 8, 10, 16, 15, tzinfo=timezone.utc)

    steward = core.memory_steward(
        [
            core.StewardRecord("recent", "project", "This week we started a prototype.", now),
            core.StewardRecord(
                "stale",
                "project",
                "I am currently finishing an old chapter.",
                datetime(2026, 5, 1, tzinfo=timezone.utc),
            ),
            core.StewardRecord("private", "private", "Synthetic private note.", None, sensitive=True),
        ],
        now=now,
    )
    categories = {row["id"]: row["category"] for row in steward["records"]}
    assert categories["recent"] == "CURRENT_OR_RECENT"
    assert categories["stale"] == "HISTORICAL_WITH_STALE_PRESENT_CLAIM"
    assert categories["private"] == "PERMISSION_RESTRICTED"

    plan = core.AccessCallPlan(
        "Example Center",
        "+12125551234",
        "accessibility information",
        ("Step free?", "Elevator?", "Restroom?"),
        now,
    )
    report = core.accessline_report(plan, ["Yes.", "Please stop.", "Never read."], called_at=now)
    assert report["recipient_declined"] is True
    assert len(report["results"]) == 2
    assert core.classify_access_answer("Yes, but no at the main door") == "AMBIGUOUS"
    try:
        core.validate_access_plan(
            core.AccessCallPlan("Example", "+12125551234", "purpose", ("Question?",), now - timedelta(hours=2)),
            now=now,
        )
    except PermissionError:
        pass
    else:
        raise AssertionError("expired approval must fail")

    ledger = core.MemoryLedger()
    ledger.append(
        memory_id="m1",
        subject="project",
        text="proposal",
        status="proposed",
        visibility="private",
        source_label="synthetic",
        created_at=now,
    )
    ledger.append(
        memory_id="m1",
        subject="project",
        text="accepted",
        status="accepted",
        visibility="private",
        source_label="synthetic_decision",
        created_at=now,
    )
    assert ledger.latest("m1").revision == 2
    assert ledger.verify_chain()

    safe = core.safe_start_plan(
        [
            core.SafeStartResource(
                "r1", "Example", "housing", "Synthetic", "https://example.org", "Example City", date(2026, 8, 9)
            ),
            core.SafeStartResource(
                "r2", "Old", "transit", "Synthetic", "https://example.org/old", "Example City", date(2025, 1, 1)
            ),
        ],
        requested_categories={"housing", "transit"},
        region="Example City",
        today=date(2026, 8, 10),
    )
    assert len(safe["resources"]) == 1
    assert len(safe["stale_resources"]) == 1

    truth = core.truthkeeper(
        [
            core.TruthClaim("old", "model", "A", datetime(2026, 8, 1, tzinfo=timezone.utc), "historical"),
            core.TruthClaim("new", "model", "B", now, "current_registry"),
        ]
    )
    assert truth["current_truth"]["model"]["value"] == "B"
    assert len(truth["contradictions"]) == 1
    assert truth["source_claims_mutated"] is False

    suite = core.demo_suite()
    assert suite["memory_ledger"]["chain_valid"] is True
    print("ALL_INCUBATOR_TESTS_PASS")


if __name__ == "__main__":
    run_tests()
