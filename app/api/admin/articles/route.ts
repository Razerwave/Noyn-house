import { NextResponse } from "next/server";
import { z } from "zod";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAdminContext } from "@/lib/admin-auth";
import { readLocalRecords, writeLocalRecords } from "@/lib/local-admin-store";
import { revalidateArticlePages } from "@/lib/public-revalidation";

const articleSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().min(2).max(80),
  summary: z.string().max(500),
  content: z.string().min(10).max(20000),
  status: z.enum(["draft", "published"]),
});
const ARTICLE_IMAGE_BUCKET = "article-images";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_ARTICLE_IMAGES = 12;
const IMAGE_EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

type Article = { id: string; title: string; slug: string; category: string; summary: string; content: string; image: string; images?: string[]; status: "draft" | "published"; publishedAt?: string };

function parseForm(formData: FormData) {
  return articleSchema.safeParse({
    title: formData.get("title"), slug: formData.get("slug"), category: formData.get("category"),
    summary: formData.get("summary"), content: formData.get("content"), status: formData.get("status"),
  });
}

function validateImage(entry: FormDataEntryValue | null, required: boolean) {
  const file = entry instanceof File && entry.size > 0 ? entry : null;
  if (required && !file) return "Нийтлэлийн зураг сонгоно уу.";
  if (!file) return null;
  if (!IMAGE_EXTENSIONS[file.type]) return "JPG, PNG, WebP эсвэл AVIF зураг сонгоно уу.";
  if (file.size > MAX_IMAGE_SIZE) return "Зургийн хэмжээ 10 MB-с их байна.";
  return null;
}

function validateImages(entries: FormDataEntryValue[], required: boolean) {
  const files = entries.filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (required && !files.length) return "Нийтлэлийн зураг сонгоно уу.";
  if (files.length > MAX_ARTICLE_IMAGES) return `Нэг нийтлэлд ${MAX_ARTICLE_IMAGES}-с олон зураг оруулах боломжгүй.`;
  for (const file of files) {
    if (!IMAGE_EXTENSIONS[file.type]) return `${file.name}: JPG, PNG, WebP эсвэл AVIF зураг сонгоно уу.`;
    if (file.size > MAX_IMAGE_SIZE) return `${file.name}: зургийн хэмжээ 10 MB-с их байна.`;
  }
  return null;
}

async function saveLocalImage(file: File, slug: string) {
  const fileName = `${crypto.randomUUID()}.${IMAGE_EXTENSIONS[file.type]}`;
  const directory = path.join(process.cwd(), "public", "uploads", "articles", slug);
  const filePath = path.join(directory, fileName);
  await mkdir(directory, { recursive: true });
  await writeFile(filePath, new Uint8Array(await file.arrayBuffer()));
  return { url: `/uploads/articles/${slug}/${fileName}`, filePath };
}

function localPathFromUrl(url: string) {
  if (!url.startsWith("/uploads/articles/")) return null;
  const root = path.join(process.cwd(), "public", "uploads", "articles");
  const filePath = path.join(process.cwd(), "public", url);
  return filePath.startsWith(`${root}${path.sep}`) ? filePath : null;
}

