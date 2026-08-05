import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

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
    <html lang="tr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
              window.scrollTo(0, 0);
            `,
          }}
        />
      </head>
      <body className="bg-[var(--bg)] text-[var(--ink)] font-sans antialiased selection:bg-[#c5a059]/30">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
