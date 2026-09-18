import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { getPublishedArticle } from "@/lib/articles";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = await getPublishedArticle((await params).slug);
  return article ? { title: article.title, description: article.summary } : { title: "Нийтлэл олдсонгүй" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getPublishedArticle((await params).slug);
  if (!article) notFound();
  const images = article.images?.length ? article.images : [article.image];

  return <>
    <PageHero eyebrow={article.category} title={article.title} copy={article.summary} />
    <article className="section article-detail">
      <div className="container article-shell">
        <Link className="text-link article-back" href="/news"><ArrowLeft size={16} />Мэдээ, зөвлөгөө рүү буцах</Link>
        <div className="article-cover"><Image src={article.image} alt={article.title} fill priority sizes="(max-width: 900px) 100vw, 1160px" /></div>
        <div className="article-content">
          {article.content.split(/\n+/).filter(Boolean).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>)}
        </div>
        {images.length > 1 && <div className="article-gallery">{images.slice(1).map((image, index) => <div key={`${image}-${index}`}><Image src={image} alt={`${article.title} — зураг ${index + 2}`} fill sizes="(max-width: 680px) 100vw, 50vw" /></div>)}</div>}
      </div>
    </article>
  </>;
}
