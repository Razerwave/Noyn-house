import { getAdminContext } from "@/lib/admin-auth";
import { AdminSidebar } from "./admin-sidebar";

const allLinks = ["/admin", "/admin/enquiries", "/admin/houses", "/admin/projects", "/admin/content", "/admin/settings"];
const roleLinks: Record<string, string[]> = {
  Admin: allLinks,
  Sales: ["/admin", "/admin/enquiries"],
  "Content Editor": ["/admin", "/admin/houses", "/admin/projects", "/admin/content"],
};

export async function AdminShell({ children, role }: { children: React.ReactNode; role?: string }) {
  const context = role ? { roleName: role } : await getAdminContext(["Admin", "Sales", "Content Editor"]);
  const allowed = roleLinks[context?.roleName ?? "Admin"] ?? roleLinks.Admin;

  return <div className="admin-shell"><AdminSidebar allowed={allowed} /><main className="admin-main">{children}</main></div>;
}
