import Link from "next/link";
import { PageHero } from "@/components/page-hero";

export const metadata = { title: "Бидний тухай" };

export default function About() {
  return <>
    <PageHero eyebrow="NOYON HOUSE" title="Бидний тухай" copy="Монгол айлын амьдралын хэв маяг, нутгийн уур амьсгалд нийцсэн сайн хаусыг зөв төлөвлөж, хариуцлагатай барихыг зорьдог." />
    <section className="split">
      <div className="split-copy">
        <div className="eyebrow">Бидний зорилго</div>
        <h2 className="section-title">Удаан хугацаанд үнэ цэнээ хадгалах орон зай</h2>
        <p className="section-copy">Ноён Хаус нь 2020 оноос хойш Канад модон каркасан технологийг Монгол орны уур амьсгал, газар нутгийн нөхцөлд тохируулан хаусын зураг төсөл, барилга угсралтын ажлыг гүйцэтгэж байна.</p>
        <Link className="button" href="/contact">Холбоо барих</Link>
      </div>
      <div className="split-image" />
    </section>
    <section className="section company-history-section">
      <div className="container">
        <div className="eyebrow">Компанийн түүх</div>
        <h2 className="section-title">Туршлага, зөвшөөрөл</h2>
        <div className="company-history">
          <div className="history-card"><strong>2020</strong><span>NOYON HOUSE компани байгуулагдсан.</span></div>
          <div className="history-card"><strong>2023</strong><span>5 давхар барилгын тусгай зөвшөөрөл авсан.</span></div>
        </div>
      </div>
    </section>
    <section className="section soft">
      <div className="container benefit-grid">
        <div><div className="eyebrow">Ажлын зарчим</div><h2 className="section-title">Тодорхой, нээлттэй, хариуцлагатай</h2></div>
        <div className="benefit-list">
          <div className="benefit"><strong>Хэрэгцээг сонсох</strong><span>Бэлэн загвар тулгах бус амьдралын бодит хэрэгцээнээс эхэлнэ.</span></div>
          <div className="benefit"><strong>Баримтаар батлах</strong><span>Төсөв, материал, ажлын явцыг баримтжуулна.</span></div>
          <div className="benefit"><strong>Нэгдсэн шийдэл</strong><span>Архитектур, хийц, инженерийн хэсгийг уялдуулна.</span></div>
          <div className="benefit"><strong>Чанарын хяналт</strong><span>Далд ажлын үе шат бүрийг шалган хүлээн авна.</span></div>
        </div>
      </div>
    </section>
  </>;
}
