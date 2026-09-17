import { AdminProjectManager } from "@/components/admin-project-manager";
import { AdminShell } from "@/components/admin-shell";
import { projects } from "@/lib/data";

export default function ProjectsAdmin(){return <div className="admin-body"><AdminShell><AdminProjectManager initialItems={projects.map(project => ({ ...project, status: "published" }))}/></AdminShell></div>}
