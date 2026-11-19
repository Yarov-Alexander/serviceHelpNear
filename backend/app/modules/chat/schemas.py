from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    sender_id: int
    text: str
    created_at: datetime


class ConversationRead(BaseModel):
    order_id: int
    topic: str
    participant_name: str
    unread_count: int
    last_message: MessageRead | None
