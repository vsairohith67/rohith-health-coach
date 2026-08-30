import hmac
import time
from collections import defaultdict, deque
from typing import Annotated

from fastapi import Depends, Header, HTTPException, Request, status

from .config import Settings, get_settings


class SlidingWindowLimiter:
    def __init__(self) -> None:
        self._events: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str, maximum: int, window_seconds: int = 60) -> None:
        now = time.monotonic()
        events = self._events[key]
        while events and events[0] <= now - window_seconds:
            events.popleft()
        if len(events) >= maximum:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="rate_limited",
            )
        events.append(now)


limiter = SlidingWindowLimiter()


def require_internal_auth(
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
    authorization: str | None = Header(default=None),
) -> None:
    if not settings.internal_token:
        raise HTTPException(status_code=503, detail="internal_auth_not_configured")
    expected = f"Bearer {settings.internal_token}"
    if authorization is None or not hmac.compare_digest(authorization, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid_internal_token",
        )
    client = request.client.host if request.client else "unknown"
    limiter.check(client, settings.requests_per_minute)
