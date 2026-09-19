import { redirect } from "next/navigation";
import { AdminTechnologyEditor } from "@/components/admin-technology-editor";
import { AdminShell } from "@/components/admin-shell";
import { getAdminContext } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function TechnologyAdminPage() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) redirect("/admin/login?next=/admin/content/technology");
  return <div className="admin-body"><AdminShell role={context.roleName}><AdminTechnologyEditor /></AdminShell></div>;
}