"""initial

Revision ID: 0001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
revision_id = revision
revises = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "organizations",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), default=True),
    )
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("org_id", sa.String(), sa.ForeignKey("organizations.id"), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_table(
        "targets",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("org_id", sa.String(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("target_type", sa.String(), nullable=False),
        sa.Column("value", sa.String(), nullable=False),
        sa.Column("metadata", sa.JSON(), default=dict),
    )
    op.create_index("ix_targets_org_id", "targets", ["org_id"])
    op.create_table(
        "findings",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("org_id", sa.String(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("source", sa.String(), nullable=False),
        sa.Column("confidence", sa.Integer(), default=50),
        sa.Column("matched_entity", sa.String(), nullable=False),
        sa.Column("exposure_types", sa.JSON(), default=list),
        sa.Column("raw_snippet", sa.String(), nullable=False),
        sa.Column("severity", sa.String(), default="low"),
        sa.Column("dedupe_hash", sa.String(), nullable=False),
        sa.Column("metadata", sa.JSON(), default=dict),
    )
    op.create_index("ix_findings_org_id", "findings", ["org_id"])
    op.create_index("ix_findings_dedupe_hash", "findings", ["dedupe_hash"])
    op.create_table(
        "alert_rules",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("org_id", sa.String(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("recipients", sa.JSON(), default=dict),
        sa.Column("filters", sa.JSON(), default=dict),
        sa.Column("redaction_policy", sa.JSON(), default=dict),
        sa.Column("schedule", sa.String(), default="0 */6 * * *"),
    )
    op.create_index("ix_alert_rules_org_id", "alert_rules", ["org_id"])
    op.create_table(
        "connectors",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("org_id", sa.String(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("connector_type", sa.String(), nullable=False),
        sa.Column("config", sa.JSON(), default=dict),
        sa.Column("secrets", sa.JSON(), default=dict),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("last_run_status", sa.String(), default="never"),
    )
    op.create_index("ix_connectors_org_id", "connectors", ["org_id"])
    op.create_table(
        "integrations",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("org_id", sa.String(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("integration_type", sa.String(), nullable=False),
        sa.Column("config", sa.JSON(), default=dict),
        sa.Column("secrets", sa.JSON(), default=dict),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("last_test_status", sa.String(), default="never"),
    )
    op.create_index("ix_integrations_org_id", "integrations", ["org_id"])
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("org_id", sa.String(), sa.ForeignKey("organizations.id"), nullable=True),
        sa.Column("actor_id", sa.String(), nullable=True),
        sa.Column("action", sa.String(), nullable=False),
        sa.Column("payload", sa.JSON(), default=dict),
        sa.Column("scope", sa.String(), default="tenant"),
    )
    op.create_index("ix_audit_logs_org_id", "audit_logs", ["org_id"])


def downgrade() -> None:
    op.drop_index("ix_audit_logs_org_id", table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index("ix_integrations_org_id", table_name="integrations")
    op.drop_table("integrations")
    op.drop_index("ix_connectors_org_id", table_name="connectors")
    op.drop_table("connectors")
    op.drop_index("ix_alert_rules_org_id", table_name="alert_rules")
    op.drop_table("alert_rules")
    op.drop_index("ix_findings_dedupe_hash", table_name="findings")
    op.drop_index("ix_findings_org_id", table_name="findings")
    op.drop_table("findings")
    op.drop_index("ix_targets_org_id", table_name="targets")
    op.drop_table("targets")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.drop_table("organizations")
