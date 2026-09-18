import "server-only";

import { createClient } from "@supabase/supabase-js";
import { readLocalValue } from "@/lib/local-admin-store";
import { defaultFeaturedProject, isFeaturedProjectLive, mergeFeaturedProject, type FeaturedProject } from "@/lib/featured-project";

export async function getPublicFeaturedProject(): Promise<FeaturedProject | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const value = !url || !key
    ? await readLocalValue<FeaturedProject>("featured-project.json")
    : await readSupabaseValue(url, key);
  const project = mergeFeaturedProject(value ?? defaultFeaturedProject);
  return isFeaturedProjectLive(project) && project.videoUrl ? project : null;
}

async function readSupabaseValue(url: string, key: string) {
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await db.from("website_settings").select("value").eq("key", "featured_project").maybeSingle();
  if (error) return null;
  return data?.value as Partial<FeaturedProject> | null;
}
