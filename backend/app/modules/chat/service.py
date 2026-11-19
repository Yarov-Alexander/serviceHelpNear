from datetime import datetime, timezone

from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.chat.models import OrderMessage
from app.modules.orders.models import Order
from app.modules.orders.service import get_order_for_chat
from app.modules.users.models import User


async def list_conversations(
    session: AsyncSession, user: User
) -> list[dict[str, object]]:
    orders = await session.scalars(
        select(Order)
        .where(
            Order.executor_id.is_not(None),
            or_(Order.customer_id == user.id, Order.executor_id == user.id),
        )
        .order_by(Order.created_at.desc(), Order.id.desc())
    )

    conversations: list[dict[str, object]] = []
    for order in orders:
        counterpart_id = (
            order.executor_id if order.customer_id == user.id else order.customer_id
        )
        counterpart = await session.get(User, counterpart_id)
        last_message = await session.scalar(
            select(OrderMessage)
            .where(OrderMessage.order_id == order.id)
            .order_by(OrderMessage.created_at.desc(), OrderMessage.id.desc())
            .limit(1)
        )
        unread_count = await session.scalar(
            select(func.count(OrderMessage.id)).where(
                OrderMessage.order_id == order.id,
                OrderMessage.sender_id != user.id,
                OrderMessage.read_at.is_(None),
            )
        )
        conversations.append(
            {
                "order_id": order.id,
                "topic": order.task,
                "participant_name": counterpart.email if counterpart else "Участник",
                "unread_count": unread_count or 0,
                "last_message": last_message,
            }
        )
    return conversations


async def mark_conversation_read(
    session: AsyncSession, order_id: int, user_id: int
) -> bool:
    order = await get_order_for_chat(session, order_id, user_id)
    if order is None:
        return False

    await session.execute(
        update(OrderMessage)
        .where(
            OrderMessage.order_id == order_id,
            OrderMessage.sender_id != user_id,
            OrderMessage.read_at.is_(None),
        )
        .values(read_at=datetime.now(timezone.utc))
    )
    await session.commit()
    return True


async def list_messages(
    session: AsyncSession,
    order_id: int,
    user_id: int,
    limit: int = 50,
    before_id: int | None = None,
) -> list[OrderMessage] | None:
    order = await get_order_for_chat(session, order_id, user_id)
    if order is None:
        return None

    statement = select(OrderMessage).where(OrderMessage.order_id == order_id)
    if before_id is not None:
        statement = statement.where(OrderMessage.id < before_id)
    result = await session.scalars(
        statement.order_by(OrderMessage.id.desc()).limit(limit)
    )
    return list(reversed(result.all()))


async def create_message(
    session: AsyncSession, order_id: int, sender_id: int, text: str
) -> OrderMessage:
    message = OrderMessage(order_id=order_id, sender_id=sender_id, text=text)
    session.add(message)
    await session.commit()
    await session.refresh(message)
    return message
