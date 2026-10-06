from __future__ import annotations

import contextlib
import email.message
import io
import json
import os
import tempfile
import unittest
import urllib.request
from dataclasses import replace
from pathlib import Path
from unittest import mock

from portable_mind.backends import (
    BackendError,
    DeterministicStubBackend,
    OllamaBackend,
    backend_from_config,
)
from portable_mind.cli import main as cli_main
from portable_mind.embodiment import EmbodimentBoundaryError, create_intent_proposal
from portable_mind.life_loops import LifeLoopStore
from portable_mind.paths import branch_root, default_data_root, package_root, require_safe_id
from portable_mind.profiles import ProfileError, available_profiles, load_profile
from portable_mind.records import AppendOnlyJSONL, StorageCorruption, stable_event_id, utc_now
from portable_mind.runtime import ConfigError, PortableMindRuntime, RuntimeConfig, load_config
from portable_mind.strict_json import StrictJSONError, canonical_json, loads_strict
from portable_mind.transfer import (
    TransferError,
    build_transfer_bundle,
    import_transfer_bundle,
    load_transfer_bundle,
)


ROOT = package_root()


def make_config(profile_id: str = "kira", branch_id: str = "test_branch") -> RuntimeConfig:
    return RuntimeConfig(
        profile_id=profile_id,
        branch_id=branch_id,
        backend={"kind": "stub"},
        data_dir="",
        persist_transcript=False,
        max_reviewed_memories=10,
        voice=False,
        body_control=False,
        intent_proposals=False,
    )


class StrictInputTests(unittest.TestCase):
    def test_duplicate_json_keys_refuse(self) -> None:
        with self.assertRaises(StrictJSONError):
            loads_strict('{"a": 1, "a": 2}')

    def test_nonfinite_json_refuses(self) -> None:
        with self.assertRaises(StrictJSONError):
            loads_strict('{"a": NaN}')

    def test_canonical_json_is_stable(self) -> None:
        self.assertEqual(canonical_json({"b": 1, "a": 2}), '{"a":2,"b":1}')

    def test_safe_ids_and_branch_containment(self) -> None:
        self.assertEqual(require_safe_id("variant_2"), "variant_2")
        with self.assertRaises(ValueError):
            require_safe_id("../escape")
        root = Path(tempfile.gettempdir()) / "portable_mind_path_test"
        self.assertEqual(branch_root(root, "kira", "variant_2"), root.resolve() / "kira" / "variant_2")
        with mock.patch.dict(os.environ, {"PORTABLE_MIND_HOME": ""}):
            default_root = default_data_root()
        self.assertNotEqual(default_root, ROOT)
        self.assertNotIn(ROOT, default_root.parents)


class PublicProfileAndConfigTests(unittest.TestCase):
    def test_only_two_public_profiles_ship(self) -> None:
        self.assertEqual(available_profiles(), ("kira", "synthetic_robert"))

    def test_kira_profile_is_explicitly_public(self) -> None:
        profile = load_profile("kira")
        self.assertIn("public", profile.identity_notice.casefold())
        self.assertIn("private memories", profile.boundaries[0].casefold())

    def test_synthetic_robert_is_not_autobiographical(self) -> None:
        profile = load_profile("synthetic_robert")
        notice = profile.identity_notice.casefold()
        self.assertIn("not robert", notice)
        self.assertIn("no private memories", notice)

    def test_unknown_profile_refuses(self) -> None:
        with self.assertRaises(ProfileError):
            load_profile("unknown")

    def test_example_config_is_text_only(self) -> None:
        config = load_config(ROOT / "config.example.json")
        self.assertFalse(config.voice)
        self.assertFalse(config.body_control)
        self.assertFalse(config.persist_transcript)
        self.assertEqual(config.backend, {"kind": "stub"})

    def test_config_cannot_enable_voice_or_body(self) -> None:
        source = json.loads((ROOT / "config.example.json").read_text(encoding="utf-8"))
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "bad.json"
            for feature in ("voice", "body_control"):
                source["features"][feature] = True
                path.write_text(json.dumps(source), encoding="utf-8")
                with self.assertRaises(ConfigError):
                    load_config(path)
                source["features"][feature] = False


