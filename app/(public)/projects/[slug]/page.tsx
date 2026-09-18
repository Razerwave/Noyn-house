import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProject } from "@/lib/public-projects";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) notFound();

  return <>
    <div className="detail-hero" style={{ backgroundImage: `url(${project.image})` }} />
    <section className="section">
      <div className="container content-grid">
        <article className="prose">
          <div className="eyebrow">Дууссан төсөл</div>
          <h1 className="section-title">{project.title}</h1>
          <p>{project.overview}</p>
          {project.video && <video className="project-video" src={project.video} controls preload="metadata" />}
          <div className="stats">
            <div className="stat"><span>БАЙРШИЛ</span><strong>{project.location}</strong></div>
            <div className="stat"><span>ТАЛБАЙ</span><strong>{project.area}</strong></div>
            <div className="stat"><span>ДУУССАН ОН</span><strong>{project.year}</strong></div>
            {project.duration && <div className="stat"><span>ХУГАЦАА</span><strong>{project.duration}</strong></div>}
          </div>
          {project.images.length > 0 && <div className="project-gallery">
            {project.images.map((image, index) => <img src={image} alt={`${project.title} — зураг ${index + 1}`} key={image} />)}
          </div>}
          <h2>Гүйцэтгэлийн тойм</h2>
          <p>{project.overview}</p>
        </article>
        <aside>
          <div className="aside-box">
            <h3>Ижил төсөл эхлүүлэх үү?</h3>
            <p className="section-copy">Таны газар, хэрэгцээний мэдээлэлд үндэслэн зөвлөх холбогдоно.</p>
            <Link className="button" href="/quote">Үнийн санал авах</Link>
          </div>
        </aside>
      </div>
    </section>
  </>;
}
