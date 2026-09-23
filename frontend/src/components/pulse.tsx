import { Building2, CalendarDays, Link2, MapPin, Users } from "lucide-react";
import type { ActivityDay, GitHubUser, LanguageStat } from "@/lib/api";
import { joined, nf, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Daily public events as bars; hover shows the day and what happened. */
export function ActivityBars({ days, className }: { days: ActivityDay[]; className?: string }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((s, d) => s + d.count, 0);
  return (
    <div className={className}>
      <div className="flex h-36 items-end gap-[3px]" role="img" aria-label={`${total} public events in ${days.length} days`}>
        {days.map((d) => (
          <div key={d.date} className="group relative flex h-full flex-1 items-end">
            <div className={cn("w-full rounded-sm transition-colors", d.count ? "bg-primary/80 group-hover:bg-primary" : "bg-muted")} style={{ height: d.count ? `${Math.max(6, (d.count / max) * 100)}%` : "4px" }} />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-52 -translate-x-1/2 rounded-lg border bg-popover p-2.5 text-xs shadow-md group-hover:block">
              <p className="font-medium">{shortDate(d.date)} · {d.count} event{d.count === 1 ? "" : "s"}</p>
              {d.events.map((e, i) => <p key={i} className="mt-1 truncate text-muted-foreground">{e}</p>)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>{days[0] ? shortDate(days[0].date) : ""}</span>
        <span>{days.at(-1) ? shortDate(days.at(-1)!.date) : ""}</span>
      </div>
    </div>
  );
}

/** One stacked bar in GitHub's language colours, with a legend. */
export function Languages({ stats }: { stats: LanguageStat[] }) {
  if (!stats.length) return <p className="text-sm text-muted-foreground">No languages detected in original (non-fork) repositories.</p>;
  return (
    <div className="space-y-4">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
        {stats.map((l) => <div key={l.language} style={{ width: `${l.percentage}%`, background: l.color }} title={`${l.language} ${l.percentage}%`} />)}
      </div>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {stats.map((l) => (
          <li key={l.language} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: l.color }} />
            <span className="min-w-0 flex-1 truncate">{l.language}</span>
            <span className="text-xs text-muted-foreground tabular">{l.percentage}% · {l.repo_count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LanguageDot({ language, color }: { language: string | null; color?: string }) {
  if (!language) return null;
  return <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-2 rounded-full" style={{ background: color ?? "var(--muted-foreground)" }} />{language}</span>;
}

export function UserHeader({ user, actions }: { user: GitHubUser; actions?: React.ReactNode }) {
  const blog = user.blog ? (user.blog.startsWith("http") ? user.blog : `https://${user.blog}`) : null;
  return (
    <div className="mb-6 flex flex-col gap-5 rounded-xl border bg-card p-5 sm:flex-row sm:items-center">
      {user.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatar_url} alt="" className="size-20 shrink-0 rounded-full border" />
      ) : <span className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">{user.username.slice(0, 2).toUpperCase()}</span>}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight">{user.name ?? user.username}</h1>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
        {user.bio ? <p className="mt-2 max-w-2xl text-sm">{user.bio}</p> : null}
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{nf.format(user.followers)} followers · {nf.format(user.following)} following</span>
          {user.location ? <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{user.location}</span> : null}
          {user.company ? <span className="inline-flex items-center gap-1"><Building2 className="size-3.5" />{user.company}</span> : null}
          {blog ? <a href={blog} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground"><Link2 className="size-3.5" />{user.blog}</a> : null}
          <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />On GitHub since {joined(user.created_at)}</span>
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

/** GitHub's mark (lucide ships no brand icons). */
export function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
