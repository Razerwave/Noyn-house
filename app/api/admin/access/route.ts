import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin-auth";

export async function GET() {
  const context = await getAdminContext(["Admin", "Content Editor", "Sales"]);
  if (!context) {
    return NextResponse.json({ error: "Энэ хэрэглэгчид админ эрх холбогдоогүй эсвэл серверийн Supabase key буруу байна." }, { status: 403 });
  }
  return NextResponse.json({ ok: true, role: context.mode === "supabase" ? context.roleName : "Admin" });
}
