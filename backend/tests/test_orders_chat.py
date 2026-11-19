import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "unit-test-secret-key")

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.database import Base
from app.modules.chat import service as chat_service
from app.modules.orders import service as order_service
from app.modules.users.models import User, UserRole


class OrdersAndChatTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.engine = create_async_engine("sqlite+aiosqlite:///:memory:")
        async with self.engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
        self.session_factory = async_sessionmaker(self.engine, expire_on_commit=False)

    async def asyncTearDown(self) -> None:
        await self.engine.dispose()

    async def test_order_is_persisted_and_only_assigned_users_can_chat(self) -> None:
        async with self.session_factory() as session:
            customer = User(
                email="customer@example.com",
                hashed_password="hash",
                role=UserRole.customer,
            )
            executor = User(
                email="executor@example.com",
                hashed_password="hash",
                role=UserRole.executor,
            )
            unrelated = User(
                email="other@example.com",
                hashed_password="hash",
                role=UserRole.customer,
            )
            session.add_all([customer, executor, unrelated])
            await session.commit()
            await session.refresh(customer)
            await session.refresh(executor)
            await session.refresh(unrelated)

            order = await order_service.create_order(
                session, customer.id, "Помочь с переездом", 1500, "Москва"
            )
            self.assertEqual(order.status, "open")
            self.assertIsNone(
                await order_service.get_order_for_chat(session, order.id, executor.id)
            )

            order = await order_service.accept_order(session, order.id, executor.id)
            self.assertEqual(order.executor_id, executor.id)
            self.assertIsNotNone(
                await order_service.get_order_for_chat(session, order.id, executor.id)
            )
            self.assertIsNone(
                await order_service.get_order_for_chat(session, order.id, unrelated.id)
            )

            message = await chat_service.create_message(
                session, order.id, customer.id, "Здравствуйте!"
            )
            self.assertEqual(message.text, "Здравствуйте!")
            self.assertEqual(
                (await chat_service.list_messages(session, order.id, executor.id))[0].id,
                message.id,
            )
            executor_conversations = await chat_service.list_conversations(session, executor)
            self.assertEqual(executor_conversations[0]["unread_count"], 1)
            self.assertTrue(
                await chat_service.mark_conversation_read(session, order.id, executor.id)
            )
            executor_conversations = await chat_service.list_conversations(session, executor)
            self.assertEqual(executor_conversations[0]["unread_count"], 0)

    async def test_available_orders_support_city_filter_and_offset_pagination(self) -> None:
        async with self.session_factory() as session:
            customer = User(
                email="customer@example.com",
                hashed_password="hash",
                role=UserRole.customer,
            )
            session.add(customer)
            await session.commit()
            await session.refresh(customer)

            first = await order_service.create_order(
                session, customer.id, "Task one", 100, "Томск"
            )
            second = await order_service.create_order(
                session, customer.id, "Task two", 200, "Томск"
            )
            await order_service.create_order(
                session, customer.id, "Task three", 300, "Москва"
            )

            page = await order_service.list_available_orders(
                session, limit=1, offset=0, city="Томск"
            )
            next_page = await order_service.list_available_orders(
                session, limit=1, offset=1, city="Томск"
            )

            self.assertEqual([order.id for order in page], [second.id])
            self.assertEqual([order.id for order in next_page], [first.id])

    async def test_chat_history_returns_latest_page_and_older_cursor(self) -> None:
        async with self.session_factory() as session:
            customer = User(
                email="customer@example.com",
                hashed_password="hash",
                role=UserRole.customer,
            )
            executor = User(
                email="executor@example.com",
                hashed_password="hash",
                role=UserRole.executor,
            )
            session.add_all([customer, executor])
            await session.commit()
            await session.refresh(customer)
            await session.refresh(executor)
            order = await order_service.create_order(
                session, customer.id, "Task", 100, "Томск"
            )
            order = await order_service.accept_order(session, order.id, executor.id)
            messages = [
                await chat_service.create_message(
                    session, order.id, customer.id, f"Message {index}"
                )
                for index in range(5)
            ]

            latest = await chat_service.list_messages(
                session, order.id, customer.id, limit=2
            )
            older = await chat_service.list_messages(
                session,
                order.id,
                customer.id,
                limit=2,
                before_id=latest[0].id,
            )

            self.assertEqual([message.id for message in latest], [messages[3].id, messages[4].id])
            self.assertEqual([message.id for message in older], [messages[1].id, messages[2].id])
