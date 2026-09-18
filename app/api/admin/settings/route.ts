import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin-auth";
import { readLocalValue, writeLocalValue } from "@/lib/local-admin-store";
import { mergeSiteSettings, type SiteSettings } from "@/lib/site-settings";

const settingsSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(40),
  phone2: z.string().trim().max(40),
  email: z.string().trim().email().max(160),
  businessHours: z.string().trim().min(2).max(160),
  address: z.string().trim().min(2).max(300),
  siteTitle: z.string().trim().min(2).max(160),
  siteDescription: z.string().trim().min(10).max(500),
});

export async function GET() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });

  if (context.mode === "local") {
    return NextResponse.json(mergeSiteSettings(await readLocalValue<SiteSettings>("site-settings.json")));
  }

  const { data, error } = await context.db.from("website_settings").select("value").eq("key", "site_settings").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mergeSiteSettings(data?.value as Partial<SiteSettings> | null));
}

export async function PUT(request: Request) {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });

  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Бүх талбарыг бүрэн, зөв оруулна уу.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const settings = mergeSiteSettings(parsed.data);
  if (context.mode === "local") {
    await writeLocalValue("site-settings.json", settings);
  } else {
    const { error } = await context.db.from("website_settings").upsert({
      key: "site_settings",
      value: settings,
      updated_by: context.user.id,
      updated_at: new Date().toISOString(),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json(settings);
}
