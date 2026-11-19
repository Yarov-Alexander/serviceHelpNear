"""Store order status as a database enum and add the available-order index.

Revision ID: 0002_order_status_enum
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002_order_status_enum"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


order_status = sa.Enum("open", "assigned", name="order_status", length=20)


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        order_status.create(bind, checkfirst=True)
        op.alter_column(
            "orders",
            "status",
            existing_type=sa.String(length=20),
            server_default=None,
            existing_nullable=False,
        )
        op.alter_column(
            "orders",
            "status",
            existing_type=sa.String(length=20),
            type_=order_status,
            existing_nullable=False,
            postgresql_using="status::text::order_status",
        )
        op.alter_column(
            "orders",
            "status",
            existing_type=order_status,
            server_default=sa.text("'open'::order_status"),
            existing_nullable=False,
        )
    op.create_index(
        "ix_orders_status_executor_id",
        "orders",
        ["status", "executor_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_orders_status_executor_id", table_name="orders")
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.alter_column(
            "orders",
            "status",
            existing_type=order_status,
            server_default=None,
            existing_nullable=False,
        )
        op.alter_column(
            "orders",
            "status",
            existing_type=order_status,
            type_=sa.String(length=20),
            existing_nullable=False,
            postgresql_using="status::text",
        )
        op.alter_column(
            "orders",
            "status",
            existing_type=sa.String(length=20),
            server_default="open",
            existing_nullable=False,
        )
        order_status.drop(bind, checkfirst=True)
