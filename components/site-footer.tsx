import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { getPublicSiteSettings } from "@/lib/public-site-settings";
import { Logo } from "./logo";

export async function SiteFooter() {
  const settings = await getPublicSiteSettings();
  const phoneHref = settings.phone.replace(/[^+\d]/g, "");
  const phone2Href = settings.phone2.replace(/[^+\d]/g, "");

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand"><Logo inverse /><p>{settings.siteDescription}</p></div>
        <div className="footer-links"><h4>Үндсэн цэс</h4><Link href="/houses">Хаусын загварууд</Link><Link href="/projects">Хийсэн төслүүд</Link><Link href="/technology">Барилгын технологи</Link><Link href="/news">Мэдээ, зөвлөгөө</Link></div>
        <div className="footer-contact"><h4>Холбоо барих</h4><a href={`tel:${phoneHref}`}><Phone size={15} /> {settings.phone}</a>{settings.phone2 && <a href={`tel:${phone2Href}`}><Phone size={15} /> {settings.phone2}</a>}<a href={`mailto:${settings.email}`}><Mail size={15} /> {settings.email}</a><span><MapPin size={15} /> {settings.address}</span></div>
        <div className="footer-cta"><h4>Хаус барих уу?</h4><p>Таны газар, хэрэгцээнд тохирсон анхны зөвлөгөөг авна уу.</p><Link className="text-link light" href="/quote">Хүсэлт илгээх <ArrowUpRight size={16} /></Link></div>
      </div>
      <div className="container footer-bottom"><span>© 2026 {settings.companyName}</span><div><Link href="/privacy">Нууцлалын бодлого</Link><Link href="/terms">Үйлчилгээний нөхцөл</Link></div></div>
    </footer>
  );
}
