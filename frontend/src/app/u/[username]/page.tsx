"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { 
  Github, Star, GitFork, MapPin, Building, Link as LinkIcon, 
  ExternalLink, Calendar, Code2, Activity, Sparkles, FolderGit2
} from "lucide-react";
import { api, PublicProfileData } from "@/lib/api";
import RepoCard from "@/components/RepoCard";

export default function PublicProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    api
      .getProfile(username)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load public profile.");
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">Generating public developer portfolio...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h1 className="text-xl font-bold text-white">Developer Profile Not Found</h1>
        <p className="text-xs text-zinc-400">{error || "Could not retrieve public profile."}</p>
        <a href="/" className="inline-block px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
          Back to Home
        </a>
      </div>
    );
  }

  const { user, overview, featured_repositories, top_languages, recent_activities } = profile;

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      {/* Profile Header Banner */}
      <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-xl">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-24 h-24 rounded-2xl border-2 border-blue-500/40 object-cover shadow-md"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-400">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="flex-1 text-center md:text-left space-y-3">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{user.name || user.username}</h1>
              <span className="text-xs font-mono text-zinc-400">@{user.username}</span>
            </div>
            {user.bio && <p className="text-xs text-zinc-300 mt-1 max-w-xl leading-relaxed">{user.bio}</p>}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-zinc-400 font-mono">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                {user.location}
              </span>
            )}
            {user.company && (
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-zinc-500" />
                {user.company}
              </span>
            )}
            <a
              href={`https://github.com/${user.username}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:underline"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub Profile
            </a>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 text-center text-xs">
          <div>
            <p className="font-bold text-white">{overview.total_repositories}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-mono">Repos</p>
          </div>
          <div>
            <p className="font-bold text-amber-400">{overview.total_stars}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-mono">Stars</p>
          </div>
          <div>
            <p className="font-bold text-zinc-300">{user.followers}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-mono">Followers</p>
          </div>
        </div>
      </div>

      {/* Primary Tech Stack / Languages */}
      <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 space-y-4">
        <h3 className="font-semibold text-sm text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          Primary Tech Stack
        </h3>
        <div className="flex flex-wrap gap-2">
          {top_languages.map((l) => (
            <div
              key={l.language}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="font-medium text-white">{l.language}</span>
              <span className="text-[11px] font-mono text-zinc-500">{l.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Repositories (Pinned 3-6) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Featured Open Source Repositories
          </h3>
          <span className="text-[11px] text-zinc-500 font-mono">Curated Portfolio Showcase</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featured_repositories.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      </div>

      {/* Recent Public Activity Feed */}
      <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 space-y-4">
        <h3 className="font-semibold text-sm text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          Recent GitHub Activity Feed
        </h3>

        <div className="space-y-2.5 divide-y divide-zinc-800/60">
          {recent_activities.map((act) => (
            <div key={act.id} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="font-medium text-zinc-200">{act.action_summary}</p>
                <p className="text-[11px] font-mono text-blue-400/80">{act.repo_name}</p>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                {act.created_at.substring(0, 10)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
