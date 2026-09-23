from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import datetime

# --- Normalized Schemas ---

class GitHubUserNormalized(BaseModel):
    username: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    blog: Optional[str] = None
    location: Optional[str] = None
    public_repos: int = 0
    followers: int = 0
    following: int = 0
    created_at: Optional[datetime.datetime] = None

class GitHubRepoNormalized(BaseModel):
    id: int
    name: str
    full_name: str
    description: Optional[str] = None
    html_url: str
    language: Optional[str] = None
    stars_count: int = 0
    forks_count: int = 0
    open_issues_count: int = 0
    is_fork: bool = False
    updated_at: Optional[datetime.datetime] = None
    pushed_at: Optional[datetime.datetime] = None

class GitHubEventNormalized(BaseModel):
    id: str
    type: str
    repo_name: str
    action_summary: str
    created_at: datetime.datetime

class LanguageStat(BaseModel):
    language: str
    repo_count: int
    percentage: float
    color: str

class ActivityDayBucket(BaseModel):
    date: str
    count: int
    events: List[str] = []

class RateLimitInfo(BaseModel):
    limit: int
    remaining: int
    reset_epoch: int
    reset_time: str
    is_authenticated: bool
