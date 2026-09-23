import { AdminProcessEditor } from "@/components/admin-process-editor";
import { AdminShell } from "@/components/admin-shell";
import { getAdminContext } from "@/lib/admin-auth";
import { defaultProcessContent } from "@/lib/process-content";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProcessContentAdmin() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) redirect("/admin/login?next=/admin/content/process");

  return <div className="admin-body"><AdminShell role={context.roleName}><AdminProcessEditor initialContent={defaultProcessContent} /></AdminShell></div>;
}
