import datetime
from typing import List, Dict
from collections import defaultdict
from app.github.schemas import (
    GitHubRepoNormalized, GitHubEventNormalized, LanguageStat, ActivityDayBucket
)

LANGUAGE_COLORS: Dict[str, str] = {
    "Python": "#3572A5",
    "TypeScript": "#3178C6",
    "JavaScript": "#F1E05A",
    "Rust": "#DEA584",
    "Go": "#00ADD8",
    "Java": "#B07219",
    "C++": "#F34B7D",
    "C": "#555555",
    "C#": "#178600",
    "HTML": "#E34C26",
    "CSS": "#563D7C",
    "PHP": "#4F5D95",
    "Ruby": "#701516",
    "Shell": "#89E051",
    "Swift": "#F05138",
    "Kotlin": "#A97BFF",
    "Dart": "#00B4AB",
    "Lua": "#000080",
}

def aggregate_language_stats(repos: List[GitHubRepoNormalized]) -> List[LanguageStat]:
    counts: Dict[str, int] = defaultdict(int)
    total_valid = 0
    for r in repos:
        if r.language and not r.is_fork:
            counts[r.language] += 1
            total_valid += 1

    if total_valid == 0:
        return []

    stats = []
    for lang, count in sorted(counts.items(), key=lambda x: x[1], reverse=True):
        pct = round((count / total_valid) * 100, 1)
        color = LANGUAGE_COLORS.get(lang, "#8B949E")
        stats.append(LanguageStat(
            language=lang,
            repo_count=count,
            percentage=pct,
            color=color
        ))
    return stats

def aggregate_activity_timeline(events: List[GitHubEventNormalized], days: int = 30) -> List[ActivityDayBucket]:
    today = datetime.datetime.utcnow().date()
    buckets: Dict[str, List[str]] = {}

    for i in range(days - 1, -1, -1):
        d = today - datetime.timedelta(days=i)
        buckets[d.isoformat()] = []

    for ev in events:
        ev_date = ev.created_at.date().isoformat()
        if ev_date in buckets:
            buckets[ev_date].append(ev.action_summary)

    result = []
    for date_str, actions in sorted(buckets.items()):
        result.append(ActivityDayBucket(
            date=date_str,
            count=len(actions),
            events=actions[:3]
        ))
    return result

def calculate_overview_metrics(repos: List[GitHubRepoNormalized], events: List[GitHubEventNormalized]) -> Dict[str, int]:
    total_stars = sum(r.stars_count for r in repos)
    total_forks = sum(r.forks_count for r in repos)
    total_open_issues = sum(r.open_issues_count for r in repos)
    
    # Commit events calculation from public activity
    push_events = [e for e in events if e.type == "PushEvent"]
    
    return {
        "total_repositories": len(repos),
        "total_stars": total_stars,
        "total_forks": total_forks,
        "total_open_issues": total_open_issues,
        "recent_push_events": len(push_events),
        "total_tracked_events": len(events)
    }
