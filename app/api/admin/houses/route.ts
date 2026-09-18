import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin-auth";
import { readLocalRecords, writeLocalRecords } from "@/lib/local-admin-store";

const HOUSE_IMAGE_BUCKET = "house-images";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 12;
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const houseSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().min(2).max(100),
  totalArea: z.coerce.number().positive().max(10000),
  floors: z.coerce.number().int().min(1).max(10),
  bedrooms: z.coerce.number().int().min(0).max(50),
  bathrooms: z.coerce.number().int().min(0).max(50),
  dimensions: z.string().max(100).optional().default(""),
  description: z.string().min(10).max(1200),
  status: z.enum(["draft", "published"]),
});

type HouseRecord = {
  id: string;
  name: string;
  slug: string;
  category: string;
  image: string;
  images: string[];
  area: string;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  dimensions: string;
  description: string;
  status: "draft" | "published";
};

function parseHouse(formData: FormData) {
  return houseSchema.safeParse({
    name: formData.get("name"), slug: formData.get("slug"), category: formData.get("category"),
    totalArea: formData.get("totalArea"), floors: formData.get("floors"), bedrooms: formData.get("bedrooms"),
    bathrooms: formData.get("bathrooms"), dimensions: formData.get("dimensions"),
    description: formData.get("description"), status: formData.get("status"),
  });
}

function validateImages(coverEntry: FormDataEntryValue | null, galleryImages: File[], requireCover = true) {
  const coverImage = coverEntry instanceof File && coverEntry.size > 0 ? coverEntry : null;
  if (requireCover && !coverImage) return "Ковер зураг сонгоно уу.";
  if (galleryImages.length > MAX_GALLERY_IMAGES) return `Нэмэлт зураг ${MAX_GALLERY_IMAGES}-с олон байж болохгүй.`;
  for (const file of [...(coverImage ? [coverImage] : []), ...galleryImages]) {
    if (!IMAGE_EXTENSIONS[file.type]) return `${file.name}: JPG, PNG, WebP эсвэл AVIF зураг сонгоно уу.`;
    if (file.size > MAX_IMAGE_SIZE) return `${file.name}: зургийн хэмжээ 10 MB-с их байна.`;
  }
  return null;
}

async function saveLocalImage(file: File, slug: string) {
  const fileName = `${crypto.randomUUID()}.${IMAGE_EXTENSIONS[file.type]}`;
  const directory = path.join(process.cwd(), "public", "uploads", "houses", slug);
  const filePath = path.join(directory, fileName);
  await mkdir(directory, { recursive: true });
  await writeFile(filePath, new Uint8Array(await file.arrayBuffer()));
  return { url: `/uploads/houses/${slug}/${fileName}`, filePath };
}

function localPathFromUrl(url: string) {
  if (!url.startsWith("/uploads/houses/")) return null;
  const uploadsRoot = path.join(process.cwd(), "public", "uploads", "houses");
  const filePath = path.join(process.cwd(), "public", url);
  return filePath.startsWith(`${uploadsRoot}${path.sep}`) ? filePath : null;
}

