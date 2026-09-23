"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Activity, ExternalLink, GitFork, RefreshCw, Search, Star, UserRound } from "lucide-react";
import { ActivityBars, GitHubMark, Languages, LanguageDot, UserHeader } from "@/components/pulse";
import { SelectField } from "@/components/kit/select-field";
import { Empty, ErrorState, PageLoading, Panel, RowsLoading, Stat } from "@/components/kit/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi } from "@/hooks/use-api";
import { useDebounced } from "@/hooks/use-debounced";
import { api, DEFAULT_USER, type RepoSort } from "@/lib/api";
import { nf, relative } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  // useSearchParams needs a Suspense boundary for the static build.
  return <Suspense fallback={<PageLoading />}><Dashboard /></Suspense>;
}

function UserSearch({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  return (
    <form className="mb-6 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (value.trim()) router.push(`/dashboard?user=${encodeURIComponent(value.trim())}`); }}>
      <label className="relative flex-1 sm:max-w-sm">
        <span className="sr-only">GitHub username</span>
        <GitHubMark className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="GitHub username" className="bg-card pl-8" />
      </label>
      <Button type="submit"><Search />Analyse</Button>
    </form>
  );
}

function Dashboard() {
  const user = useSearchParams().get("user") || DEFAULT_USER;
  const [days, setDays] = useState(30);
  const [refreshing, setRefreshing] = useState(false);
  const main = useApi(() => Promise.all([api.getOverview(user), api.getLanguages(user), api.getProfile(user)]), user);
  const activity = useApi(() => api.getActivity(user, days), `${user}:${days}`);

  async function refresh() {
    setRefreshing(true);
    try {
      const r = await api.refresh(user);
      toast.success(`Synced ${r.repos_count} repositories and ${r.events_count} events from GitHub`);
      main.reload();
      activity.reload();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <>
      <UserSearch key={user} initial={user} />
      {main.error ? <ErrorState message={main.error} onRetry={main.reload} /> : !main.data ? <PageLoading /> : (() => {
        const [o, languages, profile] = main.data;
        const featured = profile.featured_repositories.map((r) => r.name);
        return (
          <>
            <UserHeader user={o.user} actions={<>
              <Button variant="outline" onClick={refresh} disabled={refreshing}><RefreshCw className={cn(refreshing && "animate-spin")} />{refreshing ? "Syncing…" : "Refresh"}</Button>
              <Button asChild><Link href={`/u/${o.user.username}`}><UserRound />Public profile</Link></Button>
            </>} />
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Repositories" icon={GitHubMark} value={nf.format(o.total_repositories)} hint={`${nf.format(o.user.public_repos)} public on GitHub`} />
              <Stat label="Stars earned" icon={Star} value={nf.format(o.total_stars)} />
              <Stat label="Forks" icon={GitFork} value={nf.format(o.total_forks)} />
              <Stat label="Pushes" icon={Activity} value={nf.format(o.recent_push_events)} hint={`of ${o.total_tracked_events} recent public events`} />
            </div>
            <div className="mb-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <Panel title="Public activity" description="GitHub keeps the last ~90 days / 300 public events."
                action={<div className="inline-flex rounded-lg border p-0.5">{[7, 30, 90].map((d) => (
                  <button key={d} type="button" onClick={() => setDays(d)} className={cn("rounded-md px-2 py-0.5 text-xs", days === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{d}d</button>
                ))}</div>} bodyClassName="px-5 pt-8 pb-4">
                {activity.data ? <ActivityBars days={activity.data} /> : activity.error ? <p className="text-sm text-destructive">{activity.error}</p> : <div className="h-40" />}
              </Panel>
              <Panel title="Languages" description="Share of original repositories by main language." bodyClassName="p-5"><Languages stats={languages} /></Panel>
            </div>
            <Repositories user={o.user.username} featured={featured} languages={languages.map((l) => l.language)} colors={Object.fromEntries(languages.map((l) => [l.language, l.color]))} onFeaturedChange={main.reload} />
          </>
        );
      })()}
    </>
  );
}

function Repositories({ user, featured, languages, colors, onFeaturedChange }: { user: string; featured: string[]; languages: string[]; colors: Record<string, string>; onFeaturedChange: () => void }) {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("all");
  const [sort, setSort] = useState<RepoSort>("updated");
  const q = useDebounced(search.trim(), 250);
  const params = { search: q || undefined, language: language === "all" ? undefined : language, sort_by: sort };
  const repos = useApi(() => api.getRepos(user, params), `${user}:${JSON.stringify(params)}`);

  async function toggle(name: string) {
    const next = featured.includes(name) ? featured.filter((n) => n !== name) : [...featured, name];
    if (next.length === 0) return toast.error("Keep at least one repository featured.");
    if (next.length > 6) return toast.error("Feature up to six repositories.");
    try {
      await api.updateFeatured(user, next);
      toast.success(featured.includes(name) ? `${name} removed from the profile` : `${name} featured on the profile`);
      onFeaturedChange();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <Panel title="Repositories" description="Star a repository to feature it on the public profile (up to six)." bodyClassName="p-0">
      <div className="grid grid-cols-1 gap-2 border-b p-3 sm:grid-cols-[minmax(0,1fr)_170px_150px]">
        <label className="relative">
          <span className="sr-only">Search repositories</span>
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or description" className="bg-card pl-8" />
        </label>
        <SelectField label="Language" value={language} onChange={setLanguage} options={[{ value: "all", label: "All languages" }, ...languages]} />
        <SelectField label="Sort" value={sort} onChange={(v) => setSort(v as RepoSort)} options={[{ value: "updated", label: "Recently pushed" }, { value: "stars", label: "Most stars" }, { value: "name", label: "Name" }]} />
      </div>
      {repos.error ? <div className="p-4"><ErrorState message={repos.error} onRetry={repos.reload} /></div> : !repos.data ? <RowsLoading /> : repos.data.length === 0 ? (
        <Empty icon={Search} title="No repositories match" />
      ) : (
        <ul className="divide-y">
          {repos.data.map((r) => {
            const isFeatured = featured.includes(r.name);
            return (
              <li key={r.id} className="flex items-start gap-3 px-5 py-3.5">
                <button type="button" onClick={() => toggle(r.name)} aria-pressed={isFeatured} aria-label={isFeatured ? `Unfeature ${r.name}` : `Feature ${r.name}`}
                  className={cn("mt-0.5 rounded-md p-1 transition-colors", isFeatured ? "text-warn" : "text-muted-foreground/50 hover:text-foreground")}>
                  <Star className={cn("size-4", isFeatured && "fill-current")} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/repo/${user}/${r.name}`} className="font-medium hover:text-primary">{r.name}</Link>
                    {r.is_fork ? <span className="rounded border px-1 text-[10px] text-muted-foreground">fork</span> : null}
                  </div>
                  {r.description ? <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{r.description}</p> : null}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <LanguageDot language={r.language} color={r.language ? colors[r.language] : undefined} />
                    <span className="inline-flex items-center gap-1"><Star className="size-3.5" />{nf.format(r.stars_count)}</span>
                    <span className="inline-flex items-center gap-1"><GitFork className="size-3.5" />{nf.format(r.forks_count)}</span>
                    <span>pushed {relative(r.pushed_at ?? r.updated_at)}</span>
                  </div>
                </div>
                <a href={r.html_url} target="_blank" rel="noreferrer" aria-label={`${r.name} on GitHub`} className="rounded-md p-1 text-muted-foreground hover:text-foreground"><ExternalLink className="size-4" /></a>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
