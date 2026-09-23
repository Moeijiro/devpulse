"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CircleDot, ExternalLink, GitFork, Star } from "lucide-react";
import { ErrorState, Field, PageLoading, PageTitle, Panel, Stat, Tag } from "@/components/kit/ui";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { nf, relative } from "@/lib/format";

export default function RepoPage() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const repo = useApi(() => api.getRepoDetail(owner, name), `${owner}/${name}`);
  if (repo.error) return <ErrorState message={repo.error} onRetry={repo.reload} />;
  if (!repo.data) return <PageLoading />;
  const r = repo.data;
  return (
    <>
      <PageTitle eyebrow={<><Link href={`/dashboard?user=${owner}`} className="hover:text-foreground">{owner}</Link> / repositories</>} title={r.name}
        description={r.description ?? "No description."}
        actions={<Button asChild variant="outline"><a href={r.html_url} target="_blank" rel="noreferrer"><ExternalLink />Open on GitHub</a></Button>} />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Stars" icon={Star} value={nf.format(r.stars_count)} />
        <Stat label="Forks" icon={GitFork} value={nf.format(r.forks_count)} />
        <Stat label="Open issues" icon={CircleDot} value={nf.format(r.open_issues_count)} tone={r.open_issues_count ? "warn" : undefined} />
      </div>
      <Panel title="Details" bodyClassName="px-5 py-2" className="max-w-2xl">
        <Field label="Full name"><span className="font-mono text-xs">{r.full_name}</span></Field>
        <Field label="Language">{r.language ?? "—"}</Field>
        <Field label="Type">{r.is_fork ? <Tag>Fork</Tag> : "Original"}</Field>
        <Field label="Last push">{relative(r.pushed_at)}</Field>
        <Field label="Updated">{relative(r.updated_at)}</Field>
      </Panel>
    </>
  );
}
