"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, GitFork, Link2, Star } from "lucide-react";
import { Logo } from "@/components/brand";
import { Languages, LanguageDot, UserHeader } from "@/components/pulse";
import { SiteFooter, SiteNav } from "@/components/kit/site";
import { ErrorState, PageLoading, Panel } from "@/components/kit/ui";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { nf, relative } from "@/lib/format";

/** The shareable portfolio page for one developer. */
export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const profile = useApi(() => api.getProfile(username), username);

  return (
    <>
      <SiteNav brand={<Logo />} links={[]} actions={<Button asChild size="sm" variant="outline"><Link href={`/dashboard?user=${username}`}>Open in dashboard</Link></Button>} />
      <main id="main" className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        {profile.error ? <ErrorState message={profile.error} onRetry={profile.reload} /> : !profile.data ? <PageLoading /> : (() => {
          const p = profile.data;
          const colors = Object.fromEntries(p.top_languages.map((l) => [l.language, l.color]));
          return (
            <>
              <UserHeader user={p.user} actions={<Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(window.location.href).catch(() => undefined); toast.success("Link copied"); }}><Link2 />Copy link</Button>} />
              <div className="mb-8 grid grid-cols-3 gap-3">
                {[["Repositories", p.overview.total_repositories], ["Stars", p.overview.total_stars], ["Forks", p.overview.total_forks]].map(([label, value]) => (
                  <div key={label} className="rounded-xl border bg-card px-5 py-4 text-center"><p className="text-2xl font-semibold tabular">{nf.format(value as number)}</p><p className="text-xs text-muted-foreground">{label}</p></div>
                ))}
              </div>
              <h2 className="mb-3 text-sm font-semibold">Featured work</h2>
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {p.featured_repositories.map((r) => (
                  <a key={r.id} href={r.html_url} target="_blank" rel="noreferrer" className="group flex flex-col rounded-xl border bg-card p-5 transition-colors hover:border-primary/40">
                    <p className="font-semibold group-hover:text-primary">{r.name}</p>
                    <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted-foreground">{r.description ?? "No description."}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <LanguageDot language={r.language} color={r.language ? colors[r.language] : undefined} />
                      <span className="inline-flex items-center gap-1"><Star className="size-3.5" />{nf.format(r.stars_count)}</span>
                      <span className="inline-flex items-center gap-1"><GitFork className="size-3.5" />{nf.format(r.forks_count)}</span>
                    </div>
                  </a>
                ))}
              </div>
              <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
                <Panel title="Languages" bodyClassName="p-5"><Languages stats={p.top_languages} /></Panel>
                <Panel title="Recent activity">
                  {p.recent_activities.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No recent public activity.</p> : (
                    <ol className="divide-y">
                      {p.recent_activities.map((a) => (
                        <li key={a.id} className="px-5 py-2.5">
                          <p className="truncate text-sm">{a.action_summary}</p>
                          <p className="text-xs text-muted-foreground">{a.repo_name} · {relative(a.created_at)}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </Panel>
              </div>
            </>
          );
        })()}
      </main>
      <SiteFooter brand={<Logo />} note="Built from public GitHub data with DevPulse" right={<Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">Make your own<ArrowRight className="size-3.5" /></Link>} />
    </>
  );
}
