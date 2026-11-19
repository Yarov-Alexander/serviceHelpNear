from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from redis.asyncio import Redis

from app.core.config import settings
from app.core.database import engine
from app.modules.auth.router import router as auth_router
from app.modules.chat.router import manager as chat_manager
from app.modules.chat.router import router as chat_router
from app.modules.orders.router import router as orders_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    redis = Redis.from_url(settings.redis_url, decode_responses=True)
    try:
        await redis.ping()
        app.state.redis = redis
        await chat_manager.start(redis)

        yield
    finally:
        try:
            await chat_manager.stop()
        finally:
            await redis.aclose()
            await engine.dispose()


app = FastAPI(title="API", lifespan=lifespan)

# Разрешаем фронтенду (другой порт = другой origin) обращаться к API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Каждый модуль подключается одной строкой. Добавил модуль orders: добавил include_router.
app.include_router(auth_router)
app.include_router(orders_router)
app.include_router(chat_router)
