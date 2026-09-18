import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { FeaturedProject } from "@/lib/featured-project";
import { FeaturedProjectVideo } from "@/components/featured-project-video";

export function FeaturedProjectSection({ project }: { project: FeaturedProject }) {
  return <section className="featured-project-section" aria-labelledby="featured-project-title">
    <div className="container featured-project-inner">
      <FeaturedProjectVideo src={project.videoUrl} mobileSrc={project.mobileVideoUrl} poster={project.posterUrl} title={project.title} />
      <div className="featured-project-copy">
        <div className="eyebrow">{project.eyebrow}</div>
        <h2 id="featured-project-title">{project.title}</h2>
        <p>{project.description}</p>
        <ul>{project.benefits.map(benefit => <li key={benefit}><Check size={17} aria-hidden="true" />{benefit}</li>)}</ul>
        <div className="featured-project-actions">
          <Link className="button" href={project.primaryHref}>{project.primaryLabel}<ArrowRight size={16} /></Link>
          <Link className="button featured-project-secondary" href={project.secondaryHref}>{project.secondaryLabel}</Link>
        </div>
      </div>
    </div>
  </section>;
}
