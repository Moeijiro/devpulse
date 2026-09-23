from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from app.api.deps import Username
from app.db.session import get_db
from app.services.sync import get_or_sync_user_data
from app.services.analytics import (
    aggregate_language_stats, aggregate_activity_timeline, calculate_overview_metrics
)
from app.github.schemas import LanguageStat, ActivityDayBucket

router = APIRouter()

@router.get("/{username}/overview")
async def get_analytics_overview(username: Username, db: AsyncSession = Depends(get_db)):
    user, repos, events = await get_or_sync_user_data(username, db)
    overview = calculate_overview_metrics(repos, events)
    overview["user"] = user.model_dump()
    return overview

@router.get("/{username}/activity", response_model=List[ActivityDayBucket])
async def get_activity_timeline(
    username: Username,
    days: int = Query(30, description="Window in days: 7, 30, or 90"),
    db: AsyncSession = Depends(get_db)
):
    valid_days = [7, 30, 90]
    if days not in valid_days:
        days = 30
    _, _, events = await get_or_sync_user_data(username, db)
    return aggregate_activity_timeline(events, days=days)

@router.get("/{username}/languages", response_model=List[LanguageStat])
async def get_language_breakdown(username: Username, db: AsyncSession = Depends(get_db)):
    _, repos, _ = await get_or_sync_user_data(username, db)
    return aggregate_language_stats(repos)
