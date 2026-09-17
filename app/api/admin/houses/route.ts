import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin-auth";
import { readLocalRecords, writeLocalRecords } from "@/lib/local-admin-store";

const houseSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().min(2).max(100),
  coverImage: z.string().min(1).max(500),
  totalArea: z.coerce.number().positive().max(10000),
  floors: z.coerce.number().int().min(1).max(10),
  bedrooms: z.coerce.number().int().min(0).max(50),
  bathrooms: z.coerce.number().int().min(0).max(50),
  dimensions: z.string().max(100).optional().default(""),
  description: z.string().min(10).max(1200),
  status: z.enum(["draft", "published"]),
});

export async function GET() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  if (context.mode === "local") return NextResponse.json(await readLocalRecords("admin-houses.json"));
  const { data, error } = await context.db.from("house_models").select("*").is("deleted_at", null).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(row => ({ id: row.id, name: row.name, slug: row.slug, category: row.category, image: row.cover_image, area: `${row.total_area} м²`, floors: row.floors, bedrooms: row.bedrooms, bathrooms: row.bathrooms, dimensions: row.dimensions, description: row.short_description, status: row.status })));
}

export async function POST(request: Request) {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  const parsed = houseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Мэдээллээ бүрэн, зөв оруулна уу.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const value = parsed.data;
  const record = { id: crypto.randomUUID(), name: value.name, slug: value.slug, category: value.category, image: value.coverImage, area: `${value.totalArea} м²`, floors: value.floors, bedrooms: value.bedrooms, bathrooms: value.bathrooms, dimensions: value.dimensions, description: value.description, status: value.status };
  if (context.mode === "local") {
    const records = await readLocalRecords<typeof record>("admin-houses.json");
    if (records.some(item => item.slug === value.slug)) return NextResponse.json({ error: "Ийм URL slug бүртгэлтэй байна." }, { status: 409 });
    records.unshift(record); await writeLocalRecords("admin-houses.json", records);
  } else {
    const { data, error } = await context.db.from("house_models").insert({ slug: value.slug, name: value.name, category: value.category, cover_image: value.coverImage, total_area: value.totalArea, floors: value.floors, bedrooms: value.bedrooms, bathrooms: value.bathrooms, dimensions: value.dimensions, short_description: value.description, status: value.status, created_by: context.user.id, updated_by: context.user.id }).select("id").single();
    if (error) return NextResponse.json({ error: error.code === "23505" ? "Ийм URL slug бүртгэлтэй байна." : error.message }, { status: 400 });
    record.id = data.id;
  }
  return NextResponse.json(record, { status: 201 });
}
