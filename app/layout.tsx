import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { getPublicSiteSettings } from "@/lib/public-site-settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: { default: settings.siteTitle, template: `%s | ${settings.companyName}` },
    description: settings.siteDescription,
    openGraph: { title: settings.siteTitle, description: settings.siteDescription, images: ["/images/hero-house.png"] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn"><body>{children}<Analytics /></body></html>;
}
