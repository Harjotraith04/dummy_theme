"""remove_raw_content_column

Revision ID: b5ab181acf38
Revises: d647b19592de
Create Date: 2025-06-10 02:18:33.397906

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b5ab181acf38'
down_revision: Union[str, None] = 'd647b19592de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('documents', 'raw_content')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('documents', sa.Column('raw_content', sa.TEXT(), autoincrement=False, nullable=True))
    # ### end Alembic commands ###
