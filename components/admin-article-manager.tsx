"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type Article = { id?: string; title: string; slug: string; category: string; summary: string; content: string; image?: string; images?: string[]; status: "draft" | "published"; publishedAt?: string };

const seedArticles: Article[] = [
  { title: "Газраа хаус барихад хэрхэн бэлтгэх вэ?", slug: "gazar-beltyylelt", category: "Газар бэлтгэл", summary: "Хаус барихаас өмнө газрын нөхцөл, дэд бүтэц болон зөвшөөрлөө хэрхэн бэлтгэх тухай.", content: "Газрын байршил, хөрсний нөхцөл, цахилгаан болон усны шийдлээ эхлээд тодорхойлоорой.", status: "published", image: "/images/hero-house.png" },
  { title: "Хаусын төлөвлөлт эхлэхээс өмнө бодох 7 зүйл", slug: "hausyn-tuluvlult", category: "Хаус төлөвлөлт", summary: "Төлөвлөлтөө эхлэхдээ талбай, гэрэлтүүлэг, хөдөлгөөний урсгалаа зөв шийдэх зөвлөмж.", content: "Өдөр тутмын амьдралын урсгал, хадгалалтын хэрэгцээ, цонхны чиглэлийг төлөвлөлтийн эхэнд тооцно.", status: "published", image: "/images/interior.png" },
  { title: "Модон каркасан хийцийн үндсэн ойлголт", slug: "modon-karkasan-hiits", category: "Барилгын материал", summary: "Timber-frame технологийн давуу тал, дулаан алдагдлын шийдлийг ойлгох товч гарын авлага.", content: "Модон каркасан хийц нь зөв тооцоо, чанартай дулаалга, салхи чийгний хамгаалалттай хосолж байж үр дүнтэй.", status: "published", image: "/images/model-nomad.png" },
];

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9\u0400-\u04ff]+/g, "-").replace(/^-+|-+$/g, "").replace(/[\u0400-\u04ff]/g, character => ({ а:"a", б:"b", в:"v", г:"g", д:"d", е:"e", ё:"yo", ж:"j", з:"z", и:"i", й:"i", к:"k", л:"l", м:"m", н:"n", о:"o", ө:"u", п:"p", р:"r", с:"s", т:"t", у:"u", ү:"u", ф:"f", х:"kh", ц:"ts", ч:"ch", ш:"sh", ы:"y", э:"e", ю:"yu", я:"ya" }[character] ?? "")).replace(/-+/g, "-");

