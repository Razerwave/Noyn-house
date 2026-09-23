import "server-only";

import { createClient } from "@supabase/supabase-js";
import { readLocalRecords } from "@/lib/local-admin-store";

export type PublicHouse = {
  id?: string;
  name: string;
  slug: string;
  category: string;
  image: string;
  images: string[];
  area: string;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  dimensions: string;
  description: string;
};

type LocalHouse = PublicHouse & { status?: string };
type HouseMedia = { url: string; media_type: string; display_order: number | null };

export async function getPublishedHouses(limit?: number): Promise<PublicHouse[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    const records = await readLocalRecords<LocalHouse>("admin-houses.json");
    const houses = records.filter(house => house.status === "published").map(house => ({
      id: house.id,
      name: house.name,
      slug: house.slug,
      category: house.category,
      image: house.image,
      images: house.images ?? [],
      area: house.area,
      floors: house.floors,
      bedrooms: house.bedrooms,
      bathrooms: house.bathrooms,
      dimensions: house.dimensions ?? "",
      description: house.description,
    }));
    return typeof limit === "number" ? houses.slice(0, limit) : houses;
  }

  const db = createClient(url, anonKey, { auth: { persistSession: false } });
  let query = db
    .from("house_models")
    .select("id, name, slug, category, cover_image, total_area, floors, bedrooms, bathrooms, dimensions, short_description, house_model_media(url, media_type, display_order)")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (typeof limit === "number") query = query.limit(limit);
  const { data, error } = await query;

  if (error) throw new Error(`Нийтэлсэн хаусын загваруудыг уншиж чадсангүй: ${error.message}`);

  return (data ?? []).map(row => {
    const media = ((row.house_model_media ?? []) as HouseMedia[]).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      category: row.category ?? "Хаусын загвар",
      image: row.cover_image ?? "/images/hero-house.webp",
      images: media.filter(item => item.media_type === "exterior").map(item => item.url),
      area: `${row.total_area ?? 0} м²`,
      floors: row.floors ?? 0,
      bedrooms: row.bedrooms ?? 0,
      bathrooms: row.bathrooms ?? 0,
      dimensions: row.dimensions ?? "",
      description: row.short_description ?? "",
    };
  });
}

export async function getPublishedHouse(slug: string) {
  const houses = await getPublishedHouses();
  return houses.find(house => house.slug === slug);
}
