import { PageHero } from "@/components/page-hero";
import { QuoteForm } from "@/components/quote-form";
import { getPublishedHouses } from "@/lib/public-houses";

export const metadata = { title: "Үнийн санал авах" };
export const dynamic = "force-dynamic";

export default async function Quote({ searchParams }: { searchParams: Promise<{ model?: string }> }) {
  const [models, params] = await Promise.all([getPublishedHouses(), searchParams]);
  const initialModel = models.some(model => model.slug === params.model) ? params.model : "";
  return (
    <>
      <PageHero
        eyebrow="Төслөө эхлүүлэх"
        title="Үнийн санал авах"
        copy="Дараах мэдээлэл нь бидэнд таны хэрэгцээ, газрын нөхцөлийг ойлгож, зөв зөвлөгөө өгөхөд тусална."
      />
      <section className="section">
        <div className="container">
          <QuoteForm models={models} initialModel={initialModel} />
        </div>
      </section>
    </>
  );
}