class BackendBoundaryTests(unittest.TestCase):
    def test_stub_cases_meet_public_expectations(self) -> None:
        fixture = json.loads(
            (ROOT / "evaluation" / "public_safe_cases.json").read_text(encoding="utf-8")
        )
        for case in fixture["cases"]:
            with self.subTest(case=case["case_id"]):
                answer = DeterministicStubBackend(case["profile_id"]).complete(
                    [{"role": "user", "content": case["prompt"]}]
                ).casefold()
                for required in case["must_include"]:
                    self.assertIn(required.casefold(), answer)

    def test_stub_schema_refuses_extra_settings(self) -> None:
        with self.assertRaises(ValueError):
            backend_from_config({"kind": "stub", "model": "unused"}, profile_id="kira")

    def test_ollama_accepts_only_loopback(self) -> None:
        local = OllamaBackend(model="local-model:latest")
        self.assertEqual(local.base_url, "http://127.0.0.1:11434")
        with self.assertRaises(ValueError):
            OllamaBackend(model="local-model", base_url="https://example.com")
        with self.assertRaises(ValueError):
            OllamaBackend(model="local-model", base_url="http://localhost:11434/path")
        with self.assertRaises(ValueError):
            OllamaBackend(model="local-model", base_url="http://localhost:11434")
        with self.assertRaises(ValueError):
            OllamaBackend(model="local-model", base_url="http://user@127.0.0.1:11434")
        with self.assertRaises(ValueError):
            OllamaBackend(model="local-model", base_url="http://127.0.0.1:11434?next=remote")
        self.assertEqual(
            OllamaBackend(model="local-model", base_url="http://[::1]:11434").base_url,
            "http://[::1]:11434",
        )

        class FakeResponse:
            def __init__(self, code: int, body: bytes, location: str | None = None):
                self.code = code
                self.status = code
                self.reason = "fixture"
                self.msg = "fixture"
                self.headers = email.message.Message()
                if location:
                    self.headers["Location"] = location
                self._body = body

            def read(self, amount: int = -1) -> bytes:
                return self._body if amount < 0 else self._body[:amount]

            def close(self) -> None:
                return None

            def info(self) -> email.message.Message:
                return self.headers

            def __enter__(self) -> "FakeResponse":
                return self

            def __exit__(self, *args: object) -> None:
                self.close()

        attempted_hosts: list[str] = []

        def local_success(_handler: object, _connection: object, request: object, **_kwargs: object) -> FakeResponse:
            attempted_hosts.append(str(getattr(request, "host")))
            return FakeResponse(200, b'{"message":{"content":"loopback fixture"}}')

        hostile_proxy_environment = {
            "HTTP_PROXY": "http://192.0.2.1:8080",
            "HTTPS_PROXY": "http://192.0.2.1:8080",
            "NO_PROXY": "",
        }
        with mock.patch.dict(os.environ, hostile_proxy_environment, clear=False):
            with mock.patch.object(urllib.request.HTTPHandler, "do_open", new=local_success):
                self.assertEqual(local.complete([{"role": "user", "content": "fixture"}]), "loopback fixture")
        self.assertEqual(attempted_hosts, ["127.0.0.1:11434"])

        attempted_hosts.clear()

        def redirect_response(_handler: object, _connection: object, request: object, **_kwargs: object) -> FakeResponse:
            attempted_hosts.append(str(getattr(request, "host")))
            return FakeResponse(302, b"", "https://example.com/redirected")

        with mock.patch.dict(os.environ, hostile_proxy_environment, clear=False):
            with mock.patch.object(urllib.request.HTTPHandler, "do_open", new=redirect_response):
                with self.assertRaises(BackendError):
                    local.complete([{"role": "user", "content": "fixture"}])
        self.assertEqual(attempted_hosts, ["127.0.0.1:11434"])


