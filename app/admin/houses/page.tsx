import { AdminHouseManager } from "@/components/admin-house-manager";
import { AdminShell } from "@/components/admin-shell";
import { models } from "@/lib/data";

export default function HousesAdmin(){return <div className="admin-body"><AdminShell><AdminHouseManager initialItems={models.map(model => ({ ...model, status: "published" }))}/></AdminShell></div>}
