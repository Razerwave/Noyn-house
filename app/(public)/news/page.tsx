import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { getPublishedArticles } from "@/lib/articles";

export const metadata = { title: "Мэдээ, зөвлөгөө" };
export default async function News() {
	const articles = await getPublishedArticles();
	return <><PageHero eyebrow="Мэдлэгийн сан" title="Мэдээ, зөвлөгөө" copy="Хаусын төлөвлөлт, газар бэлтгэл, материал ба ашиглалтын талаар хэрэгтэй мэдээлэл."/><section className="section soft"><div className="container">{articles.length ? <div className="cards">{articles.map(article => <Link href={`/news/${article.slug}`} className="card" key={article.id ?? article.slug}><div className="card-image"><Image src={article.image} alt={article.title} fill sizes="(max-width: 680px) 100vw, 33vw"/><span className="badge">{article.category}</span></div><div className="card-body"><h3>{article.title}</h3><p>{article.summary}</p><span className="text-link">Унших →</span></div></Link>)}</div> : <div className="empty-state"><h2>Одоогоор нийтлэл байхгүй байна</h2><p>Шинэ мэдээ, зөвлөгөө удахгүй нэмэгдэнэ.</p></div>}</div></section></>;
}
