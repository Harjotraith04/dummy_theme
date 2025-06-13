"""restructure_document_content_fields

Revision ID: 0042d143b73e
Revises: 62282e1dbcba
Create Date: 2025-06-06 15:48:52.627123

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0042d143b73e'
down_revision: Union[str, None] = '62282e1dbcba'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###

    # First, add the new raw_content column
    op.add_column('documents', sa.Column(
        'raw_content', sa.Text(), nullable=True))

    # Copy existing content to raw_content before changing the type
    op.execute(
        "UPDATE documents SET raw_content = content WHERE content IS NOT NULL")

    # Drop the old content column and recreate it as JSON
    op.drop_column('documents', 'content')
    op.add_column('documents', sa.Column('content', sa.JSON(), nullable=True))

    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###

    # Drop the JSON content column and recreate it as TEXT
    op.drop_column('documents', 'content')
    op.add_column('documents', sa.Column('content', sa.TEXT(), nullable=True))

    # Copy raw_content back to content
    op.execute(
        "UPDATE documents SET content = raw_content WHERE raw_content IS NOT NULL")

    # Drop the raw_content column
    op.drop_column('documents', 'raw_content')

    # ### end Alembic commands ###
