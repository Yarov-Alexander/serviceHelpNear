import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class OrderStatus(str, enum.Enum):
    open = "open"
    assigned = "assigned"


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        Index("ix_orders_status_created_at", "status", "created_at"),
        Index("ix_orders_status_executor_id", "status", "executor_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    executor_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    task: Mapped[str] = mapped_column(String(300))
    price: Mapped[int] = mapped_column(Integer)
    city: Mapped[str] = mapped_column(String(100))
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, name="order_status", length=20),
        default=OrderStatus.open,
        server_default=OrderStatus.open.value,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
