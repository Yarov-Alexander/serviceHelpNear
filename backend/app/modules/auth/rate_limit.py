import hashlib

from redis.asyncio import Redis

LOGIN_MAX_ATTEMPTS = 5
LOGIN_WINDOW_SECONDS = 15 * 60
_INCREMENT_SCRIPT = """
local attempts = redis.call('INCR', KEYS[1])
if attempts == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return attempts
"""


def _login_key(client_ip: str) -> str:
    digest = hashlib.sha256(client_ip.encode("utf-8")).hexdigest()
    return f"auth:login-attempts:{digest}"


async def is_login_rate_limited(redis: Redis, client_ip: str) -> bool:
    attempts = await redis.get(_login_key(client_ip))
    return attempts is not None and int(attempts) >= LOGIN_MAX_ATTEMPTS


async def record_failed_login(redis: Redis, client_ip: str) -> None:
    await redis.eval(
        _INCREMENT_SCRIPT,
        1,
        _login_key(client_ip),
        LOGIN_WINDOW_SECONDS,
    )


async def clear_failed_logins(redis: Redis, client_ip: str) -> None:
    await redis.delete(_login_key(client_ip))
