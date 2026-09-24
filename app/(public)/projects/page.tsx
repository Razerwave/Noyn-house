import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { getPublishedProjects } from "@/lib/public-projects";

export const metadata = { title: "Хийсэн төслүүд" };
export default async function Projects() {
  const projects = await getPublishedProjects();

  return <>
    <PageHero eyebrow="Бидний туршлага" title="Хийсэн төслүүд" copy="Хэрэглэгчийн нууцлалыг хүндэтгэн ерөнхий байршил, төлөвлөлт, гүйцэтгэлийн шийдлээр танилцуулж байна." image={projects[0]?.image ?? "/images/model-khaan.png"} />
    <section className="section soft">
      <div className="container">
        {projects.length > 0 ? <div className="cards">
          {projects.map(project => <Link className="card" href={`/projects/${project.slug}`} prefetch={true} key={project.id ?? project.slug}>
            <div className="card-image">
              <Image src={project.image} alt={project.title} fill sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 33vw" />
              <span className="badge">Дууссан</span>
            </div>
            <div className="card-body">
              <h3>{project.title}</h3>
              <p>{project.location} · {project.area} · {project.year}</p>
              <span className="text-link">Дэлгэрэнгүй <ArrowRight size={15} /></span>
            </div>
          </Link>)}
        </div> : <div className="empty-state">
          <h2>Нийтэлсэн төсөл одоогоор алга</h2>
          <p>Админ хэсгээс төслийн төлөвийг “Нийтлэх” гэж сонгоход энд харагдана.</p>
        </div>}
      </div>
    </section>
  </>;
}
