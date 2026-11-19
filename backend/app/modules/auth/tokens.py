import hashlib
import secrets

from redis.asyncio import Redis

from app.core.config import settings
from app.core.security import create_access_token

REFRESH_GRACE_SECONDS = 5
_ROTATE_REFRESH_SCRIPT = """
local user_id = redis.call('GET', KEYS[1])
if user_id then
    redis.call('DEL', KEYS[1])
    redis.call('SET', KEYS[2], user_id, 'EX', ARGV[1])
    redis.call('SET', KEYS[3], user_id .. '|' .. KEYS[2], 'EX', ARGV[2])
    return user_id
end
local replay = redis.call('GET', KEYS[3])
if replay then
    local separator = string.find(replay, '|', 1, true)
    local replay_user_id = string.sub(replay, 1, separator - 1)
    local rotated_key = string.sub(replay, separator + 1)
    if redis.call('EXISTS', rotated_key) == 1 then
        return 'grace:' .. replay_user_id
    end
end
return nil
"""


def _refresh_key(token: str) -> str:
    digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
    return f"auth:refresh:{digest}"


def _refresh_grace_key(token: str) -> str:
    digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
    return f"auth:refresh-grace:{digest}"


async def issue_tokens(redis: Redis, user_id: int) -> tuple[str, str]:
    refresh_token = secrets.token_urlsafe(48)
    await redis.set(
        _refresh_key(refresh_token),
        str(user_id),
        ex=settings.refresh_token_expire_days * 24 * 60 * 60,
    )
    return create_access_token(user_id), refresh_token


async def rotate_refresh_token(
    redis: Redis, token: str | None
) -> tuple[int, str, str | None] | None:
    if not token:
        return None

    refresh_token = secrets.token_urlsafe(48)
    user_id = await redis.eval(
        _ROTATE_REFRESH_SCRIPT,
        3,
        _refresh_key(token),
        _refresh_key(refresh_token),
        _refresh_grace_key(token),
        settings.refresh_token_expire_days * 24 * 60 * 60,
        REFRESH_GRACE_SECONDS,
    )
    if user_id is None:
        return None

    if str(user_id).startswith("grace:"):
        user_id = str(user_id).removeprefix("grace:")
        return int(user_id), create_access_token(int(user_id)), None

    return int(user_id), create_access_token(int(user_id)), refresh_token


async def revoke_refresh_token(redis: Redis, token: str | None) -> None:
    if token:
        await redis.delete(_refresh_key(token))
