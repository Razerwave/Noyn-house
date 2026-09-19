import { redirect } from "next/navigation";
import { AdminSiteContentManager } from "@/components/admin-site-content-manager";
import { AdminShell } from "@/components/admin-shell";
import { getAdminContext } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function FaqsAdminPage() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) redirect("/admin/login?next=/admin/faqs");
  return <div className="admin-body"><AdminShell role={context.roleName}><AdminSiteContentManager only="faq" /></AdminShell></div>;
}