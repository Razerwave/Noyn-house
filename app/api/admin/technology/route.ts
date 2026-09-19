import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin-auth";
import { readLocalValue, writeLocalValue } from "@/lib/local-admin-store";
import { mergeTechnologyContent, type TechnologyContent } from "@/lib/technology-content";

const schema = z.object({
  eyebrow: z.string().trim().min(2).max(80), title: z.string().trim().min(2).max(160), copy: z.string().trim().min(10).max(1000),
  wallEyebrow: z.string().trim().min(2).max(80), wallTitle: z.string().trim().min(2).max(160), wallCopy: z.string().trim().min(10).max(1000),
  layers: z.array(z.string().trim().min(2).max(120)).min(1).max(20),
  cards: z.array(z.object({ title: z.string().trim().min(2).max(160), description: z.string().trim().min(5).max(1500) })).min(1).max(30),
});

export async function GET() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  if (context.mode === "local") return NextResponse.json(mergeTechnologyContent(await readLocalValue<TechnologyContent>("technology-content.json")));
  const { data, error } = await context.db.from("website_settings").select("value").eq("key", "technology_page").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mergeTechnologyContent(data?.value as Partial<TechnologyContent> | null));
}

export async function PUT(request: Request) {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Бүх талбарыг бүрэн, зөв оруулна уу." }, { status: 400 });
  const content = mergeTechnologyContent(parsed.data);
  if (context.mode === "local") await writeLocalValue("technology-content.json", content);
  else {
    const { error } = await context.db.from("website_settings").upsert({ key: "technology_page", value: content, updated_by: context.user.id, updated_at: new Date().toISOString() });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  revalidatePath("/technology");
  return NextResponse.json(content);
}
