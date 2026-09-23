"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Github, Search, ArrowRight, BarChart3, Code2, ShieldCheck, Sparkles, FolderGit2 } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    router.push(`/dashboard?user=${encodeURIComponent(username.trim())}`);
  }

  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Factual GitHub Telemetry • Zero Arbitrary Rankings</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Developer telemetry, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            purely factual.
          </span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Transform your GitHub repository landscape, activity feeds, and language distributions into a clean developer portfolio and analytics dashboard.
        </p>

        {/* Live GitHub Username Demo Search */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto pt-4 flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Github className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Moeijiro, octocat, torvalds"
              className="w-full pl-10 pr-3 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition flex items-center gap-1.5 glow-blue shrink-0"
          >
            Explore
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 font-mono">
          <span>Popular demos:</span>
          <button
            type="button"
            onClick={() => router.push("/dashboard?user=Moeijiro")}
            className="hover:text-blue-400 underline transition"
          >
            Moeijiro
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => router.push("/dashboard?user=octocat")}
            className="hover:text-blue-400 underline transition"
          >
            octocat
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => router.push("/dashboard?user=torvalds")}
            className="hover:text-blue-400 underline transition"
          >
            torvalds
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white">7/30/90-Day Telemetry</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Directly aggregate public event streams without inventing scores. Inspect push velocity, issue resolutions, and PR activity.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white">Language Intelligence</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Calculate accurate repository-weighted language distributions, identifying primary tech stacks across entire GitHub ecosystems.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white">Public Portfolio Route</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Create clean, shareable developer portfolios at <code className="text-purple-400">/u/&#123;username&#125;</code> highlighting your top 3–6 pinned repositories.
          </p>
        </div>
      </section>

      {/* Defensive Philosophy Callout */}
      <section className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Ethical Metrics Policy</span>
          </div>
          <h2 className="text-xl font-bold text-white">No Speculative Performance Ratings</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            DevPulse avoids deceptive AI productivity scores and commit-based developer rankings. We present factual repository telemetry and event history to let engineering accomplishments speak for themselves.
          </p>
        </div>
        <Link
          href="/u/Moeijiro"
          className="px-6 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition shrink-0"
        >
          View Live Portfolio Demo
        </Link>
      </section>
    </div>
  );
}
