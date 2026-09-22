import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getPublishedHouse, getPublishedHouses } from "@/lib/public-houses";

export async function generateStaticParams() {
  const houses = await getPublishedHouses();
  return houses.map(house => ({ slug: house.slug }));
}

export default async function HouseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const house = await getPublishedHouse(slug);
  if (!house) notFound();

  return <>
    <div className="detail-hero house-detail-hero"><Image src={house.image} alt={`${house.name} хаус`} fill priority sizes="100vw" /></div>
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="detail-title">
          <div className="eyebrow">{house.category}</div>
          <h1>{house.name}</h1>
          <p className="section-copy">{house.description}</p>
          <div className="stats">
            <div className="stat"><span>НИЙТ ТАЛБАЙ</span><strong>{house.area}</strong></div>
            <div className="stat"><span>ХЭМЖЭЭ</span><strong>{house.dimensions || "—"}</strong></div>
            <div className="stat"><span>ДАВХАР</span><strong>{house.floors}</strong></div>
            <div className="stat"><span>УНТЛАГЫН ӨРӨӨ</span><strong>{house.bedrooms}</strong></div>
            <div className="stat"><span>АРИУН ЦЭВРИЙН ӨРӨӨ</span><strong>{house.bathrooms}</strong></div>
          </div>
          <div className="hero-actions"><Link className="button" href={`/quote?model=${house.slug}`}>Үнийн санал авах <ArrowRight size={17} /></Link></div>
        </div>
        <div className="content-grid section">
          <div className="prose">
            <div className="eyebrow">Загварын тухай</div>
            <h2>{house.name}</h2>
            <p>{house.description}</p>
            {house.images.length > 0 && <div className="project-gallery">{house.images.map((image, index) => <Image src={image} alt={`${house.name} — зураг ${index + 1}`} width={1200} height={860} sizes="(max-width: 680px) 100vw, 50vw" key={image} />)}</div>}
            <h2>Материал ба гүйцэтгэл</h2>
            <p>Каркас, дулаалга, уур болон салхины хамгаалалт, фасад, инженерийн системийн үзүүлэлтүүдийг ажлын зураг болон баталгаажсан төсөвт тусгана.</p>
            <h2>Үнийн мэдээлэл</h2>
            <p><strong>Төслийн нөхцөлөөс хамаарч үнэ тооцно.</strong></p>
          </div>
          <aside><div className="aside-box"><h3>Багцад багтах ажил</h3><ul><li>Архитектур төлөвлөлт</li><li>Хийцийн ажлын зураг</li><li>Материалын тооцоо</li><li>Барилга угсралтын ажил</li><li>Үе шатны чанарын хяналт</li></ul><Link className="button" href={`/quote?model=${house.slug}`}>Хүсэлт илгээх</Link></div></aside>
        </div>
      </div>
    </section>
  </>;
}
