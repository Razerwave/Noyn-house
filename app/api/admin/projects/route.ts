import { NextResponse } from "next/server";
import { z } from "zod";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAdminContext } from "@/lib/admin-auth";
import { readLocalRecords, writeLocalRecords } from "@/lib/local-admin-store";

const PROJECT_IMAGE_BUCKET = "project-images";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 12;
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const projectSchema = z.object({
  title: z.string().min(2).max(160), slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  location: z.string().min(2).max(180), totalArea: z.coerce.number().positive().max(10000),
  year: z.coerce.number().int().min(1900).max(2200), duration: z.string().max(100).optional().default(""),
  houseModelId: z.string().uuid().optional().or(z.literal("")),
  overview: z.string().min(10).max(3000), status: z.enum(["draft", "published"]),
});

function imageValidationError(coverImage: FormDataEntryValue | null, galleryImages: File[], requireCover = true) {
  const coverFile = coverImage instanceof File && coverImage.size > 0 ? coverImage : null;
  if (requireCover && !coverFile) return "Ковер зураг сонгоно уу.";
  if (galleryImages.length > MAX_GALLERY_IMAGES) return `Gallery-д ${MAX_GALLERY_IMAGES}-с олон зураг оруулах боломжгүй.`;
  for (const file of [...(coverFile ? [coverFile] : []), ...galleryImages]) {
    if (!IMAGE_EXTENSIONS[file.type]) return `${file.name}: JPG, PNG, WebP эсвэл AVIF зураг сонгоно уу.`;
    if (file.size > MAX_IMAGE_SIZE) return `${file.name}: зургийн хэмжээ 10 MB-с их байна.`;
  }
  return null;
}

function videoValidationError(videoEntry: FormDataEntryValue | null) {
  const video = videoEntry instanceof File && videoEntry.size > 0 ? videoEntry : null;
  if (!video) return null;
  if (!VIDEO_EXTENSIONS[video.type]) return `${video.name}: MP4, WebM эсвэл MOV видео сонгоно уу.`;
  if (video.size > MAX_VIDEO_SIZE) return `${video.name}: видеоны хэмжээ 100 MB-с их байна.`;
  return null;
}

async function saveLocalImage(file: File, slug: string) {
  const fileName = `${crypto.randomUUID()}.${IMAGE_EXTENSIONS[file.type]}`;
  const directory = path.join(process.cwd(), "public", "uploads", "projects", slug);
  const filePath = path.join(directory, fileName);
  await mkdir(directory, { recursive: true });
  await writeFile(filePath, new Uint8Array(await file.arrayBuffer()));
  return { url: `/uploads/projects/${slug}/${fileName}`, filePath };
}

async function saveLocalVideo(file: File, slug: string) {
  const fileName = `${crypto.randomUUID()}.${VIDEO_EXTENSIONS[file.type]}`;
  const directory = path.join(process.cwd(), "public", "uploads", "projects", slug);
  const filePath = path.join(directory, fileName);
  await mkdir(directory, { recursive: true });
  await writeFile(filePath, new Uint8Array(await file.arrayBuffer()));
  return { url: `/uploads/projects/${slug}/${fileName}`, filePath };
}

function localPathFromUrl(url: string) {
  if (!url.startsWith("/uploads/projects/")) return null;
  const uploadsRoot = path.join(process.cwd(), "public", "uploads", "projects");
  const filePath = path.join(process.cwd(), "public", url);
  return filePath.startsWith(`${uploadsRoot}${path.sep}`) ? filePath : null;
}

