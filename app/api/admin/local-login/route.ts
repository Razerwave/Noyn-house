import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Production login-д Supabase Auth ашиглана уу." }, { status: 404 });
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return NextResponse.json({ error: "ADMIN_EMAIL болон ADMIN_PASSWORD тохиргоог .env.local-д нэмнэ үү." }, { status: 503 });
  if (body?.email !== email || body.password !== password) return NextResponse.json({ error: "Имэйл эсвэл нууц үг буруу байна." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("noyon_admin_session", "authenticated", { httpOnly: true, sameSite: "lax", secure: false, path: "/", maxAge: 60 * 60 * 8 });
  return response;
}
