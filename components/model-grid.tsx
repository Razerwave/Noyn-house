import Link from "next/link";
import { ArrowRight, BedDouble, Building2, Ruler } from "lucide-react";
import type { PublicHouse } from "@/lib/public-houses";

export function ModelGrid({ models }: { models: PublicHouse[] }) {
  return <div className="cards">{models.map(model => <Link className="card" href={`/houses/${model.slug}`} key={model.id ?? model.slug}><div className="card-image"><img src={model.image} alt={model.name} /><span className="badge">{model.category}</span></div><div className="card-body"><h3>{model.name}</h3><p>{model.description}</p><div className="spec-row"><span><Ruler size={14}/>{model.area}</span><span><Building2 size={14}/>{model.floors} давхар</span><span><BedDouble size={14}/>{model.bedrooms} унтлагын</span></div><span className="text-link">Дэлгэрэнгүй үзэх <ArrowRight size={15}/></span></div></Link>)}</div>;
}
