import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { getPublishedArticles } from "@/lib/articles";

export const metadata = { title: "Мэдээ, зөвлөгөө" };

export default async function News() {
	const articles = await getPublishedArticles();
	return <><PageHero eyebrow="Мэдлэгийн сан" title="Мэдээ, зөвлөгөө" copy="Хаусын төлөвлөлт, газар бэлтгэл, материал ба ашиглалтын талаар хэрэгтэй мэдээлэл."/><section className="section soft"><div className="container cards">{articles.map(article => <article className="card" key={article.id ?? article.slug}><div className="card-image"><Image src={article.image} alt={article.title} fill sizes="33vw"/><span className="badge">{article.category}</span></div><div className="card-body"><h3>{article.title}</h3><p>{article.summary}</p><span className="text-link">Унших →</span></div></article>)}</div></section></>;
}
