from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from app.db.session import get_db
from app.services.sync import get_or_sync_user_data, get_featured_repo_names, set_featured_repo_names
from app.services.analytics import aggregate_language_stats, calculate_overview_metrics

router = APIRouter()

@router.get("/{username}")
async def get_public_profile(username: str, db: AsyncSession = Depends(get_db)):
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
        candidates.sort(key=lambda r: r.stars_count, reverse=True)
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
    username: str,
    repo_names: List[str] = Body(..., description="List of 3 to 6 repository names to feature"),
    db: AsyncSession = Depends(get_db)
):
    if len(repo_names) < 1 or len(repo_names) > 6:
        raise HTTPException(status_code=400, detail="You must provide between 1 and 6 repository names.")
    
    await set_featured_repo_names(username, repo_names, db)
    return {"message": "Featured repositories updated successfully.", "featured": repo_names}

@router.post("/{username}/refresh")
async def refresh_user_telemetry(username: str, db: AsyncSession = Depends(get_db)):
    user, repos, events = await get_or_sync_user_data(username, db, force_refresh=True)
    return {
        "message": f"Successfully refreshed telemetry for '{username}'",
        "repos_count": len(repos),
        "events_count": len(events)
    }
