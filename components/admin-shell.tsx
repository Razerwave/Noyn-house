import Link from "next/link";import { BarChart3, Building2, FileText, FolderKanban, LayoutDashboard, Settings, ExternalLink } from "lucide-react";import { Logo } from "./logo";import { AdminLogoutButton } from "./admin-logout-button";
import { getAdminContext } from "@/lib/admin-auth";
const nav=[
	{ href: "/admin", label: "Хянах самбар", Icon: LayoutDashboard },
	{ href: "/admin/enquiries", label: "Үнийн хүсэлтүүд", Icon: FileText },
	{ href: "/admin/houses", label: "Хаусын загвар", Icon: Building2 },
	{ href: "/admin/projects", label: "Хийсэн төслүүд", Icon: FolderKanban },
	{ href: "/admin/content", label: "Контент удирдлага", Icon: BarChart3 },
	{ href: "/admin/settings", label: "Тохиргоо", Icon: Settings },
];
const roleLinks: Record<string, string[]> = { Admin: nav.map(item => item.href), Sales: ["/admin", "/admin/enquiries"], "Content Editor": ["/admin", "/admin/houses", "/admin/projects", "/admin/content"] };
export async function AdminShell({children, role}:{children:React.ReactNode; role?: string}){const context = role ? { roleName: role } : await getAdminContext(["Admin", "Sales", "Content Editor"]);const allowed = roleLinks[context?.roleName ?? "Admin"] ?? roleLinks.Admin;return <div className="admin-shell"><aside className="admin-side"><Logo inverse/><nav>{nav.filter(item => allowed.includes(item.href)).map(({href,label,Icon})=><Link href={href} key={href}><Icon size={16} aria-hidden="true" /><span>{label}</span></Link>)}<Link href="/"><ExternalLink size={16} aria-hidden="true" /><span>Сайт руу буцах</span></Link><AdminLogoutButton /></nav></aside><main className="admin-main">{children}</main></div>}
