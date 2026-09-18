import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Ноён хаус — Канад технологийн хаус", template: "%s | Ноён хаус" },
  description: "Монгол орны уур амьсгалд тохируулсан Канад модон каркасан хаусын зураг төсөл, барилга угсралт.",
  openGraph: { title: "Ноён хаус", description: "Монгол ахуйд тохирсон, ухаалаг төлөвлөлттэй дулаан хаус.", images: ["/images/hero-house.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn"><body>{children}<Analytics /></body></html>;
}
