import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import "./museum.css";

export const metadata: Metadata = {
  title: "Beşiktaş Dijital Müzesi | Beşiktaş Belediyesi & Kültür Bilincini Geliştirme Vakfı",
  description:
    "Beşiktaş'ın tarihi ve kültürel mirasını keşfedin. İnteraktif harita, dijital arşiv ve kent hafızası.",
  keywords:
    "Beşiktaş, dijital müze, tarihi mekanlar, kültürel miras, interaktif harita, İstanbul",
  openGraph: {
    title: "Beşiktaş Dijital Müzesi",
    description: "Beşiktaş'ın zengin kültürel mirasını dijital platformda keşfedin.",
    type: "website",
    locale: "tr_TR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;650;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
