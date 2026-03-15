from __future__ import annotations

import os
import time
from dataclasses import dataclass
from typing import Callable


def read_env_float(name: str, default: float, min_value: float = 0.0) -> float:
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    try:
        value = float(raw)
    except ValueError as error:
        raise ValueError(f"{name} must be a float value.") from error
    if value < min_value:
        raise ValueError(f"{name} must be >= {min_value}.")
    return value


def read_env_int(name: str, default: int, min_value: int = 1) -> int:
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    try:
        value = int(raw)
    except ValueError as error:
        raise ValueError(f"{name} must be an integer value.") from error
    if value < min_value:
        raise ValueError(f"{name} must be >= {min_value}.")
    return value


def parse_retry_after_seconds(header_value: str | None) -> float | None:
    if header_value is None:
        return None
    trimmed = header_value.strip()
    if not trimmed:
        return None
    try:
        return max(0.0, float(trimmed))
    except ValueError:
        return None


@dataclass(slots=True)
class RetryPolicy:
    max_attempts: int
    base_backoff_seconds: float
    max_backoff_seconds: float

    def backoff_seconds(
        self,
        attempt: int,
        retry_after_seconds: float | None = None,
    ) -> float:
        if retry_after_seconds is not None:
            return min(self.max_backoff_seconds, max(0.0, retry_after_seconds))
        exponent = max(0, attempt - 1)
        delay = self.base_backoff_seconds * (2**exponent)
        return min(self.max_backoff_seconds, delay)


class RequestThrottler:
    def __init__(
        self,
        min_interval_seconds: float,
        clock: Callable[[], float] | None = None,
        sleeper: Callable[[float], None] | None = None,
    ) -> None:
        if min_interval_seconds < 0:
            raise ValueError("min_interval_seconds must be >= 0.")
        self.min_interval_seconds = min_interval_seconds
        self._clock = clock or time.monotonic
        self._sleeper = sleeper or time.sleep
        self._last_request_at: float | None = None

    def wait(self) -> None:
        now = self._clock()
        if self._last_request_at is not None and self.min_interval_seconds > 0:
            elapsed = now - self._last_request_at
            remaining = self.min_interval_seconds - elapsed
            if remaining > 0:
                self._sleeper(remaining)
                now = self._clock()
        self._last_request_at = now
