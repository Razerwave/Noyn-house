"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "./logo";

export function AdminLoginForm({ nextPath = "/admin" }: { nextPath?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      const response = await fetch("/api/admin/local-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        toast.error(result.error || "Нэвтрэх боломжгүй байна.");
        setBusy(false);
        return;
      }
      router.push(nextPath);
      router.refresh();
      return;
    }

    const supabase = createBrowserClient(url, key);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      toast.error("Имэйл эсвэл нууц үг буруу байна.");
      setBusy(false);
      return;
    }

    const accessResponse = await fetch("/api/admin/access", { cache: "no-store" });
    if (!accessResponse.ok) {
      const result = await accessResponse.json().catch(() => ({}));
      toast.error(result.error || "Таны бүртгэлд админ эрх холбогдоогүй байна.");
      setBusy(false);
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  return <form className="login-form" onSubmit={login}>
    <Logo />
    <h2>Админ нэвтрэх</h2>
    <p className="section-copy">Эрх бүхий байгууллагын бүртгэлээр нэвтэрнэ үү.</p>
    <div className="field"><label>Имэйл</label><input name="email" type="email" required placeholder="name@noyonhouse.mn" /></div>
    <div className="field"><label>Нууц үг</label><input name="password" type="password" required /></div>
    <button className="button" style={{ width: "100%" }} disabled={busy}>{busy ? "Нэвтэрч байна…" : "Нэвтрэх"}</button>
  </form>;
}
