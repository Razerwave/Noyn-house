import "server-only";

import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { readLocalValue } from "@/lib/local-admin-store";
import { defaultSiteSettings, mergeSiteSettings, type SiteSettings } from "@/lib/site-settings";

export const getPublicSiteSettings = cache(async (): Promise<SiteSettings> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return mergeSiteSettings(await readLocalValue<SiteSettings>("site-settings.json"));
  }

  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await db.from("website_settings").select("value").eq("key", "site_settings").maybeSingle();
  if (error) return defaultSiteSettings;
  return mergeSiteSettings(data?.value as Partial<SiteSettings> | null);
});
