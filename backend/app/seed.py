"""Warm the cache: ``python -m app.seed [--reset] [username ...]``.

DevPulse has no demo data of its own — it reads public GitHub profiles. This fetches
the given usernames (default: Moeijiro) once, so the dashboard opens instantly and the
next 15 minutes cost no GitHub requests. ``--reset`` drops every table first.
"""

from __future__ import annotations

import argparse
import asyncio

import app.models  # noqa: F401  (registers every table)
from app.db.session import AsyncSessionLocal, Base, engine
from app.services.sync import get_or_sync_user_data


async def main(reset: bool, usernames: list[str]) -> None:
    async with engine.begin() as conn:
        if reset:
            await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        for username in usernames:
            user, repos, events = await get_or_sync_user_data(username, db, force_refresh=True)
            print(f"Cached {user.username}: {len(repos)} repositories, {len(events)} public events")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reset", action="store_true", help="drop all tables before fetching")
    parser.add_argument("usernames", nargs="*", default=["Moeijiro"])
    args = parser.parse_args()
    asyncio.run(main(args.reset, args.usernames))
