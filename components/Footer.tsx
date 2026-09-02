"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <footer className="relative z-[1] bg-[#08090c] border-t border-white/8 pt-16 pb-8 px-6 md:px-[8vw]">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* ─── Brand ─── */}
          <div className="text-center md:col-span-2 md:text-left">
            <Link href="/" className="mx-auto mb-5 block w-fit md:mx-0">
              <Image
                src="/besiktas-belediyesi-logo.png"
                alt="Beşiktaş Belediyesi"
                width={200}
                height={60}
                className="h-6 w-auto object-contain opacity-70 transition-opacity hover:opacity-100 md:h-12"
              />
            </Link>
            <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.15em] uppercase mb-3">
              Dijital Müze Platformu · Kent Belleği Dijital Arşiv
            </p>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-[var(--muted)] md:mx-0">
              Beşiktaş&apos;ın tarihi ve kültürel mirasını interaktif dijital arşivle
              geleceğe taşıyoruz.
            </p>
          </div>

          {/* ─── İletişim ─── */}
          <div>
            <p className="eyebrow mb-4">İletişim</p>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>Nisbetiye Mah. Aytar Cad. No:1</li>
              <li>Beşiktaş / İstanbul</li>
              <li className="pt-1">
                <a
                  href="mailto:dijitalmuze@besiktas.bel.tr"
                  className="text-[var(--accent)] hover:underline"
                >
                  dijitalmuze@besiktas.bel.tr
                </a>
              </li>
              <li className="pt-2 text-xs text-white/25 italic">
                Akademik ortak: Kültür Bilincini Geliştirme Vakfı
              </li>
            </ul>
          </div>

          {/* ─── Sayfalar ─── */}
          <div className="text-center md:text-left">
            <p className="eyebrow mb-4">Sayfalar</p>
            <ul className="flex items-center justify-center gap-2 whitespace-nowrap md:block md:space-y-2">
              {[
                { href: "/",            label: "Anasayfa" },
                { href: "/harita",      label: "Kültür Haritası" },
                { href: "/ansiklopedi", label: "Ansiklopedi" },
                { href: "/hakkimizda", label: "Hakkımızda" },
                { href: "/iletisim",   label: "İletişim" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[11px] text-[var(--muted)] transition-colors duration-200 hover:text-[var(--accent)] md:text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ─── Bottom bar ─── */}
        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--muted)]">
            © 2026 Beşiktaş Belediyesi · Dijital Müze Platformu · Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-white/20">
            Akademik destek: Kültür Bilincini Geliştirme Vakfı
          </p>
        </div>
      </div>
    </footer>
  );
}
