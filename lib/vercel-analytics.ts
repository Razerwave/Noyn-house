import "server-only";

export type VercelAnalytics = {
  pageviews: number;
  visitors: number;
  breakdowns: { label: string; items: { name: string; pageviews: number; visitors: number }[] }[];
  since: string;
  until: string;
  configured: boolean;
  error?: string;
};

type VercelResponse = { data?: { pageviews?: number; visitors?: number } };
type VercelAggregateResponse = { data?: { name?: string; requestPath?: string; country?: string; deviceType?: string; referrerHostname?: string; pageviews?: number; visitors?: number }[] };

export async function getVercelAnalytics(): Promise<VercelAnalytics> {
  const token = process.env.VERCEL_ACCESS_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID || "noyon_house";
  const teamId = process.env.VERCEL_TEAM_ID;
  const teamSlug = process.env.VERCEL_TEAM_SLUG || "hatnaacs-2750s-projects";
  const until = new Date();
  const since = new Date(until);
  since.setDate(since.getDate() - 30);
  const range = { since: since.toISOString(), until: until.toISOString() };

  if (!token) return { ...range, pageviews: 0, visitors: 0, breakdowns: [], configured: false };

  const params = new URLSearchParams({ projectId, since: range.since, until: range.until });
  if (teamId) params.set("teamId", teamId);
  else if (teamSlug) params.set("slug", teamSlug);
  try {
    const response = await fetch(`https://api.vercel.com/v1/query/web-analytics/visits/count?${params}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      const detail = response.status === 404 ? "Project ID эсвэл Team ID/slug буруу байна." : `Vercel Analytics API ${response.status}`;
      return { ...range, pageviews: 0, visitors: 0, breakdowns: [], configured: true, error: detail };
    }
    const result = await response.json() as VercelResponse;
    const dimensions = [["Хуудас", "requestPath"], ["Улс", "country"], ["Төхөөрөмж", "deviceType"], ["Эх сурвалж", "referrerHostname"]] as const;
    const breakdowns = await Promise.all(dimensions.map(async ([label, dimension]) => {
      const aggregateParams = new URLSearchParams({ projectId, since: range.since, until: range.until, limit: "10" });
      aggregateParams.append("by", dimension);
      if (teamId) aggregateParams.set("teamId", teamId); else if (teamSlug) aggregateParams.set("slug", teamSlug);
      const aggregateResponse = await fetch(`https://api.vercel.com/v1/query/web-analytics/visits/aggregate?${aggregateParams}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, next: { revalidate: 300 } });
      if (!aggregateResponse.ok) return { label, items: [] };
      const aggregate = await aggregateResponse.json() as VercelAggregateResponse;
      return { label, items: (aggregate.data ?? []).map(item => ({ name: item[dimension] ?? item.name ?? "Тодорхойгүй", pageviews: item.pageviews ?? 0, visitors: item.visitors ?? 0 })) };
    }));
    return { ...range, pageviews: result.data?.pageviews ?? 0, visitors: result.data?.visitors ?? 0, breakdowns, configured: true };
  } catch {
    return { ...range, pageviews: 0, visitors: 0, breakdowns: [], configured: true, error: "Vercel Analytics холболт амжилтгүй." };
  }
}
