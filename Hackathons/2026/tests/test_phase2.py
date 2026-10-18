from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

import project_toolkit as toolkit
import secret_scan
from local_ledger_store import JsonlMemoryLedgerStore

ROOT = Path(__file__).resolve().parents[1]


def load(name: str, relative: str):
    path = ROOT / relative
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class FakeStrandsAgent:
    def __init__(self, **kwargs):
        self.kwargs = kwargs

    def __call__(self, prompt):
        assert "Decisions Robert must make" in prompt
        return "Synthetic Strands explanation"


class FakeModels:
    def generate_content(self, **kwargs):
        assert kwargs["model"] == "gemini-3.5-flash"
        assert "deterministically" in kwargs["contents"]
        return type("Response", (), {"text": "Synthetic Gemini explanation"})()


class FakeGoogleClient:
    def __init__(self):
        self.models = FakeModels()


class FakeCallECalls:
    def __init__(self):
        self.kwargs = None

    def create_and_wait(self, **kwargs):
        self.kwargs = kwargs
        return {
            "status": "completed",
            "task_completed": True,
            "completion_confidence": {"score": 1.0, "label": "high"},
            "structured_result": {"answer_1": "yes"},
            "evidence": ["Synthetic fake provider result."],
        }


class FakeCallEClient:
    def __init__(self):
        self.calls = FakeCallECalls()


class Phase2Tests(unittest.TestCase):
    def test_all_demo_projects_pass(self):
        result = toolkit.self_test()
        self.assertEqual("ALL_PROJECT_TOOLKIT_TESTS_PASS", result["status"])
        self.assertEqual(5, len(result["projects"]))

    def test_accessline_is_simulation_only(self):
        report = toolkit.demo("accessline")
        self.assertFalse(report["phone_call_placed"])
        self.assertEqual("SIMULATED_LOCAL_ONLY", report["provider"])

    def test_duplicate_memory_id_fails(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "records.json"
            path.write_text(json.dumps([
                {"id": "same", "subject": "x", "text": "a"},
                {"id": "same", "subject": "x", "text": "b"},
            ]), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "duplicate"):
                toolkit.run_memory_steward(path, now=datetime.now(timezone.utc))

    def test_local_ledger_reload_and_tamper_detection(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "ledger.jsonl"
            store = JsonlMemoryLedgerStore(path)
            now = datetime.now(timezone.utc)
            for text, status in (("proposal", "proposed"), ("accepted", "accepted")):
                store.append(
                    memory_id="m1", subject="project", text=text, status=status,
                    visibility="private", source_label="synthetic", created_at=now,
                )
            self.assertTrue(JsonlMemoryLedgerStore(path).verify_chain())
            self.assertEqual(2, JsonlMemoryLedgerStore(path).current_view()[0]["revision"])
            rows = path.read_text(encoding="utf-8").splitlines()
            first = json.loads(rows[0])
            first["text"] = "tampered"
            rows[0] = json.dumps(first)
            path.write_text("\n".join(rows) + "\n", encoding="utf-8")
            self.assertFalse(JsonlMemoryLedgerStore(path).verify_chain())

    def test_secret_scan_detects_key_and_allows_placeholder(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / "bad.txt").write_text("AKIA" + "1234567890ABCDEF" + "\n", encoding="utf-8")
            self.assertEqual(1, len(secret_scan.scan(root)))
            (root / "bad.txt").write_text("AWS_ACCESS_KEY_ID=your-key\n", encoding="utf-8")
            self.assertEqual([], secret_scan.scan(root))

    def test_calle_adapter_requires_fresh_plan_and_explicit_execute(self):
        adapter = load("call_e_live_adapter_test", "call-e-kira-accessline/call_e_live_adapter.py")
        now = datetime(2026, 8, 10, 18, 0, tzinfo=timezone.utc)
        plan = adapter.AccessCallPlan(
            venue="Example Center",
            phone="+12125551234",
            purpose="accessibility information",
            questions=("Is there a step-free entrance?",),
            approved_at=now,
        )
        fake = FakeCallEClient()
        with self.assertRaisesRegex(PermissionError, "execute=True"):
            adapter.place_approved_call(plan, client=fake, now=now)
        result = adapter.place_approved_call(plan, execute=True, client=fake, now=now)
        self.assertTrue(result["phone_call_placed"])
        self.assertEqual("CALL-E", result["provider"])
        self.assertIn("automated accessibility assistant", fake.calls.kwargs["task"])
        self.assertFalse(result["audio_retained_by_kira_accessline"])

    def test_optional_adapters_with_fakes(self):
        strands = load("strands_adapter_test", "agents-for-humans-kira-memory-steward/strands_adapter.py")
        self.assertEqual(
            "Synthetic Strands explanation",
            strands.explain_report({"human_decisions": []}, agent_factory=FakeStrandsAgent),
        )
        summary = strands.configuration_summary()
        self.assertEqual("Amazon Bedrock", summary["provider"])
        self.assertEqual("amazon.nova-micro-v1:0", summary["model_id"])
        self.assertFalse(summary["model_invoked"])
        google = load("google_adapter_test", "all-things-agentic-kira-project-truthkeeper/google_adapter.py")
        self.assertEqual(
            "Synthetic Gemini explanation",
            google.explain_report({"current_truth": {}, "proposals": []}, client=FakeGoogleClient()),
        )
        cockroach = load("cockroach_repository_test", "cockroachdb-aws-kira-memory-ledger/cockroach_repository.py")
        with self.assertRaisesRegex(RuntimeError, "DATABASE_URL"):
            cockroach.CockroachRepository("")


class Phase3SetupTests(unittest.TestCase):
    def test_cloud_preflight_masks_sensitive_identifiers(self):
        preflight = load("cloud_preflight_test", "cloud_preflight.py")
        self.assertEqual("***6789", preflight.mask_account_id("123456789"))
        self.assertEqual("arn:aws:iam::123456789012:***", preflight.mask_arn("arn:aws:iam::123456789012:user/secret-name"))
        masked = preflight.mask_database_url(
            "postgresql://private_user:private_password@example.invalid:26257/defaultdb?sslmode=verify-full"
        )
        self.assertEqual("***", masked["host"])
        self.assertTrue(masked["username_present"])
        self.assertTrue(masked["password_present"])
        self.assertNotIn("private_user", json.dumps(masked))
        self.assertNotIn("private_password", json.dumps(masked))

    def test_setup_assistant_defines_expected_variable_names(self):
        assistant = load("provider_setup_assistant_test", "provider_setup_assistant.py")
        all_names = {
            variable
            for provider in assistant.PROVIDERS.values()
            for variable in provider["variables"]
        }
        self.assertEqual(
            {"GEMINI_API_KEY", "AWS_PROFILE", "AWS_REGION", "DATABASE_URL", "CALLE_API_KEY"},
            all_names,
        )


if __name__ == "__main__":
    unittest.main()
