from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# Engine держит пул соединений с PostgreSQL. Он один на всё приложение.
engine = create_async_engine(settings.database_url)

# Фабрика сессий. expire_on_commit=False нужен, чтобы после commit()
# можно было читать поля объекта без повторного запроса к БД.
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    """Базовый класс для всех моделей. Модели из разных модулей наследуются от него."""


async def get_session() -> AsyncIterator[AsyncSession]:
    """FastAPI-зависимость: открывает сессию на время запроса и закрывает после."""
    async with SessionLocal() as session:
        yield session
