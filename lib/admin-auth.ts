import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function getAdminContext(allowedRoles: string[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    const cookieStore = await cookies();
    if (process.env.NODE_ENV !== "production" && cookieStore.get("noyon_admin_session")?.value === "authenticated") return { mode: "local" as const };
    return null;
  }

  const cookieStore = await cookies();
  const auth = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => undefined,
    },
  });
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return null;

  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: profile } = await db
    .from("profiles")
    .select("role:roles(name)")
    .eq("id", user.id)
    .single();
  const roleValue = profile?.role as unknown as { name?: string } | { name?: string }[] | null;
  const roleName = Array.isArray(roleValue) ? roleValue[0]?.name : roleValue?.name;
  if (!roleName || !allowedRoles.includes(roleName)) return null;
  return { mode: "supabase" as const, db, user, roleName };
}
