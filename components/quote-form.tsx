"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { PublicHouse } from "@/lib/public-houses";
import { CustomSelect } from "./custom-select";
const labels = [
  "Хаусын мэдээлэл",
  "Газрын мэдээлэл",
  "Төсөв, хугацаа",
  "Холбоо барих",
];
export function QuoteForm({ models }: { models: PublicHouse[] }) {
  const requestedModel = useSearchParams().get("model") ?? "";
  const initialModel = models.some(model => model.slug === requestedModel) ? requestedModel : "";
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Record<string, string>>({ model: initialModel });
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const body = { ...draft, ...Object.fromEntries(fd.entries()) };
    try {
      const r = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      toast.success(`Хүсэлт амжилттай илгээгдлээ: ${j.enquiryNumber}`);
      e.currentTarget.reset();
      setDraft({ model: initialModel });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Хүсэлтийг илгээж чадсангүй. Дахин оролдоно уу.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }
  function remember(e: React.FormEvent<HTMLFormElement>) {
    const t = e.target as
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (!t.name) return;
    setDraft((d) => ({
      ...d,
      [t.name]:
        t.type === "checkbox"
          ? String((t as HTMLInputElement).checked)
          : t.value,
    }));
  }
  return (
    <div className="quote-shell">
      <ol className="steps">
        {labels.map((x, i) => (
          <li className={i === step ? "active" : ""} key={x}>
            <b>{i + 1}</b>
            <span>{x}</span>
          </li>
        ))}
      </ol>
      <form
        className="quote-form"
        onInput={remember}
        onChange={remember}
        onSubmit={submit}
      >
        {step === 0 && (
          <>
            <h2>Хаусын мэдээлэл</h2>
            <div className="field-grid">
              <div className="field full">
                <label>Сонирхож буй загвар</label>
                <CustomSelect name="model" defaultValue={draft.model}>
                  <option value="">Одоогоор сонгоогүй</option>
                  {models.map(model => <option value={model.slug} key={model.id ?? model.slug}>{model.name} · {model.area}</option>)}
                </CustomSelect>
              </div>
              <div className="field">
                <label>Хүсэж буй нийт талбай</label>
                <input
                  name="area"
                  defaultValue={draft.area}
                  placeholder="жишээ: 120 м²"
                />
              </div>
              <div className="field">
                <label>Давхар</label>
                <CustomSelect name="floors" defaultValue={draft.floors}>
                  <option>1 давхар</option>
                  <option>2 давхар</option>
                </CustomSelect>
              </div>
              <div className="field">
                <label>Өрөөний тоо</label>
                <input
                  name="rooms"
                  defaultValue={draft.rooms}
                  type="number"
                  min="1"
                />
              </div>
              <div className="field">
                <label>Унтлагын өрөө</label>
                <input
                  name="bedrooms"
                  defaultValue={draft.bedrooms}
                  type="number"
                  min="1"
                />
              </div>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h2>Газрын мэдээлэл</h2>
            <div className="field-grid">
              <div className="field full">
                <label>Барих газрын байршил *</label>
                <input
                  name="location"
                  defaultValue={draft.location}
                  required
                  placeholder="Аймаг, хот, дүүрэг"
                />
              </div>
              <div className="field">
                <label>Газар бэлэн эсэх</label>
                <CustomSelect name="landReady" defaultValue={draft.landReady}>
                  <option>Бэлэн</option>
                  <option>Хайж байгаа</option>
                </CustomSelect>
              </div>
              <div className="field">
                <label>Газрын хэмжээ</label>
                <input
                  name="landSize"
                  defaultValue={draft.landSize}
                  placeholder="жишээ: 700 м²"
                />
              </div>
              <div className="field">
                <label>Цахилгаан</label>
                <CustomSelect name="electricity" defaultValue={draft.electricity}>
                  <option>Байгаа</option>
                  <option>Байхгүй</option>
                  <option>Тодорхойгүй</option>
                </CustomSelect>
              </div>
              <div className="field">
                <label>Цэвэр ус</label>
                <CustomSelect name="water" defaultValue={draft.water}>
                  <option>Байгаа</option>
                  <option>Байхгүй</option>
                  <option>Тодорхойгүй</option>
                </CustomSelect>
              </div>
              <div className="field full">
                <label>Нэмэлт тайлбар</label>
                <textarea
                  name="landNote"
                  defaultValue={draft.landNote}
                  rows={4}
                />
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2>Төсөв ба хугацаа</h2>
            <div className="field-grid">
              <div className="field">
                <label>Эхлүүлэх хугацаа</label>
                <CustomSelect name="schedule" defaultValue={draft.schedule}>
                  <option>3 сарын дотор</option>
                  <option>3–6 сарын дотор</option>
                  <option>6–12 сарын дотор</option>
                  <option>Судалж байгаа</option>
                </CustomSelect>
              </div>
              <div className="field">
                <label>Төсвийн хэмжээ</label>
                <CustomSelect name="budget" defaultValue={draft.budget}>
                  <option>Тодорхойгүй</option>
                  <option>Төсөв ярилцах</option>
                  <option>Санхүүжилт судалж байгаа</option>
                </CustomSelect>
              </div>
              <div className="field full">
                <label>Сонирхож буй үйлчилгээ</label>
                <CustomSelect name="service" defaultValue={draft.service}>
                  <option>Зураг төсөл + барилга угсралт</option>
                  <option>Зөвхөн зураг төсөл</option>
                  <option>Зөвхөн барилга угсралт</option>
                </CustomSelect>
              </div>
              <div className="field full">
                <label>Нэмэлт шаардлага</label>
                <textarea
                  name="requirements"
                  defaultValue={draft.requirements}
                  rows={4}
                />
              </div>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2>Холбоо барих мэдээлэл</h2>
            <div className="field-grid">
              <div className="field">
                <label>Нэр *</label>
                <input name="name" defaultValue={draft.name} required />
              </div>
              <div className="field">
                <label>Утасны дугаар *</label>
                <input
                  name="phone"
                  defaultValue={draft.phone}
                  required
                  pattern="[+0-9 ()-]{8,}"
                />
              </div>
              <div className="field">
                <label>Имэйл</label>
                <input name="email" defaultValue={draft.email} type="email" />
              </div>
              <div className="field">
                <label>Холбогдох хэлбэр</label>
                <CustomSelect name="contactMethod" defaultValue={draft.contactMethod}>
                  <option>Утсаар</option>
                  <option>Имэйлээр</option>
                </CustomSelect>
              </div>
              <div className="field full">
                <label className="quote-consent">
                  <input name="consent" type="checkbox" required />
                  <span><a href="/privacy" target="_blank" rel="noreferrer">Нууцлалын бодлого</a>-той танилцаж, хувийн мэдээлэл боловсруулахыг зөвшөөрч байна. *</span>
                </label>
              </div>
            </div>
          </>
        )}
        <div className="form-actions">
          <button
            type="button"
            className="button ghost"
            style={{
              color: "#172126",
              borderColor: "#bbb",
              visibility: step === 0 ? "hidden" : "visible",
            }}
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft size={16} /> Өмнөх
          </button>
          {step < 3 ? (
            <button
              type="button"
              className="button"
              onClick={() => setStep(step + 1)}
            >
              Үргэлжлүүлэх <ArrowRight size={16} />
            </button>
          ) : (
            <button className="button" disabled={busy}>
              {busy ? "Илгээж байна…" : "Хүсэлт илгээх"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
