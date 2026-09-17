"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type Project = { id?: string; title: string; slug: string; location: string; area: string; year: string; duration?: string; image?: string; images?: string[]; overview?: string; status?: string };

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "i",
  к: "k", л: "l", м: "m", н: "n", о: "o", ө: "u", п: "p", р: "r", с: "s", т: "t", у: "u",
  ү: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "",
  э: "e", ю: "yu", я: "ya",
};

function toSlug(value: string) {
  return value.toLowerCase().split("").map(character => CYRILLIC_TO_LATIN[character] ?? character).join("")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

export function AdminProjectManager({ initialItems }: { initialItems: Project[] }) {
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    fetch("/api/admin/projects").then(r => r.ok ? r.json() : []).then((saved: Project[]) => {
      if (saved.length) setItems([...saved, ...initialItems.filter(seed => !saved.some(item => item.slug === seed.slug))]);
    }).catch(() => undefined);
  }, [initialItems]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/projects", { method: editing ? "PATCH" : "POST", body: new FormData(form) });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error || "Хадгалж чадсангүй."); return; }
      setItems(current => editing ? current.map(item => item.id === result.id ? result : item) : [result, ...current]);
      setMessage(editing ? "Төслийн мэдээлэл амжилттай шинэчлэгдлээ." : "Шинэ төсөл болон зургууд амжилттай хадгалагдлаа.");
      setOpen(false); form.reset(); clearPreviews();
      setEditing(null); setSlug(""); setSlugTouched(false);
    } catch {
      setMessage("Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  }

  function replacePreview(current: string, file?: File) {
    if (current.startsWith("blob:")) URL.revokeObjectURL(current);
    return file ? URL.createObjectURL(file) : "";
  }

  function onCoverChange(event: ChangeEvent<HTMLInputElement>) {
    setCoverPreview(current => replacePreview(current, event.target.files?.[0]));
  }

  function onGalleryChange(event: ChangeEvent<HTMLInputElement>) {
    setGalleryPreviews(current => {
      current.filter(url => url.startsWith("blob:")).forEach(url => URL.revokeObjectURL(url));
      return Array.from(event.target.files ?? []).map(file => URL.createObjectURL(file));
    });
  }

  function clearPreviews() {
    if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    galleryPreviews.filter(url => url.startsWith("blob:")).forEach(url => URL.revokeObjectURL(url));
    setCoverPreview(""); setGalleryPreviews([]);
  }

  function closeEditor() {
    setOpen(false); setMessage(""); clearPreviews(); setEditing(null); setSlug(""); setSlugTouched(false);
  }

  function startCreate() {
    clearPreviews(); setEditing(null); setSlug(""); setSlugTouched(false); setMessage(""); setOpen(true);
  }

  function startEdit(project: Project) {
    clearPreviews(); setEditing(project); setSlug(project.slug); setSlugTouched(true); setMessage("");
    setCoverPreview(project.image ?? ""); setGalleryPreviews(project.images ?? []); setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return <>
    <div className="admin-top"><div><h1>Хийсэн төслүүд</h1><small>Төслийн явц, зураг, мэдээлэл удирдах</small></div><button className="button" onClick={() => open ? closeEditor() : startCreate()}>{open ? "Хаах" : "+ Шинэ төсөл"}</button></div>
    {open && <form key={editing?.id ?? "new"} className="admin-card admin-editor" onSubmit={submit}>
      {editing?.id && <input type="hidden" name="id" value={editing.id} />}
      <div className="admin-editor-head"><div><span>{editing ? "ТӨСӨЛ ЗАСАХ" : "ШИНЭ БҮРТГЭЛ"}</span><h2>{editing ? editing.title : "Хийсэн төсөл нэмэх"}</h2></div><p>Харилцагчийн нарийн хаяг болон хувийн мэдээллийг оруулахгүй.</p></div>
      <div className="field-grid">
        <div className="field"><label>Төслийн нэр *</label><input name="title" required placeholder="Тэрэлжийн гэр бүлийн хаус" defaultValue={editing?.title} onChange={event => { if (!slugTouched) setSlug(toSlug(event.target.value)); }} /></div>
        <div className="field"><label>URL slug *</label><input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="terelj-family-house" value={slug} onChange={event => { setSlug(event.target.value.toLowerCase()); setSlugTouched(true); }} /><small className="field-help">Нэрээс автоматаар үүснэ. Шаардлагатай бол гараар засаж болно.</small></div>
        <div className="field"><label>Ерөнхий байршил *</label><input name="location" required placeholder="Төв аймаг" defaultValue={editing?.location} /></div>
        <div className="field"><label>Нийт талбай, м² *</label><input name="totalArea" required type="number" min="1" defaultValue={editing ? Number.parseFloat(editing.area) : undefined} /></div>
        <div className="field"><label>Дууссан он *</label><input name="year" required type="number" min="1900" max="2200" defaultValue={editing?.year ?? new Date().getFullYear()} /></div>
        <div className="field"><label>Барилгын хугацаа</label><input name="duration" placeholder="Жишээ: 5 сар" defaultValue={editing?.duration} /></div>
        <div className="field full">
          <label>Ковер зураг {editing ? "" : "*"}</label>
          <input name="coverImage" required={!editing} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onCoverChange} />
          <small className="field-help">JPG, PNG, WebP эсвэл AVIF · дээд хэмжээ 10 MB{editing ? " · солихгүй бол хоосон үлдээнэ" : ""}</small>
          {coverPreview && <div className="admin-cover-preview"><img src={coverPreview} alt="Ковер зургийн урьдчилсан харагдац" /></div>}
        </div>
        <div className="field full">
          <label>Gallery зургууд</label>
          <input name="galleryImages" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={onGalleryChange} />
          <small className="field-help">Нэг дор 12 хүртэл зураг сонгож болно.{editing ? " Шинэ зураг сонговол одоогийн gallery-г солино." : ""}</small>
          {galleryPreviews.length > 0 && <div className="admin-gallery-preview">{galleryPreviews.map((url, index) => <img key={url} src={url} alt={`Gallery зураг ${index + 1}`} />)}</div>}
        </div>
        <div className="field full"><label>Төслийн тойм *</label><textarea name="overview" required minLength={10} rows={4} defaultValue={editing?.overview} /></div>
        <div className="field"><label>Төлөв</label><select name="status" defaultValue={editing?.status ?? "draft"}><option value="draft">Ноорог</option><option value="published">Нийтлэх</option></select></div>
      </div>
      <div className="admin-form-actions"><button type="button" className="button secondary" onClick={closeEditor}>Цуцлах</button><button className="button" disabled={busy}>{busy ? "Хадгалж байна…" : editing ? "Өөрчлөлт хадгалах" : "Төсөл хадгалах"}</button></div>
    </form>}
    {message && <div className={message.includes("амжилттай") ? "admin-alert success" : "admin-alert error"}>{message}</div>}
    <div className="admin-card"><table className="admin-table"><thead><tr><th>Зураг</th><th>Төслийн нэр</th><th>Байршил</th><th>Талбай</th><th>Он</th><th>Төлөв</th><th></th></tr></thead><tbody>{items.map(item => <tr key={item.id || item.slug}><td>{item.image ? <img src={item.image} alt="" width="70" height="45" className="admin-thumb" /> : "—"}</td><td><strong>{item.title}</strong><small className="admin-slug">/{item.slug}</small></td><td>{item.location}</td><td>{item.area}</td><td>{item.year}</td><td><span className={`status ${item.status === "draft" ? "draft" : ""}`}>{item.status === "draft" ? "Ноорог" : "Нийтэлсэн"}</span></td><td>{item.id && <button type="button" className="admin-action" onClick={() => startEdit(item)}>Засах</button>}</td></tr>)}</tbody></table></div>
  </>;
}
