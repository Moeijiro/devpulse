#!/usr/bin/env python3
"""Utility script to verify offline developer telemetry generation."""
import asyncio
from app.github.schemas import GitHubRepoNormalized
from app.services.analytics import aggregate_language_stats

def main():
    sample_repos = [
        GitHubRepoNormalized(
            id=1, name="vaultshare", full_name="Moeijiro/vaultshare",
            html_url="https://github.com/Moeijiro/vaultshare",
            language="Python", stars_count=45, forks_count=8, is_fork=False
        ),
        GitHubRepoNormalized(
            id=2, name="devpulse", full_name="Moeijiro/devpulse",
            html_url="https://github.com/Moeijiro/devpulse",
            language="TypeScript", stars_count=62, forks_count=12, is_fork=False
        ),
    ]
    stats = aggregate_language_stats(sample_repos)
    print("\n--- DevPulse Language Aggregation Test ---")
    for s in stats:
        print(f"• {s.language}: {s.percentage}% ({s.repo_count} repos)")
    print()

if __name__ == "__main__":
    main()
