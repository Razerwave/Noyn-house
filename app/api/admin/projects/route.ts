import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin-auth";
import { readLocalRecords, writeLocalRecords } from "@/lib/local-admin-store";

const projectSchema = z.object({
  title: z.string().min(2).max(160), slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  location: z.string().min(2).max(180), totalArea: z.coerce.number().positive().max(10000),
  year: z.coerce.number().int().min(1900).max(2200), duration: z.string().max(100).optional().default(""),
  houseModelId: z.string().uuid().optional().or(z.literal("")), image: z.string().min(1).max(500),
  overview: z.string().min(10).max(3000), status: z.enum(["draft", "published"]),
});

export async function GET() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  if (context.mode === "local") return NextResponse.json(await readLocalRecords("admin-projects.json"));
  const { data, error } = await context.db.from("projects").select("*, project_media(url, media_type)").is("deleted_at", null).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(row => ({ id: row.id, title: row.title, slug: row.slug, location: row.general_location, area: `${row.total_area} м²`, year: String(row.completion_year ?? ""), duration: row.duration, image: row.project_media?.find((m: {media_type:string}) => m.media_type === "cover")?.url || "/images/hero-house.png", overview: row.overview, status: row.status })));
}

export async function POST(request: Request) {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  const parsed = projectSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Мэдээллээ бүрэн, зөв оруулна уу.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const value = parsed.data;
  const record = { id: crypto.randomUUID(), title: value.title, slug: value.slug, location: value.location, area: `${value.totalArea} м²`, year: String(value.year), duration: value.duration, image: value.image, overview: value.overview, status: value.status };
  if (context.mode === "local") {
    const records = await readLocalRecords<typeof record>("admin-projects.json");
    if (records.some(item => item.slug === value.slug)) return NextResponse.json({ error: "Ийм URL slug бүртгэлтэй байна." }, { status: 409 });
    records.unshift(record); await writeLocalRecords("admin-projects.json", records);
  } else {
    const { data, error } = await context.db.from("projects").insert({ slug: value.slug, title: value.title, general_location: value.location, total_area: value.totalArea, completion_year: value.year, duration: value.duration, house_model_id: value.houseModelId || null, overview: value.overview, status: value.status, created_by: context.user.id, updated_by: context.user.id }).select("id").single();
    if (error) return NextResponse.json({ error: error.code === "23505" ? "Ийм URL slug бүртгэлтэй байна." : error.message }, { status: 400 });
    record.id = data.id;
    const { error: mediaError } = await context.db.from("project_media").insert({ project_id: data.id, media_type: "cover", url: value.image, alt_text: value.title, display_order: 0 });
    if (mediaError) return NextResponse.json({ error: mediaError.message }, { status: 500 });
  }
  return NextResponse.json(record, { status: 201 });
}
