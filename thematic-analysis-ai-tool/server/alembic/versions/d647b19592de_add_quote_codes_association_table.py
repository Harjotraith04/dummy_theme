"""add quote_codes association table

Revision ID: d647b19592de
Revises: 622ebc07fe53
Create Date: 2025-06-07 15:48:50.408436

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd647b19592de'
down_revision: Union[str, None] = '622ebc07fe53'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('quote_codes',
    sa.Column('quote_id', sa.Integer(), nullable=False),
    sa.Column('code_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['code_id'], ['codes.id'], ),
    sa.ForeignKeyConstraint(['quote_id'], ['quotes.id'], ),
    sa.PrimaryKeyConstraint('quote_id', 'code_id')
    )
    op.alter_column('quotes', 'segment_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('quotes', 'segment_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.drop_table('quote_codes')
    # ### end Alembic commands ###
