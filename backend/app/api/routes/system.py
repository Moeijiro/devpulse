from fastapi import APIRouter
from app.github.client import github_client
from app.github.schemas import RateLimitInfo

router = APIRouter()

@router.get("/rate-limit", response_model=RateLimitInfo)
async def get_github_rate_limit():
    return await github_client.fetch_rate_limit()
