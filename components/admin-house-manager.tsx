"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { AdminImageTooltip } from "./admin-image-tooltip";
import { CustomSelect } from "./custom-select";
import { toast } from "sonner";

type House = { id?: string; name: string; slug: string; category: string; image: string; images?: string[]; area: string; floors: number; bedrooms: number; bathrooms?: number; dimensions?: string; description: string; status?: string };

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

export function AdminHouseManager({ initialItems }: { initialItems: House[] }) {
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<House | null>(null);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [coverPreview, setCoverPreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/houses").then(response => response.ok ? response.json() : []).then((saved: House[]) => {
      if (saved.length) setItems([...saved, ...initialItems.filter(seed => !saved.some(item => item.slug === seed.slug))]);
    }).catch(() => undefined);
  }, [initialItems]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/houses", { method: editing?.id ? "PATCH" : "POST", body: new FormData(form) });
      const result = await response.json();
      if (!response.ok) { const message = result.error || "Хадгалж чадсангүй."; setMessage(message); toast.error(message); return; }
      setItems(current => editing ? current.map(item => item.id ? (item.id === result.id ? result : item) : (item.slug === editing.slug ? result : item)) : [result, ...current]);
      const message = editing ? "Хаусын загвар амжилттай шинэчлэгдлээ." : "Шинэ загвар болон зургууд амжилттай хадгалагдлаа."; setMessage(message); toast.success(message);
      setOpen(false); form.reset(); clearPreviews(); setEditing(null); setSlug(""); setSlugTouched(false);
    } catch {
      setMessage("Сүлжээний алдаа гарлаа. Дахин оролдоно уу."); toast.error("Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  }

  function onCoverChange(event: ChangeEvent<HTMLInputElement>) {
    setCoverPreview(current => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      const file = event.target.files?.[0];
      return file ? URL.createObjectURL(file) : "";
    });
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

  function startEdit(house: House) {
    clearPreviews(); setEditing(house); setSlug(house.slug); setSlugTouched(true); setMessage("");
    setCoverPreview(house.image ?? ""); setGalleryPreviews(house.images ?? []); setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(house: House) {
    if (!house.id || !window.confirm(`“${house.name}” загварыг устгах уу?`)) return;
    setMessage("");
    const response = await fetch(`/api/admin/houses?id=${house.id}`, { method: "DELETE" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { const message = result.error || "Загварыг устгаж чадсангүй."; setMessage(message); toast.error(message); return; }
    setItems(current => current.filter(item => item.id !== house.id));
    setMessage("Хаусын загвар амжилттай устгагдлаа."); toast.success("Хаусын загвар амжилттай устгагдлаа.");
  }

  return <>
    <div className="admin-top"><div><h1>Хаусын загварууд</h1><small>Загвар, үзүүлэлт, зураг, PDF удирдах</small></div><button className="button" onClick={() => open ? closeEditor() : startCreate()}>{open ? "Хаах" : "+ Шинэ загвар"}</button></div>
    {open && <form key={editing?.id ?? editing?.slug ?? "new"} className="admin-card admin-editor" onSubmit={submit}>
      {editing?.id && <input type="hidden" name="id" value={editing.id} />}
      {editing?.image && <input type="hidden" name="existingCoverImage" value={editing.image} />}
      <div className="admin-editor-head"><div><span>{editing ? "ЗАГВАР ЗАСАХ" : "ШИНЭ БҮРТГЭЛ"}</span><h2>{editing ? editing.name : "Хаусын загвар нэмэх"}</h2></div><p>Заавал бөглөх талбаруудыг оруулаад нийтлэх төлөвөө сонгоно уу.</p></div>
      <div className="field-grid">
        <div className="field"><label>Загварын нэр *</label><input name="name" required placeholder="Жишээ: ALTAI 140" defaultValue={editing?.name} onChange={event => { if (!slugTouched) setSlug(toSlug(event.target.value)); }} /></div>
        <div className="field"><label>URL slug *</label><input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="altai-140" value={slug} onChange={event => { setSlug(event.target.value.toLowerCase()); setSlugTouched(true); }} /><small className="field-help">Нэрээс автоматаар үүснэ. Шаардлагатай бол гараар засаж болно.</small></div>
        <div className="field"><label>Ангилал *</label><input name="category" required placeholder="Нэг давхар хаус" defaultValue={editing?.category} /></div>
        <div className="field"><label>Нийт талбай, м² *</label><input name="totalArea" required type="number" min="1" defaultValue={editing ? Number.parseFloat(editing.area) : undefined} /></div>
        <div className="field"><label>Давхар *</label><input name="floors" required type="number" min="1" defaultValue={editing?.floors ?? 1} /></div>
        <div className="field"><label>Унтлагын өрөө *</label><input name="bedrooms" required type="number" min="0" defaultValue={editing?.bedrooms ?? 3} /></div>
        <div className="field"><label>Ариун цэврийн өрөө *</label><input name="bathrooms" required type="number" min="0" defaultValue={editing?.bathrooms ?? 2} /></div>
        <div className="field"><label>Барилгын хэмжээ</label><input name="dimensions" placeholder="12 × 10 м" defaultValue={editing?.dimensions} /></div>
        <div className="field full">
          <label>Ковер зураг {editing ? "" : "*"}</label>
          <input name="coverImage" required={!editing} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onCoverChange} />
          <small className="field-help">JPG, PNG, WebP эсвэл AVIF · дээд хэмжээ 10 MB{editing ? " · солихгүй бол хоосон үлдээнэ" : ""}</small>
          {coverPreview && <div className="admin-cover-preview"><img src={coverPreview} alt="Ковер зургийн урьдчилсан харагдац" /></div>}
        </div>
        <div className="field full">
          <label>Нэмэлт зургууд</label>
          <input name="galleryImages" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={onGalleryChange} />
          <small className="field-help">Нэг дор 12 хүртэл зураг сонгож болно.{editing ? " Шинэ зураг сонговол одоогийн зургуудыг солино." : ""}</small>
          {galleryPreviews.length > 0 && <div className="admin-gallery-preview">{galleryPreviews.map((url, index) => <img key={url} src={url} alt={`Нэмэлт зураг ${index + 1}`} />)}</div>}
        </div>
        <div className="field full"><label>Товч тайлбар *</label><textarea name="description" required minLength={10} rows={4} defaultValue={editing?.description} /></div>
        <div className="field"><label>Төлөв</label><CustomSelect name="status" defaultValue={editing?.status ?? "draft"}><option value="draft">Ноорог</option><option value="published">Нийтлэх</option></CustomSelect></div>
      </div>
      <div className="admin-form-actions"><button type="button" className="button secondary" onClick={closeEditor}>Цуцлах</button><button className="button" disabled={busy}>{busy ? "Хадгалж байна…" : editing ? "Өөрчлөлт хадгалах" : "Загвар хадгалах"}</button></div>
    </form>}
    <div className="admin-card"><table className="admin-table"><thead><tr><th>Зураг</th><th>Нэр</th><th>Ангилал</th><th>Талбай</th><th>Төлөв</th><th></th></tr></thead><tbody>{items.map(item => <tr key={item.id || item.slug}><td><AdminImageTooltip src={item.image} alt={item.name} /></td><td><strong>{item.name}</strong><small className="admin-slug">/{item.slug}</small></td><td>{item.category}</td><td>{item.area}</td><td><span className={`status ${item.status === "draft" ? "draft" : ""}`}>{item.status === "draft" ? "Ноорог" : "Нийтэлсэн"}</span></td><td className="admin-actions">{item.id && <><button type="button" className="admin-action" onClick={() => startEdit(item)}>Засах</button><button type="button" className="admin-action danger" onClick={() => remove(item)}>Устгах</button></>}</td></tr>)}</tbody></table></div>
  </>;
}
