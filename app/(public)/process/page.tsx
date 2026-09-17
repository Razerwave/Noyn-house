import { PageHero } from "@/components/page-hero";
import { getPublicProcessContent } from "@/lib/public-process";

export const metadata = { title: "Бид хэрхэн ажилладаг вэ?" };
export const dynamic = "force-dynamic";

export default async function Process() {
  const content = await getPublicProcessContent();

  return <>
    <PageHero eyebrow={content.eyebrow} title={content.title} copy={content.copy} />
    <section className="section"><div className="container"><div className="timeline">
      {content.steps.map((step, index) => <article className="timeline-item" key={step.id ?? `${index}-${step.title}`}>
        <div className="eyebrow">{String(index + 1).padStart(2, "0")} дүгээр үе шат</div>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
      </article>)}
    </div></div></section>
  </>;
}
