"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Building2,
  ExternalLink,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Settings,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import { AdminLogoutButton } from "./admin-logout-button";
import { Logo } from "./logo";

const groups = [
  {
    label: "Шуурхай цэс",
    links: [
      { href: "/admin", label: "Хянах самбар", Icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Аналитик", Icon: TrendingUp },
      { href: "/admin/featured-project", label: "Онцлох видео", Icon: Star },
      { href: "/admin/articles", label: "Мэдээ, нийтлэл", Icon: FileText },
      { href: "/admin/enquiries", label: "Үнийн хүсэлтүүд", Icon: FileText },
    ],
  },
  {
    label: "Барилгын удирдлага",
    links: [
      { href: "/admin/houses", label: "Хаусын загвар", Icon: Building2 },
      { href: "/admin/projects", label: "Хийсэн төслүүд", Icon: FolderKanban },
      { href: "/admin/content", label: "Контент удирдлага", Icon: BarChart3 },
    ],
  },
  {
    label: "Систем",
    links: [{ href: "/admin/settings", label: "Тохиргоо", Icon: Settings }],
  },
];

const contentLinks = [
  { href: "/admin/content/technology", label: "Барилгын технологи" },
  { href: "/admin/content", label: "Ерөнхий контент" },
  { href: "/admin/content/process", label: "Үйлдвэрлэлийн явц" },
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

  function isActive(href: string) {
    if (href === "/admin") return pathname === href;
    if (href === "/admin/content") return pathname.startsWith("/admin/content");
    return pathname.startsWith(href);
  }

  return (
    <>
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

        <nav className="admin-navigation" aria-label="Админ үндсэн цэс">
          {groups.map(group => {
            const links = group.links.filter(item => allowed.includes(item.href));
            if (!links.length) return null;
            return (
              <div className="admin-nav-group" key={group.label}>
                <p>{group.label}</p>
                {links.map(({ href, label, Icon }) => {
                  const active = isActive(href);
                  return (
                    <div className="admin-nav-item" key={href}>
                      <Link className={active ? "is-active" : undefined} href={href} onClick={() => setOpen(false)}><Icon size={18} aria-hidden="true" /><span>{label}</span>{active && href === "/admin/content" && <i />}</Link>
                      {href === "/admin/content" && active && (
                        <div className="admin-content-subnav">
                          {contentLinks.map(item => <Link className={pathname === item.href ? "is-current" : undefined} href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="admin-side-footer">
          <Link className="admin-site-link" href="/" onClick={() => setOpen(false)}><ExternalLink size={16} aria-hidden="true" /><span>Сайт руу буцах</span></Link>
          <div className="admin-profile">
            <span className="admin-profile-avatar">NH</span>
            <div><strong>Админ хэрэглэгч</strong><small>NOYON HOUSE CMS</small></div>
            <AdminLogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
