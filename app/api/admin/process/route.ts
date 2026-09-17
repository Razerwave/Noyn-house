import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin-auth";
import { readLocalValue, writeLocalValue } from "@/lib/local-admin-store";
import { defaultProcessContent, mergeProcessContent, type ProcessContent } from "@/lib/process-content";

const processContentSchema = z.object({
  eyebrow: z.string().trim().min(2).max(80),
  title: z.string().trim().min(2).max(160),
  copy: z.string().trim().min(10).max(1000),
  homeEyebrow: z.string().trim().min(2).max(80),
  homeTitle: z.string().trim().min(2).max(160),
  steps: z.array(z.object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(2).max(160),
    description: z.string().trim().min(5).max(1500),
  })).min(1).max(20),
});

async function readSupabaseContent(context: Extract<Awaited<ReturnType<typeof getAdminContext>>, { mode: "supabase" }>) {
  const [settingResult, stepsResult] = await Promise.all([
    context.db.from("website_settings").select("value").eq("key", "process_page").maybeSingle(),
    context.db.from("process_steps").select("id, title, description").order("display_order"),
  ]);

  if (settingResult.error) throw settingResult.error;
  if (stepsResult.error) throw stepsResult.error;

  const setting = (settingResult.data?.value ?? {}) as Partial<ProcessContent>;
  const steps = (stepsResult.data ?? []).map(step => ({
    id: step.id,
    title: step.title,
    description: step.description ?? "",
  }));
  return mergeProcessContent({ ...setting, steps });
}

export async function GET() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });

  if (context.mode === "local") {
    const saved = await readLocalValue<ProcessContent>("process-content.json");
    return NextResponse.json(mergeProcessContent(saved));
  }

  try {
    return NextResponse.json(await readSupabaseContent(context));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Агуулгыг уншиж чадсангүй.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = processContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Бүх талбарыг бүрэн, зөв оруулна уу.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const content = parsed.data;
  if (context.mode === "local") {
    await writeLocalValue("process-content.json", content);
    return NextResponse.json(content);
  }

  const pageValue = {
    eyebrow: content.eyebrow,
    title: content.title,
    copy: content.copy,
    homeEyebrow: content.homeEyebrow,
    homeTitle: content.homeTitle,
  };

  const { error: settingError } = await context.db.from("website_settings").upsert({
    key: "process_page",
    value: pageValue,
    updated_by: context.user.id,
    updated_at: new Date().toISOString(),
  });
  if (settingError) return NextResponse.json({ error: settingError.message }, { status: 500 });

  const { error: deleteError } = await context.db.from("process_steps").delete().not("id", "is", null);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  const { data: steps, error: insertError } = await context.db.from("process_steps").insert(content.steps.map((step, index) => ({
    title: step.title,
    description: step.description,
    display_order: index,
    status: "published",
    updated_by: context.user.id,
  }))).select("id, title, description").order("display_order");

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  return NextResponse.json({ ...pageValue, steps: steps ?? content.steps });
}
