import asyncio
import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "unit-test-secret-key")

from app.modules.chat.router import ConnectionManager


class SharedPubSub:
    def __init__(self) -> None:
        self.messages: asyncio.Queue[dict[str, str]] = asyncio.Queue()

    async def psubscribe(self, pattern: str) -> None:
        self.pattern = pattern

    async def listen(self):
        while True:
            yield await self.messages.get()

    async def aclose(self) -> None:
        await self.messages.put({"type": "closed"})


class SharedRedis:
    def __init__(self) -> None:
        self.pubsubs: list[SharedPubSub] = []

    def pubsub(self) -> SharedPubSub:
        pubsub = SharedPubSub()
        self.pubsubs.append(pubsub)
        return pubsub

    async def publish(self, channel: str, message: str) -> None:
        for pubsub in self.pubsubs:
            await pubsub.messages.put(
                {"type": "pmessage", "channel": channel, "data": message}
            )


class RecordingWebSocket:
    def __init__(self) -> None:
        self.events: list[dict[str, object]] = []
        self.received = asyncio.Event()

    async def send_json(self, event: dict[str, object]) -> None:
        self.events.append(event)
        self.received.set()


class ChatPubSubTests(unittest.IsolatedAsyncioTestCase):
    async def test_publish_reaches_connections_on_other_worker(self) -> None:
        redis = SharedRedis()
        first_worker = ConnectionManager()
        second_worker = ConnectionManager()
        first_socket = RecordingWebSocket()
        second_socket = RecordingWebSocket()
        event = {"type": "message", "message": {"id": 17, "text": "Hi"}}

        await first_worker.start(redis)
        await second_worker.start(redis)
        try:
            await first_worker.connect(17, first_socket)
            await second_worker.connect(17, second_socket)
            await first_worker.publish(17, event)
            await asyncio.wait_for(second_socket.received.wait(), timeout=1)

            self.assertEqual(second_socket.events, [event])
        finally:
            await first_worker.stop()
            await second_worker.stop()
