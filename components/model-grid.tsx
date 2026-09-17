import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Building2, Ruler } from "lucide-react";
import { models } from "@/lib/data";

export function ModelGrid() {
  return <div className="cards">{models.map(m=><Link className="card" href={`/houses/${m.slug}`} key={m.slug}><div className="card-image"><Image src={m.image} alt={m.name} fill sizes="33vw"/><span className="badge">{m.category}</span></div><div className="card-body"><h3>{m.name}</h3><p>{m.description}</p><div className="spec-row"><span><Ruler size={14}/>{m.area}</span><span><Building2 size={14}/>{m.floors} давхар</span><span><BedDouble size={14}/>{m.bedrooms} унтлагын</span></div><span className="text-link">Дэлгэрэнгүй үзэх <ArrowRight size={15}/></span></div></Link>)}</div>;
}
