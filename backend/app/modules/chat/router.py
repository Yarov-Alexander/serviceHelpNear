import asyncio
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import SessionLocal, get_session
from app.modules.auth import service as auth_service
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.exceptions import InvalidTokenError
from app.modules.chat import service
from app.modules.chat.schemas import ConversationRead, MessageRead
from app.modules.orders.service import get_order_for_chat
from app.modules.users.models import User

router = APIRouter(prefix="/chat", tags=["chat"])


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[int, set[WebSocket]] = defaultdict(set)

    async def connect(self, order_id: int, websocket: WebSocket) -> None:
        self._connections[order_id].add(websocket)

    async def disconnect(self, order_id: int, websocket: WebSocket) -> None:
        connections = self._connections.get(order_id)
        if connections is None:
            return
        connections.discard(websocket)
        if not connections:
            self._connections.pop(order_id, None)

    async def broadcast(self, order_id: int, event: dict[str, object]) -> None:
        stale: list[WebSocket] = []
        for connection in tuple(self._connections.get(order_id, ())):
            try:
                await connection.send_json(event)
            except (RuntimeError, WebSocketDisconnect):
                stale.append(connection)
        for connection in stale:
            await self.disconnect(order_id, connection)


manager = ConnectionManager()


@router.get("/conversations", response_model=list[ConversationRead])
async def conversations(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    return await service.list_conversations(session, user)


@router.get("/orders/{order_id}/messages", response_model=list[MessageRead])
async def messages(
    order_id: int,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    result = await service.list_messages(session, order_id, user.id)
    if result is None:
        raise HTTPException(status_code=404, detail="Диалог не найден")
    return result


@router.post("/orders/{order_id}/read", status_code=204)
async def mark_read(
    order_id: int,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    if not await service.mark_conversation_read(session, order_id, user.id):
        raise HTTPException(status_code=404, detail="Диалог не найден")


@router.websocket("/orders/{order_id}/ws")
async def order_chat(websocket: WebSocket, order_id: int):
    await websocket.accept()
    try:
        auth_event = await asyncio.wait_for(websocket.receive_json(), timeout=5)
        access_token = (
            auth_event.get("access_token")
            if isinstance(auth_event, dict) and auth_event.get("type") == "auth"
            else None
        )
        if not isinstance(access_token, str) or not access_token:
            await websocket.close(code=4401, reason="Authentication required")
            return

        async with SessionLocal() as session:
            try:
                user = await auth_service.get_user_by_token(session, access_token)
            except InvalidTokenError:
                await websocket.close(code=4401, reason="Invalid access token")
                return

            order = await get_order_for_chat(session, order_id, user.id)
            if order is None:
                await websocket.close(code=4403, reason="Chat access denied")
                return
            sender_id = user.id

        await manager.connect(order_id, websocket)
        await websocket.send_json({"type": "ready"})

        while True:
            event = await websocket.receive_json()
            if not isinstance(event, dict) or event.get("type") != "message":
                await websocket.send_json(
                    {"type": "error", "message": "Expected a message event"}
                )
                continue

            text = event.get("text")
            if not isinstance(text, str) or not text.strip():
                await websocket.send_json(
                    {"type": "error", "message": "Message text is required"}
                )
                continue
            text = text.strip()
            if len(text) > 4000:
                await websocket.send_json(
                    {"type": "error", "message": "Message is too long"}
                )
                continue

            async with SessionLocal() as session:
                order = await get_order_for_chat(session, order_id, sender_id)
                if order is None:
                    await websocket.close(code=4403, reason="Chat access revoked")
                    return
                message = await service.create_message(
                    session, order_id, sender_id, text
                )

            serialized = MessageRead.model_validate(message).model_dump(mode="json")
            await manager.broadcast(
                order_id, {"type": "message", "message": serialized}
            )
    except asyncio.TimeoutError:
        await websocket.close(code=4401, reason="Authentication timed out")
    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(order_id, websocket)
