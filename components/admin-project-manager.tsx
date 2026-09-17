"use client";

import { FormEvent, useEffect, useState } from "react";

type Project = { id?: string; title: string; slug: string; location: string; area: string; year: string; duration?: string; image?: string; overview?: string; status?: string };

export function AdminProjectManager({ initialItems }: { initialItems: Project[] }) {
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/projects").then(r => r.ok ? r.json() : []).then((saved: Project[]) => {
      if (saved.length) setItems([...saved, ...initialItems.filter(seed => !saved.some(item => item.slug === seed.slug))]);
    }).catch(() => undefined);
  }, [initialItems]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/admin/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) { setMessage(result.error || "Хадгалж чадсангүй."); return; }
    setItems(current => [result, ...current]); setMessage("Шинэ төсөл амжилттай хадгалагдлаа."); setOpen(false); event.currentTarget.reset();
  }

  return <>
    <div className="admin-top"><div><h1>Хийсэн төслүүд</h1><small>Төслийн явц, зураг, мэдээлэл удирдах</small></div><button className="button" onClick={() => { setOpen(!open); setMessage(""); }}>{open ? "Хаах" : "+ Шинэ төсөл"}</button></div>
    {open && <form className="admin-card admin-editor" onSubmit={submit}>
      <div className="admin-editor-head"><div><span>ШИНЭ БҮРТГЭЛ</span><h2>Хийсэн төсөл нэмэх</h2></div><p>Харилцагчийн нарийн хаяг болон хувийн мэдээллийг оруулахгүй.</p></div>
      <div className="field-grid">
        <div className="field"><label>Төслийн нэр *</label><input name="title" required placeholder="Тэрэлжийн гэр бүлийн хаус" /></div>
        <div className="field"><label>URL slug *</label><input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="terelj-family-house" /></div>
        <div className="field"><label>Ерөнхий байршил *</label><input name="location" required placeholder="Төв аймаг" /></div>
        <div className="field"><label>Нийт талбай, м² *</label><input name="totalArea" required type="number" min="1" /></div>
        <div className="field"><label>Дууссан он *</label><input name="year" required type="number" min="1900" max="2200" defaultValue={new Date().getFullYear()} /></div>
        <div className="field"><label>Барилгын хугацаа</label><input name="duration" placeholder="Жишээ: 5 сар" /></div>
        <div className="field full"><label>Ковер зургийн URL *</label><input name="image" required defaultValue="/images/hero-house.png" /></div>
        <div className="field full"><label>Төслийн тойм *</label><textarea name="overview" required minLength={10} rows={4} /></div>
        <div className="field"><label>Төлөв</label><select name="status" defaultValue="draft"><option value="draft">Ноорог</option><option value="published">Нийтлэх</option></select></div>
      </div>
      <div className="admin-form-actions"><button type="button" className="button secondary" onClick={() => setOpen(false)}>Цуцлах</button><button className="button" disabled={busy}>{busy ? "Хадгалж байна…" : "Төсөл хадгалах"}</button></div>
    </form>}
    {message && <div className={message.includes("амжилттай") ? "admin-alert success" : "admin-alert error"}>{message}</div>}
    <div className="admin-card"><table className="admin-table"><thead><tr><th>Төслийн нэр</th><th>Байршил</th><th>Талбай</th><th>Он</th><th>Төлөв</th></tr></thead><tbody>{items.map(item => <tr key={item.id || item.slug}><td><strong>{item.title}</strong><small className="admin-slug">/{item.slug}</small></td><td>{item.location}</td><td>{item.area}</td><td>{item.year}</td><td><span className={`status ${item.status === "draft" ? "draft" : ""}`}>{item.status === "draft" ? "Ноорог" : "Нийтэлсэн"}</span></td></tr>)}</tbody></table></div>
  </>;
}
