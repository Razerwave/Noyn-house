import { AdminHouseManager } from "@/components/admin-house-manager";
import { AdminShell } from "@/components/admin-shell";
import { getAdminContext } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HousesAdmin() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) redirect("/admin/login?next=/admin/houses");
  return <div className="admin-body"><AdminShell><AdminHouseManager initialItems={[]} /></AdminShell></div>;
}
