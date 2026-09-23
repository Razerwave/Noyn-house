import { AdminProjectManager } from "@/components/admin-project-manager";
import { AdminShell } from "@/components/admin-shell";
import { getAdminContext } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectsAdmin() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) redirect("/admin/login?next=/admin/projects");
  return <div className="admin-body"><AdminShell role={context.roleName}><AdminProjectManager initialItems={[]} /></AdminShell></div>;
}
