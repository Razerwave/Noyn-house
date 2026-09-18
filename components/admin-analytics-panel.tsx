import { ExternalLink } from "lucide-react";
import type { VercelAnalytics } from "@/lib/vercel-analytics";

export function AdminAnalyticsPanel({ analytics }: { analytics: VercelAnalytics }) {
  return <>
    <div className="admin-top"><div><h1>Аналитик</h1><small>Сүүлийн 30 хоногийн сайтын хандалтын мэдээлэл</small></div><a className="button" href="https://vercel.com/hatnaacs-2750s-projects/noyon_house/analytics" target="_blank" rel="noreferrer">Vercel нээх <ExternalLink size={16} /></a></div>
    <div className="metric-grid analytics-metric-grid"><div className="metric"><span>PAGEVIEWS</span><strong>{analytics.configured ? analytics.pageviews.toLocaleString("mn-MN") : "—"}</strong></div><div className="metric"><span>VISITORS</span><strong>{analytics.configured ? analytics.visitors.toLocaleString("mn-MN") : "—"}</strong></div></div>
    {analytics.error && <div className="admin-alert error">{analytics.error} Vercel Analytics тохиргоо болон token-оо шалгана уу.</div>}
    {!analytics.configured && <div className="admin-alert error">Vercel API metric харахын тулд `VERCEL_ACCESS_TOKEN` тохируулна уу.</div>}
    {analytics.configured && analytics.breakdowns.map(breakdown => <div className="admin-card analytics-breakdown" key={breakdown.label}><h2>{breakdown.label}</h2>{breakdown.items.length ? <table className="admin-table"><thead><tr><th>Нэр</th><th>Pageviews</th><th>Visitors</th></tr></thead><tbody>{breakdown.items.map(item => <tr key={item.name}><td>{item.name}</td><td>{item.pageviews.toLocaleString("mn-MN")}</td><td>{item.visitors.toLocaleString("mn-MN")}</td></tr>)}</tbody></table> : <p className="section-copy">Мэдээлэл одоогоор алга.</p>}</div>)}
  </>;
}
