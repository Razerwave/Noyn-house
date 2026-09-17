import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "NOYON HOUSE — Канад технологийн хаус", template: "%s | NOYON HOUSE" },
  description: "Монгол орны уур амьсгалд тохируулсан Канад модон каркасан хаусын зураг төсөл, барилга угсралт.",
  openGraph: { title: "NOYON HOUSE", description: "Монгол ахуйд тохирсон, ухаалаг төлөвлөлттэй дулаан хаус.", images: ["/images/hero-house.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn"><body>{children}</body></html>;
}
