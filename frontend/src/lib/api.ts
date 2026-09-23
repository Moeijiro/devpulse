export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");
/** The profile the demo opens on. */
export const DEFAULT_USER = "Moeijiro";

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
  percentage: number;
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

export type RepoSort = "updated" | "stars" | "name";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers: init?.body ? { "Content-Type": "application/json" } : undefined });
  } catch {
    throw new ApiError("Can't reach the DevPulse API. Is the backend running on port 8000?", 0);
  }
  if (!res.ok) {
    let message = `Request failed (HTTP ${res.status}).`;
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") message = data.detail;
      else if (Array.isArray(data?.detail) && data.detail[0]?.msg) message = res.status === 422 ? "That isn't a valid GitHub username." : String(data.detail[0].msg);
    } catch {
      /* not JSON */
    }
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

const u = (username: string) => encodeURIComponent(username);

export const api = {
  getOverview: (username: string) => request<OverviewMetrics>(`/analytics/${u(username)}/overview`),
  getActivity: (username: string, days = 30) => request<ActivityDay[]>(`/analytics/${u(username)}/activity?days=${days}`),
  getLanguages: (username: string) => request<LanguageStat[]>(`/analytics/${u(username)}/languages`),
  getRepos: (username: string, params: { language?: string; search?: string; sort_by?: RepoSort } = {}) => {
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) query.set(k, v);
    return request<GitHubRepo[]>(`/repos/${u(username)}?${query}`);
  },
  getRepoDetail: (username: string, repo: string) => request<GitHubRepo>(`/repos/${u(username)}/${encodeURIComponent(repo)}`),
  getProfile: (username: string) => request<PublicProfileData>(`/profiles/${u(username)}`),
  updateFeatured: (username: string, names: string[]) => request<{ featured: string[] }>(`/profiles/${u(username)}/featured`, { method: "POST", body: JSON.stringify(names) }),
  refresh: (username: string) => request<{ repos_count: number; events_count: number }>(`/profiles/${u(username)}/refresh`, { method: "POST" }),
  rateLimit: () => request<RateLimitStatus>(`/system/rate-limit`),
};
