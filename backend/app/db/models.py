import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Index
from app.db.session import Base

class CachedProfile(Base):
    __tablename__ = "cached_profiles"

    username = Column(String(128), primary_key=True, index=True)
    name = Column(String(255), nullable=True)
    avatar_url = Column(String(512), nullable=True)
    bio = Column(Text, nullable=True)
    company = Column(String(255), nullable=True)
    blog = Column(String(512), nullable=True)
    location = Column(String(255), nullable=True)
    public_repos = Column(Integer, default=0)
    followers = Column(Integer, default=0)
    following = Column(Integer, default=0)
    github_created_at = Column(DateTime, nullable=True)
    cached_at = Column(DateTime, default=datetime.datetime.utcnow)

class CachedRepo(Base):
    __tablename__ = "cached_repos"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(128), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    html_url = Column(String(512), nullable=False)
    language = Column(String(64), nullable=True, index=True)
    stars_count = Column(Integer, default=0)
    forks_count = Column(Integer, default=0)
    open_issues_count = Column(Integer, default=0)
    is_fork = Column(Boolean, default=False)
    updated_at = Column(DateTime, nullable=True)
    pushed_at = Column(DateTime, nullable=True)
    cached_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        Index("ix_cached_repos_user_name", "username", "name", unique=True),
    )

class CachedActivity(Base):
    __tablename__ = "cached_activities"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(128), index=True, nullable=False)
    event_id = Column(String(64), nullable=False)
    event_type = Column(String(64), nullable=False)  # PushEvent, PullRequestEvent, IssuesEvent, etc.
    repo_name = Column(String(255), nullable=False)
    payload_summary = Column(String(512), nullable=False)
    created_at = Column(DateTime, nullable=False, index=True)

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
