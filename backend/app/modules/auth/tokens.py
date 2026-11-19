import hashlib
import secrets

from redis.asyncio import Redis

from app.core.config import settings
from app.core.security import create_access_token


def _refresh_key(token: str) -> str:
    digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
    return f"auth:refresh:{digest}"


async def issue_tokens(redis: Redis, user_id: int) -> tuple[str, str]:
    refresh_token = secrets.token_urlsafe(48)
    await redis.set(
        _refresh_key(refresh_token),
        str(user_id),
        ex=settings.refresh_token_expire_days * 24 * 60 * 60,
    )
    return create_access_token(user_id), refresh_token


async def rotate_refresh_token(redis: Redis, token: str | None) -> tuple[int, str, str] | None:
    if not token:
        return None

    user_id = await redis.getdel(_refresh_key(token))
    if user_id is None:
        return None

    access_token, refresh_token = await issue_tokens(redis, int(user_id))
    return int(user_id), access_token, refresh_token


async def revoke_refresh_token(redis: Redis, token: str | None) -> None:
    if token:
        await redis.delete(_refresh_key(token))