export function AdminArticleManager({ initialItems }: { initialItems: Article[] }) {
  const [items, setItems] = useState<Article[]>(initialItems.length ? initialItems : seedArticles);
  const [editing, setEditing] = useState<Article | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => { fetch("/api/admin/articles").then(response => response.ok ? response.json() : []).then((saved: Article[]) => { if (saved.length) setItems([...saved, ...seedArticles.filter(seed => !saved.some(item => item.slug === seed.slug))]); }).catch(() => undefined); }, []);

  function startCreate() { setEditing(null); setSlug(""); setSlugTouched(false); setImagePreviews([]); setMessage(""); setOpen(true); }
  function startEdit(article: Article) { setEditing(article); setSlug(article.slug); setSlugTouched(true); setImagePreviews(article.images ?? (article.image ? [article.image] : [])); setMessage(""); setOpen(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function closeEditor() { setOpen(false); setEditing(null); setMessage(""); setSlug(""); setSlugTouched(false); setImagePreviews([]); }
  function onImageChange(event: ChangeEvent<HTMLInputElement>) { const files = Array.from(event.target.files ?? []); setImagePreviews(files.map(file => URL.createObjectURL(file))); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/admin/articles", { method: editing ? "PATCH" : "POST", body: new FormData(form) });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error || "Хадгалж чадсангүй."); return; }
      setItems(current => editing ? current.map(item => item.id === result.id ? result : item) : [result, ...current]);
      setMessage(editing ? "Нийтлэл шинэчлэгдлээ." : "Нийтлэл хадгалагдлаа."); closeEditor();
    } catch { setMessage("Сүлжээний алдаа гарлаа."); } finally { setBusy(false); }
  }

  async function remove(article: Article) {
    if (!article.id || !window.confirm(`“${article.title}” нийтлэлийг устгах уу?`)) return;
    const response = await fetch(`/api/admin/articles?id=${article.id}`, { method: "DELETE" });
    if (response.ok) setItems(current => current.filter(item => item.id !== article.id));
    else setMessage("Нийтлэлийг устгаж чадсангүй.");
  }

  return <>
    <div className="admin-top"><div><h1>Мэдээ, нийтлэл</h1><small>Нийтлэл нэмэх, засах, нийтлэх болон устгах</small></div><button className="button" onClick={() => open ? closeEditor() : startCreate()}>{open ? "Хаах" : "+ Шинэ нийтлэл"}</button></div>
    {open && <form className="admin-card admin-editor" onSubmit={submit}>
      {editing?.id && <input type="hidden" name="id" value={editing.id} />}
      <div className="admin-editor-head"><div><span>{editing ? "НИЙТЛЭЛ ЗАСАХ" : "ШИНЭ НИЙТЛЭЛ"}</span><h2>{editing ? editing.title : "Нийтлэл бэлтгэх"}</h2></div><p>Нийтлэх үед public сайтын Мэдээ, зөвлөгөө хэсэгт харагдана.</p></div>
      <div className="field-grid">
        <div className="field"><label>Гарчиг *</label><input name="title" required defaultValue={editing?.title} onChange={event => { if (!slugTouched) setSlug(slugify(event.target.value)); }} /></div>
        <div className="field"><label>URL slug *</label><input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} onChange={event => { setSlug(event.target.value.toLowerCase()); setSlugTouched(true); }} /></div>
        <div className="field"><label>Ангилал *</label><input name="category" required defaultValue={editing?.category} placeholder="Газар бэлтгэл" /></div>
        <div className="field full"><label>Товч агуулга *</label><textarea name="summary" required minLength={10} rows={3} defaultValue={editing?.summary} /></div>
        <div className="field full"><label>Нийтлэлийн агуулга *</label><textarea name="content" required minLength={10} rows={10} defaultValue={editing?.content} /></div>
        <div className="field full"><label>Нийтлэлийн зургууд {editing ? "" : "*"}</label>{editing?.image && <input type="hidden" name="existingImage" value={editing.image} />}<input name="articleImages" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple required={!editing} onChange={onImageChange} /><small className="field-help">12 хүртэл JPG, PNG, WebP эсвэл AVIF зураг · зураг бүр 10 MB хүртэл{editing ? " · шинэ зураг сонговол одоогийн gallery солигдоно" : ""}</small>{imagePreviews.length > 0 && <div className="admin-gallery-preview">{imagePreviews.map((url, index) => <img key={`${url}-${index}`} src={url} alt={`Нийтлэлийн зураг ${index + 1}`} />)}</div>}</div>
        <div className="field"><label>Төлөв</label><select name="status" defaultValue={editing?.status ?? "draft"}><option value="draft">Ноорог</option><option value="published">Нийтлэх</option></select></div>
      </div>
      <div className="admin-form-actions"><button type="button" className="button secondary" onClick={closeEditor}>Цуцлах</button><button className="button" disabled={busy}>{busy ? "Хадгалж байна…" : editing ? "Өөрчлөлт хадгалах" : "Нийтлэл хадгалах"}</button></div>
    </form>}
    {message && <div className="admin-alert success">{message}</div>}
    <div className="admin-card"><table className="admin-table"><thead><tr><th>Гарчиг</th><th>Ангилал</th><th>Төлөв</th><th></th></tr></thead><tbody>{items.map(item => <tr key={item.id || item.slug}><td><strong>{item.title}</strong><small className="admin-slug">/{item.slug}</small></td><td>{item.category}</td><td><span className={`status ${item.status === "draft" ? "draft" : ""}`}>{item.status === "draft" ? "Ноорог" : "Нийтэлсэн"}</span></td><td className="admin-actions">{item.id && <><button type="button" className="admin-action" onClick={() => startEdit(item)}>Засах</button><button type="button" className="admin-action danger" onClick={() => remove(item)}>Устгах</button></>}</td></tr>)}</tbody></table></div>
  </>;
}
