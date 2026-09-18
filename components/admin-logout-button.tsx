"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const supabase = createBrowserClient(url, key);
      await supabase.auth.signOut();
    }
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return <button type="button" className="admin-logout" onClick={logout}>Гарах</button>;
}
