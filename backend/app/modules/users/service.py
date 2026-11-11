from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.models import User, UserRole


async def get_by_id(session: AsyncSession, user_id: int) -> User | None:
    return await session.get(User, user_id)


async def get_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def create(
    session: AsyncSession, email: str, hashed_password: str, role: UserRole
) -> User:
    user = User(email=email, hashed_password=hashed_password, role=role)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user
