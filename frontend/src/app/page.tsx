"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, BarChart3, Clock, Code2, Gauge, Search, Share2, ShieldCheck, Star } from "lucide-react";
import { Logo } from "@/components/brand";
import { ActivityBars, GitHubMark, Languages } from "@/components/pulse";
import { CtaBand, FeatureCard, Hero, HeroCard, InfoCard, Section, SiteFooter, SiteNav } from "@/components/kit/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_USER } from "@/lib/api";

const SAMPLE_DAYS = Array.from({ length: 30 }, (_, i) => ({ date: new Date(Date.UTC(2026, 7, 25 + i)).toISOString().slice(0, 10), count: [0, 2, 5, 3, 0, 1, 8, 4, 2, 0, 0, 6, 9, 3, 1, 2, 7, 5, 0, 3, 4, 11, 6, 2, 0, 1, 5, 8, 4, 6][i], events: [] }));
const SAMPLE_LANGS = [
  { language: "TypeScript", repo_count: 7, percentage: 43.8, color: "#3178C6" },
  { language: "Python", repo_count: 6, percentage: 37.5, color: "#3572A5" },
  { language: "Rust", repo_count: 2, percentage: 12.5, color: "#DEA584" },
  { language: "Shell", repo_count: 1, percentage: 6.2, color: "#89E051" },
];

function Lookup() {
  const router = useRouter();
  const [name, setName] = useState("");
  return (
    <form className="flex w-full max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); router.push(`/dashboard?user=${encodeURIComponent(name.trim() || DEFAULT_USER)}`); }}>
      <label className="relative flex-1">
        <span className="sr-only">GitHub username</span>
        <GitHubMark className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={DEFAULT_USER} className="h-11 bg-card pl-9" />
      </label>
      <Button type="submit" size="lg" className="h-11 px-5"><Search />Analyse</Button>
    </form>
  );
}

export default function Landing() {
  return (
    <>
      <SiteNav brand={<Logo />} links={[["#how", "How it works"], ["#features", "Features"], ["#use-cases", "Use cases"]]}
        actions={<Button asChild size="sm"><Link href="/dashboard">Open the dashboard</Link></Button>} />
      <main id="main">
        <Hero eyebrow="GitHub analytics"
          title="See what a developer actually ships."
          description="DevPulse turns a public GitHub profile into an activity chart, a language breakdown and a searchable repository list — plus a clean profile page to share with clients and employers."
          actions={<Lookup />}
          note="Any public username works. Data is cached for 15 minutes to respect GitHub's rate limit."
          visual={
            <HeroCard>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <div><p className="mb-6 text-sm font-semibold">Public activity · 30 days</p><ActivityBars days={SAMPLE_DAYS} /></div>
                <div><p className="mb-4 text-sm font-semibold">Languages</p><Languages stats={SAMPLE_LANGS} /></div>
              </div>
            </HeroCard>
          } />

        <Section id="how" eyebrow="How it works" title="One username, three views">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={Search} title="Enter a username" index={1}>Any public GitHub account — no sign-in, no OAuth.</FeatureCard>
            <FeatureCard icon={Activity} title="Read the activity" index={2} delay={0.05}>Pushes, pull requests and issues bucketed per day, for 7, 30 or 90 days.</FeatureCard>
            <FeatureCard icon={Star} title="Pick the highlights" index={3} delay={0.1}>Star up to six repositories to feature on the public page.</FeatureCard>
            <FeatureCard icon={Share2} title="Share the profile" index={4} delay={0.15}>A clean page at /u/username with featured work and languages.</FeatureCard>
          </div>
        </Section>

        <Section id="features" eyebrow="Under the hood" title="Fast, polite to GitHub, hard to break" tinted>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={Clock} title="15-minute cache">Profiles, repositories and events are cached, so a busy page stays inside 60 requests an hour.</FeatureCard>
            <FeatureCard icon={Gauge} title="Rate-limit aware" delay={0.05}>A clear message when GitHub&apos;s limit is hit; a token raises it to 5,000.</FeatureCard>
            <FeatureCard icon={Code2} title="Honest language stats" delay={0.1}>Forks are left out, so the breakdown reflects the developer&apos;s own work.</FeatureCard>
            <FeatureCard icon={ShieldCheck} title="Validated usernames">Only valid GitHub logins reach the GitHub API; lookups are case-insensitive.</FeatureCard>
            <FeatureCard icon={BarChart3} title="Search and sort" delay={0.05}>Filter repositories by language, search descriptions, sort by stars or recency.</FeatureCard>
            <FeatureCard icon={Share2} title="Owner-only edits" delay={0.1}>With an admin token set, only you can change what your profile features.</FeatureCard>
          </div>
        </Section>

        <Section id="use-cases" eyebrow="Use cases" title="For people who hire, and people who get hired" last>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard title="Freelancers">Send one link that shows real, recent work instead of a static CV.</InfoCard>
            <InfoCard title="Tech recruiters" delay={0.05}>Check what a candidate has been building lately, in seconds.</InfoCard>
            <InfoCard title="Team leads">A quick read on a new contributor&apos;s languages and activity.</InfoCard>
            <InfoCard title="Open-source maintainers" delay={0.05}>See stars, forks and issues across your projects in one list.</InfoCard>
          </div>
          <CtaBand title="Try it on your own GitHub" description="Enter a username — the dashboard and the public profile are ready immediately."
            action={<Button asChild size="lg" variant="secondary" className="h-11 px-5"><Link href="/dashboard">Open the dashboard<ArrowRight data-icon="inline-end" /></Link></Button>} />
        </Section>
      </main>
      <SiteFooter brand={<Logo />} note="A portfolio project · MIT licensed · uses public GitHub data" right={<><Clock className="size-3.5" />Cached for 15 minutes</>} />
    </>
  );
}
