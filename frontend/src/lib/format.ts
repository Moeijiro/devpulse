export const nf = new Intl.NumberFormat("en-GB");

export function relative(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`);
  const minutes = Math.round((Date.now() - d.getTime()) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  return `${Math.round(months / 12)} y ago`;
}

export function joined(value: string | null): string {
  return value ? new Date(value).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "—";
}

export function shortDate(value: string): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}
