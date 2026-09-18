import { NextResponse } from "next/server";
import { z } from "zod";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAdminContext } from "@/lib/admin-auth";

const statusSchema = z.enum(["Шинэ", "Холбогдсон", "Мэдээлэл дутуу", "Уулзалт товлосон", "Талбай үзсэн", "Үнийн санал бэлтгэж байгаа", "Үнийн санал илгээсэн", "Гэрээний шатанд", "Гэрээ болсон", "Цуцлагдсан", "Архивласан"]);

export async function PATCH(request: Request) {
  const context = await getAdminContext(["Admin", "Sales"]);
  if (!context) return NextResponse.json({ error: "Нэвтрэх эрх шаардлагатай." }, { status: 401 });
  const body = await request.json().catch(() => null) as { enquiryNumber?: string; status?: string } | null;
  const parsed = z.object({ enquiryNumber: z.string().min(1), status: statusSchema }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Хүсэлтийн дугаар болон төлөв буруу байна." }, { status: 400 });

  if (context.mode === "local") {
    const filePath = path.join(process.cwd(), "data", "enquiries.ndjson");
    const lines = (await readFile(filePath, "utf8")).split("\n").filter(Boolean);
    let found = false;
    const next = lines.map(line => {
      const record = JSON.parse(line) as { enquiry_number?: string; status?: string };
      if (record.enquiry_number !== parsed.data.enquiryNumber) return line;
      found = true; return JSON.stringify({ ...record, status: parsed.data.status });
    });
    if (!found) return NextResponse.json({ error: "Хүсэлт олдсонгүй." }, { status: 404 });
    await writeFile(filePath, `${next.join("\n")}\n`, "utf8");
    return NextResponse.json({ ok: true, enquiryNumber: parsed.data.enquiryNumber, status: parsed.data.status });
  }

  const { data, error } = await context.db.from("quotation_enquiries").update({ status: parsed.data.status, updated_at: new Date().toISOString() }).eq("enquiry_number", parsed.data.enquiryNumber).is("deleted_at", null).select("enquiry_number, status").single();
  if (error || !data) return NextResponse.json({ error: error?.message ?? "Хүсэлт олдсонгүй." }, { status: error?.code === "PGRST116" ? 404 : 400 });
  return NextResponse.json({ ok: true, enquiryNumber: data.enquiry_number, status: data.status });
}
