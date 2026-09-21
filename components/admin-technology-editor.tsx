"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Eye, GripVertical, Plus, Save, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { TechnologyContent } from "@/lib/technology-content";

type IndexedCard = TechnologyContent["cards"][number] & { index: number };

export function AdminTechnologyEditor() {
  const [content, setContent] = useState<TechnologyContent | null>(null);
  const [savedContent, setSavedContent] = useState<TechnologyContent | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [draggedLayer, setDraggedLayer] = useState<number | null>(null);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/technology")
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setContent(result);
        setSavedContent(result);
      })
      .catch(error => toast.error(error instanceof Error ? error.message : "Технологийн агуулгыг уншиж чадсангүй."));
  }, []);

  const hasChanges = useMemo(
    () => Boolean(content && savedContent && JSON.stringify(content) !== JSON.stringify(savedContent)),
    [content, savedContent],
  );

  const visibleCards = useMemo<IndexedCard[]>(() => {
    if (!content) return [];
    const normalizedQuery = query.trim().toLocaleLowerCase("mn");
    return content.cards
      .map((card, index) => ({ ...card, index }))
      .filter(card => !normalizedQuery || `${card.title} ${card.description}`.toLocaleLowerCase("mn").includes(normalizedQuery));
  }, [content, query]);

  const persist = useCallback(async () => {
    if (!content || busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/technology", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(content),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Хадгалж чадсангүй.");
      setContent(result);
      setSavedContent(result);
      toast.success("Барилгын технологийн мэдээлэл хадгалагдлаа.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Хадгалж чадсангүй.");
    } finally {
      setBusy(false);
    }
  }, [busy, content]);

  useEffect(() => {
    function handleSaveShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void persist();
      }
    }
    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [persist]);

  if (!content) {
    return <div className="technology-loading"><span className="technology-loading-dot" />Агуулгыг уншиж байна...</div>;
  }

  function update<K extends keyof TechnologyContent>(field: K, value: TechnologyContent[K]) {
    setContent(current => current ? { ...current, [field]: value } : current);
  }

  function updateLayer(index: number, value: string) {
    update("layers", content!.layers.map((layer, layerIndex) => layerIndex === index ? value : layer));
  }

  function moveItem<T>(items: T[], from: number, to: number) {
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void persist();
  }

  return (
    <form className="technology-admin-page" onSubmit={save}>
      <div className="technology-topbar">
        <div className="technology-admin-breadcrumb">
          <span>Үндсэн систем</span><b>/</b><span>Контент удирдлага</span><b>/</b><strong>Барилгын технологи</strong>
        </div>
        <div className="technology-topbar-actions">
          <div className={`technology-save-status ${hasChanges ? "is-dirty" : ""}`}>
            <span />{hasChanges ? "Хадгалаагүй өөрчлөлт байна" : "Бүх өөрчлөлт хадгалагдсан"}
          </div>
          <a className="technology-button secondary" href="/technology" target="_blank" rel="noreferrer"><Eye size={15} /> Урьдчилан харах</a>
          <button className="technology-button primary" disabled={busy} type="submit"><Save size={15} /> {busy ? "Хадгалж байна..." : "Хадгалах"}</button>
        </div>
      </div>

      <header className="technology-admin-header">
        <div className="technology-admin-heading">
          <div>
            <div className="technology-title-line"><h1>Барилгын технологи</h1><span>Нийтлэгдсэн</span></div>
            <p>Технологийн хуудасны бүх текст, давхарга болон карт бүтцийг удирдах хэсэг</p>
          </div>
          <button className="technology-button dark" type="button" onClick={() => update("cards", [...content.cards, { title: "Шинэ хэсэг", description: "Тайлбар оруулна уу." }])}><Plus size={15} /> Шинэ карт нэмэх</button>
        </div>
        <nav className="technology-admin-tabs" aria-label="Технологийн хэсгүүд">
          <a className="is-active" href="#technology-hero">Үндсэн мэдээлэл <i /></a>
          <a href="#wall-structure">Ханын бүтэц (Давхарга) <span>{content.layers.length}</span></a>
          <a href="#technology-cards">Технологийн картууд <span className="accent">{content.cards.length}</span></a>
        </nav>
      </header>

      <div className="technology-admin-canvas">
        <section className="technology-section-card" id="technology-hero">
          <div className="technology-section-heading">
            <div className="technology-section-number">01</div>
            <div><span>ХУУДАСНЫ ТОЛГОЙ ХЭСЭГ</span><h2>Үндсэн танилцуулга мэдээлэл</h2></div>
            <small>Сайтын дээд нүүр хэсэгт харагдана</small>
          </div>
          <div className="technology-field-grid">
            <div className="technology-field">
              <div className="technology-label-row"><label htmlFor="technology-eyebrow">Жижиг гарчиг <em>*</em></label><small>Дээд талын жижиг шошго</small></div>
              <input id="technology-eyebrow" required value={content.eyebrow} onChange={event => update("eyebrow", event.target.value)} />
            </div>
            <div className="technology-field">
              <div className="technology-label-row"><label htmlFor="technology-title">Үндсэн том гарчиг <em>*</em></label><small>H1 үндсэн гарчиг</small></div>
              <input id="technology-title" required value={content.title} onChange={event => update("title", event.target.value)} />
            </div>
            <div className="technology-field full">
              <div className="technology-label-row"><label htmlFor="technology-copy">Тайлбар эх бичвэр <em>*</em></label><small>{content.copy.length} / 300 тэмдэгт</small></div>
              <textarea id="technology-copy" maxLength={300} required rows={3} value={content.copy} onChange={event => update("copy", event.target.value)} />
            </div>
          </div>
        </section>

        <section className="technology-section-card" id="wall-structure">
          <div className="technology-section-heading">
            <div className="technology-section-number">02</div>
            <div><span>ХАНЫН БҮТЭЦ</span><h2>Давхаргын нарийвчилсан мэдээлэл</h2></div>
            <button type="button" className="technology-button soft" onClick={() => update("layers", [...content.layers, "Шинэ давхарга"])}><Plus size={15} /> Давхарга нэмэх</button>
          </div>
          <div className="technology-field-grid">
            <div className="technology-field"><label htmlFor="wall-eyebrow">Жижиг гарчиг</label><input id="wall-eyebrow" required value={content.wallEyebrow} onChange={event => update("wallEyebrow", event.target.value)} /></div>
            <div className="technology-field"><label htmlFor="wall-title">Үндсэн гарчиг</label><input id="wall-title" required value={content.wallTitle} onChange={event => update("wallTitle", event.target.value)} /></div>
            <div className="technology-field full"><label htmlFor="wall-copy">Тайлбар бичвэр</label><textarea id="wall-copy" required rows={3} value={content.wallCopy} onChange={event => update("wallCopy", event.target.value)} /></div>
          </div>
          <div className="technology-layers">
            <div className="technology-list-label"><strong>Ханын {content.layers.length} давхаргын дараалал <span>(Дотор тал → Гадна фасад)</span></strong><small><ArrowUpDown size={14} /> Чирж байрлалыг солих боломжтой</small></div>
            <div className="technology-layer-list">
              {content.layers.map((layer, index) => (
                <div
                  className={`technology-layer-row ${draggedLayer === index ? "is-dragging" : ""}`}
                  key={`${layer}-${index}`}
                  onDragOver={event => event.preventDefault()}
                  onDrop={() => {
                    if (draggedLayer !== null && draggedLayer !== index) update("layers", moveItem(content.layers, draggedLayer, index));
                    setDraggedLayer(null);
                  }}
                >
                  <span className="technology-drag-handle" draggable onDragStart={() => setDraggedLayer(index)} onDragEnd={() => setDraggedLayer(null)} title="Чирж эрэмбэлэх"><GripVertical size={17} aria-hidden="true" /></span>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  <input aria-label={`${index + 1}-р давхарга`} value={layer} onChange={event => updateLayer(index, event.target.value)} />
                  <span className={`technology-layer-badge ${index === 0 ? "inside" : index === content.layers.length - 1 ? "outside" : "middle"}`}>{index === 0 ? "Дотор тал" : index === content.layers.length - 1 ? "Гадна тал" : "Давхарга"}</span>
                  <button type="button" className="technology-icon-button danger" title="Давхарга устгах" aria-label={`${index + 1}-р давхарга устгах`} disabled={content.layers.length === 1} onClick={() => update("layers", content.layers.filter((_, layerIndex) => layerIndex !== index))}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="technology-section-card technology-card-editor" id="technology-cards">
          <div className="technology-section-heading technology-cards-heading">
            <div className="technology-section-number">03</div>
            <div><span>ТЕХНОЛОГИЙН ХЭСГҮҮД</span><h2>Нийт {content.cards.length} карт бүртгэгдсэн</h2></div>
            <div className="technology-card-tools">
              <label className="technology-search"><Search size={15} /><input aria-label="Картуудаас хайх" placeholder="Картуудаас хайх..." value={query} onChange={event => setQuery(event.target.value)} /></label>
              <button type="button" className="technology-button primary" onClick={() => update("cards", [...content.cards, { title: "Шинэ хэсэг", description: "Тайлбар оруулна уу." }])}><Plus size={15} /> Нэмэх</button>
            </div>
          </div>
          <div className="technology-card-list">
            {visibleCards.map(card => (
              <div
                className={`technology-card-row ${draggedCard === card.index ? "is-dragging" : ""}`}
                key={`${card.title}-${card.index}`}
                onDragOver={event => event.preventDefault()}
                onDrop={() => {
                  if (draggedCard !== null && draggedCard !== card.index) update("cards", moveItem(content.cards, draggedCard, card.index));
                  setDraggedCard(null);
                }}
              >
                <div className="technology-card-index"><span draggable={!query} onDragStart={() => setDraggedCard(card.index)} onDragEnd={() => setDraggedCard(null)}><GripVertical size={16} /></span><b>{String(card.index + 1).padStart(2, "0")}</b></div>
                <div className="technology-field"><label htmlFor={`card-title-${card.index}`}>Гарчиг</label><input id={`card-title-${card.index}`} value={card.title} onChange={event => update("cards", content.cards.map((item, itemIndex) => itemIndex === card.index ? { ...item, title: event.target.value } : item))} /></div>
                <div className="technology-field"><label htmlFor={`card-description-${card.index}`}>Тайлбар</label><textarea id={`card-description-${card.index}`} rows={2} value={card.description} onChange={event => update("cards", content.cards.map((item, itemIndex) => itemIndex === card.index ? { ...item, description: event.target.value } : item))} /></div>
                <button type="button" className="technology-icon-button danger" title="Карт устгах" aria-label="Карт устгах" onClick={() => update("cards", content.cards.filter((_, itemIndex) => itemIndex !== card.index))}><Trash2 size={16} /></button>
              </div>
            ))}
            {visibleCards.length === 0 && <div className="technology-empty">“{query}” хайлтад тохирох карт олдсонгүй.</div>}
          </div>
        </section>
      </div>

      {hasChanges && (
        <div className="technology-floating-save" role="status">
          <div><span /><p>Хадгалаагүй өөрчлөлт байна</p></div>
          <i />
          <button type="button" onClick={() => setContent(savedContent)}>Цуцлах</button>
          <button type="submit" disabled={busy}>{busy ? "Хадгалж байна..." : "Хадгалах (Ctrl+S)"}</button>
        </div>
      )}
    </form>
  );
}
