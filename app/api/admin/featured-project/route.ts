import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAdminContext } from "@/lib/admin-auth";
import { readLocalValue, writeLocalValue } from "@/lib/local-admin-store";
import { defaultFeaturedProject, mergeFeaturedProject, type FeaturedProject } from "@/lib/featured-project";

const BUCKET = "featured-project-videos";
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const videoTypes: Record<string, string> = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" };
const imageTypes: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
const schema = z.object({
  enabled: z.enum(["true", "false"]).transform(value => value === "true"), eyebrow: z.string().trim().min(2).max(80), title: z.string().trim().min(2).max(160), description: z.string().trim().min(10).max(500),
  benefits: z.string().transform(value => value.split("\n").map(item => item.trim()).filter(Boolean)).pipe(z.array(z.string().min(2).max(160)).min(1).max(6)),
  videoUrl: z.string().trim().url().or(z.literal("")), mobileVideoUrl: z.string().trim().url().or(z.literal("")), posterUrl: z.string().trim().max(500),
  primaryLabel: z.string().trim().min(2).max(80), primaryHref: z.string().trim().min(1).max(300), secondaryLabel: z.string().trim().min(2).max(80), secondaryHref: z.string().trim().min(1).max(300),
  relatedProject: z.string().trim().max(120), startsAt: z.string().trim().max(40), endsAt: z.string().trim().max(40), displayOrder: z.coerce.number().int().min(0).max(999), status: z.enum(["draft", "published"]),
});

export async function GET() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  if (context.mode === "local") return NextResponse.json(mergeFeaturedProject(await readLocalValue<FeaturedProject>("featured-project.json")));
  const { data, error } = await context.db.from("website_settings").select("value").eq("key", "featured_project").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mergeFeaturedProject(data?.value as Partial<FeaturedProject> | null));
}

function fileFrom(form: FormData, name: string) {
  const file = form.get(name);
  return file instanceof File && file.size > 0 ? file : null;
}

function validateFile(file: File | null, types: Record<string, string>, maxSize: number, label: string) {
  if (!file) return null;
  if (!types[file.type]) return `${label}: зөвшөөрөгдөх формат сонгоно уу.`;
  if (file.size > maxSize) return `${label}: файлын хэмжээ хэт их байна.`;
  return null;
}

async function saveLocal(file: File, kind: "video" | "poster") {
  const extension = (kind === "video" ? videoTypes : imageTypes)[file.type];
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads", "featured-project");
  const filePath = path.join(directory, fileName);
  await mkdir(directory, { recursive: true });
  await writeFile(filePath, new Uint8Array(await file.arrayBuffer()));
  return `/uploads/featured-project/${fileName}`;
}

export async function PUT(request: Request) {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Илгээсэн мэдээллийн формат буруу байна." }, { status: 400 });
  const current = context.mode === "local" ? await readLocalValue<FeaturedProject>("featured-project.json") : null;
  const video = fileFrom(form, "videoFile");
  const poster = fileFrom(form, "posterFile");
  const fileError = validateFile(video, videoTypes, MAX_VIDEO_SIZE, "Видео") || validateFile(poster, imageTypes, MAX_IMAGE_SIZE, "Poster зураг");
  if (fileError) return NextResponse.json({ error: fileError }, { status: 400 });
  const parsed = schema.safeParse({
    enabled: form.get("enabled"), eyebrow: form.get("eyebrow"), title: form.get("title"), description: form.get("description"), benefits: form.get("benefits"),
    videoUrl: form.get("videoUrl"), mobileVideoUrl: form.get("mobileVideoUrl"), posterUrl: form.get("posterUrl"), primaryLabel: form.get("primaryLabel"), primaryHref: form.get("primaryHref"), secondaryLabel: form.get("secondaryLabel"), secondaryHref: form.get("secondaryHref"), relatedProject: form.get("relatedProject"), startsAt: form.get("startsAt"), endsAt: form.get("endsAt"), displayOrder: form.get("displayOrder"), status: form.get("status"),
  });
  if (!parsed.success) return NextResponse.json({ error: "Мэдээллээ бүрэн, зөв оруулна уу.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const value = parsed.data;
  let videoUrl = value.videoUrl;
  let posterUrl = value.posterUrl;
  if (context.mode === "local") {
    if (video) videoUrl = await saveLocal(video, "video");
    if (poster) posterUrl = await saveLocal(poster, "poster");
  } else {
    const uploads = [{ file: video, kind: "video" as const }, { file: poster, kind: "poster" as const }];
    for (const upload of uploads) {
      if (!upload.file) continue;
      const extension = (upload.kind === "video" ? videoTypes : imageTypes)[upload.file.type];
      const storagePath = `featured-project/${crypto.randomUUID()}.${extension}`;
      const { error } = await context.db.storage.from(BUCKET).upload(storagePath, new Uint8Array(await upload.file.arrayBuffer()), { contentType: upload.file.type, upsert: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const url = context.db.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
      if (upload.kind === "video") videoUrl = url; else posterUrl = url;
    }
  }
  const result = mergeFeaturedProject({ ...(current ?? {}), ...value, videoUrl, posterUrl });
  if (context.mode === "local") await writeLocalValue("featured-project.json", result);
  else {
    const { error } = await context.db.from("website_settings").upsert({ key: "featured_project", value: result, updated_by: context.user.id, updated_at: new Date().toISOString() });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  revalidatePath("/");
  return NextResponse.json(result);
}
