import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AdminEnquiry } from "@/components/admin-enquiry-list";
import { getAdminContext } from "@/lib/admin-auth";

export type DashboardData = { total: number; newCount: number; uncontacted: number; today: number; month: number; recent: AdminEnquiry[] };

function normalize(row: any): AdminEnquiry {
  const formData = Object.fromEntries(Object.entries(row.form_data ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  return { enquiryNumber: row.enquiry_number ?? "—", customerName: row.customer_name ?? "—", phone: row.phone ?? "—", email: row.email ?? "", location: row.location ?? "—", model: row.interested_model ?? formData.model ?? "", budget: row.budget ?? formData.budget ?? "", status: row.status ?? "Шинэ", createdAt: row.created_at ?? row.consent_at ?? "", formData };
}

export async function getDashboardData(): Promise<DashboardData> {
  const context = await getAdminContext(["Admin", "Sales", "Content Editor"]);
  if (!context) return { total: 0, newCount: 0, uncontacted: 0, today: 0, month: 0, recent: [] };
  let rows: AdminEnquiry[];
  if (context.mode === "local") {
    try {
      const content = await readFile(path.join(process.cwd(), "data", "enquiries.ndjson"), "utf8");
      rows = content.split("\n").filter(Boolean).map(line => normalize(JSON.parse(line))).reverse();
    } catch { rows = []; }
  } else {
    const { data } = await context.db.from("quotation_enquiries").select("*").is("deleted_at", null).order("created_at", { ascending: false });
    rows = (data ?? []).map(normalize);
  }
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const monthKey = todayKey.slice(0, 7);
  const isDate = (value: string, key: string) => value.startsWith(key);
  return { total: rows.length, newCount: rows.filter(row => row.status === "Шинэ").length, uncontacted: rows.filter(row => row.status === "Шинэ" || row.status === "Мэдээлэл дутуу").length, today: rows.filter(row => isDate(row.createdAt, todayKey)).length, month: rows.filter(row => isDate(row.createdAt, monthKey)).length, recent: rows.slice(0, 5) };
}
