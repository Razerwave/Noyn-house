"use client";

import { FormEvent, useEffect, useState } from "react";

type House = { id?: string; name: string; slug: string; category: string; image: string; area: string; floors: number; bedrooms: number; bathrooms?: number; dimensions?: string; description: string; status?: string };

export function AdminHouseManager({ initialItems }: { initialItems: House[] }) {
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/houses").then(r => r.ok ? r.json() : []).then((saved: House[]) => {
      if (saved.length) setItems([...saved, ...initialItems.filter(seed => !saved.some(item => item.slug === seed.slug))]);
    }).catch(() => undefined);
  }, [initialItems]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/admin/houses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) { setMessage(result.error || "Хадгалж чадсангүй."); return; }
    setItems(current => [result, ...current]); setMessage("Шинэ загвар амжилттай хадгалагдлаа."); setOpen(false); event.currentTarget.reset();
  }

  return <>
    <div className="admin-top"><div><h1>Хаусын загварууд</h1><small>Загвар, үзүүлэлт, зураг, PDF удирдах</small></div><button className="button" onClick={() => { setOpen(!open); setMessage(""); }}>{open ? "Хаах" : "+ Шинэ загвар"}</button></div>
    {open && <form className="admin-card admin-editor" onSubmit={submit}>
      <div className="admin-editor-head"><div><span>ШИНЭ БҮРТГЭЛ</span><h2>Хаусын загвар нэмэх</h2></div><p>Заавал бөглөх талбаруудыг оруулаад нийтлэх төлөвөө сонгоно уу.</p></div>
      <div className="field-grid">
        <div className="field"><label>Загварын нэр *</label><input name="name" required placeholder="Жишээ: ALTAI 140" /></div>
        <div className="field"><label>URL slug *</label><input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="altai-140" /></div>
        <div className="field"><label>Ангилал *</label><input name="category" required placeholder="Нэг давхар хаус" /></div>
        <div className="field"><label>Нийт талбай, м² *</label><input name="totalArea" required type="number" min="1" /></div>
        <div className="field"><label>Давхар *</label><input name="floors" required type="number" min="1" defaultValue="1" /></div>
        <div className="field"><label>Унтлагын өрөө *</label><input name="bedrooms" required type="number" min="0" defaultValue="3" /></div>
        <div className="field"><label>Ариун цэврийн өрөө *</label><input name="bathrooms" required type="number" min="0" defaultValue="2" /></div>
        <div className="field"><label>Барилгын хэмжээ</label><input name="dimensions" placeholder="12 × 10 м" /></div>
        <div className="field full"><label>Ковер зургийн URL *</label><input name="coverImage" required defaultValue="/images/model-nomad.png" /></div>
        <div className="field full"><label>Товч тайлбар *</label><textarea name="description" required minLength={10} rows={4} /></div>
        <div className="field"><label>Төлөв</label><select name="status" defaultValue="draft"><option value="draft">Ноорог</option><option value="published">Нийтлэх</option></select></div>
      </div>
      <div className="admin-form-actions"><button type="button" className="button secondary" onClick={() => setOpen(false)}>Цуцлах</button><button className="button" disabled={busy}>{busy ? "Хадгалж байна…" : "Загвар хадгалах"}</button></div>
    </form>}
    {message && <div className={message.includes("амжилттай") ? "admin-alert success" : "admin-alert error"}>{message}</div>}
    <div className="admin-card"><table className="admin-table"><thead><tr><th>Зураг</th><th>Нэр</th><th>Ангилал</th><th>Талбай</th><th>Төлөв</th></tr></thead><tbody>{items.map(item => <tr key={item.id || item.slug}><td><img src={item.image} alt="" width="70" height="45" className="admin-thumb" /></td><td><strong>{item.name}</strong><small className="admin-slug">/{item.slug}</small></td><td>{item.category}</td><td>{item.area}</td><td><span className={`status ${item.status === "draft" ? "draft" : ""}`}>{item.status === "draft" ? "Ноорог" : "Нийтэлсэн"}</span></td></tr>)}</tbody></table></div>
  </>;
}
