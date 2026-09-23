from fastapi import APIRouter
from app.api.v1.endpoints import analytics, repositories, profiles, system

api_router = APIRouter()

api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(repositories.router, prefix="/repos", tags=["repositories"])
api_router.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
api_router.include_router(system.router, prefix="/system", tags=["system"])
