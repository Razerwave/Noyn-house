import { createClient } from "@supabase/supabase-js";
import { readLocalRecords } from "@/lib/local-admin-store";

export type PublicArticle = { id?: string; title: string; slug: string; category: string; summary: string; content: string; image: string; images?: string[]; status: "draft" | "published"; publishedAt?: string };

const fallbackArticles: PublicArticle[] = [
  { title: "Газраа хаус барихад хэрхэн бэлтгэх вэ?", slug: "gazar-beltyylelt", category: "Газар бэлтгэл", summary: "Хаус барихаас өмнө газрын нөхцөл, дэд бүтэц болон зөвшөөрлөө хэрхэн бэлтгэх тухай.", content: "Газрын байршил, хөрсний нөхцөл, цахилгаан болон усны шийдлээ эхлээд тодорхойлоорой.", image: "/images/hero-house.webp", status: "published" },
  { title: "Хаусын төлөвлөлт эхлэхээс өмнө бодох 7 зүйл", slug: "hausyn-tuluvlult", category: "Хаус төлөвлөлт", summary: "Төлөвлөлтөө эхлэхдээ талбай, гэрэлтүүлэг, хөдөлгөөний урсгалаа зөв шийдэх зөвлөмж.", content: "Өдөр тутмын амьдралын урсгал, хадгалалтын хэрэгцээ, цонхны чиглэлийг төлөвлөлтийн эхэнд тооцно.", image: "/images/interior.webp", status: "published" },
  { title: "Модон каркасан хийцийн үндсэн ойлголт", slug: "modon-karkasan-hiits", category: "Барилгын материал", summary: "Timber-frame технологийн давуу тал, дулаан алдагдлын шийдлийг ойлгох товч гарын авлага.", content: "Модон каркасан хийц нь зөв тооцоо, чанартай дулаалга, салхи чийгний хамгаалалттай хосолж байж үр дүнтэй.", image: "/images/model-nomad.png", status: "published" },
];

function normalizeArticle(row: any): PublicArticle {
  const category = Array.isArray(row.article_categories) ? row.article_categories[0]?.name : row.article_categories?.name;
  const content = typeof row.content === "string" ? row.content : row.content?.text ?? "";
  const images = typeof row.content === "object" && Array.isArray(row.content?.images)
    ? row.content.images
    : [row.cover_image ?? "/images/hero-house.webp"];
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: category ?? "Мэдээ",
    summary: row.summary ?? "",
    content,
    image: row.cover_image ?? images[0] ?? "/images/hero-house.webp",
    images,
    status: "published",
    publishedAt: row.published_at,
  };
}

export async function getPublishedArticles(limit?: number) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    const local = await readLocalRecords<PublicArticle>("admin-articles.json");
    const articles = local.length ? local.filter(article => article.status === "published") : fallbackArticles;
    return typeof limit === "number" ? articles.slice(0, limit) : articles;
  }
  const db = createClient(url, anonKey, { auth: { persistSession: false } });
  let query = db.from("articles").select("id, title, slug, cover_image, summary, content, status, published_at, article_categories(name)").eq("status", "published").is("deleted_at", null).order("published_at", { ascending: false });
  if (typeof limit === "number") query = query.limit(limit);
  const { data, error } = await query;
  if (error) return typeof limit === "number" ? fallbackArticles.slice(0, limit) : fallbackArticles;
  return (data ?? []).map(normalizeArticle);
}

export async function getPublishedArticle(slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    const articles = await getPublishedArticles();
    return articles.find(article => article.slug === slug) ?? null;
  }
  const db = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await db.from("articles").select("id, title, slug, cover_image, summary, content, status, published_at, article_categories(name)").eq("slug", slug).eq("status", "published").is("deleted_at", null).maybeSingle();
  if (error) return fallbackArticles.find(article => article.slug === slug) ?? null;
  return data ? normalizeArticle(data) : null;
}
