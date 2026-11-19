from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.modules.auth.dependencies import get_current_user, require_role
from app.modules.orders import service
from app.modules.orders.exceptions import (
    OrderAlreadyAssignedError,
    OrderNotFoundError,
)
from app.modules.orders.schemas import OrderCreate, OrderRead
from app.modules.users.models import User, UserRole

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_role(UserRole.customer)),
):
    return await service.create_order(
        session, user.id, data.task, data.price, data.city
    )


@router.get("/mine", response_model=list[OrderRead])
async def my_orders(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    if user.role == UserRole.customer:
        return await service.list_customer_orders(session, user.id)
    if user.role == UserRole.executor:
        return await service.list_executor_orders(session, user.id)
    return []


@router.get("/available", response_model=list[OrderRead])
async def available_orders(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    city: str | None = Query(default=None, min_length=1, max_length=100),
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_role(UserRole.executor)),
):
    return await service.list_available_orders(session, limit, offset, city)


@router.post("/{order_id}/accept", response_model=OrderRead)
async def accept_order(
    order_id: int,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_role(UserRole.executor)),
):
    try:
        return await service.accept_order(session, order_id, user.id)
    except OrderNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заказ не найден")
    except OrderAlreadyAssignedError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Заказ уже взят другим исполнителем",
        )