class RecordAndLifeLoopTests(unittest.TestCase):
    def test_append_only_channel_is_idempotent(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            channel = AppendOnlyJSONL(Path(temporary) / "events.jsonl")
            record = {"event_id": stable_event_id("fixture"), "value": "public fixture"}
            self.assertTrue(channel.append_once(record))
            self.assertFalse(channel.append_once(record))
            self.assertEqual(channel.records(), [record])

    def test_conflicting_duplicate_refuses(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            channel = AppendOnlyJSONL(Path(temporary) / "events.jsonl")
            event_id = stable_event_id("fixture")
            channel.append_once({"event_id": event_id, "value": 1})
            with self.assertRaises(StorageCorruption):
                channel.append_once({"event_id": event_id, "value": 2})

    def test_new_life_loop_closes_interrupted_predecessor(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            store = LifeLoopStore(Path(temporary))
            first = store.start("kira", "demo")
            second = store.start("kira", "demo")
            self.assertNotEqual(first.loop_id, second.loop_id)
            events = store.channel.records()
            self.assertEqual([event["event_type"] for event in events], [
                "loop_started",
                "loop_closed",
                "loop_started",
            ])
            self.assertEqual(events[1]["reason"], "previous_process_interrupted")


class RuntimeTests(unittest.TestCase):
    def test_default_conversation_does_not_persist_transcript(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            runtime = PortableMindRuntime(make_config(), data_root=Path(temporary))
            answer = runtime.respond("What are you in this repository?")
            runtime.close()
            self.assertIn("text-only", answer)
            self.assertFalse((runtime.branch_root / "transcript.jsonl").exists())
            self.assertEqual(len(runtime.state_records.records()), 1)

    def test_reviewed_summary_survives_restart(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            first = PortableMindRuntime(make_config(), data_root=root)
            saved = first.remember("In a fictional demo, use the blue room as the rollback point.")
            self.assertEqual(first.remember(saved["summary"])["memory_id"], saved["memory_id"])
            first.start()
            first.close()
            second = PortableMindRuntime(make_config(), data_root=root)
            self.assertEqual(second.reviewed_memories()[0]["summary"], saved["summary"])

    def test_branches_diverge_without_automatic_merge(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            left = PortableMindRuntime(make_config(branch_id="left_branch"), data_root=root)
            right = PortableMindRuntime(make_config(branch_id="right_branch"), data_root=root)
            left.remember("Fictional left-branch note.")
            self.assertEqual(len(left.reviewed_memories()), 1)
            self.assertEqual(right.reviewed_memories(), [])

    def test_transcript_persistence_requires_explicit_opt_in(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            config = replace(make_config(), persist_transcript=True)
            runtime = PortableMindRuntime(config, data_root=Path(temporary))
            runtime.respond("A fictional public prompt.")
            runtime.close()
            records = runtime.transcript_records.records()
            self.assertEqual(records[0]["user"], "A fictional public prompt.")

    def test_status_never_claims_voice_body_or_official_integration(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            status = PortableMindRuntime(make_config(), data_root=Path(temporary)).status()
            self.assertFalse(status["voice"])
            self.assertFalse(status["body_control"])
            self.assertFalse(status["official_hanson_integration"])
            with self.assertRaises(ConfigError):
                PortableMindRuntime(make_config(), data_root=ROOT / "runtime_data")


class EmbodimentAndTransferTests(unittest.TestCase):
    def test_intent_proposals_are_disabled_by_default(self) -> None:
        with self.assertRaises(EmbodimentBoundaryError):
            create_intent_proposal("gesture", {"name": "wave", "speed": 0.4})

    def test_high_level_proposal_has_no_execution_path(self) -> None:
        proposal = create_intent_proposal(
            "gesture", {"name": "wave", "speed": 0.4}, enabled=True
        )
        self.assertEqual(proposal.status, "local_proposal_only")
        with self.assertRaises(EmbodimentBoundaryError):
            create_intent_proposal(
                "gesture", {"name": "wave", "motor": 7}, enabled=True
            )

    def test_transfer_import_creates_reviewed_records_in_new_branch(self) -> None:
        memory = {
            "memory_id": "memory_fictional_demo",
            "summary": "A fictional reviewed summary.",
            "created_at": utc_now(),
        }
        bundle = build_transfer_bundle(
            profile_id="kira",
            source_branch_id="source_branch",
            reviewed_memories=[memory],
            appraisal={"valence": 0.0, "arousal": 0.2, "engagement": 0.5, "confidence": 0.5},
        )
        with tempfile.TemporaryDirectory() as temporary:
            destination = Path(temporary) / "destination"
            self.assertEqual(
                import_transfer_bundle(
                    bundle,
                    destination_root=destination,
                    expected_profile_id="kira",
                    destination_branch_id="destination_branch",
                ),
                1,
            )
            records = AppendOnlyJSONL(destination / "reviewed_memories.jsonl").records()
            self.assertEqual(records[0]["source"], "reviewed_transfer_import")

    def test_transfer_digest_detects_change(self) -> None:
        bundle = build_transfer_bundle(
            profile_id="kira",
            source_branch_id="source_branch",
            reviewed_memories=[],
            appraisal={"valence": 0.0, "arousal": 0.2, "engagement": 0.5, "confidence": 0.5},
        )
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "bundle.json"
            path.write_text(json.dumps(bundle), encoding="utf-8")
            self.assertEqual(load_transfer_bundle(path)["payload"]["profile_id"], "kira")
            bundle["payload"]["profile_id"] = "synthetic_robert"
            path.write_text(json.dumps(bundle), encoding="utf-8")
            with self.assertRaises(TransferError):
                load_transfer_bundle(path)


class CliSmokeTests(unittest.TestCase):
    def test_one_turn_cli_uses_public_stub(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            output = io.StringIO()
            with contextlib.redirect_stdout(output):
                result = cli_main(
                    [
                        "--profile",
                        "kira",
                        "--data-dir",
                        temporary,
                        "--once",
                        "What are you in this repository?",
                    ]
                )
            self.assertEqual(result, 0)
            self.assertIn("text-only", output.getvalue())


if __name__ == "__main__":
    unittest.main()
