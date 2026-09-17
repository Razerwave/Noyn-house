import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Building2, DraftingCompass, HardHat, Heart, House, Leaf, Ruler, ShieldCheck, Trees } from "lucide-react";
import { faqs, models, projects } from "@/lib/data";
import { getPublicProcessContent } from "@/lib/public-process";
import { MaterialSection } from "@/components/material-section";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const processContent = await getPublicProcessContent();

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div className="eyebrow">Монголд зориулсан Канад технологи</div>
          <h1>Гэр бүлийн тань<br />маргаашийг бүтээнэ</h1>
          {/* <p>Монголын эрс тэс уур амьсгалд тохируулсан, ухаалаг төлөвлөлттэй timber-frame хаусыг зураг төслөөс түлхүүр гардуулах хүртэл.</p> */}
          <div className="hero-actions"><Link className="button" href="/houses">Хаусын загвар үзэх <ArrowRight size={17} /></Link><Link className="button ghost" href="/quote">Үнийн санал авах</Link></div>
        </div>
        <div className="hero-note">Монгол ахуйд нийцсэн.<br />Канад чанартай.</div>
      </section>
      <section className="trust-strip"><div className="container trust-grid">
        <div className="trust-item"><House /><h3>Ухаалаг төлөвлөлт</h3><p>Гэр бүлийн бодит хэрэгцээнд нийцсэн орон зай.</p></div>
        <div className="trust-item"><ShieldCheck /><h3>Нэгдсэн хяналт</h3><p>Үе шат бүрт баримтжуулсан чанарын шалгалт.</p></div>
        <div className="trust-item"><Leaf /><h3>Эрчим хүчний шийдэл</h3><p>Уур амьсгалд тооцсон хийц ба дулаалга.</p></div>
        <div className="trust-item"><Trees /><h3>Монголд тохируулсан</h3><p>Газар, салхи, хүйтний нөхцөлийг тооцно.</p></div>
      </div></section>
      <section className="split">
        <div className="split-copy"><div className="eyebrow">NOYON HOUSE</div><h2 className="section-title">Хауснаас илүү амьдралын орчин</h2><p className="section-copy">Бид Канад модон каркасан технологийг Монгол орны эрс тэс уур амьсгал, газар нутгийн онцлог, айл бүрийн амьдралын хэв маягтай уялдуулан төлөвлөж, барьдаг.</p><div><Link className="button" href="/about">Бидний тухай <ArrowRight size={17} /></Link></div></div>
        <div className="split-image" role="img" aria-label="Модон каркасан хаусын дулаан интерьер" />
      </section>
      <section className="section soft"><div className="container"><div className="section-head"><div><div className="eyebrow">Онцлох загварууд</div><h2 className="section-title">Танд тохирох орон зай</h2></div><Link className="text-link" href="/houses">Бүх загвар үзэх <ArrowRight size={16} /></Link></div><div className="cards">
        {models.map(model => <Link href={`/houses/${model.slug}`} className="card" key={model.slug}><div className="card-image"><Image src={model.image} alt={`${model.name} хаус`} fill sizes="(max-width:680px) 100vw, 33vw" /><span className="badge">{model.category}</span></div><div className="card-body"><h3>{model.name}</h3><p>{model.description}</p><div className="spec-row"><span><Ruler size={14}/>{model.area}</span><span><Building2 size={14}/>{model.floors} давхар</span><span><BedDouble size={14}/>{model.bedrooms} унтлагын өрөө</span></div><span className="text-link">Дэлгэрэнгүй үзэх <ArrowRight size={15}/></span></div></Link>)}
      </div></div></section>
      <MaterialSection />
      <section className="section"><div className="container benefit-grid"><div><div className="eyebrow">Яагаад timber-frame вэ?</div><h2 className="section-title">Дулаан, бат бөх, уян хатан</h2><p className="section-copy">Хийцийн үзүүлэлт бүрийг төслийн инженерийн тооцоо, баталгаажсан материалын сонголтоор тодорхойлно.</p><Link className="button dark" href="/technology">Технологитой танилцах</Link></div><div className="benefit-list">
        <div className="benefit"><strong>Уур амьсгалд тооцсон</strong><span>Хүйтэн, салхи, хөрсний нөхцөл бүрт тохируулан төлөвлөнө.</span></div><div className="benefit"><strong>Хурдан угсралт</strong><span>Төлөвлөгдсөн дараалал, үйлдвэрийн нарийвчлалтай бэлтгэл.</span></div><div className="benefit"><strong>Уян төлөвлөлт</strong><span>Өрөөний зохион байгуулалтыг амьдралын хэв маягт нийцүүлнэ.</span></div><div className="benefit"><strong>Хяналттай чанар</strong><span>Далд ажлаас өнгөлгөө хүртэл үе шатны шалгалттай.</span></div>
      </div></div></section>
      <section className="section soft"><div className="container"><div className="section-head"><div><div className="eyebrow">Хийсэн төслүүд</div><h2 className="section-title">Бодитоор бүтсэн орон зай</h2></div><Link className="text-link" href="/projects">Бүх төсөл үзэх <ArrowRight size={16}/></Link></div><div className="cards">{projects.map(p=><Link href={`/projects/${p.slug}`} className="card" key={p.slug}><div className="card-image"><Image src={p.image} alt={p.title} fill sizes="33vw" /></div><div className="card-body"><h3>{p.title}</h3><p>{p.location} · {p.area} · {p.year}</p><span className="text-link">Төслийн дэлгэрэнгүй <ArrowRight size={15}/></span></div></Link>)}</div></div></section>
      <section className="section"><div className="container"><div className="section-head"><div><div className="eyebrow">{processContent.homeEyebrow}</div><h2 className="section-title">{processContent.homeTitle}</h2></div><Link className="text-link" href="/process">Дэлгэрэнгүй явц <ArrowRight size={16}/></Link></div><div className="process-grid">{processContent.steps.slice(0,6).map((step,i)=><div className="process-item" key={step.id ?? `${i}-${step.title}`}><b>{String(i+1).padStart(2,'0')}</b><h3>{step.title}</h3><p>{step.description}</p></div>)}</div></div></section>
      <section className="cta-band"><div className="container cta-inner"><h2>Таны газрын нөхцөлд тохирох хаусыг хамтдаа төлөвлөе.</h2><Link className="button" href="/quote">Үнийн санал авах <ArrowRight size={17}/></Link></div></section>
      <section className="section"><div className="container content-grid"><div><div className="eyebrow">Түгээмэл асуултууд</div><h2 className="section-title">Танд хэрэгтэй хариулт</h2></div><div className="faq-list">{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
    </>
  );
}
