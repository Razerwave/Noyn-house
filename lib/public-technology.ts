import "server-only";

import { createClient } from "@supabase/supabase-js";
import { readLocalValue } from "@/lib/local-admin-store";
import { defaultTechnologyContent, mergeTechnologyContent, type TechnologyContent } from "@/lib/technology-content";

export async function getPublicTechnologyContent(): Promise<TechnologyContent> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return mergeTechnologyContent(await readLocalValue<TechnologyContent>("technology-content.json"));
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await db.from("website_settings").select("value").eq("key", "technology_page").maybeSingle();
  if (error) return defaultTechnologyContent;
  return mergeTechnologyContent(data?.value as Partial<TechnologyContent> | null);
}
