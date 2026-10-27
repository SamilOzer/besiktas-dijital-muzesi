"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname === "/harita") return null;
  return (
    <footer className="museum-footer">
      <div className="footer-top museum-container">
        <div><Link href="/" className="footer-title">Beşiktaş<br />Dijital Müzesi</Link><p>Birlikte hatırlıyor,<br />geleceğe taşıyoruz.</p></div>
        <nav aria-label="Alt menü"><Link href="/harita">Kültür haritası</Link><Link href="/ansiklopedi">Ansiklopedi</Link><Link href="/hakkimizda">Müze hakkında</Link><Link href="/katkida-bulun">Katkıda bulun</Link><Link href="/iletisim">İletişim</Link></nav>
        <div className="footer-contact"><p>Bir hikâyeniz mi var?</p><a href="mailto:dijitalmuze@besiktas.bel.tr">Bize yazın <ArrowUpRight size={19} aria-hidden="true" /></a><p>Nisbetiye Mah. Aytar Cad. No:1<br />Beşiktaş / İstanbul</p></div>
      </div>
      <div className="footer-bottom museum-container"><span>© 2026 Beşiktaş Belediyesi</span><span>Kültür Bilincini Geliştirme Vakfı iş birliğiyle</span><span>Kent hafızası, herkese açık.</span></div>
    </footer>
  );
}
