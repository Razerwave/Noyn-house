import Link from "next/link";import { BarChart3, Building2, FileText, FolderKanban, LayoutDashboard, Settings, ExternalLink } from "lucide-react";import { Logo } from "./logo";import { AdminLogoutButton } from "./admin-logout-button";
const nav=[
	{ href: "/admin", label: "Хянах самбар", Icon: LayoutDashboard },
	{ href: "/admin/enquiries", label: "Үнийн хүсэлтүүд", Icon: FileText },
	{ href: "/admin/houses", label: "Хаусын загвар", Icon: Building2 },
	{ href: "/admin/projects", label: "Хийсэн төслүүд", Icon: FolderKanban },
	{ href: "/admin/content", label: "Контент удирдлага", Icon: BarChart3 },
	{ href: "/admin/settings", label: "Тохиргоо", Icon: Settings },
];
export function AdminShell({children}:{children:React.ReactNode}){return <div className="admin-shell"><aside className="admin-side"><Logo inverse/><nav>{nav.map(({href,label,Icon})=><Link href={href} key={href}><Icon size={16} aria-hidden="true" /><span>{label}</span></Link>)}<Link href="/"><ExternalLink size={16} aria-hidden="true" /><span>Сайт руу буцах</span></Link><AdminLogoutButton /></nav></aside><main className="admin-main">{children}</main></div>}
