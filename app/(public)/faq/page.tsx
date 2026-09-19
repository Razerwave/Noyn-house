import { PageHero } from "@/components/page-hero";
import { getPublishedFaqs } from "@/lib/public-site-content";
export const metadata={title:"Түгээмэл асуултууд"};
export const dynamic = "force-dynamic";
export default async function Faq(){const faqs = await getPublishedFaqs();return <><PageHero eyebrow="Асуулт ба хариулт" title="Түгээмэл асуултууд" copy="Үнэ, барилгын хугацаа, газар, суурь, дулаалга, инженерийн шийдэлтэй холбоотой нийтлэг асуултууд."/><section className="section"><div className="container content-grid"><div><div className="filter-bar"><button className="button dark">Бүгд</button><button className="button ghost" style={{color:'#172126',borderColor:'#ccc'}}>Үнэ</button><button className="button ghost" style={{color:'#172126',borderColor:'#ccc'}}>Технологи</button></div></div><div className="faq-list">{faqs.map(faq=><details key={faq.id ?? faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></div></section></>}
