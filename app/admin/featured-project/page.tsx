import { redirect } from "next/navigation";
import { AdminFeaturedProjectEditor } from "@/components/admin-featured-project-editor";
import { AdminShell } from "@/components/admin-shell";
import { getAdminContext } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function FeaturedProjectPage() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) redirect("/admin/login?next=/admin/featured-project");
  return <div className="admin-body"><AdminShell role={context.roleName}><AdminFeaturedProjectEditor /></AdminShell></div>;
}