import { AdminSidebar } from "./admin-sidebar";

const allLinks = ["/admin", "/admin/analytics", "/admin/featured-project", "/admin/articles", "/admin/enquiries", "/admin/houses", "/admin/projects", "/admin/content", "/admin/settings"];
const roleLinks: Record<string, string[]> = {
  Admin: allLinks,
  Sales: ["/admin", "/admin/enquiries"],
  "Content Editor": ["/admin", "/admin/analytics", "/admin/featured-project", "/admin/articles", "/admin/houses", "/admin/projects", "/admin/content"],
};

export function AdminShell({ children, role }: { children: React.ReactNode; role: string }) {
  const allowed = roleLinks[role] ?? roleLinks.Admin;

  return <div className="admin-shell"><AdminSidebar allowed={allowed} /><main className="admin-main">{children}</main></div>;
}
