import { PageHero } from "@/components/page-hero";
import { getPublishedServices } from "@/lib/public-site-content";

export const metadata={title:"Үйлчилгээ"};
export const dynamic = "force-dynamic";

export default async function Services(){const services = await getPublishedServices();return <><PageHero eyebrow="Нэг цэгийн үйлчилгээ" title="Үйлчилгээ" copy="Анхны зөвлөгөөнөөс түлхүүр гардуулах хүртэл төслийн бүх үе шатыг нэг баг удирдана."/><section className="section"><div className="container service-grid">{services.map((service,i)=><article className="service-card" key={service.id ?? service.title}><span>{String(i+1).padStart(2,'0')}</span><h3>{service.title}</h3><p>{service.description}</p></article>)}</div></section></>}
