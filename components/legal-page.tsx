import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Mail, Scale, ShieldCheck } from "lucide-react";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type LegalPageProps = {
  intro: string;
  highlights: Array<{ title: string; copy: string }>;
  sections: LegalSection[];
  updatedAt: string;
  contactEmail: string;
  source: { label: string; href: string };
  related: { href: string; eyebrow: string; title: string; copy: string };
};

export function LegalPage({
  intro,
  highlights,
  sections,
  updatedAt,
  contactEmail,
  source,
  related,
}: LegalPageProps) {
  return (
    <section className="legal-page">
      <div className="container legal-layout">
        <aside className="legal-sidebar">
          <div className="legal-sidebar-card">
            <span className="legal-overline">Энэ хуудсанд</span>
            <nav aria-label="Хуудасны гарчиг">
              {sections.map((section, index) => (
                <a href={`#${section.id}`} key={section.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {section.title}
                </a>
              ))}
            </nav>
            <div className="legal-updated">
              <CalendarDays aria-hidden="true" />
              <div><small>Сүүлд шинэчилсэн</small><strong>{updatedAt}</strong></div>
            </div>
          </div>
        </aside>

        <article className="legal-content">
          <header className="legal-summary">
            <div className="legal-summary-heading">
              <ShieldCheck aria-hidden="true" />
              <span>Товч мэдээлэл</span>
            </div>
            <h2>Ойлгомжтой, ил тод нөхцөл</h2>
            <p>{intro}</p>
            <div className="legal-highlights">
              {highlights.map((item, index) => (
                <div key={item.title}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              ))}
            </div>
          </header>

          <div className="legal-sections">
            {sections.map((section, index) => (
              <section className="legal-section" id={section.id} key={section.id}>
                <span className="legal-section-number">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{section.title}</h2>
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          <div className="legal-reference">
            <Scale aria-hidden="true" />
            <div>
              <span>Албан эх сурвалж</span>
              <p>Холбогдох эрх зүйн зохицуулалтын хүчин төгөлдөр эхийг Legalinfo.mn-ээс үзнэ үү.</p>
            </div>
            <a href={source.href} target="_blank" rel="noreferrer">
              {source.label} <ArrowUpRight aria-hidden="true" />
            </a>
          </div>

          <div className="legal-contact-card">
            <div className="legal-contact-icon"><Mail aria-hidden="true" /></div>
            <div>
              <span>Асуух зүйл байна уу?</span>
              <h2>Бидэнтэй шууд холбогдоорой</h2>
              <p>Энэ нөхцөл эсвэл таны мэдээлэлтэй холбоотой хүсэлтийг имэйлээр хүлээн авна.</p>
            </div>
            <a className="button" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </div>

          <Link className="legal-related" href={related.href}>
            <div><span>{related.eyebrow}</span><h3>{related.title}</h3><p>{related.copy}</p></div>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </article>
      </div>
    </section>
  );
}
