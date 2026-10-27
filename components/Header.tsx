"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/harita", label: "Kültür haritası" },
  { href: "/ansiklopedi", label: "Ansiklopedi" },
  { href: "/hakkimizda", label: "Müze hakkında" },
  { href: "/iletisim", label: "İletişim" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  if (pathname.startsWith("/admin")) return null;
  return (
    <header className="museum-header">
      <a className="skip-link" href="#main-content">İçeriğe geç</a>
      <Link href="/" className="museum-brand" aria-label="Beşiktaş Dijital Müzesi, ana sayfa">
        <svg className="brand-symbol" viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <path d="M5 37V8h16c9 0 14 4 14 10 0 4-3 7-7 8 6 1 9 4 9 8v3H5Z" stroke="currentColor" strokeWidth="2" />
          <path d="M13 37V16h8c4 0 6 1 6 4s-2 5-6 5h-8m0 6h11c4 0 6 2 6 6M5 42h32" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span>Beşiktaş<span>Dijital Müzesi</span></span>
      </Link>
      <nav className="desktop-nav" aria-label="Ana menü">
        {links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}
      </nav>
      <Link className="header-contribute" href="/katkida-bulun">Hafızaya katkı ver <ArrowUpRight size={17} aria-hidden="true" /></Link>
      <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Menüyü kapat" : "Menüyü aç"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      {open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobil menü">
        <Link href="/" onClick={() => setOpen(false)}>Ana sayfa</Link>
        {links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <Link href="/katkida-bulun" onClick={() => setOpen(false)}>Hafızaya katkı ver</Link>
      </nav>}
    </header>
  );
}
