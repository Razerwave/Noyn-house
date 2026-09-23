import { readFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { AdminEnquiryList, type AdminEnquiry } from "@/components/admin-enquiry-list";
import { AdminShell } from "@/components/admin-shell";
import { getAdminContext } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type StoredEnquiry = {
  enquiry_number?: string;
  customer_name?: string;
  phone?: string;
  email?: string | null;
  location?: string;
  interested_model?: string | null;
  budget?: string | null;
  status?: string;
  consent_at?: string;
  created_at?: string;
  form_data?: Record<string, unknown>;
};

function normalize(row: StoredEnquiry): AdminEnquiry {
  const formData = Object.fromEntries(Object.entries(row.form_data ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  return {
    enquiryNumber: row.enquiry_number ?? "—",
    customerName: row.customer_name ?? "—",
    phone: row.phone ?? "—",
    email: row.email ?? "",
    location: row.location ?? "—",
    model: row.interested_model ?? formData.model ?? "",
    budget: row.budget ?? formData.budget ?? "",
    status: row.status ?? "Шинэ",
    createdAt: row.created_at ?? row.consent_at ?? "",
    formData,
  };
}

async function readLocalEnquiries() {
  try {
    const content = await readFile(path.join(process.cwd(), "data", "enquiries.ndjson"), "utf8");
    return content.split("\n").filter(Boolean).flatMap(line => {
      try { return [normalize(JSON.parse(line) as StoredEnquiry)]; } catch { return []; }
    }).reverse();
  } catch {
    return [];
  }
}

export default async function Enquiries() {
  const context = await getAdminContext(["Admin", "Sales"]);
  if (!context) redirect("/admin/login");

  let enquiries: AdminEnquiry[];
  if (context.mode === "local") {
    enquiries = await readLocalEnquiries();
  } else {
    const { data, error } = await context.db.from("quotation_enquiries").select("*").is("deleted_at", null).order("created_at", { ascending: false });
    if (error) throw new Error(`Үнийн хүсэлтүүдийг уншиж чадсангүй: ${error.message}`);
    enquiries = (data ?? []).map(row => normalize(row as StoredEnquiry));
  }

  return <div className="admin-body"><AdminShell role={context.roleName}><AdminEnquiryList enquiries={enquiries} /></AdminShell></div>;
}
