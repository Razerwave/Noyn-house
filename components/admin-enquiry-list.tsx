"use client";

import { Fragment, useMemo, useState } from "react";
import { CustomSelect } from "./custom-select";
import { toast } from "sonner";

const enquiryStatuses = ["Шинэ", "Холбогдсон", "Мэдээлэл дутуу", "Уулзалт товлосон", "Талбай үзсэн", "Үнийн санал бэлтгэж байгаа", "Үнийн санал илгээсэн", "Гэрээний шатанд", "Гэрээ болсон", "Цуцлагдсан", "Архивласан"];
const PAGE_SIZE = 10;

export type AdminEnquiry = {
  enquiryNumber: string;
  customerName: string;
  phone: string;
  email: string;
  location: string;
  model: string;
  budget: string;
  status: string;
  createdAt: string;
  formData: Record<string, string>;
};

const detailLabels: Record<string, string> = {
  area: "Хүссэн талбай",
  floors: "Давхар",
  rooms: "Өрөөний тоо",
  bedrooms: "Унтлагын өрөө",
  landReady: "Газар бэлэн эсэх",
  landSize: "Газрын хэмжээ",
  electricity: "Цахилгаан",
  water: "Цэвэр ус",
  schedule: "Эхлүүлэх хугацаа",
  service: "Сонирхож буй үйлчилгээ",
  contactMethod: "Холбогдох хэлбэр",
  landNote: "Газрын нэмэлт тайлбар",
  requirements: "Нэмэлт шаардлага",
};

function formatDate(value: string) {
  if (!value) return "—";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}.${values.month}.${values.day} ${values.hour}:${values.minute}`;
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function AdminEnquiryList({ enquiries }: { enquiries: AdminEnquiry[] }) {
  const [items, setItems] = useState(enquiries);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter(enquiry => {
      const matchesQuery = !needle || [enquiry.enquiryNumber, enquiry.customerName, enquiry.phone, enquiry.email, enquiry.location, enquiry.model].some(value => value.toLowerCase().includes(needle));
      return matchesQuery && (!status || enquiry.status === status);
    });
  }, [items, query, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function updateStatus(enquiryNumber: string, nextStatus: string) {
    setUpdating(enquiryNumber);
    try {
      const response = await fetch("/api/admin/enquiries", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ enquiryNumber, status: nextStatus }) });
      if (!response.ok) throw new Error("Төлөв шинэчилж чадсангүй.");
      setItems(current => current.map(item => item.enquiryNumber === enquiryNumber ? { ...item, status: nextStatus } : item));
      toast.success("Хүсэлтийн төлөв шинэчлэгдлээ.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Төлөв шинэчилж чадсангүй.");
    } finally { setUpdating(null); }
  }

  function downloadCsv() {
    const header = ["Дугаар", "Огноо", "Нэр", "Утас", "Имэйл", "Загвар", "Байршил", "Төсөв", "Төлөв"];
    const rows = filtered.map(enquiry => [enquiry.enquiryNumber, formatDate(enquiry.createdAt), enquiry.customerName, enquiry.phone, enquiry.email, enquiry.model, enquiry.location, enquiry.budget, enquiry.status]);
    const csv = `\uFEFF${[header, ...rows].map(row => row.map(csvCell).join(",")).join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `noyon-house-enquiries-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click();
    URL.revokeObjectURL(url);
  }

  return <>
    <div className="admin-top">
      <div><h1>Үнийн хүсэлтүүд</h1><small>Нийт {items.length} хүсэлт · харагдаж буй {filtered.length}</small></div>
      <button className="button" type="button" onClick={downloadCsv} disabled={!filtered.length}>CSV татах</button>
    </div>
    <div className="admin-card">
      <div className="filter-bar">
        <input value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Нэр, утас, дугаараар хайх" />
        <CustomSelect value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">Бүх төлөв</option>{enquiryStatuses.map(item => <option key={item}>{item}</option>)}</CustomSelect>
      </div>
      {filtered.length > 0 ? <><table className="admin-table enquiry-table">
        <thead><tr><th>Дугаар / Огноо</th><th>Нэр</th><th>Утас</th><th>Загвар</th><th>Байршил</th><th>Төсөв</th><th>Төлөв</th><th></th></tr></thead>
        <tbody>{visible.map(enquiry => <Fragment key={enquiry.enquiryNumber}>
          <tr>
            <td><strong>{enquiry.enquiryNumber}</strong><small className="admin-slug">{formatDate(enquiry.createdAt)}</small></td>
            <td><strong>{enquiry.customerName}</strong>{enquiry.email && <small className="admin-slug">{enquiry.email}</small>}</td>
            <td>{enquiry.phone}</td><td>{enquiry.model || "Сонгоогүй"}</td><td>{enquiry.location}</td><td>{enquiry.budget || "—"}</td>
            <td><CustomSelect className="table-status-select" value={enquiry.status} disabled={updating === enquiry.enquiryNumber} onChange={event => updateStatus(enquiry.enquiryNumber, event.target.value)}>{enquiryStatuses.map(item => <option key={item}>{item}</option>)}</CustomSelect></td>
            <td><button className="admin-action" type="button" onClick={() => setExpanded(current => current === enquiry.enquiryNumber ? null : enquiry.enquiryNumber)}>{expanded === enquiry.enquiryNumber ? "Хаах" : "Дэлгэрэнгүй"}</button></td>
          </tr>
          {expanded === enquiry.enquiryNumber && <tr className="enquiry-detail-row"><td colSpan={8}><div className="enquiry-detail-grid">
            {Object.entries(detailLabels).map(([key, label]) => enquiry.formData[key] && <div key={key} className={key === "landNote" || key === "requirements" ? "full" : ""}><small>{label}</small><strong>{enquiry.formData[key]}</strong></div>)}
          </div></td></tr>}
        </Fragment>)}</tbody>
      </table><div className="admin-pagination"><span>{page} / {pageCount} хуудас</span><button className="admin-action" type="button" disabled={page <= 1} onClick={() => setPage(current => current - 1)}>Өмнөх</button><button className="admin-action" type="button" disabled={page >= pageCount} onClick={() => setPage(current => current + 1)}>Дараах</button></div></> : <div className="admin-empty"><strong>Хүсэлт олдсонгүй</strong><span>{items.length ? "Хайлтын нөхцөлөө өөрчилнө үү." : "Үнийн саналын form-оор илгээсэн хүсэлтүүд энд харагдана."}</span></div>}
    </div>
  </>;
}
