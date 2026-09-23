import datetime
import httpx
from typing import Optional, List, Dict, Any, Tuple
from fastapi import HTTPException
from app.core.config import settings
from app.github.schemas import (
    GitHubUserNormalized, GitHubRepoNormalized, GitHubEventNormalized, RateLimitInfo
)

GITHUB_API_BASE = "https://api.github.com"

class GitHubClient:
    def __init__(self, token: Optional[str] = None):
        self.token = token or settings.GITHUB_TOKEN
        self.latest_rate_limit: Optional[RateLimitInfo] = None

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "DevPulse-Analytics/1.0",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def _update_rate_limit(self, response_headers: httpx.Headers):
        limit = response_headers.get("x-ratelimit-limit")
        remaining = response_headers.get("x-ratelimit-remaining")
        reset = response_headers.get("x-ratelimit-reset")
        if limit and remaining and reset:
            reset_ts = int(reset)
            reset_dt = datetime.datetime.fromtimestamp(reset_ts, tz=datetime.timezone.utc)
            self.latest_rate_limit = RateLimitInfo(
                limit=int(limit),
                remaining=int(remaining),
                reset_epoch=reset_ts,
                reset_time=reset_dt.strftime("%Y-%m-%d %H:%M:%S UTC"),
                is_authenticated=bool(self.token)
            )

    async def fetch_user(self, username: str) -> GitHubUserNormalized:
        url = f"{GITHUB_API_BASE}/users/{username}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, headers=self._get_headers())
            self._update_rate_limit(resp.headers)
            
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail=f"GitHub user '{username}' not found.")
            elif resp.status_code == 403:
                raise HTTPException(
                    status_code=429,
                    detail="GitHub API rate limit exceeded. Please configure a Personal Access Token or wait for reset."
                )
            resp.raise_for_status()
            data = resp.json()

            created_dt = None
            if data.get("created_at"):
                try:
                    created_dt = datetime.datetime.fromisoformat(data["created_at"].replace("Z", "+00:00"))
                except Exception:
                    pass

            return GitHubUserNormalized(
                username=data["login"],
                name=data.get("name"),
                avatar_url=data.get("avatar_url"),
                bio=data.get("bio"),
                company=data.get("company"),
                blog=data.get("blog"),
                location=data.get("location"),
                public_repos=data.get("public_repos", 0),
                followers=data.get("followers", 0),
                following=data.get("following", 0),
                created_at=created_dt
            )

    async def fetch_user_repos(self, username: str) -> List[GitHubRepoNormalized]:
        url = f"{GITHUB_API_BASE}/users/{username}/repos?per_page=100&sort=updated"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, headers=self._get_headers())
            self._update_rate_limit(resp.headers)
            if resp.status_code == 404:
                return []
            resp.raise_for_status()
            data = resp.json()

            repos = []
            for r in data:
                upd_dt = None
                if r.get("updated_at"):
                    try:
                        upd_dt = datetime.datetime.fromisoformat(r["updated_at"].replace("Z", "+00:00"))
                    except Exception:
                        pass

                push_dt = None
                if r.get("pushed_at"):
                    try:
                        push_dt = datetime.datetime.fromisoformat(r["pushed_at"].replace("Z", "+00:00"))
                    except Exception:
                        pass

                repos.append(GitHubRepoNormalized(
                    id=r["id"],
                    name=r["name"],
                    full_name=r["full_name"],
                    description=r.get("description"),
                    html_url=r["html_url"],
                    language=r.get("language"),
                    stars_count=r.get("stargazers_count", 0),
                    forks_count=r.get("forks_count", 0),
                    open_issues_count=r.get("open_issues_count", 0),
                    is_fork=r.get("fork", False),
                    updated_at=upd_dt,
                    pushed_at=push_dt
                ))
            return repos

    async def fetch_user_events(self, username: str) -> List[GitHubEventNormalized]:
        url = f"{GITHUB_API_BASE}/users/{username}/events/public?per_page=100"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, headers=self._get_headers())
            self._update_rate_limit(resp.headers)
            if resp.status_code != 200:
                return []
            data = resp.json()

            events = []
            for e in data:
                ev_type = e.get("type", "Event")
                repo_name = e.get("repo", {}).get("name", "")
                created_str = e.get("created_at")
                created_dt = datetime.datetime.utcnow()
                if created_str:
                    try:
                        created_dt = datetime.datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                    except Exception:
                        pass

                summary = self._summarize_event(ev_type, e.get("payload", {}), repo_name)
                events.append(GitHubEventNormalized(
                    id=str(e.get("id")),
                    type=ev_type,
                    repo_name=repo_name,
                    action_summary=summary,
                    created_at=created_dt
                ))
            return events

    def _summarize_event(self, ev_type: str, payload: Dict[str, Any], repo_name: str) -> str:
        if ev_type == "PushEvent":
            commits = payload.get("commits", [])
            count = len(commits)
            msg = f"Pushed {count} commit{'s' if count != 1 else ''}"
            if commits and "message" in commits[0]:
                first_msg = commits[0]["message"].split("\n")[0][:45]
                msg += f': "{first_msg}"'
            return msg
        elif ev_type == "PullRequestEvent":
            action = payload.get("action", "activity")
            title = payload.get("pull_request", {}).get("title", "")
            return f"{action.capitalize()} pull request: {title[:40]}"
        elif ev_type == "IssuesEvent":
            action = payload.get("action", "activity")
            title = payload.get("issue", {}).get("title", "")
            return f"{action.capitalize()} issue: {title[:40]}"
        elif ev_type == "WatchEvent":
            return f"Starred repository {repo_name}"
        elif ev_type == "ForkEvent":
            return f"Forked repository {repo_name}"
        elif ev_type == "CreateEvent":
            ref_type = payload.get("ref_type", "branch")
            return f"Created {ref_type} in {repo_name}"
        return f"{ev_type.replace('Event', '')} on {repo_name}"

    async def fetch_rate_limit(self) -> RateLimitInfo:
        url = f"{GITHUB_API_BASE}/rate_limit"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=self._get_headers())
            data = resp.json()
            core = data.get("resources", {}).get("core", {})
            reset_ts = core.get("reset", int(datetime.datetime.utcnow().timestamp()))
            reset_dt = datetime.datetime.fromtimestamp(reset_ts, tz=datetime.timezone.utc)
            return RateLimitInfo(
                limit=core.get("limit", 60),
                remaining=core.get("remaining", 60),
                reset_epoch=reset_ts,
                reset_time=reset_dt.strftime("%Y-%m-%d %H:%M:%S UTC"),
                is_authenticated=bool(self.token)
            )

github_client = GitHubClient()
