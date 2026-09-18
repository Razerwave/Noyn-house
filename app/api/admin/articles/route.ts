import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin-auth";
import { readLocalRecords, writeLocalRecords } from "@/lib/local-admin-store";

const articleSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().min(2).max(80),
  summary: z.string().min(10).max(500),
  content: z.string().min(10).max(20000),
  status: z.enum(["draft", "published"]),
});

type Article = { id: string; title: string; slug: string; category: string; summary: string; content: string; image: string; status: "draft" | "published"; publishedAt?: string };

function parseForm(formData: FormData) {
  return articleSchema.safeParse({
    title: formData.get("title"), slug: formData.get("slug"), category: formData.get("category"),
    summary: formData.get("summary"), content: formData.get("content"), status: formData.get("status"),
  });
}

function toArticle(row: any): Article {
  return {
    id: row.id, title: row.title, slug: row.slug, category: row.category ?? row.article_categories?.name ?? "Мэдээ",
    summary: row.summary ?? "", content: typeof row.content === "string" ? row.content : row.content?.text ?? "",
    image: row.image ?? row.cover_image ?? "/images/hero-house.png", status: row.status, publishedAt: row.published_at,
  };
}

async function findCategoryId(db: any, name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9\u0400-\u04ff]+/g, "-").replace(/^-+|-+$/g, "");
  const existing = await db.from("article_categories").select("id").eq("name", name).maybeSingle();
  if (existing.data?.id) return existing.data.id;
  const created = await db.from("article_categories").insert({ name, slug }).select("id").single();
  return created.data?.id ?? null;
}

export async function GET() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  if (context.mode === "local") return NextResponse.json(await readLocalRecords<Article>("admin-articles.json"));
  const { data, error } = await context.db.from("articles").select("*, article_categories(name)").is("deleted_at", null).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(toArticle));
}

export async function POST(request: Request) {
  return saveArticle(request, "create");
}

export async function PATCH(request: Request) {
  return saveArticle(request, "update");
}

async function saveArticle(request: Request, mode: "create" | "update") {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Илгээсэн мэдээллийн формат буруу байна." }, { status: 400 });
  const parsed = parseForm(formData);
  const id = formData.get("id");
  if (!parsed.success || (mode === "update" && typeof id !== "string")) return NextResponse.json({ error: "Мэдээллээ бүрэн, зөв оруулна уу." }, { status: 400 });
  const value = parsed.data;
  const publishedAt = value.status === "published" ? new Date().toISOString() : undefined;

  if (context.mode === "local") {
    const records = await readLocalRecords<Article>("admin-articles.json");
    if (records.some(item => item.slug === value.slug && item.id !== id)) return NextResponse.json({ error: "Ийм URL slug бүртгэлтэй байна." }, { status: 409 });
    if (mode === "update") {
      const index = records.findIndex(item => item.id === id);
      if (index === -1) return NextResponse.json({ error: "Нийтлэл олдсонгүй." }, { status: 404 });
      const next = { ...records[index], ...value, image: records[index].image, publishedAt: publishedAt ?? records[index].publishedAt };
      records[index] = next; await writeLocalRecords("admin-articles.json", records); return NextResponse.json(next);
    }
    const article: Article = { id: crypto.randomUUID(), ...value, image: "/images/hero-house.png", publishedAt };
    records.unshift(article); await writeLocalRecords("admin-articles.json", records); return NextResponse.json(article, { status: 201 });
  }

  if (mode === "update") {
    const categoryId = await findCategoryId(context.db, value.category);
    const { data, error } = await context.db.from("articles").update({ title: value.title, slug: value.slug, category_id: categoryId, summary: value.summary, content: { text: value.content }, status: value.status, published_at: publishedAt, updated_at: new Date().toISOString() }).eq("id", id).is("deleted_at", null).select("*, article_categories(name)").single();
    if (error) return NextResponse.json({ error: error.code === "23505" ? "Ийм URL slug бүртгэлтэй байна." : error.message }, { status: 400 });
    return NextResponse.json(toArticle(data));
  }
  const categoryId = await findCategoryId(context.db, value.category);
  const { data, error } = await context.db.from("articles").insert({ title: value.title, slug: value.slug, category_id: categoryId, summary: value.summary, content: { text: value.content }, status: value.status, published_at: publishedAt, author_id: context.user.id }).select("*, article_categories(name)").single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Ийм URL slug бүртгэлтэй байна." : error.message }, { status: 400 });
  return NextResponse.json(toArticle(data), { status: 201 });
}

export async function DELETE(request: Request) {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Нийтлэлийн ID шаардлагатай." }, { status: 400 });
  if (context.mode === "local") {
    const records = await readLocalRecords<Article>("admin-articles.json");
    const next = records.filter(item => item.id !== id);
    if (next.length === records.length) return NextResponse.json({ error: "Нийтлэл олдсонгүй." }, { status: 404 });
    await writeLocalRecords("admin-articles.json", next); return NextResponse.json({ ok: true });
  }
  const { error } = await context.db.from("articles").update({ deleted_at: new Date().toISOString() }).eq("id", id).is("deleted_at", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
