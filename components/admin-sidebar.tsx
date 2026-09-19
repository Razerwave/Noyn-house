"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Building2, ExternalLink, FileText, FolderKanban, LayoutDashboard, Menu, Settings, Star, TrendingUp, X } from "lucide-react";
import { AdminLogoutButton } from "./admin-logout-button";
import { Logo } from "./logo";

const nav = [
  { href: "/admin", label: "Хянах самбар", Icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Аналитик", Icon: TrendingUp },
  { href: "/admin/featured-project", label: "Онцлох видео", Icon: Star },
  { href: "/admin/articles", label: "Мэдээ, нийтлэл", Icon: FileText },
  { href: "/admin/enquiries", label: "Үнийн хүсэлтүүд", Icon: FileText },
  { href: "/admin/houses", label: "Хаусын загвар", Icon: Building2 },
  { href: "/admin/projects", label: "Хийсэн төслүүд", Icon: FolderKanban },
  { href: "/admin/content", label: "Контент удирдлага", Icon: BarChart3 },
  { href: "/admin/settings", label: "Тохиргоо", Icon: Settings },
];

export function AdminSidebar({ allowed }: { allowed: string[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  return <>
    <header className="admin-mobile-bar">
      <Logo inverse />
      <button className="admin-menu-toggle" type="button" aria-label="Админ цэс нээх" aria-expanded={open} aria-controls="admin-sidebar" onClick={() => setOpen(true)}><Menu size={22} /></button>
    </header>

    {open && <button className="admin-menu-overlay" type="button" aria-label="Админ цэс хаах" onClick={() => setOpen(false)} />}

    <aside className={`admin-side ${open ? "is-open" : ""}`} id="admin-sidebar">
      <div className="admin-side-head">
        <Logo inverse />
        <button className="admin-menu-close" type="button" aria-label="Админ цэс хаах" onClick={() => setOpen(false)}><X size={22} /></button>
      </div>
      <nav>
        {nav.filter(item => allowed.includes(item.href)).map(({ href, label, Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return <Link className={active ? "is-active" : undefined} href={href} key={href} onClick={() => setOpen(false)}><Icon size={16} aria-hidden="true" /><span>{label}</span></Link>;
        })}
        <Link href="/" onClick={() => setOpen(false)}><ExternalLink size={16} aria-hidden="true" /><span>Сайт руу буцах</span></Link>
        <AdminLogoutButton />
      </nav>
    </aside>
  </>;
}