function storagePathFromUrl(url: string) {
  const marker = `/storage/v1/object/public/${ARTICLE_IMAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}

async function uploadArticleImage(db: any, file: File, slug: string) {
  await db.storage.createBucket(ARTICLE_IMAGE_BUCKET, { public: true }).catch(() => undefined);
  const storagePath = `${slug}/${crypto.randomUUID()}.${IMAGE_EXTENSIONS[file.type]}`;
  const { error } = await db.storage.from(ARTICLE_IMAGE_BUCKET).upload(storagePath, new Uint8Array(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return { path: storagePath, url: db.storage.from(ARTICLE_IMAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl };
}

function toArticle(row: any): Article {
  const content = typeof row.content === "string" ? row.content : row.content?.text ?? "";
  const images = typeof row.content === "object" && Array.isArray(row.content?.images) ? row.content.images : (row.image ? [row.image] : []);
  return {
    id: row.id, title: row.title, slug: row.slug, category: row.category ?? row.article_categories?.name ?? "Мэдээ",
    summary: row.summary ?? "", content, image: row.image ?? row.cover_image ?? "/images/hero-house.webp", images, status: row.status, publishedAt: row.published_at,
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
  const response = await saveArticle(request, "create");
  if (response.ok) revalidateArticlePages();
  return response;
}

export async function PATCH(request: Request) {
  const response = await saveArticle(request, "update");
  if (response.ok) revalidateArticlePages();
  return response;
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
  const imageEntries = formData.getAll("articleImages");
  const imageEntry = imageEntries[0] ?? null;
  const images = imageEntries.filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const image = images[0] ?? null;
  const existingImage = typeof formData.get("existingImage") === "string" ? String(formData.get("existingImage")) : "";
  const imageError = validateImages(imageEntries, mode === "create" && !existingImage);
  if (imageError) return NextResponse.json({ error: imageError }, { status: 400 });
  const publishedAt = value.status === "published" ? new Date().toISOString() : undefined;

  if (context.mode === "local") {
    const records = await readLocalRecords<Article>("admin-articles.json");
    if (records.some(item => item.slug === value.slug && item.id !== id)) return NextResponse.json({ error: "Ийм URL slug бүртгэлтэй байна." }, { status: 409 });
    if (mode === "update") {
      const index = records.findIndex(item => item.id === id);
      if (index === -1) return NextResponse.json({ error: "Нийтлэл олдсонгүй." }, { status: 404 });
      let imageUrl = records[index].image;
      let articleImages = records[index].images ?? (imageUrl ? [imageUrl] : []);
      if (images.length) { articleImages = []; for (const file of images) articleImages.push((await saveLocalImage(file, value.slug)).url); imageUrl = articleImages[0]; }
      const next = { ...records[index], ...value, image: imageUrl, images: articleImages, publishedAt: publishedAt ?? records[index].publishedAt };
      records[index] = next; await writeLocalRecords("admin-articles.json", records); return NextResponse.json(next);
    }
    const articleImages: string[] = [];
    for (const file of images) articleImages.push((await saveLocalImage(file, value.slug)).url);
    const article: Article = { id: crypto.randomUUID(), ...value, image: articleImages[0], images: articleImages, publishedAt };
    records.unshift(article); await writeLocalRecords("admin-articles.json", records); return NextResponse.json(article, { status: 201 });
  }

  let imageUrl = existingImage;
  let articleImages = existingImage ? [existingImage] : [];
  if (images.length) { articleImages = []; for (const file of images) articleImages.push((await uploadArticleImage(context.db, file, value.slug)).url); imageUrl = articleImages[0]; }
  if (mode === "update") {
    const categoryId = await findCategoryId(context.db, value.category);
    const { data, error } = await context.db.from("articles").update({ title: value.title, slug: value.slug, category_id: categoryId, cover_image: imageUrl || null, summary: value.summary, content: { text: value.content, images: articleImages }, status: value.status, published_at: publishedAt, updated_at: new Date().toISOString() }).eq("id", id).is("deleted_at", null).select("*, article_categories(name)").single();
    if (error) return NextResponse.json({ error: error.code === "23505" ? "Ийм URL slug бүртгэлтэй байна." : error.message }, { status: 400 });
    return NextResponse.json(toArticle(data));
  }
  const categoryId = await findCategoryId(context.db, value.category);
  const { data, error } = await context.db.from("articles").insert({ title: value.title, slug: value.slug, category_id: categoryId, cover_image: imageUrl, summary: value.summary, content: { text: value.content, images: articleImages }, status: value.status, published_at: publishedAt, author_id: context.user.id }).select("*, article_categories(name)").single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Ийм URL slug бүртгэлтэй байна." : error.message }, { status: 400 });
  return NextResponse.json(toArticle(data), { status: 201 });
}

async function deleteArticle(request: Request) {
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

export async function DELETE(request: Request) {
  const response = await deleteArticle(request);
  if (response.ok) revalidateArticlePages();
  return response;
}
