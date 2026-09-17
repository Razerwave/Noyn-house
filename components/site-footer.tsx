import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div><Logo inverse /><p>Монгол орны уур амьсгалд тохируулсан Канад модон каркасан хаус.</p></div>
        <div><h4>Үндсэн цэс</h4><Link href="/houses">Хаусын загварууд</Link><Link href="/projects">Хийсэн төслүүд</Link><Link href="/technology">Барилгын технологи</Link><Link href="/news">Мэдээ, зөвлөгөө</Link></div>
        <div><h4>Холбоо барих</h4><a href="tel:+97670000000"><Phone size={15} /> +976 7000 0000</a><a href="mailto:info@noyonhouse.mn"><Mail size={15} /> info@noyonhouse.mn</a><span><MapPin size={15} /> Улаанбаатар, Монгол</span></div>
        <div><h4>Хаус барих уу?</h4><p>Таны газар, хэрэгцээнд тохирсон анхны зөвлөгөөг авна уу.</p><Link className="text-link light" href="/quote">Хүсэлт илгээх <ArrowUpRight size={16} /></Link></div>
      </div>
      <div className="container footer-bottom"><span>© 2026 NOYON HOUSE</span><div><Link href="/privacy">Нууцлалын бодлого</Link><Link href="/terms">Үйлчилгээний нөхцөл</Link></div></div>
    </footer>
  );
}
