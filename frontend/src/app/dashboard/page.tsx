"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Activity, Star, GitFork, AlertCircle, RefreshCw, Search, 
  Filter, Calendar, ExternalLink, Github, Code2, Sparkles, FolderGit2
} from "lucide-react";
import { 
  api, OverviewMetrics, ActivityDay, LanguageStat, GitHubRepo 
} from "@/lib/api";
import ActivityChart from "@/components/ActivityChart";
import LanguageBreakdown from "@/components/LanguageBreakdown";
import RepoCard from "@/components/RepoCard";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialUser = searchParams.get("user") || "Moeijiro";

  const [username, setUsername] = useState(initialUser);
  const [inputUser, setInputUser] = useState(initialUser);
  const [days, setDays] = useState<number>(30);
  
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [languages, setLanguages] = useState<LanguageStat[]>([]);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated");
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData(username, days);
  }, [username, days]);

  async function loadData(user: string, daysWindow: number) {
    setLoading(true);
    setError(null);
    try {
      const [ov, act, langs, rep] = await Promise.all([
        api.getOverview(user),
        api.getActivity(user, daysWindow),
        api.getLanguages(user),
        api.getRepos(user),
      ]);
      setOverview(ov);
      setActivity(act);
      setLanguages(langs);
      setRepos(rep);
    } catch (err: any) {
      setError(err.message || "Failed to load developer telemetry.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await api.refresh(username);
      await loadData(username, days);
    } catch (err: any) {
      setError("Failed to refresh GitHub data.");
    } finally {
      setRefreshing(false);
    }
  }

  function handleUserSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputUser.trim()) return;
    setUsername(inputUser.trim());
    router.push(`/dashboard?user=${encodeURIComponent(inputUser.trim())}`);
  }

  const filteredRepos = useMemo(() => {
    let list = [...repos];
    if (selectedLang !== "all") {
      list = list.filter((r) => r.language?.toLowerCase() === selectedLang.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) => r.name.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q))
      );
    }
    if (sortBy === "stars") {
      list.sort((a, b) => b.stars_count - a.stars_count);
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => (b.pushed_at || b.updated_at || "").localeCompare(a.pushed_at || a.updated_at || ""));
    }
    return list;
  }, [repos, selectedLang, searchQuery, sortBy]);

  return (
    <div className="space-y-8 py-4">
      {/* Top Header & User Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-400" />
            Developer Telemetry
          </h1>
          <p className="text-xs text-zinc-400">
            Factual repository metrics and telemetry for GitHub user <strong className="text-white">@{username}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleUserSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputUser}
              onChange={(e) => setInputUser(e.target.value)}
              placeholder="Switch username..."
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg text-white transition"
            >
              Go
            </button>
          </form>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 text-xs flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-400" : ""}`} />
            Sync
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
          {error}
        </div>
      ) : loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 font-mono">Aggregating public telemetry from GitHub...</p>
        </div>
      ) : (
        <>
          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 space-y-1">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Repositories</span>
              <p className="text-2xl font-bold text-white">{overview?.total_repositories}</p>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 space-y-1">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Total Stars</span>
              <p className="text-2xl font-bold text-amber-400 flex items-center gap-1.5">
                <Star className="w-5 h-5 fill-amber-400/20" />
                {overview?.total_stars}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 space-y-1">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Forks</span>
              <p className="text-2xl font-bold text-zinc-200 flex items-center gap-1.5">
                <GitFork className="w-5 h-5 text-zinc-400" />
                {overview?.total_forks}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 space-y-1">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Open Issues</span>
              <p className="text-2xl font-bold text-zinc-200 flex items-center gap-1.5">
                <AlertCircle className="w-5 h-5 text-zinc-400" />
                {overview?.total_open_issues}
              </p>
            </div>
          </div>

          {/* Activity Velocity Chart */}
          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Activity Velocity Stream
                </h3>
                <p className="text-xs text-zinc-400">Events aggregated directly from GitHub public event timeline.</p>
              </div>

              {/* Time window selector */}
              <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
                {[7, 30, 90].map((w) => (
                  <button
                    key={w}
                    onClick={() => setDays(w)}
                    className={`px-3 py-1 rounded transition ${
                      days === w ? "bg-zinc-800 text-white font-bold" : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    {w}d
                  </button>
                ))}
              </div>
            </div>

            <ActivityChart data={activity} daysWindow={days} />
          </div>

          {/* Languages Breakdown */}
          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 space-y-4">
            <div className="space-y-0.5">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                Ecosystem Language Distribution
              </h3>
              <p className="text-xs text-zinc-400">Repository language footprint normalized across public repositories.</p>
            </div>
            <LanguageBreakdown languages={languages} />
          </div>

          {/* Repositories Explorer */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-blue-400" />
                Public Repositories ({filteredRepos.length})
              </h3>

              {/* Search & Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search repositories..."
                    className="bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Languages</option>
                  {languages.map((l) => (
                    <option key={l.language} value={l.language}>{l.language}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="stars">Most Stars</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {filteredRepos.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-zinc-800 rounded-xl text-xs text-zinc-500 font-mono">
                No repositories match the current filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRepos.map((repo) => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
