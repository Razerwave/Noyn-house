import "server-only";

import { createClient } from "@supabase/supabase-js";
import { readLocalRecords } from "@/lib/local-admin-store";

export type PublicProject = {
  id?: string;
  slug: string;
  title: string;
  location: string;
  area: string;
  year: string;
  duration?: string;
  image: string;
  images: string[];
  video?: string;
  overview: string;
};

type LocalProject = PublicProject & { status?: string };
type ProjectMedia = { url: string; media_type: string; display_order: number | null };

export async function getPublishedProjects(limit?: number): Promise<PublicProject[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    const records = await readLocalRecords<LocalProject>("admin-projects.json");
    const projects = records.filter(project => project.status === "published").map(project => ({
      id: project.id,
      slug: project.slug,
      title: project.title,
      location: project.location,
      area: project.area,
      year: project.year,
      duration: project.duration,
      image: project.image,
      images: project.images ?? [],
      video: project.video,
      overview: project.overview,
    }));
    return typeof limit === "number" ? projects.slice(0, limit) : projects;
  }

  const db = createClient(url, key, { auth: { persistSession: false } });
  let query = db
    .from("projects")
    .select("id, slug, title, general_location, total_area, completion_year, duration, overview, project_media(url, media_type, display_order)")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (typeof limit === "number") query = query.limit(limit);
  const { data, error } = await query;

  if (error) throw new Error(`Нийтэлсэн төслүүдийг уншиж чадсангүй: ${error.message}`);

  return (data ?? []).map(row => {
    const media = ((row.project_media ?? []) as ProjectMedia[]).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    const cover = media.find(item => item.media_type === "cover") ?? media.find(item => item.media_type === "gallery");
    const gallery = media.filter(item => item.media_type === "gallery").map(item => item.url);
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      location: row.general_location ?? "",
      area: `${row.total_area ?? 0} м²`,
      year: String(row.completion_year ?? ""),
      duration: row.duration ?? "",
      image: cover?.url ?? "/images/hero-house.png",
      images: gallery.length > 0 ? gallery : (cover ? [cover.url] : []),
      video: media.find(item => item.media_type === "video")?.url,
      overview: row.overview ?? "",
    };
  });
}

export async function getPublishedProject(slug: string) {
  const projects = await getPublishedProjects();
  return projects.find(project => project.slug === slug);
}