function storagePathFromUrl(url: string) {
  const marker = `/storage/v1/object/public/${HOUSE_IMAGE_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  return markerIndex === -1 ? null : decodeURIComponent(url.slice(markerIndex + marker.length));
}

async function uploadHouseImage(db: any, file: File, slug: string) {
  await db.storage.createBucket(HOUSE_IMAGE_BUCKET, {
    public: true,
    fileSizeLimit: MAX_IMAGE_SIZE,
    allowedMimeTypes: Object.keys(IMAGE_EXTENSIONS),
  }).catch(() => undefined);
  const storagePath = `${slug}/${crypto.randomUUID()}.${IMAGE_EXTENSIONS[file.type]}`;
  const { error } = await db.storage.from(HOUSE_IMAGE_BUCKET).upload(storagePath, new Uint8Array(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return { path: storagePath, url: db.storage.from(HOUSE_IMAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl };
}

export async function GET() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  if (context.mode === "local") return NextResponse.json(await readLocalRecords("admin-houses.json"));

  const { data, error } = await context.db.from("house_models").select("*, house_model_media(url, media_type, display_order)").is("deleted_at", null).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(row => {
    const media = ((row.house_model_media ?? []) as { url: string; media_type: string; display_order: number | null }[]).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    return { id: row.id, name: row.name, slug: row.slug, category: row.category, image: row.cover_image, images: media.filter(item => item.media_type === "exterior").map(item => item.url), area: `${row.total_area} м²`, floors: row.floors, bedrooms: row.bedrooms, bathrooms: row.bathrooms, dimensions: row.dimensions, description: row.short_description, status: row.status };
  }));
}

export async function POST(request: Request) {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Илгээсэн мэдээллийн формат буруу байна." }, { status: 400 });
  const parsed = parseHouse(formData);
  if (!parsed.success) return NextResponse.json({ error: "Мэдээллээ бүрэн, зөв оруулна уу.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const coverEntry = formData.get("coverImage");
  const coverImage = coverEntry instanceof File && coverEntry.size > 0 ? coverEntry : null;
  const existingCoverEntry = formData.get("existingCoverImage");
  const existingCoverImage = typeof existingCoverEntry === "string" && /^\/images\/[a-zA-Z0-9._/-]+$/.test(existingCoverEntry) ? existingCoverEntry : null;
  const galleryImages = formData.getAll("galleryImages").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const fileError = validateImages(coverEntry, galleryImages, !existingCoverImage);
  if (fileError) return NextResponse.json({ error: fileError }, { status: 400 });
  const value = parsed.data;

  if (context.mode === "local") {
    const records = await readLocalRecords<HouseRecord>("admin-houses.json");
    if (records.some(item => item.slug === value.slug)) return NextResponse.json({ error: "Ийм URL slug бүртгэлтэй байна." }, { status: 409 });
    const savedPaths: string[] = [];
    try {
      let coverUrl = existingCoverImage ?? "";
      if (coverImage) {
        const savedCover = await saveLocalImage(coverImage, value.slug); savedPaths.push(savedCover.filePath); coverUrl = savedCover.url;
      }
      const images: string[] = [];
      for (const image of galleryImages) {
        const saved = await saveLocalImage(image, value.slug); savedPaths.push(saved.filePath); images.push(saved.url);
      }
      const record: HouseRecord = { id: crypto.randomUUID(), name: value.name, slug: value.slug, category: value.category, image: coverUrl, images, area: `${value.totalArea} м²`, floors: value.floors, bedrooms: value.bedrooms, bathrooms: value.bathrooms, dimensions: value.dimensions, description: value.description, status: value.status };
      records.unshift(record); await writeLocalRecords("admin-houses.json", records);
      return NextResponse.json(record, { status: 201 });
    } catch {
      await Promise.allSettled(savedPaths.map(filePath => unlink(filePath)));
      return NextResponse.json({ error: "Загварын зургийг хадгалж чадсангүй." }, { status: 500 });
    }
  }

  const storagePaths: string[] = [];
  let modelId: string | null = null;
  try {
    let coverUrl = existingCoverImage ?? "";
    const galleryUrls: string[] = [];
    for (const file of [...(coverImage ? [coverImage] : []), ...galleryImages]) {
      const saved = await uploadHouseImage(context.db, file, value.slug);
      storagePaths.push(saved.path);
      if (coverImage && file === coverImage) coverUrl = saved.url; else galleryUrls.push(saved.url);
    }
    const { data, error } = await context.db.from("house_models").insert({ slug: value.slug, name: value.name, category: value.category, cover_image: coverUrl, total_area: value.totalArea, floors: value.floors, bedrooms: value.bedrooms, bathrooms: value.bathrooms, dimensions: value.dimensions, short_description: value.description, status: value.status, created_by: context.user.id, updated_by: context.user.id }).select("id").single();
    if (error) {
      if (error.code === "23505") throw new Error("Ийм URL slug бүртгэлтэй байна.");
      throw error;
    }
    modelId = data.id;
    if (galleryUrls.length) {
      const { error: mediaError } = await context.db.from("house_model_media").insert(galleryUrls.map((url, index) => ({ model_id: data.id, media_type: "exterior", url, alt_text: value.name, display_order: index + 1 })));
      if (mediaError) throw mediaError;
    }
    const record: HouseRecord = { id: data.id, name: value.name, slug: value.slug, category: value.category, image: coverUrl, images: galleryUrls, area: `${value.totalArea} м²`, floors: value.floors, bedrooms: value.bedrooms, bathrooms: value.bathrooms, dimensions: value.dimensions, description: value.description, status: value.status };
    return NextResponse.json(record, { status: 201 });
  } catch (saveError) {
    if (modelId) await context.db.from("house_models").delete().eq("id", modelId);
    if (storagePaths.length) await context.db.storage.from(HOUSE_IMAGE_BUCKET).remove(storagePaths);
    const message = saveError instanceof Error ? saveError.message : "Загварыг хадгалж чадсангүй.";
    return NextResponse.json({ error: message }, { status: message.includes("slug") ? 409 : 500 });
  }
}

export async function PATCH(request: Request) {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Илгээсэн мэдээллийн формат буруу байна." }, { status: 400 });
  const id = z.string().uuid().safeParse(formData.get("id"));
  const parsed = parseHouse(formData);
  if (!id.success || !parsed.success) return NextResponse.json({ error: "Мэдээллээ бүрэн, зөв оруулна уу." }, { status: 400 });
  const coverEntry = formData.get("coverImage");
  const coverImage = coverEntry instanceof File && coverEntry.size > 0 ? coverEntry : null;
  const galleryImages = formData.getAll("galleryImages").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const fileError = validateImages(coverEntry, galleryImages, false);
  if (fileError) return NextResponse.json({ error: fileError }, { status: 400 });
  const value = parsed.data;

  if (context.mode === "local") {
    const records = await readLocalRecords<HouseRecord>("admin-houses.json");
    const index = records.findIndex(house => house.id === id.data);
    if (index === -1) return NextResponse.json({ error: "Хаусын загвар олдсонгүй." }, { status: 404 });
    if (records.some((house, itemIndex) => itemIndex !== index && house.slug === value.slug)) return NextResponse.json({ error: "Ийм URL slug бүртгэлтэй байна." }, { status: 409 });
    const previous = records[index];
    const next: HouseRecord = { ...previous, name: value.name, slug: value.slug, category: value.category, area: `${value.totalArea} м²`, floors: value.floors, bedrooms: value.bedrooms, bathrooms: value.bathrooms, dimensions: value.dimensions, description: value.description, status: value.status, images: previous.images ?? [] };
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
      records[index] = next; await writeLocalRecords("admin-houses.json", records);
      await Promise.allSettled(obsoleteUrls.map(localPathFromUrl).filter((filePath): filePath is string => Boolean(filePath)).map(filePath => unlink(filePath)));
      return NextResponse.json(next);
    } catch {
      await Promise.allSettled(savedPaths.map(filePath => unlink(filePath)));
      return NextResponse.json({ error: "Хаусын загварыг шинэчилж чадсангүй." }, { status: 500 });
    }
  }

  const { data: existing, error: existingError } = await context.db.from("house_models").select("id, cover_image, house_model_media(id, url, media_type, display_order)").eq("id", id.data).is("deleted_at", null).single();
  if (existingError || !existing) return NextResponse.json({ error: "Хаусын загвар олдсонгүй." }, { status: 404 });
  const previousMedia = (existing.house_model_media ?? []) as { id: string; url: string; media_type: string; display_order: number | null }[];
  const storagePaths: string[] = [];
  let newCoverUrl: string | null = null;
  const newGalleryUrls: string[] = [];

  try {
    for (const file of [...(coverImage ? [coverImage] : []), ...galleryImages]) {
      const saved = await uploadHouseImage(context.db, file, value.slug);
      storagePaths.push(saved.path);
      if (coverImage && file === coverImage) newCoverUrl = saved.url; else newGalleryUrls.push(saved.url);
    }

    const { error: updateError } = await context.db.from("house_models").update({ slug: value.slug, name: value.name, category: value.category, cover_image: newCoverUrl ?? existing.cover_image, total_area: value.totalArea, floors: value.floors, bedrooms: value.bedrooms, bathrooms: value.bathrooms, dimensions: value.dimensions, short_description: value.description, status: value.status, updated_by: context.user.id, updated_at: new Date().toISOString() }).eq("id", id.data);
    if (updateError) {
      if (updateError.code === "23505") throw new Error("Ийм URL slug бүртгэлтэй байна.");
      throw updateError;
    }

    let insertedMedia: { id: string }[] = [];
    if (newGalleryUrls.length) {
      const { data, error } = await context.db.from("house_model_media").insert(newGalleryUrls.map((url, index) => ({ model_id: id.data, media_type: "exterior", url, alt_text: value.name, display_order: index + 1 }))).select("id");
      if (error) throw error;
      insertedMedia = data ?? [];
      const previousGallery = previousMedia.filter(media => media.media_type === "exterior");
      if (previousGallery.length) {
        const { error: deleteError } = await context.db.from("house_model_media").delete().in("id", previousGallery.map(media => media.id));
        if (deleteError) {
          if (insertedMedia.length) await context.db.from("house_model_media").delete().in("id", insertedMedia.map(media => media.id));
          throw deleteError;
        }
        const obsoletePaths = previousGallery.map(media => storagePathFromUrl(media.url)).filter((storagePath): storagePath is string => Boolean(storagePath));
        if (obsoletePaths.length) await context.db.storage.from(HOUSE_IMAGE_BUCKET).remove(obsoletePaths);
      }
    }
    if (newCoverUrl) {
      const oldCoverPath = storagePathFromUrl(existing.cover_image ?? "");
      if (oldCoverPath) await context.db.storage.from(HOUSE_IMAGE_BUCKET).remove([oldCoverPath]);
    }

    const images = newGalleryUrls.length ? newGalleryUrls : previousMedia.filter(media => media.media_type === "exterior").sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)).map(media => media.url);
    const record: HouseRecord = { id: id.data, name: value.name, slug: value.slug, category: value.category, image: newCoverUrl ?? existing.cover_image, images, area: `${value.totalArea} м²`, floors: value.floors, bedrooms: value.bedrooms, bathrooms: value.bathrooms, dimensions: value.dimensions, description: value.description, status: value.status };
    return NextResponse.json(record);
  } catch (updateError) {
    if (storagePaths.length) await context.db.storage.from(HOUSE_IMAGE_BUCKET).remove(storagePaths);
    const message = updateError instanceof Error ? updateError.message : "Хаусын загварыг шинэчилж чадсангүй.";
    return NextResponse.json({ error: message }, { status: message.includes("slug") ? 409 : 500 });
  }
}

export async function DELETE(request: Request) {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  const id = z.string().uuid().safeParse(new URL(request.url).searchParams.get("id"));
  if (!id.success) return NextResponse.json({ error: "Хаусын загварын ID буруу байна." }, { status: 400 });

  if (context.mode === "local") {
    const records = await readLocalRecords<HouseRecord>("admin-houses.json");
    const next = records.filter(house => house.id !== id.data);
    if (next.length === records.length) return NextResponse.json({ error: "Хаусын загвар олдсонгүй." }, { status: 404 });
    await writeLocalRecords("admin-houses.json", next);
    return NextResponse.json({ ok: true });
  }

  const { error } = await context.db.from("house_models").update({ deleted_at: new Date().toISOString(), updated_by: context.user.id, updated_at: new Date().toISOString() }).eq("id", id.data).is("deleted_at", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
