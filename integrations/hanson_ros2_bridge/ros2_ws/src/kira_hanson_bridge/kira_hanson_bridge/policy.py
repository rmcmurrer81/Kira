from __future__ import annotations

from dataclasses import dataclass
from math import isfinite
from pathlib import Path
from typing import Any, Mapping

import yaml


@dataclass(frozen=True)
class ValidationResult:
    accepted: bool
    reason_code: str
    detail: str

    @classmethod
    def allow(cls, detail: str = "Request is within the configured bounds.") -> "ValidationResult":
        return cls(True, "ACCEPTED", detail)

    @classmethod
    def reject(cls, reason_code: str, detail: str) -> "ValidationResult":
        return cls(False, reason_code, detail)


class SafetyPolicy:
    """Pure-Python validator for bounded social intentions.

    This class does not import ROS, which lets the policy be unit-tested and
    reviewed independently from the transport and simulator implementation.
    """

    SUPPORTED_CATEGORIES = {"speech", "gaze", "expression", "gesture"}

    def __init__(self, config: Mapping[str, Any]):
        self.config = dict(config)
        self.common = dict(self.config.get("common", {}))

    @classmethod
    def from_yaml(cls, path: str | Path) -> "SafetyPolicy":
        with Path(path).open("r", encoding="utf-8") as handle:
            raw = yaml.safe_load(handle) or {}
        return cls(raw)

    def validate(self, category: str, payload: Mapping[str, Any]) -> ValidationResult:
        if category not in self.SUPPORTED_CATEGORIES:
            return ValidationResult.reject("UNKNOWN_CATEGORY", f"Unsupported category: {category}")

        common_result = self._validate_common(payload)
        if not common_result.accepted:
            return common_result

        validator = getattr(self, f"_validate_{category}")
        return validator(payload)

    def _validate_common(self, payload: Mapping[str, Any]) -> ValidationResult:
        if not str(payload.get("intent_id", "")).strip():
            return ValidationResult.reject("MISSING_INTENT_ID", "intent_id is required.")

        if not str(payload.get("source_identity", "")).strip():
            return ValidationResult.reject("MISSING_SOURCE_IDENTITY", "source_identity is required.")

        confidence = payload.get("confidence")
        if not self._finite_number(confidence) or not 0.0 <= float(confidence) <= 1.0:
            return ValidationResult.reject("INVALID_CONFIDENCE", "confidence must be between 0.0 and 1.0.")

        minimum_confidence = float(self.common.get("minimum_confidence", 0.0))
        if float(confidence) < minimum_confidence:
            return ValidationResult.reject(
                "CONFIDENCE_BELOW_POLICY",
                f"confidence is below the configured minimum of {minimum_confidence}.",
            )

        ttl_ms = payload.get("ttl_ms")
        maximum_ttl = int(self.common.get("maximum_ttl_ms", 30000))
        if not isinstance(ttl_ms, int) or isinstance(ttl_ms, bool) or ttl_ms <= 0:
            return ValidationResult.reject("INVALID_TTL", "ttl_ms must be a positive integer.")
        if ttl_ms > maximum_ttl:
            return ValidationResult.reject("TTL_EXCEEDS_POLICY", f"ttl_ms exceeds {maximum_ttl} ms.")

        age_ms = payload.get("age_ms", 0)
        if not self._finite_number(age_ms) or float(age_ms) < 0:
            return ValidationResult.reject("INVALID_AGE", "age_ms must be a nonnegative number.")
        if bool(self.common.get("reject_stale", True)) and float(age_ms) > ttl_ms:
            return ValidationResult.reject(
                "STALE_INTENT",
                f"intention age {float(age_ms):.0f} ms exceeds ttl_ms {ttl_ms}.",
            )

        return ValidationResult.allow()

    def _validate_speech(self, payload: Mapping[str, Any]) -> ValidationResult:
        config = dict(self.config.get("speech", {}))
        text = str(payload.get("text", "")).strip()
        if not text:
            return ValidationResult.reject("EMPTY_SPEECH", "Speech text cannot be empty.")
        maximum_chars = int(config.get("maximum_chars", 500))
        if len(text) > maximum_chars:
            return ValidationResult.reject(
                "SPEECH_TOO_LONG",
                f"Speech has {len(text)} characters; policy allows {maximum_chars}.",
            )

        voice = str(payload.get("voice", "")).strip() or "default"
        allowed_voices = set(config.get("allowed_voices", ["default"]))
        if voice not in allowed_voices:
            return ValidationResult.reject("VOICE_NOT_ALLOWED", f"Voice '{voice}' is not allowlisted.")

        return self._validate_duration(
            payload.get("max_duration_ms"),
            int(config.get("maximum_duration_ms", 20000)),
            "SPEECH_DURATION",
        )

    def _validate_gaze(self, payload: Mapping[str, Any]) -> ValidationResult:
        config = dict(self.config.get("gaze", {}))
        frame = str(payload.get("target_frame", "")).strip()
        allowed_frames = set(config.get("allowed_frames", ["world"]))
        if frame not in allowed_frames:
            return ValidationResult.reject("GAZE_FRAME_NOT_ALLOWED", f"Frame '{frame}' is not allowlisted.")

        target = payload.get("target")
        if not isinstance(target, Mapping):
            return ValidationResult.reject("INVALID_GAZE_TARGET", "target must contain x, y, and z.")

        maximum_coordinate = float(config.get("maximum_abs_coordinate_m", 5.0))
        for axis in ("x", "y", "z"):
            value = target.get(axis)
            if not self._finite_number(value):
                return ValidationResult.reject("INVALID_GAZE_TARGET", f"target.{axis} must be finite.")
            if abs(float(value)) > maximum_coordinate:
                return ValidationResult.reject(
                    "GAZE_TARGET_OUT_OF_RANGE",
                    f"target.{axis} exceeds ±{maximum_coordinate} m.",
                )

        return self._validate_duration(
            payload.get("duration_ms"),
            int(config.get("maximum_duration_ms", 10000)),
            "GAZE_DURATION",
        )

    def _validate_expression(self, payload: Mapping[str, Any]) -> ValidationResult:
        config = dict(self.config.get("expression", {}))
        expression = str(payload.get("expression", "")).strip()
        allowed = set(config.get("allowed", []))
        if expression not in allowed:
            return ValidationResult.reject(
                "EXPRESSION_NOT_ALLOWED",
                f"Expression '{expression}' is not allowlisted.",
            )

        intensity_result = self._validate_bounded_float(
            payload.get("intensity"),
            0.0,
            float(config.get("maximum_intensity", 1.0)),
            "EXPRESSION_INTENSITY",
        )
        if not intensity_result.accepted:
            return intensity_result

        return self._validate_duration(
            payload.get("duration_ms"),
            int(config.get("maximum_duration_ms", 10000)),
            "EXPRESSION_DURATION",
        )

    def _validate_gesture(self, payload: Mapping[str, Any]) -> ValidationResult:
        config = dict(self.config.get("gesture", {}))
        gesture = str(payload.get("gesture", "")).strip()
        allowed = set(config.get("allowed", []))
        if gesture not in allowed:
            return ValidationResult.reject(
                "GESTURE_NOT_ALLOWED",
                f"Gesture '{gesture}' is not allowlisted.",
            )

        intensity_result = self._validate_bounded_float(
            payload.get("intensity"),
            0.0,
            float(config.get("maximum_intensity", 1.0)),
            "GESTURE_INTENSITY",
        )
        if not intensity_result.accepted:
            return intensity_result

        speed_result = self._validate_bounded_float(
            payload.get("speed"),
            0.0,
            float(config.get("maximum_speed", 1.0)),
            "GESTURE_SPEED",
        )
        if not speed_result.accepted:
            return speed_result

        return self._validate_duration(
            payload.get("duration_ms"),
            int(config.get("maximum_duration_ms", 10000)),
            "GESTURE_DURATION",
        )

    @staticmethod
    def _finite_number(value: Any) -> bool:
        if isinstance(value, bool):
            return False
        try:
            return isfinite(float(value))
        except (TypeError, ValueError):
            return False

    @classmethod
    def _validate_bounded_float(
        cls,
        value: Any,
        minimum: float,
        maximum: float,
        code_prefix: str,
    ) -> ValidationResult:
        if not cls._finite_number(value):
            return ValidationResult.reject(f"INVALID_{code_prefix}", f"{code_prefix.lower()} must be finite.")
        numeric = float(value)
        if not minimum <= numeric <= maximum:
            return ValidationResult.reject(
                f"{code_prefix}_OUT_OF_RANGE",
                f"{code_prefix.lower()} must be between {minimum} and {maximum}.",
            )
        return ValidationResult.allow()

    @staticmethod
    def _validate_duration(value: Any, maximum_ms: int, code_prefix: str) -> ValidationResult:
        if not isinstance(value, int) or isinstance(value, bool) or value <= 0:
            return ValidationResult.reject(f"INVALID_{code_prefix}", "Duration must be a positive integer.")
        if value > maximum_ms:
            return ValidationResult.reject(
                f"{code_prefix}_EXCEEDS_POLICY",
                f"Duration {value} ms exceeds policy maximum {maximum_ms} ms.",
            )
        return ValidationResult.allow()
