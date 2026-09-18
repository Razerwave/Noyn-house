"use client";

import { FormEvent, useEffect, useState } from "react";
import { defaultSiteSettings, type SiteSettings } from "@/lib/site-settings";

export function AdminSettingsForm() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Тохиргоог уншиж чадсангүй.");
        setSettings(result);
      })
      .catch(error => setMessage(error instanceof Error ? error.message : "Тохиргоог уншиж чадсангүй."))
      .finally(() => setLoading(false));
  }, []);

  function setField(field: keyof SiteSettings, value: string) {
    setSettings(current => ({ ...current, [field]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "Тохиргоог хадгалж чадсангүй.");
        return;
      }
      setSettings(result);
      setMessage("Сайтын тохиргоо амжилттай хадгалагдлаа.");
    } catch {
      setMessage("Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={save}>
    <div className="admin-top">
      <div><h1>Сайтын тохиргоо</h1><small>Холбоо барих болон SEO үндсэн мэдээлэл</small></div>
      <button className="button" disabled={busy || loading}>{busy ? "Хадгалж байна…" : loading ? "Уншиж байна…" : "Хадгалах"}</button>
    </div>

    {message && <div className={message.includes("амжилттай") ? "admin-alert success" : "admin-alert error"}>{message}</div>}

    <section className="admin-card admin-editor">
      <div className="admin-editor-head"><div><span>КОМПАНИЙН МЭДЭЭЛЭЛ</span><h2>Холбоо барих мэдээлэл</h2></div><p>Эдгээр мэдээлэл холбоо барих хуудас болон footer хэсэгт харагдана.</p></div>
      <div className="field-grid">
        <div className="field"><label>Компанийн нэр *</label><input required minLength={2} maxLength={120} value={settings.companyName} onChange={event => setField("companyName", event.target.value)} /></div>
        <div className="field"><label>Үндсэн утас *</label><input required type="tel" minLength={6} maxLength={40} value={settings.phone} onChange={event => setField("phone", event.target.value)} /></div>
        <div className="field"><label>Имэйл *</label><input required type="email" maxLength={160} value={settings.email} onChange={event => setField("email", event.target.value)} /></div>
        <div className="field"><label>Ажлын цаг *</label><input required minLength={2} maxLength={160} value={settings.businessHours} onChange={event => setField("businessHours", event.target.value)} /></div>
        <div className="field full"><label>Хаяг *</label><input required minLength={2} maxLength={300} value={settings.address} onChange={event => setField("address", event.target.value)} /></div>
      </div>
    </section>

    <section className="admin-card admin-editor">
      <div className="admin-editor-head"><div><span>SEO ТОХИРГОО</span><h2>Хайлтын системийн мэдээлэл</h2></div><p>Сайтын үндсэн гарчиг болон хайлтын үр дүнд харагдах тайлбар.</p></div>
      <div className="field-grid">
        <div className="field full"><label>Үндсэн гарчиг *</label><input required minLength={2} maxLength={160} value={settings.siteTitle} onChange={event => setField("siteTitle", event.target.value)} /></div>
        <div className="field full"><label>Үндсэн тайлбар *</label><textarea required minLength={10} maxLength={500} rows={4} value={settings.siteDescription} onChange={event => setField("siteDescription", event.target.value)} /></div>
      </div>
    </section>

    <div className="admin-form-actions"><button className="button" disabled={busy || loading}>{busy ? "Хадгалж байна…" : "Бүх тохиргоог хадгалах"}</button></div>
  </form>;
}
