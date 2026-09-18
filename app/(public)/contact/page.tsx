import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/page-hero";
import { getPublicSiteSettings } from "@/lib/public-site-settings";

export const metadata = { title: "Холбоо барих" };

export default async function Contact() {
  const settings = await getPublicSiteSettings();
  const phoneHref = settings.phone.replace(/[^+\d]/g, "");

  return <><PageHero eyebrow="Тантай ярилцъя" title="Холбоо барих" copy="Хаусын загвар, газрын нөхцөл, үйлчилгээний талаар асуух зүйлээ бидэнд үлдээнэ үү."/><section className="section"><div className="container contact-grid"><div><h2 className="section-title">Төслөө ярилцахад бэлэн</h2><div className="contact-list"><a className="contact-line" href={`tel:${phoneHref}`}><Phone/> {settings.phone}</a><a className="contact-line" href={`mailto:${settings.email}`}><Mail/> {settings.email}</a><div className="contact-line"><MapPin/> {settings.address}</div><div className="contact-line"><Clock/> {settings.businessHours}</div></div></div><ContactForm/></div></section></>;
}
