import "server-only";

import { createClient } from "@supabase/supabase-js";
import { readLocalValue } from "@/lib/local-admin-store";
import { defaultProcessContent, mergeProcessContent, type ProcessContent } from "@/lib/process-content";

export async function getPublicProcessContent(): Promise<ProcessContent> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return mergeProcessContent(await readLocalValue<ProcessContent>("process-content.json"));
  }

  const db = createClient(url, anonKey, { auth: { persistSession: false } });
  const [settingResult, stepsResult] = await Promise.all([
    db.from("website_settings").select("value").eq("key", "process_page").maybeSingle(),
    db.from("process_steps").select("id, title, description").eq("status", "published").order("display_order"),
  ]);

  if (settingResult.error || stepsResult.error) return defaultProcessContent;

  const setting = (settingResult.data?.value ?? {}) as Partial<ProcessContent>;
  const steps = (stepsResult.data ?? []).map(step => ({
    id: step.id,
    title: step.title,
    description: step.description ?? "",
  }));

  return mergeProcessContent({ ...setting, steps });
}
