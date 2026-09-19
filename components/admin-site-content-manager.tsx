"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { CustomSelect } from "./custom-select";
import { toast } from "sonner";

type Service = { id: string; title: string; description: string; status: "draft" | "published"; displayOrder: number };
type Faq = { id: string; question: string; answer: string; status: "draft" | "published"; displayOrder: number };
type Editor = { entity: "service"; item?: Service } | { entity: "faq"; item?: Faq };

export function AdminSiteContentManager({ only }: { only?: "service" | "faq" } = {}) {
  const [services, setServices] = useState<Service[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/site-content").then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setServices(result.services ?? []); setFaqs(result.faqs ?? []);
    }).catch(error => setMessage(error instanceof Error ? error.message : "Контент уншиж чадсангүй."));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    setBusy(true); setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const item = editor.item;
    const body = { ...values, entity: editor.entity, id: item?.id, displayOrder: Number(values.displayOrder) };
    try {
      const response = await fetch("/api/admin/site-content", { method: item ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Хадгалж чадсангүй.");
      if (editor.entity === "service") setServices(current => (item ? current.map(entry => entry.id === result.id ? result : entry) : [...current, result]).sort((a, b) => a.displayOrder - b.displayOrder));
      else setFaqs(current => (item ? current.map(entry => entry.id === result.id ? result : entry) : [...current, result]).sort((a, b) => a.displayOrder - b.displayOrder));
      setMessage("Контент амжилттай хадгалагдлаа."); toast.success("Контент амжилттай хадгалагдлаа."); setEditor(null);
    } catch (error) { const message = error instanceof Error ? error.message : "Хадгалж чадсангүй."; setMessage(message); toast.error(message); }
    finally { setBusy(false); }
  }

  async function remove(entity: "service" | "faq", id: string, label: string) {
    if (!window.confirm(`“${label}” мэдээллийг устгах уу?`)) return;
    const response = await fetch(`/api/admin/site-content?entity=${entity}&id=${id}`, { method: "DELETE" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { const message = result.error || "Устгаж чадсангүй."; setMessage(message); toast.error(message); return; }
    if (entity === "service") setServices(current => current.filter(item => item.id !== id));
    else setFaqs(current => current.filter(item => item.id !== id));
    setMessage("Контент амжилттай устгагдлаа."); toast.success("Контент амжилттай устгагдлаа.");
  }

  const editingService = editor?.entity === "service" ? editor.item : undefined;
  const editingFaq = editor?.entity === "faq" ? editor.item : undefined;

  return <section className="admin-content-manager">
    {editor && (!only || editor.entity === only) && <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-label={editor.entity === "service" ? "Үйлчилгээ засах" : "Түгээмэл асуулт засах"} style={{ position: "fixed", inset: 0, zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(7, 15, 19, 0.58)" }}><form className="admin-card admin-editor admin-modal" onSubmit={submit} style={{ width: "min(680px, 100%)", maxHeight: "calc(100dvh - 48px)", overflow: "auto", margin: 0 }}>
      <div className="admin-editor-head"><div><span>{editor.item ? "КОНТЕНТ ЗАСАХ" : "ШИНЭ КОНТЕНТ"}</span><h2>{editor.entity === "service" ? "Үйлчилгээ" : "Түгээмэл асуулт"}</h2></div><button type="button" className="admin-modal-close" onClick={() => setEditor(null)} aria-label="Modal хаах" title="Хаах"><X size={18} /></button></div>
      <div className="field-grid">
        {editor.entity === "service" ? <>
          <div className="field full"><label>Үйлчилгээний нэр *</label><input name="title" required defaultValue={editingService?.title} /></div>
          <div className="field full"><label>Тайлбар *</label><textarea name="description" required minLength={5} rows={4} defaultValue={editingService?.description} /></div>
        </> : <>
          <div className="field full"><label>Асуулт *</label><input name="question" required defaultValue={editingFaq?.question} /></div>
          <div className="field full"><label>Хариулт *</label><textarea name="answer" required minLength={5} rows={5} defaultValue={editingFaq?.answer} /></div>
        </>}
        <div className="field"><label>Дараалал</label><input name="displayOrder" type="number" min="0" defaultValue={editingService?.displayOrder ?? editingFaq?.displayOrder ?? (editor.entity === "service" ? services.length : faqs.length)} /></div>
        <div className="field"><label>Төлөв</label><CustomSelect name="status" defaultValue={editingService?.status ?? editingFaq?.status ?? "published"}><option value="draft">Ноорог</option><option value="published">Нийтлэх</option></CustomSelect></div>
      </div>
      <div className="admin-form-actions"><button type="button" className="button secondary" onClick={() => setEditor(null)}>Цуцлах</button><button className="button" disabled={busy}>{busy ? "Хадгалж байна…" : "Хадгалах"}</button></div>
    </form></div>}


    {(!only || only === "service") && <><div className="admin-top admin-content-head"><div><h1>Үйлчилгээ</h1><small>Үндсэн вебийн үйлчилгээний жагсаалт</small></div><button className="button" onClick={() => setEditor({ entity: "service" })}>+ Үйлчилгээ</button></div>
    <div className="admin-card"><table className="admin-table"><thead><tr><th>#</th><th>Нэр</th><th>Тайлбар</th><th>Төлөв</th><th></th></tr></thead><tbody>{services.map(item => <tr key={item.id}><td>{item.displayOrder + 1}</td><td><strong>{item.title}</strong></td><td>{item.description}</td><td><span className={`status ${item.status === "draft" ? "draft" : ""}`}>{item.status === "draft" ? "Ноорог" : "Нийтэлсэн"}</span></td><td className="admin-actions"><button className="admin-action" onClick={() => setEditor({ entity: "service", item })}>Засах</button><button className="admin-action danger" onClick={() => remove("service", item.id, item.title)}>Устгах</button></td></tr>)}</tbody></table></div></>}

    {(!only || only === "faq") && <><div className="admin-top admin-content-head"><div><h1>Түгээмэл асуулт</h1><small>Нүүр болон FAQ хуудсанд харагдана</small></div><button className="button" onClick={() => setEditor({ entity: "faq" })}>+ Асуулт</button></div>
    <div className="admin-card"><table className="admin-table"><thead><tr><th>#</th><th>Асуулт</th><th>Хариулт</th><th>Төлөв</th><th></th></tr></thead><tbody>{faqs.map(item => <tr key={item.id}><td>{item.displayOrder + 1}</td><td><strong>{item.question}</strong></td><td>{item.answer}</td><td><span className={`status ${item.status === "draft" ? "draft" : ""}`}>{item.status === "draft" ? "Ноорог" : "Нийтэлсэн"}</span></td><td className="admin-actions"><button className="admin-action" onClick={() => setEditor({ entity: "faq", item })}>Засах</button><button className="admin-action danger" onClick={() => remove("faq", item.id, item.question)}>Устгах</button></td></tr>)}</tbody></table></div></>}
  </section>;
}
