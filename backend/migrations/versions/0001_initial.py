"""Create the initial application schema.

Revision ID: 0001_initial
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


LEGACY_COLUMNS = {
    "users": {"id", "email", "hashed_password", "role", "created_at"},
    "orders": {
        "id",
        "customer_id",
        "executor_id",
        "task",
        "price",
        "city",
        "status",
        "created_at",
    },
    "order_messages": {
        "id",
        "order_id",
        "sender_id",
        "text",
        "read_at",
        "created_at",
    },
}

LEGACY_INDEXES = {
    "users": {"ix_users_email"},
    "orders": {
        "ix_orders_customer_id",
        "ix_orders_executor_id",
        "ix_orders_status",
        "ix_orders_status_created_at",
    },
    "order_messages": {
        "ix_order_messages_order_id",
        "ix_order_messages_sender_id",
        "ix_order_messages_order_created",
    },
}


def _is_legacy_create_all_schema(connection: sa.Connection) -> bool:
    inspector = inspect(connection)
    tables = set(inspector.get_table_names())
    legacy_tables = set(LEGACY_COLUMNS)
    present_tables = tables & legacy_tables

    if not present_tables:
        return False
    if present_tables != legacy_tables:
        raise RuntimeError(
            "Found a partial pre-Alembic database schema. Back up the database "
            "and resolve its schema before running migrations."
        )
    if connection.dialect.name != "postgresql":
        raise RuntimeError(
            "Cannot automatically recognize the pre-Alembic schema on "
            f"{connection.dialect.name}."
        )

    for table_name, expected_columns in LEGACY_COLUMNS.items():
            actual_columns = {
                column["name"] for column in inspector.get_columns(table_name)
            }
        actual_indexes = {
            index["name"] for index in inspector.get_indexes(table_name)
        }
        expected_indexes = LEGACY_INDEXES[table_name]
            if (
                actual_columns != expected_columns
                or not expected_indexes <= actual_indexes
            ):
            raise RuntimeError(
                f"Existing table {table_name!r} does not match the known "
                "pre-Alembic schema; refusing to stamp it automatically."
            )

    role_labels = connection.execute(
        sa.text(
            """
            SELECT e.enumlabel
            FROM pg_type AS t
            JOIN pg_enum AS e ON e.enumtypid = t.oid
            WHERE t.typname = 'userrole'
              AND t.typnamespace = current_schema()::regnamespace
            ORDER BY e.enumsortorder
            """
        )
    ).scalars().all()
    if role_labels != ["customer", "executor", "admin"]:
        raise RuntimeError(
            "The existing userrole enum does not match the known pre-Alembic schema."
        )

    status_type = connection.execute(
        sa.text(
            """
            SELECT data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'orders'
              AND column_name = 'status'
            """
        )
    ).one()
    if status_type != ("character varying", 20):
        raise RuntimeError(
            "The existing orders.status column does not match the known "
            "pre-Alembic schema."
        )

    return True


def upgrade() -> None:
    connection = op.get_bind()
    if _is_legacy_create_all_schema(connection):
        op.get_context().config.print_stdout(
            "Recognized the pre-Alembic schema; recording the initial revision."
        )
        return

    user_role = sa.Enum("customer", "executor", "admin", name="userrole")

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column(
            "role",
            user_role,
            nullable=False,
            server_default="customer",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=False),
        sa.Column("executor_id", sa.Integer(), nullable=True),
        sa.Column("task", sa.String(length=300), nullable=False),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="open", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["customer_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["executor_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_orders_customer_id", "orders", ["customer_id"], unique=False)
    op.create_index("ix_orders_executor_id", "orders", ["executor_id"], unique=False)
    op.create_index("ix_orders_status", "orders", ["status"], unique=False)
    op.create_index(
        "ix_orders_status_created_at",
        "orders",
        ["status", "created_at"],
        unique=False,
    )

    op.create_table(
        "order_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_order_messages_order_id", "order_messages", ["order_id"], unique=False
    )
    op.create_index(
        "ix_order_messages_sender_id", "order_messages", ["sender_id"], unique=False
    )
    op.create_index(
        "ix_order_messages_order_created",
        "order_messages",
        ["order_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_order_messages_order_created", table_name="order_messages")
    op.drop_index("ix_order_messages_sender_id", table_name="order_messages")
    op.drop_index("ix_order_messages_order_id", table_name="order_messages")
    op.drop_table("order_messages")
    op.drop_index("ix_orders_status_created_at", table_name="orders")
    op.drop_index("ix_orders_status", table_name="orders")
    op.drop_index("ix_orders_executor_id", table_name="orders")
    op.drop_index("ix_orders_customer_id", table_name="orders")
    op.drop_table("orders")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    sa.Enum(name="userrole").drop(op.get_bind(), checkfirst=True)
