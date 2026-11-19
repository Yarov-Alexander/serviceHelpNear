from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.modules.orders.models import OrderStatus


class OrderCreate(BaseModel):
    task: str = Field(min_length=2, max_length=300)
    price: int = Field(gt=0)
    city: str = Field(min_length=1, max_length=100)

    @field_validator("task")
    @classmethod
    def validate_task(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Опишите задачу минимум двумя символами")
        return value

    @field_validator("city")
    @classmethod
    def validate_city(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Укажите город")
        return value


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    executor_id: int | None
    task: str
    price: int
    city: str
    status: OrderStatus
    created_at: datetime
