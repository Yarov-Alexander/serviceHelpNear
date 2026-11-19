import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "unit-test-secret-key")

from fastapi import Response
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.database import Base
from app.core.security import decode_access_token, hash_password
from app.modules.auth.router import login, logout, refresh
from app.modules.auth.schemas import LoginRequest
from app.modules.auth.tokens import issue_tokens, rotate_refresh_token
from app.modules.users.models import User, UserRole


class InMemoryRedis:
    def __init__(self) -> None:
        self.values: dict[str, str] = {}

    async def set(self, key: str, value: str, ex: int) -> None:
        self.values[key] = value

    async def getdel(self, key: str) -> str | None:
        return self.values.pop(key, None)

    async def delete(self, key: str) -> None:
        self.values.pop(key, None)


class AuthTokenTests(unittest.IsolatedAsyncioTestCase):
    async def test_refresh_tokens_rotate_and_cannot_be_reused(self) -> None:
        redis = InMemoryRedis()
        access_token, refresh_token = await issue_tokens(redis, 42)

        self.assertEqual(decode_access_token(access_token), 42)
        rotated = await rotate_refresh_token(redis, refresh_token)

        self.assertIsNotNone(rotated)
        user_id, new_access_token, new_refresh_token = rotated
        self.assertEqual(user_id, 42)
        self.assertEqual(decode_access_token(new_access_token), 42)
        self.assertNotEqual(refresh_token, new_refresh_token)
        self.assertIsNone(await rotate_refresh_token(redis, refresh_token))

    async def test_login_sets_http_only_refresh_cookie_and_logout_revokes_it(self) -> None:
        engine = create_async_engine("sqlite+aiosqlite:///:memory:")
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
        session_factory = async_sessionmaker(engine, expire_on_commit=False)
        redis = InMemoryRedis()

        async with session_factory() as session:
            user = User(
                email="customer@example.com",
                hashed_password=hash_password("valid-password-123"),
                role=UserRole.customer,
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)

            login_response = Response()
            tokens = await login(
                LoginRequest(email=user.email, password="valid-password-123"),
                login_response,
                session,
                redis,
            )
            self.assertEqual(decode_access_token(tokens.access_token), user.id)
            login_cookie = login_response.headers["set-cookie"]
            self.assertIn("httponly", login_cookie.lower())
            refresh_token = login_cookie.split(";", maxsplit=1)[0].split("=", maxsplit=1)[1]

            refresh_response = Response()
            refreshed = await refresh(refresh_response, refresh_token, redis)
            self.assertEqual(decode_access_token(refreshed.access_token), user.id)
            rotated_cookie = refresh_response.headers["set-cookie"]
            new_refresh_token = rotated_cookie.split(";", maxsplit=1)[0].split("=", maxsplit=1)[1]
            self.assertNotEqual(refresh_token, new_refresh_token)

            logout_response = Response()
            await logout(logout_response, new_refresh_token, redis)
            self.assertIn("max-age=0", logout_response.headers["set-cookie"].lower())

        await engine.dispose()
