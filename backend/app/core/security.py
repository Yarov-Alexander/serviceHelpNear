"""Низкоуровневые инструменты безопасности: пароли и JWT.

Здесь нет бизнес-логики («кто может входить»). Это только функции-инструменты,
поэтому лежат в core и доступны любому модулю.
"""
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.core.config import settings

# recommended() сейчас означает argon2: современный алгоритм хеширования паролей
_password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return _password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return _password_hash.verify(password, hashed_password)


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    # sub (subject) по стандарту JWT: чей это токен. Должен быть строкой.
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int:
    """Возвращает id пользователя. Если токен подделан или просрочен, бросает jwt.PyJWTError."""
    payload = jwt.decode(
        token, settings.secret_key, algorithms=[settings.jwt_algorithm]
    )
    return int(payload["sub"])
