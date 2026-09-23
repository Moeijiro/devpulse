import datetime
from app.github.schemas import GitHubRepoNormalized, GitHubEventNormalized
from app.services.analytics import (
    aggregate_language_stats, aggregate_activity_timeline, calculate_overview_metrics
)

def test_language_aggregation():
    repos = [
        GitHubRepoNormalized(
            id=1, name="repo1", full_name="user/repo1", html_url="http://gh.com/1",
            language="Python", stars_count=10, is_fork=False
        ),
        GitHubRepoNormalized(
            id=2, name="repo2", full_name="user/repo2", html_url="http://gh.com/2",
            language="Python", stars_count=5, is_fork=False
        ),
        GitHubRepoNormalized(
            id=3, name="repo3", full_name="user/repo3", html_url="http://gh.com/3",
            language="TypeScript", stars_count=20, is_fork=False
        ),
        GitHubRepoNormalized(
            id=4, name="forked", full_name="user/forked", html_url="http://gh.com/4",
            language="Rust", stars_count=100, is_fork=True  # Should be excluded
        ),
    ]

    stats = aggregate_language_stats(repos)
    assert len(stats) == 2
    assert stats[0].language == "Python"
    assert stats[0].repo_count == 2
    assert stats[0].percentage == 66.7
    assert stats[1].language == "TypeScript"
    assert stats[1].repo_count == 1
    assert stats[1].percentage == 33.3

def test_activity_timeline_aggregation():
    today = datetime.datetime.utcnow()
    events = [
        GitHubEventNormalized(
            id="1", type="PushEvent", repo_name="user/repo1",
            action_summary="Pushed 2 commits", created_at=today
        ),
        GitHubEventNormalized(
            id="2", type="PullRequestEvent", repo_name="user/repo1",
            action_summary="Opened PR", created_at=today
        ),
        GitHubEventNormalized(
            id="3", type="WatchEvent", repo_name="user/repo2",
            action_summary="Starred repo", created_at=today - datetime.timedelta(days=2)
        )
    ]

    timeline_7d = aggregate_activity_timeline(events, days=7)
    assert len(timeline_7d) == 7
    # today's bucket has count 2
    today_str = today.date().isoformat()
    today_bucket = next(b for b in timeline_7d if b.date == today_str)
    assert today_bucket.count == 2

def test_overview_metrics():
    repos = [
        GitHubRepoNormalized(
            id=1, name="r1", full_name="u/r1", html_url="http://1",
            stars_count=15, forks_count=3, open_issues_count=2
        ),
        GitHubRepoNormalized(
            id=2, name="r2", full_name="u/r2", html_url="http://2",
            stars_count=25, forks_count=7, open_issues_count=1
        ),
    ]
    events = [
        GitHubEventNormalized(
            id="1", type="PushEvent", repo_name="u/r1",
            action_summary="Push", created_at=datetime.datetime.utcnow()
        )
    ]

    metrics = calculate_overview_metrics(repos, events)
    assert metrics["total_repositories"] == 2
    assert metrics["total_stars"] == 40
    assert metrics["total_forks"] == 10
    assert metrics["total_open_issues"] == 3
    assert metrics["recent_push_events"] == 1


def test_push_summaries_do_not_claim_zero_commits():
    from app.github.client import GitHubClient

    c = GitHubClient()
    assert c._summarize_event("PushEvent", {"ref": "refs/heads/main", "size": 3}, "o/r") == "Pushed 3 commits to main"
    assert c._summarize_event("PushEvent", {"ref": "refs/heads/dev"}, "o/r") == "Pushed to dev"
    with_list = c._summarize_event("PushEvent", {"ref": "refs/heads/main", "commits": [{"message": "fix: bug\nbody"}]}, "o/r")
    assert with_list == 'Pushed 1 commit to main: "fix: bug"'
