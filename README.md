# DevPulse

[![CI](https://github.com/Moeijiro/devpulse/actions/workflows/ci.yml/badge.svg)](https://github.com/Moeijiro/devpulse/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg?logo=next.js)](https://nextjs.org/)
[![GitHub API](https://img.shields.io/badge/Integration-GitHub%20REST%20v3-181717.svg?logo=github)](https://docs.github.com/en/rest)

> **DevPulse** is a developer analytics platform that transforms public GitHub activity, repository metrics, language distributions, and commit feeds into responsive visual dashboards and shareable public developer portfolios.

---

## System Architecture

```
                               +-------------------------------------+
                               |           DevPulse Web UI           |
                               |  (Next.js 14, TypeScript, Tailwind) |
                               +------------------+------------------+
                                                  |
                                            REST API (JSON)
                                                  |
                               +------------------v------------------+
                               |          DevPulse Backend           |
                               |    (FastAPI, Pydantic, HTTPX)       |
                               +------------------+------------------+
                                                  |
              +-----------------------------------+-----------------------------------+
              |                                   |                                   |
+-------------v--------------+     +--------------v-------------+     +---------------v---------------+
|    GitHub API Connector    |     |    Aggregation & Analytics |     |   Cache & Persistence Engine  |
| • Asynchronous HTTPX Pool  |     | • 7 / 30 / 90-Day Buckets  |     | • TTL-Based Stale-While-Reval |
| • Rate Limit Header Watch  |     | • Language Byte Normalizer |     | • SQLite / PostgreSQL Ready   |
| • OAuth / PAT Token Inject |     | • Event Stream Sequencer   |     | • Pinned Featured Repos       |
+-------------+--------------+     +----------------------------+     +-------------------------------+
              |
              v
     [ GitHub REST v3 ]
```

---

## Core Principles & Defensive Scope

1. **Factual Metrics Only**: DevPulse strictly surfaces factual public telemetry (commits, pull requests, issues, stars, forks, and language bytes). It intentionally **does not compute arbitrary developer scores** or rank programmers.
2. **Rate Limit Preservation**: All external GitHub API calls are cached with configurable TTLs (e.g. 15 minutes for metadata, 1 hour for language breakdowns) to conserve API quotas.
3. **Public-First & Non-Intrusive**: Operates seamlessly in anonymous public mode for any public username (`/u/{username}`), respecting private repository boundaries.

---

## Key Features

- 📈 **Activity Velocity Timeline**: Interactive 7-day, 30-day, and 90-day activity event visualizations parsed directly from public GitHub event streams.
- 💻 **Language Breakdown**: Weighted language distribution calculated across all repositories with percentage representations and byte counters.
- 🗂️ **Repository Explorer**: Real-time client-side search, filtering by programming language, and multi-field sorting (recently updated, stars, forks, open issues).
- 🔍 **Repository Deep Dive**: Detailed inspection view showing commit history, open issue counts, primary branch metadata, and license info.
- 👤 **Shareable Developer Profile (`/u/{username}`)**: Public portfolio page displaying curated featured repositories (3–6 pinned repositories) and overall open-source footprint.
- ⚡ **Rate Limit Monitor**: Live visibility into remaining GitHub API quotas and reset countdowns extracted from upstream response headers.
- 🔄 **On-Demand Cache Invalidation**: Instant refresh trigger to pull fresh commits and PR updates from GitHub.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/analytics/{username}/overview` | High-level summary (repos, stars, forks, total commits) |
| `GET` | `/api/v1/analytics/{username}/activity` | 7, 30, and 90-day activity telemetry buckets |
| `GET` | `/api/v1/analytics/{username}/languages` | Aggregate language distribution breakdown |
| `GET` | `/api/v1/repos/{username}` | List normalized repositories with filtering |
| `GET` | `/api/v1/repos/{username}/{repo_name}` | Repository details and recent commit feed |
| `GET` | `/api/v1/profiles/{username}` | Public developer profile with pinned repositories |
| `POST` | `/api/v1/profiles/{username}/featured` | Update pinned featured repositories (3-6) |
| `POST` | `/api/v1/profiles/{username}/refresh` | Invalidate cache and sync latest GitHub telemetry |
| `GET` | `/api/v1/system/rate-limit` | Upstream GitHub API quota status |

---

## Tech Stack

- **Backend**: Python 3.11+, FastAPI, HTTPX, SQLAlchemy 2.0, Pydantic v2, pytest
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **CI/CD**: GitHub Actions, Ruff, Pytest-cov

---

## Quickstart

### Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env

# Optional: Add GITHUB_TOKEN to .env for 5,000 req/hr rate limits
pytest
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## License

MIT © [Moeijiro](https://github.com/Moeijiro)
