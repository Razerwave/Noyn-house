import { createClient } from "@supabase/supabase-js";
import { readLocalRecords } from "@/lib/local-admin-store";

export type PublicArticle = { id?: string; title: string; slug: string; category: string; summary: string; content: string; image: string; status: "draft" | "published"; publishedAt?: string };

const fallbackArticles: PublicArticle[] = [
  { title: "Газраа хаус барихад хэрхэн бэлтгэх вэ?", slug: "gazar-beltyylelt", category: "Газар бэлтгэл", summary: "Хаус барихаас өмнө газрын нөхцөл, дэд бүтэц болон зөвшөөрлөө хэрхэн бэлтгэх тухай.", content: "Газрын байршил, хөрсний нөхцөл, цахилгаан болон усны шийдлээ эхлээд тодорхойлоорой.", image: "/images/hero-house.png", status: "published" },
  { title: "Хаусын төлөвлөлт эхлэхээс өмнө бодох 7 зүйл", slug: "hausyn-tuluvlult", category: "Хаус төлөвлөлт", summary: "Төлөвлөлтөө эхлэхдээ талбай, гэрэлтүүлэг, хөдөлгөөний урсгалаа зөв шийдэх зөвлөмж.", content: "Өдөр тутмын амьдралын урсгал, хадгалалтын хэрэгцээ, цонхны чиглэлийг төлөвлөлтийн эхэнд тооцно.", image: "/images/interior.png", status: "published" },
  { title: "Модон каркасан хийцийн үндсэн ойлголт", slug: "modon-karkasan-hiits", category: "Барилгын материал", summary: "Timber-frame технологийн давуу тал, дулаан алдагдлын шийдлийг ойлгох товч гарын авлага.", content: "Модон каркасан хийц нь зөв тооцоо, чанартай дулаалга, салхи чийгний хамгаалалттай хосолж байж үр дүнтэй.", image: "/images/model-nomad.png", status: "published" },
];

export async function getPublishedArticles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    const local = await readLocalRecords<PublicArticle>("admin-articles.json");
    return local.length ? local.filter(article => article.status === "published") : fallbackArticles;
  }
  const db = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await db.from("articles").select("id, title, slug, cover_image, summary, content, status, published_at, article_categories(name)").eq("status", "published").is("deleted_at", null).order("published_at", { ascending: false });
  if (error || !data?.length) return fallbackArticles;
  return data.map(row => ({ id: row.id, title: row.title, slug: row.slug, category: (row.article_categories as { name?: string } | null)?.name ?? "Мэдээ", summary: row.summary ?? "", content: typeof row.content === "string" ? row.content : (row.content as { text?: string } | null)?.text ?? "", image: row.cover_image ?? "/images/hero-house.png", images: typeof row.content === "object" && Array.isArray((row.content as { images?: string[] } | null)?.images) ? (row.content as { images: string[] }).images : [row.cover_image ?? "/images/hero-house.png"], status: "published" as const, publishedAt: row.published_at }));
}
