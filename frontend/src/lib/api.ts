const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface GitHubUser {
  username: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string | null;
}

export interface OverviewMetrics {
  total_repositories: number;
  total_stars: number;
  total_forks: number;
  total_open_issues: number;
  recent_push_events: number;
  total_tracked_events: number;
  user: GitHubUser;
}

export interface ActivityDay {
  date: string;
  count: number;
  events: string[];
}

export interface LanguageStat {
  language: string;
  repo_count: number;
  percentage: float;
  color: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stars_count: number;
  forks_count: number;
  open_issues_count: number;
  is_fork: boolean;
  updated_at: string | null;
  pushed_at: string | null;
}

export interface PublicProfileData {
  user: GitHubUser;
  overview: OverviewMetrics;
  featured_repositories: GitHubRepo[];
  top_languages: LanguageStat[];
  recent_activities: Array<{
    id: string;
    type: string;
    repo_name: string;
    action_summary: string;
    created_at: string;
  }>;
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset_epoch: number;
  reset_time: string;
  is_authenticated: boolean;
}

export const api = {
  async getOverview(username: string): Promise<OverviewMetrics> {
    const res = await fetch(`${API_URL}/analytics/${username}/overview`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "User not found." }));
      throw new Error(err.detail || "User not found.");
    }
    return res.json();
  },

  async getActivity(username: string, days: number = 30): Promise<ActivityDay[]> {
    const res = await fetch(`${API_URL}/analytics/${username}/activity?days=${days}`);
    if (!res.ok) throw new Error("Failed to load activity telemetry.");
    return res.json();
  },

  async getLanguages(username: string): Promise<LanguageStat[]> {
    const res = await fetch(`${API_URL}/analytics/${username}/languages`);
    if (!res.ok) throw new Error("Failed to load language breakdown.");
    return res.json();
  },

  async getRepos(
    username: string,
    params?: { language?: string; search?: string; sort_by?: string }
  ): Promise<GitHubRepo[]> {
    const query = new URLSearchParams();
    if (params?.language) query.set("language", params.language);
    if (params?.search) query.set("search", params.search);
    if (params?.sort_by) query.set("sort_by", params.sort_by);

    const res = await fetch(`${API_URL}/repos/${username}?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to load repositories.");
    return res.json();
  },

  async getRepoDetail(username: string, repoName: string): Promise<GitHubRepo> {
    const res = await fetch(`${API_URL}/repos/${username}/${repoName}`);
    if (!res.ok) throw new Error("Repository not found.");
    return res.json();
  },

  async getProfile(username: string): Promise<PublicProfileData> {
    const res = await fetch(`${API_URL}/profiles/${username}`);
    if (!res.ok) throw new Error("Profile not found.");
    return res.json();
  },

  async updateFeatured(username: string, repoNames: string[]): Promise<void> {
    const res = await fetch(`${API_URL}/profiles/${username}/featured`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(repoNames),
    });
    if (!res.ok) throw new Error("Failed to update featured repositories.");
  },

  async refresh(username: string): Promise<void> {
    const res = await fetch(`${API_URL}/profiles/${username}/refresh`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to sync GitHub data.");
  },

  async getRateLimit(): Promise<RateLimitStatus> {
    const res = await fetch(`${API_URL}/system/rate-limit`);
    if (!res.ok) throw new Error("Failed to fetch rate limit status.");
    return res.json();
  },
};