function storagePathFromUrl(url: string) {
  const marker = `/storage/v1/object/public/${PROJECT_IMAGE_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  return markerIndex === -1 ? null : decodeURIComponent(url.slice(markerIndex + marker.length));
}

export async function GET() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  if (context.mode === "local") return NextResponse.json(await readLocalRecords("admin-projects.json"));
  const { data, error } = await context.db.from("projects").select("*, project_media(url, media_type, display_order)").is("deleted_at", null).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data ?? []).map(row => {
    const media = ((row.project_media ?? []) as { url: string; media_type: string; display_order: number | null }[]).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    return { id: row.id, title: row.title, slug: row.slug, location: row.general_location, area: `${row.total_area} м²`, year: String(row.completion_year ?? ""), duration: row.duration, image: media.find(item => item.media_type === "cover")?.url || "/images/hero-house.webp", images: media.filter(item => item.media_type === "gallery").map(item => item.url), overview: row.overview, status: row.status };
  }));
}

export async function POST(request: Request) {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Илгээсэн мэдээллийн формат буруу байна." }, { status: 400 });
  const parsed = projectSchema.safeParse({
    title: formData.get("title"), slug: formData.get("slug"), location: formData.get("location"),
    totalArea: formData.get("totalArea"), year: formData.get("year"), duration: formData.get("duration"),
    houseModelId: formData.get("houseModelId") ?? "", overview: formData.get("overview"), status: formData.get("status"),
  });
  if (!parsed.success) return NextResponse.json({ error: "Мэдээллээ бүрэн, зөв оруулна уу.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const coverEntry = formData.get("coverImage");
  const galleryImages = formData.getAll("galleryImages").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const videoEntry = formData.get("projectVideo");
  const fileError = imageValidationError(coverEntry, galleryImages);
  const videoError = videoValidationError(videoEntry);
  if (fileError || videoError) return NextResponse.json({ error: fileError || videoError }, { status: 400 });
  const coverImage = coverEntry as File;
  const video = videoEntry instanceof File && videoEntry.size > 0 ? videoEntry : null;
  const value = parsed.data;
  if (context.mode === "local") {
    const record = { id: crypto.randomUUID(), title: value.title, slug: value.slug, location: value.location, area: `${value.totalArea} м²`, year: String(value.year), duration: value.duration, image: "", images: [] as string[], video: "", overview: value.overview, status: value.status };
    const records = await readLocalRecords<typeof record>("admin-projects.json");
    if (records.some(item => item.slug === value.slug)) return NextResponse.json({ error: "Ийм URL slug бүртгэлтэй байна." }, { status: 409 });
    const savedPaths: string[] = [];
    try {
      const savedCover = await saveLocalImage(coverImage, value.slug); savedPaths.push(savedCover.filePath); record.image = savedCover.url;
      for (const image of galleryImages) {
        const saved = await saveLocalImage(image, value.slug); savedPaths.push(saved.filePath); record.images.push(saved.url);
      }
      if (video) { const saved = await saveLocalVideo(video, value.slug); savedPaths.push(saved.filePath); record.video = saved.url; }
      records.unshift(record); await writeLocalRecords("admin-projects.json", records);
      return NextResponse.json(record, { status: 201 });
    } catch {
      await Promise.allSettled(savedPaths.map(filePath => unlink(filePath)));
      return NextResponse.json({ error: "Зургийг хадгалж чадсангүй." }, { status: 500 });
    }
  }

  const { data, error } = await context.db.from("projects").insert({ slug: value.slug, title: value.title, general_location: value.location, total_area: value.totalArea, completion_year: value.year, duration: value.duration, house_model_id: value.houseModelId || null, overview: value.overview, status: value.status, created_by: context.user.id, updated_by: context.user.id }).select("id").single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Ийм URL slug бүртгэлтэй байна." : error.message }, { status: 400 });

  const storagePaths: string[] = [];
  const mediaRows: { project_id: string; media_type: string; url: string; alt_text: string; display_order: number }[] = [];
  try {
    const upload = async (file: File, mediaType: string, displayOrder: number) => {
      const extension = IMAGE_EXTENSIONS[file.type] ?? VIDEO_EXTENSIONS[file.type];
      const storagePath = `${value.slug}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await context.db.storage.from(PROJECT_IMAGE_BUCKET).upload(storagePath, new Uint8Array(await file.arrayBuffer()), { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      storagePaths.push(storagePath);
      mediaRows.push({ project_id: data.id, media_type: mediaType, url: context.db.storage.from(PROJECT_IMAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl, alt_text: value.title, display_order: displayOrder });
    };
    await upload(coverImage, "cover", 0);
    for (const [index, file] of galleryImages.entries()) await upload(file, "gallery", index + 1);
    if (video) await upload(video, "video", 0);
    const { error: mediaError } = await context.db.from("project_media").insert(mediaRows);
    if (mediaError) throw mediaError;
    const record = { id: data.id, title: value.title, slug: value.slug, location: value.location, area: `${value.totalArea} м²`, year: String(value.year), duration: value.duration, image: mediaRows[0].url, images: mediaRows.filter(media => media.media_type === "gallery").map(media => media.url), video: mediaRows.find(media => media.media_type === "video")?.url ?? "", overview: value.overview, status: value.status };
    return NextResponse.json(record, { status: 201 });
  } catch (uploadError) {
    if (storagePaths.length) await context.db.storage.from(PROJECT_IMAGE_BUCKET).remove(storagePaths);
    await context.db.from("projects").delete().eq("id", data.id);
    const message = uploadError instanceof Error ? uploadError.message : "Зургийг хадгалж чадсангүй.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Илгээсэн мэдээллийн формат буруу байна." }, { status: 400 });
  const id = z.string().uuid().safeParse(formData.get("id"));
  const parsed = projectSchema.safeParse({
    title: formData.get("title"), slug: formData.get("slug"), location: formData.get("location"),
    totalArea: formData.get("totalArea"), year: formData.get("year"), duration: formData.get("duration"),
    houseModelId: formData.get("houseModelId") ?? "", overview: formData.get("overview"), status: formData.get("status"),
  });
  if (!id.success || !parsed.success) return NextResponse.json({ error: "Мэдээллээ бүрэн, зөв оруулна уу." }, { status: 400 });

  const coverEntry = formData.get("coverImage");
  const coverImage = coverEntry instanceof File && coverEntry.size > 0 ? coverEntry : null;
  const galleryImages = formData.getAll("galleryImages").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const videoEntry = formData.get("projectVideo");
  const video = videoEntry instanceof File && videoEntry.size > 0 ? videoEntry : null;
  const fileError = imageValidationError(coverEntry, galleryImages, false);
  const videoError = videoValidationError(videoEntry);
  if (fileError || videoError) return NextResponse.json({ error: fileError || videoError }, { status: 400 });
  const value = parsed.data;

  if (context.mode === "local") {
    type LocalRecord = { id: string; title: string; slug: string; location: string; area: string; year: string; duration: string; image: string; images: string[]; video?: string; overview: string; status: "draft" | "published" };
    const records = await readLocalRecords<LocalRecord>("admin-projects.json");
    const index = records.findIndex(project => project.id === id.data);
    if (index === -1) return NextResponse.json({ error: "Төсөл олдсонгүй." }, { status: 404 });
    if (records.some((project, itemIndex) => itemIndex !== index && project.slug === value.slug)) return NextResponse.json({ error: "Ийм URL slug бүртгэлтэй байна." }, { status: 409 });

    const previous = records[index];
    const next: LocalRecord = { ...previous, title: value.title, slug: value.slug, location: value.location, area: `${value.totalArea} м²`, year: String(value.year), duration: value.duration, overview: value.overview, status: value.status, images: previous.images ?? [] };
    const savedPaths: string[] = [];
    const obsoleteUrls: string[] = [];
    try {
      if (coverImage) {
        const saved = await saveLocalImage(coverImage, value.slug); savedPaths.push(saved.filePath); obsoleteUrls.push(previous.image); next.image = saved.url;
      }
      if (galleryImages.length) {
        const urls: string[] = [];
        for (const image of galleryImages) {
          const saved = await saveLocalImage(image, value.slug); savedPaths.push(saved.filePath); urls.push(saved.url);
        }
        obsoleteUrls.push(...(previous.images ?? [])); next.images = urls;
      }
      if (video) {
        const saved = await saveLocalVideo(video, value.slug); savedPaths.push(saved.filePath); if (previous.video) obsoleteUrls.push(previous.video); next.video = saved.url;
      }
      records[index] = next; await writeLocalRecords("admin-projects.json", records);
      await Promise.allSettled(obsoleteUrls.map(localPathFromUrl).filter((filePath): filePath is string => Boolean(filePath)).map(filePath => unlink(filePath)));
      return NextResponse.json(next);
    } catch {
      await Promise.allSettled(savedPaths.map(filePath => unlink(filePath)));
      return NextResponse.json({ error: "Төслийг шинэчилж чадсангүй." }, { status: 500 });
    }
  }

  const { data: existing, error: existingError } = await context.db.from("projects").select("id, project_media(id, url, media_type, display_order)").eq("id", id.data).is("deleted_at", null).single();
  if (existingError || !existing) return NextResponse.json({ error: "Төсөл олдсонгүй." }, { status: 404 });
  const previousMedia = (existing.project_media ?? []) as { id: string; url: string; media_type: string; display_order: number | null }[];
  const storagePaths: string[] = [];
  let newCoverUrl: string | null = null;
  const newGalleryUrls: string[] = [];
  let newVideoUrl: string | null = null;

  try {
    for (const file of [...(coverImage ? [coverImage] : []), ...galleryImages, ...(video ? [video] : [])]) {
      const extension = IMAGE_EXTENSIONS[file.type] ?? VIDEO_EXTENSIONS[file.type];
      const storagePath = `${value.slug}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await context.db.storage.from(PROJECT_IMAGE_BUCKET).upload(storagePath, new Uint8Array(await file.arrayBuffer()), { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      storagePaths.push(storagePath);
      const publicUrl = context.db.storage.from(PROJECT_IMAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
      if (coverImage && file === coverImage) newCoverUrl = publicUrl;
      else if (video && file === video) newVideoUrl = publicUrl;
      else newGalleryUrls.push(publicUrl);
    }

    const { error: updateError } = await context.db.from("projects").update({ slug: value.slug, title: value.title, general_location: value.location, total_area: value.totalArea, completion_year: value.year, duration: value.duration, house_model_id: value.houseModelId || null, overview: value.overview, status: value.status, updated_by: context.user.id, updated_at: new Date().toISOString() }).eq("id", id.data);
    if (updateError) {
      if (updateError.code === "23505") throw new Error("Ийм URL slug бүртгэлтэй байна.");
      throw updateError;
    }

    const newMediaRows = [
      ...(newCoverUrl ? [{ project_id: id.data, media_type: "cover", url: newCoverUrl, alt_text: value.title, display_order: 0 }] : []),
      ...newGalleryUrls.map((url, index) => ({ project_id: id.data, media_type: "gallery", url, alt_text: value.title, display_order: index + 1 })),
      ...(newVideoUrl ? [{ project_id: id.data, media_type: "video", url: newVideoUrl, alt_text: value.title, display_order: 0 }] : []),
    ];
    const { data: insertedMedia, error: mediaError } = newMediaRows.length ? await context.db.from("project_media").insert(newMediaRows).select("id") : { data: [], error: null };
    if (mediaError) throw mediaError;

    const replacedMedia = previousMedia.filter(media => (newCoverUrl && media.media_type === "cover") || (newGalleryUrls.length && media.media_type === "gallery") || (newVideoUrl && media.media_type === "video"));
    if (replacedMedia.length) {
      const { error: deleteError } = await context.db.from("project_media").delete().in("id", replacedMedia.map(media => media.id));
      if (deleteError) {
        if (insertedMedia?.length) await context.db.from("project_media").delete().in("id", insertedMedia.map(media => media.id));
        throw deleteError;
      }
      const obsoleteStoragePaths = replacedMedia.map(media => storagePathFromUrl(media.url)).filter((storagePath): storagePath is string => Boolean(storagePath));
      if (obsoleteStoragePaths.length) await context.db.storage.from(PROJECT_IMAGE_BUCKET).remove(obsoleteStoragePaths);
    }

    const coverUrl = newCoverUrl ?? previousMedia.find(media => media.media_type === "cover")?.url ?? "/images/hero-house.webp";
    const galleryUrls = newGalleryUrls.length ? newGalleryUrls : previousMedia.filter(media => media.media_type === "gallery").sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)).map(media => media.url);
    return NextResponse.json({ id: id.data, title: value.title, slug: value.slug, location: value.location, area: `${value.totalArea} м²`, year: String(value.year), duration: value.duration, image: coverUrl, images: galleryUrls, video: newVideoUrl ?? previousMedia.find(media => media.media_type === "video")?.url ?? "", overview: value.overview, status: value.status });
  } catch (updateError) {
    if (storagePaths.length) await context.db.storage.from(PROJECT_IMAGE_BUCKET).remove(storagePaths);
    const message = updateError instanceof Error ? updateError.message : "Төслийг шинэчилж чадсангүй.";
    return NextResponse.json({ error: message }, { status: message.includes("slug") ? 409 : 500 });
  }
}

export async function DELETE(request: Request) {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  const id = z.string().uuid().safeParse(new URL(request.url).searchParams.get("id"));
  if (!id.success) return NextResponse.json({ error: "Төслийн ID буруу байна." }, { status: 400 });

  if (context.mode === "local") {
    type LocalRecord = { id: string };
    const records = await readLocalRecords<LocalRecord>("admin-projects.json");
    const next = records.filter(project => project.id !== id.data);
    if (next.length === records.length) return NextResponse.json({ error: "Төсөл олдсонгүй." }, { status: 404 });
    await writeLocalRecords("admin-projects.json", next);
    return NextResponse.json({ ok: true });
  }

  const { error } = await context.db.from("projects").update({ deleted_at: new Date().toISOString(), updated_by: context.user.id, updated_at: new Date().toISOString() }).eq("id", id.data).is("deleted_at", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
