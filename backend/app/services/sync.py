import datetime
from typing import Tuple, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.core.config import settings
from app.db.models import CachedProfile, CachedRepo, CachedActivity, FeaturedRepo
from app.github.client import github_client
from app.github.schemas import (
    GitHubUserNormalized, GitHubRepoNormalized, GitHubEventNormalized
)

async def get_or_sync_user_data(
    username: str,
    db: AsyncSession,
    force_refresh: bool = False
) -> Tuple[GitHubUserNormalized, List[GitHubRepoNormalized], List[GitHubEventNormalized]]:
    now = datetime.datetime.utcnow()
    ttl_delta = datetime.timedelta(seconds=settings.CACHE_TTL_SECONDS)

    # 1. Check cached profile
    stmt_p = select(CachedProfile).where(CachedProfile.username == username)
    res_p = await db.execute(stmt_p)
    cached_p = res_p.scalar_one_or_none()

    is_stale = True
    if cached_p and not force_refresh:
        if (now - cached_p.cached_at) < ttl_delta:
            is_stale = False

    if not is_stale and cached_p:
        # Load repos from cache
        stmt_r = select(CachedRepo).where(CachedRepo.username == username).order_by(CachedRepo.stars_count.desc())
        res_r = await db.execute(stmt_r)
        db_repos = res_r.scalars().all()

        stmt_e = select(CachedActivity).where(CachedActivity.username == username).order_by(CachedActivity.created_at.desc())
        res_e = await db.execute(stmt_e)
        db_events = res_e.scalars().all()

        user_norm = GitHubUserNormalized(
            username=cached_p.username,
            name=cached_p.name,
            avatar_url=cached_p.avatar_url,
            bio=cached_p.bio,
            company=cached_p.company,
            blog=cached_p.blog,
            location=cached_p.location,
            public_repos=cached_p.public_repos,
            followers=cached_p.followers,
            following=cached_p.following,
            created_at=cached_p.github_created_at
        )

        repos_norm = [
            GitHubRepoNormalized(
                id=r.id,
                name=r.name,
                full_name=r.full_name,
                description=r.description,
                html_url=r.html_url,
                language=r.language,
                stars_count=r.stars_count,
                forks_count=r.forks_count,
                open_issues_count=r.open_issues_count,
                is_fork=r.is_fork,
                updated_at=r.updated_at,
                pushed_at=r.pushed_at
            ) for r in db_repos
        ]

        events_norm = [
            GitHubEventNormalized(
                id=e.event_id,
                type=e.event_type,
                repo_name=e.repo_name,
                action_summary=e.payload_summary,
                created_at=e.created_at
            ) for e in db_events
        ]

        return user_norm, repos_norm, events_norm

    # 2. Fetch fresh from GitHub
    user_fresh = await github_client.fetch_user(username)
    repos_fresh = await github_client.fetch_user_repos(username)
    events_fresh = await github_client.fetch_user_events(username)

    # 3. Update Database Cache
    if cached_p:
        cached_p.name = user_fresh.name
        cached_p.avatar_url = user_fresh.avatar_url
        cached_p.bio = user_fresh.bio
        cached_p.company = user_fresh.company
        cached_p.blog = user_fresh.blog
        cached_p.location = user_fresh.location
        cached_p.public_repos = user_fresh.public_repos
        cached_p.followers = user_fresh.followers
        cached_p.following = user_fresh.following
        cached_p.github_created_at = user_fresh.created_at
        cached_p.cached_at = now
    else:
        new_p = CachedProfile(
            username=user_fresh.username,
            name=user_fresh.name,
            avatar_url=user_fresh.avatar_url,
            bio=user_fresh.bio,
            company=user_fresh.company,
            blog=user_fresh.blog,
            location=user_fresh.location,
            public_repos=user_fresh.public_repos,
            followers=user_fresh.followers,
            following=user_fresh.following,
            github_created_at=user_fresh.created_at,
            cached_at=now
        )
        db.add(new_p)

    # Clean previous repos & activities
    await db.execute(delete(CachedRepo).where(CachedRepo.username == username))
    await db.execute(delete(CachedActivity).where(CachedActivity.username == username))

    for r in repos_fresh:
        db.add(CachedRepo(
            id=r.id,
            username=username,
            name=r.name,
            full_name=r.full_name,
            description=r.description,
            html_url=r.html_url,
            language=r.language,
            stars_count=r.stars_count,
            forks_count=r.forks_count,
            open_issues_count=r.open_issues_count,
            is_fork=r.is_fork,
            updated_at=r.updated_at,
            pushed_at=r.pushed_at,
            cached_at=now
        ))

    for ev in events_fresh:
        db.add(CachedActivity(
            username=username,
            event_id=ev.id,
            event_type=ev.type,
            repo_name=ev.repo_name,
            payload_summary=ev.action_summary,
            created_at=ev.created_at
        ))

    await db.commit()
    return user_fresh, repos_fresh, events_fresh

async def get_featured_repo_names(username: str, db: AsyncSession) -> List[str]:
    stmt = select(FeaturedRepo).where(FeaturedRepo.username == username).order_by(FeaturedRepo.display_order.asc())
    res = await db.execute(stmt)
    return [f.repo_name for f in res.scalars().all()]

async def set_featured_repo_names(username: str, repo_names: List[str], db: AsyncSession):
    await db.execute(delete(FeaturedRepo).where(FeaturedRepo.username == username))
    for order, name in enumerate(repo_names[:6]):
        db.add(FeaturedRepo(username=username, repo_name=name, display_order=order))
    await db.commit()
