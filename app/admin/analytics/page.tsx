import { redirect } from "next/navigation";
import { AdminAnalyticsPanel } from "@/components/admin-analytics-panel";
import { AdminShell } from "@/components/admin-shell";
import { getAdminContext } from "@/lib/admin-auth";
import { getVercelAnalytics } from "@/lib/vercel-analytics";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) redirect("/admin/login?next=/admin/analytics");
  const analytics = await getVercelAnalytics();
  return <div className="admin-body"><AdminShell role={context.roleName}><AdminAnalyticsPanel analytics={analytics} /></AdminShell></div>;
}
