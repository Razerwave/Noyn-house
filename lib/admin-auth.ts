import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { cache } from "react";

const ADMIN_USER_ID_HEADER = "x-noyon-admin-user-id";

const getBaseAdminContext = cache(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    const cookieStore = await cookies();
    if (process.env.NODE_ENV !== "production" && cookieStore.get("noyon_admin_session")?.value === "authenticated") {
      return { mode: "local" as const, roleName: "Admin" };
    }
    return null;
  }

  let userId = (await headers()).get(ADMIN_USER_ID_HEADER);
  if (!userId) {
    const cookieStore = await cookies();
    const auth = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => undefined,
      },
    });
    const { data, error } = await auth.auth.getClaims();
    userId = data?.claims?.sub ?? null;
    if (error || !userId) return null;
  }

  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: profile } = await db
    .from("profiles")
    .select("role:roles(name)")
    .eq("id", userId)
    .single();
  const roleValue = profile?.role as unknown as { name?: string } | { name?: string }[] | null;
  const roleName = Array.isArray(roleValue) ? roleValue[0]?.name : roleValue?.name;
  if (!roleName) return null;
  return { mode: "supabase" as const, db, user: { id: userId }, roleName };
});

export async function getAdminContext(allowedRoles: string[]) {
  const context = await getBaseAdminContext();
  if (!context || (context.mode === "supabase" && !allowedRoles.includes(context.roleName))) return null;
  return context;
}
