import "server-only";

import { createClient } from "@supabase/supabase-js";
import { faqs as fallbackFaqs, services as fallbackServices } from "@/lib/data";
import { readLocalRecords } from "@/lib/local-admin-store";

export type PublicService = { id?: string; title: string; description: string; displayOrder: number };
export type PublicFaq = { id?: string; question: string; answer: string; displayOrder: number };
type StoredService = PublicService & { status: "draft" | "published" };
type StoredFaq = PublicFaq & { status: "draft" | "published" };

export async function getPublishedServices(): Promise<PublicService[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    const saved = await readLocalRecords<StoredService>("admin-services.json");
    return saved.length
      ? saved.filter(item => item.status === "published").sort((a, b) => a.displayOrder - b.displayOrder)
      : fallbackServices.map(([title, description], displayOrder) => ({ title, description, displayOrder }));
  }
  const db = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await db.from("services").select("id, title, description, display_order").eq("status", "published").order("display_order");
  if (error) throw new Error(`Үйлчилгээний мэдээллийг уншиж чадсангүй: ${error.message}`);
  return (data ?? []).map(row => ({ id: row.id, title: row.title, description: row.description ?? "", displayOrder: row.display_order ?? 0 }));
}

export async function getPublishedFaqs(): Promise<PublicFaq[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    const saved = await readLocalRecords<StoredFaq>("admin-faqs.json");
    return saved.length
      ? saved.filter(item => item.status === "published").sort((a, b) => a.displayOrder - b.displayOrder)
      : fallbackFaqs.map(([question, answer], displayOrder) => ({ question, answer, displayOrder }));
  }
  const db = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await db.from("faqs").select("id, question, answer, display_order").eq("status", "published").order("display_order");
  if (error) throw new Error(`Түгээмэл асуултыг уншиж чадсангүй: ${error.message}`);
  return (data ?? []).map(row => ({ id: row.id, question: row.question, answer: row.answer, displayOrder: row.display_order ?? 0 }));
}
