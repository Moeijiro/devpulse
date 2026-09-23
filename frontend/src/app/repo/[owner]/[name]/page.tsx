"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, GitFork, AlertCircle, ExternalLink, Calendar, Code2, FolderGit2 } from "lucide-react";
import { api, GitHubRepo } from "@/lib/api";

export default function RepoDetailPage() {
  const params = useParams();
  const owner = params?.owner as string;
  const name = params?.name as string;

  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!owner || !name) return;
    api
      .getRepoDetail(owner, name)
      .then((data) => {
        setRepo(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load repository detail.");
        setLoading(false);
      });
  }, [owner, name]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">Fetching repository telemetry...</p>
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h1 className="text-xl font-bold text-white">Repository Not Found</h1>
        <p className="text-xs text-zinc-400">{error || "Could not retrieve repository info."}</p>
        <Link href="/dashboard" className="inline-block px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <Link
        href={`/dashboard?user=${owner}`}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to @{owner} telemetry
      </Link>

      <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">{repo.name}</h1>
            </div>
            <p className="text-xs font-mono text-zinc-500">{repo.full_name}</p>
          </div>

          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs text-blue-400 font-semibold flex items-center gap-1.5 transition shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View on GitHub
          </a>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed">
          {repo.description || "No repository description has been configured on GitHub."}
        </p>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-center">
            <span className="text-[10px] uppercase font-mono text-zinc-500">Stars</span>
            <p className="text-lg font-bold text-amber-400 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-400/20" />
              {repo.stars_count}
            </p>
          </div>
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-center">
            <span className="text-[10px] uppercase font-mono text-zinc-500">Forks</span>
            <p className="text-lg font-bold text-zinc-200 flex items-center justify-center gap-1">
              <GitFork className="w-4 h-4" />
              {repo.forks_count}
            </p>
          </div>
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-center">
            <span className="text-[10px] uppercase font-mono text-zinc-500">Open Issues</span>
            <p className="text-lg font-bold text-zinc-200 flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {repo.open_issues_count}
            </p>
          </div>
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-center">
            <span className="text-[10px] uppercase font-mono text-zinc-500">Primary Tech</span>
            <p className="text-sm font-bold text-blue-400 pt-1">
              {repo.language || "Plain"}
            </p>
          </div>
        </div>

        <div className="text-xs text-zinc-400 font-mono space-y-1 pt-2 border-t border-zinc-800/60">
          <p>Last pushed: {repo.pushed_at ? repo.pushed_at.replace("T", " ").substring(0, 16) : "N/A"} UTC</p>
          <p>Fork status: {repo.is_fork ? "Forked repository" : "Original source repository"}</p>
        </div>
      </div>
    </div>
  );
}
