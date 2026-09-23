from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Literal, Optional
from app.api.v1.username import Username
from app.db.session import get_db
from app.services.sync import get_or_sync_user_data
from app.github.schemas import GitHubRepoNormalized

router = APIRouter()

@router.get("/{username}", response_model=List[GitHubRepoNormalized])
async def list_user_repositories(
    username: Username,
    language: Optional[str] = Query(None, description="Filter by programming language"),
    search: Optional[str] = Query(None, description="Search in repo name or description"),
    sort_by: Literal["updated", "stars", "name"] = Query("updated"),
    db: AsyncSession = Depends(get_db)
):
    _, repos, _ = await get_or_sync_user_data(username, db)
    
    # Filter
    filtered = repos
    if language:
        filtered = [r for r in filtered if r.language and r.language.lower() == language.lower()]
    if search:
        q = search.lower()
        filtered = [
            r for r in filtered
            if q in r.name.lower() or (r.description and q in r.description.lower())
        ]

    # Sort
    if sort_by == "stars":
        filtered.sort(key=lambda r: r.stars_count, reverse=True)
    elif sort_by == "name":
        filtered.sort(key=lambda r: r.name.lower())
    else:  # updated
        # Timezone-aware GitHub timestamps and the None fallback can't be compared directly.
        filtered.sort(key=lambda r: (r.pushed_at or r.updated_at).timestamp() if (r.pushed_at or r.updated_at) else 0, reverse=True)

    return filtered

@router.get("/{username}/{repo_name}", response_model=GitHubRepoNormalized)
async def get_repository_detail(
    username: Username,
    repo_name: str,
    db: AsyncSession = Depends(get_db)
):
    _, repos, _ = await get_or_sync_user_data(username, db)
    for r in repos:
        if r.name.lower() == repo_name.lower():
            return r
    raise HTTPException(status_code=404, detail=f"Repository '{repo_name}' not found for user '{username}'.")
