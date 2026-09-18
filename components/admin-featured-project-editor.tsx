"use client";

import { FormEvent, useEffect, useState } from "react";
import { CustomSelect } from "./custom-select";
import type { FeaturedProject } from "@/lib/featured-project";

export function AdminFeaturedProjectEditor() {
  const [value, setValue] = useState<FeaturedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/featured-project").then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setValue(result);
    }).catch(error => setMessage(error instanceof Error ? error.message : "Highlight тохиргоог уншиж чадсангүй.")).finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/featured-project", { method: "PUT", body: new FormData(event.currentTarget) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Хадгалж чадсангүй.");
      setValue(result); setMessage("Онцлох төслийн тохиргоо хадгалагдлаа.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Хадгалж чадсангүй."); }
    finally { setBusy(false); }
  }

  if (loading || !value) return <section className="admin-card"><p>{loading ? "Уншиж байна..." : message}</p></section>;
  return <form className="admin-card admin-editor" onSubmit={submit}>
    <div className="admin-editor-head"><div><span>НҮҮР ХУУДАС</span><h2>Онцлох төслийн видео</h2></div><p>Hero хэсгийн дараа харагдах highlight video болон төслийн мэдээллийг удирдана.</p></div>
    <input type="hidden" name="enabled" value={value.enabled ? "true" : "false"} />
    <div className="field-grid">
      <div className="field full"><label><input type="checkbox" checked={value.enabled} onChange={event => setValue({ ...value, enabled: event.target.checked })} /> Хэсгийг идэвхтэй харуулах</label></div>
      <div className="field"><label>Жижиг гарчиг *</label><input name="eyebrow" required value={value.eyebrow} onChange={event => setValue({ ...value, eyebrow: event.target.value })} /></div>
      <div className="field"><label>Үндсэн гарчиг *</label><input name="title" required value={value.title} onChange={event => setValue({ ...value, title: event.target.value })} /></div>
      <div className="field full"><label>Тайлбар *</label><textarea name="description" required minLength={10} rows={3} value={value.description} onChange={event => setValue({ ...value, description: event.target.value })} /></div>
      <div className="field full"><label>Давуу талууд * <small className="field-help">Мөр бүрт нэг давуу тал</small></label><textarea name="benefits" required rows={4} value={value.benefits.join("\n")} onChange={event => setValue({ ...value, benefits: event.target.value.split("\n") })} /></div>
      <div className="field full"><label>Видео файл</label><input name="videoFile" type="file" accept="video/mp4,video/webm,video/quicktime" /><small className="field-help">MP4, WebM, MOV · дээд хэмжээ 100 MB</small></div>
      <div className="field"><label>Видео URL</label><input name="videoUrl" type="url" value={value.videoUrl} onChange={event => setValue({ ...value, videoUrl: event.target.value })} placeholder="https://.../highlight.mp4" /></div>
      <div className="field"><label>Mobile video URL</label><input name="mobileVideoUrl" type="url" value={value.mobileVideoUrl} onChange={event => setValue({ ...value, mobileVideoUrl: event.target.value })} /></div>
      <div className="field full"><label>Poster зураг</label><input name="posterFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /><input name="posterUrl" type="url" value={value.posterUrl} onChange={event => setValue({ ...value, posterUrl: event.target.value })} placeholder="https://.../poster.jpg" /><small className="field-help">Poster URL эсвэл файл ашиглаж болно.</small></div>
      <div className="field"><label>Үндсэн товчны текст *</label><input name="primaryLabel" required value={value.primaryLabel} onChange={event => setValue({ ...value, primaryLabel: event.target.value })} /></div>
      <div className="field"><label>Үндсэн товчны холбоос *</label><input name="primaryHref" required value={value.primaryHref} onChange={event => setValue({ ...value, primaryHref: event.target.value })} /></div>
      <div className="field"><label>Хоёрдогч товчны текст *</label><input name="secondaryLabel" required value={value.secondaryLabel} onChange={event => setValue({ ...value, secondaryLabel: event.target.value })} /></div>
      <div className="field"><label>Хоёрдогч товчны холбоос *</label><input name="secondaryHref" required value={value.secondaryHref} onChange={event => setValue({ ...value, secondaryHref: event.target.value })} /></div>
      <div className="field"><label>Холбогдох төсөл</label><input name="relatedProject" value={value.relatedProject} onChange={event => setValue({ ...value, relatedProject: event.target.value })} placeholder="project-slug" /></div>
      <div className="field"><label>Эрэмбэ</label><input name="displayOrder" type="number" min="0" value={value.displayOrder} onChange={event => setValue({ ...value, displayOrder: Number(event.target.value) })} /></div>
      <div className="field"><label>Харуулах эхлэх огноо</label><input name="startsAt" type="datetime-local" value={value.startsAt} onChange={event => setValue({ ...value, startsAt: event.target.value })} /></div>
      <div className="field"><label>Харуулах дуусах огноо</label><input name="endsAt" type="datetime-local" value={value.endsAt} onChange={event => setValue({ ...value, endsAt: event.target.value })} /></div>
      <div className="field"><label>Төлөв</label><CustomSelect name="status" value={value.status} onChange={event => setValue({ ...value, status: event.target.value as FeaturedProject["status"] })}><option value="draft">Ноорог</option><option value="published">Нийтлэх</option></CustomSelect></div>
    </div>
    {message && <div className={message.includes("хадгалагдлаа") ? "admin-alert success" : "admin-alert error"}>{message}</div>}
    <div className="admin-form-actions"><button className="button" disabled={busy}>{busy ? "Хадгалж байна..." : "Хадгалах"}</button></div>
  </form>;
}
