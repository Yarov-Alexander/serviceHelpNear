"""Бизнес-логика авторизации. Ничего не знает про HTTP, Request и HTTPException."""
import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.modules.auth.exceptions import (
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    InvalidTokenError,
)
from app.modules.auth.schemas import LoginRequest, RegisterRequest
from app.modules.users import service as users_service
from app.modules.users.models import User, UserRole


async def register(session: AsyncSession, data: RegisterRequest) -> User:
    email = data.email.lower()
    if await users_service.get_by_email(session, email):
        raise EmailAlreadyRegisteredError()

    return await users_service.create(
        session,
        email=email,
        hashed_password=hash_password(data.password),
        role=UserRole(data.role),
    )


async def login(session: AsyncSession, data: LoginRequest) -> str:
    user = await users_service.get_by_email(session, data.email.lower())
    
    if user is None or not verify_password(data.password, user.hashed_password):
        raise InvalidCredentialsError()

    return create_access_token(user.id)


async def get_user_by_token(session: AsyncSession, token: str) -> User:
    try:
        user_id = decode_access_token(token)
    except (jwt.PyJWTError, KeyError, ValueError):
        raise InvalidTokenError()

    user = await users_service.get_by_id(session, user_id)
    if user is None:  # токен валиден, но пользователя уже удалили
        raise InvalidTokenError()
    return user
