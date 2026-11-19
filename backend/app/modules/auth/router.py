from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_session
from app.core.redis import get_redis
from app.modules.auth import service
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.exceptions import (
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
)
from app.modules.auth.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.modules.auth.tokens import issue_tokens, revoke_refresh_token, rotate_refresh_token
from app.modules.users.models import User
from app.modules.users.schemas import UserRead

router = APIRouter(prefix="/auth", tags=["auth"])
REFRESH_COOKIE = "refresh_token"


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.refresh_cookie_secure,
        samesite="strict",
        path="/auth",
    )


def _delete_refresh_cookie(response: Response) -> str:
    response.delete_cookie(
        REFRESH_COOKIE,
        path="/auth",
        secure=settings.refresh_cookie_secure,
        httponly=True,
        samesite="strict",
    )
    return response.headers["set-cookie"]


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, session: AsyncSession = Depends(get_session)):
    try:
        return await service.register(session, data)
    except EmailAlreadyRegisteredError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email уже зарегистрирован"
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis),
):
    try:
        user = await service.login(session, data)
    except InvalidCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль"
        )
    access_token, refresh_token = await issue_tokens(redis, user.id)
    _set_refresh_cookie(response, refresh_token)
    return TokenResponse(access_token=access_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE),
    redis: Redis = Depends(get_redis),
):
    rotated = await rotate_refresh_token(redis, refresh_token)
    if rotated is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Сессия истекла",
            headers={"Set-Cookie": _delete_refresh_cookie(response)},
        )

    _, access_token, new_refresh_token = rotated
    _set_refresh_cookie(response, new_refresh_token)
    return TokenResponse(access_token=access_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE),
    redis: Redis = Depends(get_redis),
):
    await revoke_refresh_token(redis, refresh_token)
    _delete_refresh_cookie(response)


@router.get("/me", response_model=UserRead)
async def me(user: User = Depends(get_current_user)):
    return user
