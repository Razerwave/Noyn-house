import { redirect } from "next/navigation";
import { AdminArticleManager } from "@/components/admin-article-manager";
import { AdminShell } from "@/components/admin-shell";
import { getAdminContext } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function ArticlesAdminPage() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) redirect("/admin/login?next=/admin/articles");
  return <div className="admin-body"><AdminShell role={context.roleName}><AdminArticleManager initialItems={[]} /></AdminShell></div>;
}