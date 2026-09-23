import pytest
from unittest.mock import patch
from app.github.client import github_client
from app.github.schemas import GitHubUserNormalized, GitHubRepoNormalized, GitHubEventNormalized
import datetime

@pytest.fixture
def mock_github():
    user = GitHubUserNormalized(
        username="octocat",
        name="The Octocat",
        avatar_url="https://github.com/images/error/octocat_happy.gif",
        bio="GitHub Mascot",
        public_repos=8,
        followers=5000,
        following=9
    )
    repos = [
        GitHubRepoNormalized(
            id=101, name="Hello-World", full_name="octocat/Hello-World",
            html_url="https://github.com/octocat/Hello-World",
            language="TypeScript", stars_count=200, forks_count=50, is_fork=False
        ),
        GitHubRepoNormalized(
            id=102, name="Spoon-Knife", full_name="octocat/Spoon-Knife",
            html_url="https://github.com/octocat/Spoon-Knife",
            language="Python", stars_count=100, forks_count=20, is_fork=False
        )
    ]
    events = [
        GitHubEventNormalized(
            id="e1", type="PushEvent", repo_name="octocat/Hello-World",
            action_summary="Pushed 1 commit", created_at=datetime.datetime.utcnow()
        )
    ]

    with patch.object(github_client, "fetch_user", return_value=user), \
         patch.object(github_client, "fetch_user_repos", return_value=repos), \
         patch.object(github_client, "fetch_user_events", return_value=events):
        yield

@pytest.mark.asyncio
async def test_analytics_overview_endpoint(client, mock_github):
    res = await client.get("/api/v1/analytics/octocat/overview")
    assert res.status_code == 200
    data = res.json()
    assert data["total_repositories"] == 2
    assert data["total_stars"] == 300
    assert data["total_forks"] == 70
    assert data["user"]["username"] == "octocat"

@pytest.mark.asyncio
async def test_language_breakdown_endpoint(client, mock_github):
    res = await client.get("/api/v1/analytics/octocat/languages")
    assert res.status_code == 200
    langs = res.json()
    assert len(langs) == 2
    names = {l["language"] for l in langs}
    assert "TypeScript" in names
    assert "Python" in names

@pytest.mark.asyncio
async def test_repo_search_and_filter(client, mock_github):
    # Filter by language
    res = await client.get("/api/v1/repos/octocat?language=Python")
    assert res.status_code == 200
    repos = res.json()
    assert len(repos) == 1
    assert repos[0]["name"] == "Spoon-Knife"

    # Search query
    search_res = await client.get("/api/v1/repos/octocat?search=Hello")
    assert search_res.status_code == 200
    assert len(search_res.json()) == 1
    assert search_res.json()[0]["name"] == "Hello-World"

@pytest.mark.asyncio
async def test_featured_repositories_management(client, mock_github):
    # Set featured repos
    post_res = await client.post(
        "/api/v1/profiles/octocat/featured",
        json=["Hello-World", "Spoon-Knife"]
    )
    assert post_res.status_code == 200

    # Retrieve public profile
    prof_res = await client.get("/api/v1/profiles/octocat")
    assert prof_res.status_code == 200
    prof = prof_res.json()
    assert len(prof["featured_repositories"]) == 2
    assert prof["featured_repositories"][0]["name"] in ["Hello-World", "Spoon-Knife"]
