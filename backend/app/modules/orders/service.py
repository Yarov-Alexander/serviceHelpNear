from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.orders.exceptions import (
    OrderAlreadyAssignedError,
    OrderNotFoundError,
)
from app.modules.orders.models import Order


async def get_order_for_chat(
    session: AsyncSession, order_id: int, user_id: int
) -> Order | None:
    order = await session.get(Order, order_id)
    if order is None or user_id not in {order.customer_id, order.executor_id}:
        return None
    return order


async def create_order(
    session: AsyncSession, customer_id: int, task: str, price: int, city: str
) -> Order:
    order = Order(
        customer_id=customer_id,
        task=task.strip(),
        price=price,
        city=city.strip(),
    )
    session.add(order)
    await session.commit()
    await session.refresh(order)
    return order


async def list_customer_orders(session: AsyncSession, customer_id: int) -> list[Order]:
    result = await session.scalars(
        select(Order)
        .where(Order.customer_id == customer_id)
        .order_by(Order.created_at.desc(), Order.id.desc())
    )
    return list(result)


async def list_executor_orders(session: AsyncSession, executor_id: int) -> list[Order]:
    result = await session.scalars(
        select(Order)
        .where(Order.executor_id == executor_id)
        .order_by(Order.created_at.desc(), Order.id.desc())
    )
    return list(result)


async def list_available_orders(session: AsyncSession) -> list[Order]:
    result = await session.scalars(
        select(Order)
        .where(Order.status == "open", Order.executor_id.is_(None))
        .order_by(Order.created_at.desc(), Order.id.desc())
    )
    return list(result)


async def accept_order(
    session: AsyncSession, order_id: int, executor_id: int
) -> Order:
    order = await session.scalar(
        select(Order).where(Order.id == order_id).with_for_update()
    )
    if order is None:
        raise OrderNotFoundError()
    if order.status != "open" or order.executor_id is not None:
        raise OrderAlreadyAssignedError()

    order.executor_id = executor_id
    order.status = "assigned"
    await session.commit()
    await session.refresh(order)
    return order
