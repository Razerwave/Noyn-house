"use client";

import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";

const links = [
  ["/houses", "Хаусын загвар"], ["/projects", "Төслүүд"], ["/technology", "Технологи"],
  ["/services", "Үйлчилгээ"], ["/process", "Ажлын явц"], ["/about", "Бидний тухай"],
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Logo />
        <nav className={open ? "nav-open" : ""}>
          {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link className="mobile-only" href="/contact">Холбоо барих</Link>
          <Link className="mobile-only" href="/admin/content">Админ панель</Link>
        </nav>
        <Link className="header-cta" href="/quote"><Phone size={16} /> Үнийн санал авах</Link>
        <Link className="header-admin" href="/admin/content">Админ</Link>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Цэс">{open ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}
