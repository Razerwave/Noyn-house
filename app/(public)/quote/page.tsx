import { Suspense } from "react";
import { PageHero } from "@/components/page-hero";
import { QuoteForm } from "@/components/quote-form";
import { getPublishedHouses } from "@/lib/public-houses";

export const metadata = { title: "Үнийн санал авах" };

export default async function Quote() {
  const models = await getPublishedHouses();
  return (
    <>
      <PageHero
        eyebrow="Төслөө эхлүүлэх"
        title="Үнийн санал авах"
        copy="Дараах мэдээлэл нь бидэнд таны хэрэгцээ, газрын нөхцөлийг ойлгож, зөв зөвлөгөө өгөхөд тусална."
      />
      <section className="section">
        <div className="container">
          <Suspense fallback={<div className="quote-form-loading">Үнийн саналын маягтыг бэлтгэж байна…</div>}>
            <QuoteForm models={models} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
