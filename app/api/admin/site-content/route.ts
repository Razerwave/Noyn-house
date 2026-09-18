import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin-auth";
import { readLocalRecords, writeLocalRecords } from "@/lib/local-admin-store";

const entitySchema = z.enum(["service", "faq"]);
const serviceSchema = z.object({ id: z.string().uuid().optional(), entity: z.literal("service"), title: z.string().trim().min(2).max(160), description: z.string().trim().min(5).max(1500), status: z.enum(["draft", "published"]), displayOrder: z.coerce.number().int().min(0).max(999) });
const faqSchema = z.object({ id: z.string().uuid().optional(), entity: z.literal("faq"), question: z.string().trim().min(2).max(300), answer: z.string().trim().min(5).max(3000), status: z.enum(["draft", "published"]), displayOrder: z.coerce.number().int().min(0).max(999) });
const contentSchema = z.discriminatedUnion("entity", [serviceSchema, faqSchema]);

type LocalService = { id: string; title: string; description: string; status: "draft" | "published"; displayOrder: number };
type LocalFaq = { id: string; question: string; answer: string; status: "draft" | "published"; displayOrder: number };

export async function GET() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  if (context.mode === "local") {
    const [services, faqs] = await Promise.all([readLocalRecords<LocalService>("admin-services.json"), readLocalRecords<LocalFaq>("admin-faqs.json")]);
    return NextResponse.json({ services, faqs });
  }
  const [servicesResult, faqsResult] = await Promise.all([
    context.db.from("services").select("id, title, description, status, display_order").order("display_order"),
    context.db.from("faqs").select("id, question, answer, status, display_order").order("display_order"),
  ]);
  if (servicesResult.error) return NextResponse.json({ error: servicesResult.error.message }, { status: 500 });
  if (faqsResult.error) return NextResponse.json({ error: faqsResult.error.message }, { status: 500 });
  return NextResponse.json({
    services: (servicesResult.data ?? []).map(row => ({ id: row.id, title: row.title, description: row.description ?? "", status: row.status, displayOrder: row.display_order ?? 0 })),
    faqs: (faqsResult.data ?? []).map(row => ({ id: row.id, question: row.question, answer: row.answer, status: row.status, displayOrder: row.display_order ?? 0 })),
  });
}

export async function POST(request: Request) { return saveContent(request, false); }
export async function PATCH(request: Request) { return saveContent(request, true); }

async function saveContent(request: Request, editing: boolean) {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  const parsed = contentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || (editing && !parsed.data.id)) return NextResponse.json({ error: "Мэдээллээ бүрэн, зөв оруулна уу." }, { status: 400 });
  const value = parsed.data;

  if (context.mode === "local") {
    if (value.entity === "service") {
      const records = await readLocalRecords<LocalService>("admin-services.json");
      const record = { id: value.id ?? crypto.randomUUID(), title: value.title, description: value.description, status: value.status, displayOrder: value.displayOrder };
      const next = editing ? records.map(item => item.id === record.id ? record : item) : [...records, record];
      await writeLocalRecords("admin-services.json", next); return NextResponse.json(record, { status: editing ? 200 : 201 });
    }
    const records = await readLocalRecords<LocalFaq>("admin-faqs.json");
    const record = { id: value.id ?? crypto.randomUUID(), question: value.question, answer: value.answer, status: value.status, displayOrder: value.displayOrder };
    const next = editing ? records.map(item => item.id === record.id ? record : item) : [...records, record];
    await writeLocalRecords("admin-faqs.json", next); return NextResponse.json(record, { status: editing ? 200 : 201 });
  }

  if (value.entity === "service") {
    const payload = { title: value.title, description: value.description, status: value.status, display_order: value.displayOrder, updated_by: context.user.id };
    const query = editing ? context.db.from("services").update(payload).eq("id", value.id!) : context.db.from("services").insert({ ...payload, created_by: context.user.id });
    const { data, error } = await query.select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ id: data.id, title: data.title, description: data.description ?? "", status: data.status, displayOrder: data.display_order ?? 0 }, { status: editing ? 200 : 201 });
  }

  const payload = { question: value.question, answer: value.answer, status: value.status, display_order: value.displayOrder };
  const query = editing ? context.db.from("faqs").update(payload).eq("id", value.id!) : context.db.from("faqs").insert(payload);
  const { data, error } = await query.select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id, question: data.question, answer: data.answer, status: data.status, displayOrder: data.display_order ?? 0 }, { status: editing ? 200 : 201 });
}

export async function DELETE(request: Request) {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  const url = new URL(request.url);
  const entity = entitySchema.safeParse(url.searchParams.get("entity"));
  const id = z.string().uuid().safeParse(url.searchParams.get("id"));
  if (!entity.success || !id.success) return NextResponse.json({ error: "Устгах мэдээлэл буруу байна." }, { status: 400 });
  if (context.mode === "local") {
    const fileName = entity.data === "service" ? "admin-services.json" : "admin-faqs.json";
    const records = await readLocalRecords<{ id: string }>(fileName);
    await writeLocalRecords(fileName, records.filter(item => item.id !== id.data));
    return NextResponse.json({ ok: true });
  }
  const { error } = await context.db.from(entity.data === "service" ? "services" : "faqs").delete().eq("id", id.data);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
