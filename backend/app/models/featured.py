import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Index
from app.db.base import Base


class FeaturedRepo(Base):
    __tablename__ = "featured_repos"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(128), index=True, nullable=False)
    repo_name = Column(String(255), nullable=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        Index("ix_featured_user_repo", "username", "repo_name", unique=True),
    )
