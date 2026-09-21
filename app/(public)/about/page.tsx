import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, DraftingCompass, Layers3, MessageSquareText, ShieldCheck } from "lucide-react";
import { getPublishedProjects } from "@/lib/public-projects";

export const metadata = { title: "Бидний тухай" };
export const dynamic = "force-dynamic";

const principles = [
  { Icon: MessageSquareText, number: "01", title: "Хэрэгцээг сонсох", copy: "Бэлэн загвар тулгах бус таны гэр бүлийн хэв маяг, газар, төсвөөс эхэлнэ." },
  { Icon: DraftingCompass, number: "02", title: "Нэгдсэн төлөвлөлт", copy: "Архитектур, хийц болон инженерийн шийдлийг нэг зураглалд уялдуулна." },
  { Icon: ClipboardCheck, number: "03", title: "Баримтаар батлах", copy: "Материал, төсөв, ажлын явц болон шийдвэр бүрийг тодорхой баримтжуулна." },
  { Icon: ShieldCheck, number: "04", title: "Чанарыг хянах", copy: "Далд ажлаас өнгөлгөө хүртэл үе шат бүрийг шалгаж, хүлээн авна." },
];

export default async function About() {
  const projects = await getPublishedProjects(3);

  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-image"><Image src="/images/interior.png" alt="Модон хийцтэй дулаан хаусын интерьер" fill priority sizes="(max-width: 900px) 100vw, 56vw" /></div>
        <div className="about-hero-shade" />
        <div className="container about-hero-content">
          <div className="about-hero-copy">
            <div className="eyebrow">NOYON HOUSE · 2020</div>
            <h1>Хауснаас илүү<br />амьдрах орчин.</h1>
            <p>Монгол айлын амьдралын хэв маяг, нутгийн уур амьсгалд нийцсэн орон зайг зөв төлөвлөж, хариуцлагатай бүтээнэ.</p>
            <div className="about-hero-actions"><Link className="button" href="/projects">Хийсэн төслүүд <ArrowRight size={17} /></Link><Link className="about-text-link" href="/contact">Бидэнтэй ярилцах <ArrowRight size={15} /></Link></div>
          </div>
          <div className="about-hero-note"><span>Бидний итгэл үнэмшил</span><strong>Сайн хаус бол зураг, хийц, инженерийн шийдэл болон гүйцэтгэлийн нэгдэл.</strong></div>
        </div>
      </section>

      <section className="about-statement">
        <div className="container about-statement-grid">
          <div><div className="eyebrow">Бидний зорилго</div><h2>Удаан хугацаанд үнэ цэнээ хадгалах орон зай.</h2></div>
          <div className="about-statement-copy">
            <p className="lead">Ноён Хаус нь Канад модон каркасан технологийг Монгол орны эрс тэс уур амьсгал, газар нутгийн нөхцөлд тохируулан зураг төсөл, барилга угсралтын ажлыг гүйцэтгэж байна.</p>
            <p>Загвар сонгохоос эхлээд материалын бэлтгэл, угсралт, инженерийн систем, чанарын хяналт хүртэлх ажлыг нэг багийн уялдаатай төлөвлөлтөөр хэрэгжүүлдэг.</p>
          </div>
        </div>
        <div className="container about-proof-grid">
          <div><strong>2020</strong><span>Компани байгуулагдсан</span></div>
          <div><strong>2023</strong><span>5 давхар барилгын тусгай зөвшөөрөл авсан</span></div>
          <div><strong>Нэгдсэн</strong><span>Зураг төслөөс хүлээлгэн өгөх хүртэл</span></div>
        </div>
      </section>

      <section className="about-history-section">
        <div className="container">
          <div className="about-section-head"><div><div className="eyebrow">Компанийн замнал</div><h2>Өсөлт бүрийн ард<br />чанарын шаардлага.</h2></div><p>Бид технологи, зураг төсөл, багийн чадавхаа шат дараатай хөгжүүлж, илүү цогц төслийг хариуцлагатай гүйцэтгэх сууриа бүрдүүлсэн.</p></div>
          <div className="about-timeline">
            <article><span>01</span><strong>2020</strong><h3>Эхлэл</h3><p>NOYON HOUSE байгуулагдаж, Монголын нөхцөлд тохирсон модон каркасан хаусын шийдлийг хөгжүүлж эхэлсэн.</p></article>
            <article><span>02</span><strong>2023</strong><h3>Чадавхын ахиц</h3><p>5 давхар хүртэлх барилга угсралтын тусгай зөвшөөрөл авч, ажлын цар хүрээ, инженерийн чадавхаа нэмэгдүүлсэн.</p></article>
            <article className="is-current"><span>03</span><strong>Өнөөдөр</strong><h3>Нэгдсэн гүйцэтгэл</h3><p>Төлөвлөлт, материал, угсралт, инженерийн шийдэл, чанарын хяналтыг нэг урсгалаар хэрэгжүүлж байна.</p></article>
          </div>
        </div>
      </section>

      <section className="about-principles-section">
        <div className="container">
          <div className="about-section-head compact"><div><div className="eyebrow">Ажлын зарчим</div><h2>Тодорхой. Нээлттэй.<br />Хариуцлагатай.</h2></div><p>Гэр бүл бүрийн хэрэгцээ өөр. Харин чанартай ажиллах зарчим бүх төсөлд ижил байна.</p></div>
          <div className="about-principles-grid">
            {principles.map(({ Icon, number, title, copy }) => <article key={number}><div><Icon size={23} /><span>{number}</span></div><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="about-technology-section">
        <div className="about-technology-visual"><Image src="/images/karkaz1.png" alt="Модон каркасан ханын бүтэц болон хаусын инженерийн зураг" fill sizes="(max-width: 900px) 100vw, 58vw" /></div>
        <div className="about-technology-copy">
          <div className="eyebrow">Хийц ба технологи</div>
          <h2>Харагдахгүй хэсэгт чанар эхэлдэг.</h2>
          <p>Ханын давхарга, каркасын зангилаа, дулаалга, мембран болон инженерийн шийдлийг тухайн газрын нөхцөл, тооцоонд тулгуурлан сонгоно.</p>
          <ul><li><Layers3 size={17} />Давхарга бүр тодорхой үүрэгтэй</li><li><ClipboardCheck size={17} />Далд ажлын үе шат бүр хяналттай</li><li><ShieldCheck size={17} />Материал, шийдэл төслөөр баталгаажна</li></ul>
          <Link className="button" href="/technology">Технологитой танилцах <ArrowRight size={17} /></Link>
        </div>
      </section>

      {projects.length > 0 && <section className="about-projects-section section">
        <div className="container">
          <div className="about-section-head compact"><div><div className="eyebrow">Бодит гүйцэтгэл</div><h2>Бидний бүтээсэн<br />орон зай.</h2></div><Link className="text-link" href="/projects">Бүх төслийг үзэх <ArrowRight size={16} /></Link></div>
          <div className="about-project-grid">{projects.map((project, index) => <Link href={`/projects/${project.slug}`} key={project.id ?? project.slug}><div><Image src={project.image} alt={project.title} fill sizes="(max-width: 680px) 100vw, 33vw" /><span>{String(index + 1).padStart(2, "0")}</span></div><h3>{project.title}</h3><p>{project.location} · {project.area} · {project.year}</p></Link>)}</div>
        </div>
      </section>}

      <section className="about-cta-section"><div className="container"><div><span>Таны төсөл хаанаас эхлэх вэ?</span><h2>Газрын нөхцөл, хэрэгцээгээ ярилцаад зөв шийдлээс эхэлье.</h2></div><Link className="button" href="/quote">Үнийн санал авах <ArrowRight size={17} /></Link></div></section>
    </main>
  );
}
