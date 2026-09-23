import secrets

from fastapi import APIRouter, Body, Depends, Header, HTTPException

from app.core.config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from app.api.deps import Username
from app.db.session import get_db
from app.services.sync import get_or_sync_user_data, get_featured_repo_names, set_featured_repo_names
from app.services.analytics import aggregate_language_stats, calculate_overview_metrics

router = APIRouter()

@router.get("/{username}")
async def get_public_profile(username: Username, db: AsyncSession = Depends(get_db)):
    user, repos, events = await get_or_sync_user_data(username, db)
    featured_names = await get_featured_repo_names(username, db)
    
    # If no featured repos configured yet, default to top 4 starred non-fork repos
    featured_repos = []
    if featured_names:
        name_map = {r.name.lower(): r for r in repos}
        for fn in featured_names:
            if fn.lower() in name_map:
                featured_repos.append(name_map[fn.lower()])
    else:
        candidates = [r for r in repos if not r.is_fork]
        # Most stars first; among equals, the most recently pushed (not whatever order GitHub returned).
        candidates.sort(key=lambda r: (r.stars_count, (r.pushed_at or r.updated_at).timestamp() if (r.pushed_at or r.updated_at) else 0), reverse=True)
        featured_repos = candidates[:4]

    languages = aggregate_language_stats(repos)
    overview = calculate_overview_metrics(repos, events)

    return {
        "user": user.model_dump(),
        "overview": overview,
        "featured_repositories": [r.model_dump() for r in featured_repos],
        "top_languages": languages[:5],
        "recent_activities": [e.model_dump() for e in events[:10]]
    }

@router.post("/{username}/featured")
async def update_featured_repositories(
    username: Username,
    repo_names: List[str] = Body(..., description="1 to 6 repository names to feature"),
    x_admin_token: str | None = Header(None),
    db: AsyncSession = Depends(get_db)
):
    # With ADMIN_TOKEN set, only the owner of this deployment can change what a profile features.
    if settings.ADMIN_TOKEN and not secrets.compare_digest(x_admin_token or "", settings.ADMIN_TOKEN):
        raise HTTPException(status_code=403, detail="Changing featured repositories needs the admin token.")
    _, repos, _ = await get_or_sync_user_data(username, db)
    owned = {r.name.lower(): r.name for r in repos}
    chosen: List[str] = []
    for name in repo_names:
        real = owned.get(name.strip().lower())
        if real is None:
            raise HTTPException(status_code=400, detail=f"'{name}' isn't one of {username}'s public repositories.")
        if real not in chosen:
            chosen.append(real)
    if not 1 <= len(chosen) <= 6:
        raise HTTPException(status_code=400, detail="Feature between 1 and 6 repositories.")
    await set_featured_repo_names(username, chosen, db)
    return {"message": "Featured repositories updated successfully.", "featured": chosen}


@router.post("/{username}/refresh")
async def refresh_user_telemetry(username: Username, db: AsyncSession = Depends(get_db)):
    user, repos, events = await get_or_sync_user_data(username, db, force_refresh=True)
    return {
        "message": f"Successfully refreshed telemetry for '{username}'",
        "repos_count": len(repos),
        "events_count": len(events)
    }
