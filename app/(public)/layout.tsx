import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// Public content is refreshed on demand by the admin mutation routes. This
// hourly fallback keeps external database edits from remaining stale while
// avoiding a slow Supabase regeneration every minute.
export const revalidate = 3600;

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <><SiteHeader /><main>{children}</main><SiteFooter /></>;
}
