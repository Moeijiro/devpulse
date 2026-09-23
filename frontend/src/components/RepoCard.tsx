import Link from "next/link";
import { Star, GitFork, AlertCircle, ExternalLink, Calendar } from "lucide-react";
import { GitHubRepo } from "@/lib/api";

interface RepoCardProps {
  repo: GitHubRepo;
}

export default function RepoCard({ repo }: RepoCardProps) {
  const updatedStr = repo.pushed_at || repo.updated_at;
  const formattedDate = updatedStr ? updatedStr.substring(0, 10) : "Recent";

  return (
    <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700/80 transition flex flex-col justify-between space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/repo/${repo.full_name}`}
            className="font-semibold text-sm text-blue-400 hover:text-blue-300 transition truncate"
          >
            {repo.name}
          </Link>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {repo.description || "No repository description provided."}
        </p>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-2 border-t border-zinc-800/60">
        <div className="flex items-center gap-3">
          {repo.language && (
            <span className="flex items-center gap-1 text-zinc-300 font-sans">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" />
            {repo.stars_count}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="w-3 h-3" />
            {repo.forks_count}
          </span>
        </div>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formattedDate}
        </span>
      </div>
    </div>
  );
}
