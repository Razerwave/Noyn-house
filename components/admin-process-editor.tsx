"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ProcessContent, ProcessStep } from "@/lib/process-content";
import styles from "./admin-process-editor.module.css";

function newStep(): ProcessStep {
  return {
    title: "Шинэ үе шат",
    description: "Энэ үе шатанд хийх ажлын тайлбарыг энд оруулна.",
  };
}

export function AdminProcessEditor({ initialContent }: { initialContent: ProcessContent }) {
  const [content, setContent] = useState(initialContent);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/process")
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((saved: ProcessContent) => setContent(saved))
      .catch(() => undefined);
  }, []);

  function setField<K extends keyof Omit<ProcessContent, "steps">>(field: K, value: ProcessContent[K]) {
    setContent(current => ({ ...current, [field]: value }));
  }

  function setStep(index: number, field: keyof Pick<ProcessStep, "title" | "description">, value: string) {
    setContent(current => ({
      ...current,
      steps: current.steps.map((step, itemIndex) => itemIndex === index ? { ...step, [field]: value } : step),
    }));
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= content.steps.length) return;
    setContent(current => {
      const steps = [...current.steps];
      [steps[index], steps[target]] = [steps[target], steps[index]];
      return { ...current, steps };
    });
  }

  function removeStep(index: number) {
    if (content.steps.length === 1) return;
    setContent(current => ({ ...current, steps: current.steps.filter((_, itemIndex) => itemIndex !== index) }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/process", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "Агуулгыг хадгалж чадсангүй.");
        toast.error(result.error || "Агуулгыг хадгалж чадсангүй.");
        return;
      }
      setContent(result);
      setMessage("Ажлын явцын агуулга амжилттай хадгалагдлаа.");
      toast.success("Ажлын явцын агуулга амжилттай хадгалагдлаа.");
    } catch {
      setMessage("Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
      toast.error("Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save}>
      <div className="admin-top">
        <div><h1>Ажлын дараалал</h1><small>“Бид хэрхэн ажилладаг вэ?” хуудасны агуулга</small></div>
        <button className="button" disabled={busy}>{busy ? "Хадгалж байна…" : "Өөрчлөлт хадгалах"}</button>
      </div>


      <section className="admin-card admin-editor">
        <div className="admin-editor-head">
          <div><span>ХУУДСЫН ТОЛГОЙ</span><h2>Hero агуулга</h2></div>
          <p>Эдгээр текст `/process` хуудасны дээд хэсэгт харагдана.</p>
        </div>
        <div className="field-grid">
          <div className="field"><label>Жижиг гарчиг *</label><input required minLength={2} maxLength={80} value={content.eyebrow} onChange={event => setField("eyebrow", event.target.value)} /></div>
          <div className="field"><label>Үндсэн гарчиг *</label><input required minLength={2} maxLength={160} value={content.title} onChange={event => setField("title", event.target.value)} /></div>
          <div className="field full"><label>Тайлбар *</label><textarea required minLength={10} maxLength={1000} rows={3} value={content.copy} onChange={event => setField("copy", event.target.value)} /></div>
        </div>
      </section>

      <section className="admin-card admin-editor">
        <div className="admin-editor-head">
          <div><span>НҮҮР ХУУДАС</span><h2>Ажлын дарааллын хэсэг</h2></div>
          <p>Нүүр хуудсан дээр үе шатуудын эхний 6 нь харагдана.</p>
        </div>
        <div className="field-grid">
          <div className="field"><label>Жижиг гарчиг *</label><input required minLength={2} maxLength={80} value={content.homeEyebrow} onChange={event => setField("homeEyebrow", event.target.value)} /></div>
          <div className="field"><label>Үндсэн гарчиг *</label><input required minLength={2} maxLength={160} value={content.homeTitle} onChange={event => setField("homeTitle", event.target.value)} /></div>
        </div>
      </section>

      <section className="admin-card admin-editor">
        <div className="admin-editor-head">
          <div><span>ҮЕ ШАТУУД</span><h2>{content.steps.length} үе шат</h2></div>
          <button className="button secondary" type="button" onClick={() => setContent(current => ({ ...current, steps: [...current.steps, newStep()] }))}><Plus size={16} /> Үе шат нэмэх</button>
        </div>

        <div className={styles.steps}>
          {content.steps.map((step, index) => (
            <article className={styles.step} key={step.id ?? index}>
              <div className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</div>
              <div className={styles.fields}>
                <div className="field"><label>Үе шатны нэр *</label><input required minLength={2} maxLength={160} value={step.title} onChange={event => setStep(index, "title", event.target.value)} /></div>
                <div className="field"><label>Тайлбар *</label><textarea required minLength={5} maxLength={1500} rows={3} value={step.description} onChange={event => setStep(index, "description", event.target.value)} /></div>
              </div>
              <div className={styles.actions}>
                <button type="button" title="Дээш зөөх" aria-label={`${index + 1}-р үе шатыг дээш зөөх`} disabled={index === 0} onClick={() => moveStep(index, -1)}><ArrowUp size={16} /></button>
                <button type="button" title="Доош зөөх" aria-label={`${index + 1}-р үе шатыг доош зөөх`} disabled={index === content.steps.length - 1} onClick={() => moveStep(index, 1)}><ArrowDown size={16} /></button>
                <button type="button" title="Устгах" aria-label={`${index + 1}-р үе шатыг устгах`} disabled={content.steps.length === 1} onClick={() => removeStep(index)}><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="admin-form-actions"><button className="button" disabled={busy}>{busy ? "Хадгалж байна…" : "Бүх өөрчлөлтийг хадгалах"}</button></div>
    </form>
  );
}
