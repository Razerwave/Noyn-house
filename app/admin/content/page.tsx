import { AdminShell } from "@/components/admin-shell";
import { getAdminContext } from "@/lib/admin-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const sections = [
  { title: "Үйлчилгээ", count: "Үйлчилгээ нэмэх, засах, устгах", href: "/admin/services" },
  { title: "Түгээмэл асуулт", count: "Асуулт, хариулт удирдах", href: "/admin/faqs" },
  { title: "Барилгын технологи", count: "Технологийн мэдээлэл удирдах", href: "/admin/content/technology" },
  { title: "Ажлын дараалал", count: "Хуудасны гарчиг болон үе шатууд", href: "/admin/content/process" },
  { title: "Медиа сан", count: "24 зураг, 3 PDF" },
  { title: "Багийн гишүүд", count: "Мэдээлэл оруулаагүй" },
];

export default async function Content() {
  const context = await getAdminContext(["Admin", "Content Editor"]);
  if (!context) redirect("/admin/login?next=/admin/content");

  return <div className="admin-body"><AdminShell role={context.roleName}>
    <div className="service-grid">{sections.map((section, index) => <article className="service-card" key={section.title}>
      <span>{String(index + 1).padStart(2, "0")}</span><h3>{section.title}</h3><p>{section.count}</p>
      {section.href ? <Link className="text-link" href={section.href}>Удирдах →</Link> : <span className="field-help">Удахгүй</span>}
    </article>)}</div>
  </AdminShell></div>;
}
