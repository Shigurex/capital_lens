from capital_lens_ingest.infrastructure.rate_control import (
    RequestThrottler,
    RetryPolicy,
    parse_retry_after_seconds,
)


def test_request_throttler_waits_for_remaining_interval() -> None:
    calls: list[float] = []
    values = iter([0.0, 0.2, 1.0])

    def fake_clock() -> float:
        return next(values)

    def fake_sleep(seconds: float) -> None:
        calls.append(seconds)

    throttler = RequestThrottler(
        min_interval_seconds=1.0,
        clock=fake_clock,
        sleeper=fake_sleep,
    )
    throttler.wait()
    throttler.wait()

    assert calls == [0.8]


def test_retry_policy_uses_retry_after_if_present() -> None:
    policy = RetryPolicy(max_attempts=3, base_backoff_seconds=1.0, max_backoff_seconds=30.0)

    assert policy.backoff_seconds(1) == 1.0
    assert policy.backoff_seconds(2) == 2.0
    assert policy.backoff_seconds(2, retry_after_seconds=15.0) == 15.0
    assert policy.backoff_seconds(2, retry_after_seconds=99.0) == 30.0


def test_parse_retry_after_seconds() -> None:
    assert parse_retry_after_seconds("3") == 3.0
    assert parse_retry_after_seconds(" 2.5 ") == 2.5
    assert parse_retry_after_seconds("abc") is None
    assert parse_retry_after_seconds(None) is None
