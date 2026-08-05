"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Map, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/", label: "Anasayfa" },
  { href: "/harita", label: "Harita", highlight: true },
  { href: "/ansiklopedi", label: "Ansiklopedi" },
  { href: "/katkida-bulun", label: "Katkıda Bulun" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[9000] h-[var(--header-h)] border-b transition-all duration-500 ${
        scrolled
          ? "bg-[#0d0e12]/90 backdrop-blur-xl border-white/8 shadow-2xl shadow-black/30"
          : "bg-transparent backdrop-blur-md border-white/5"
      }`}
    >
      <div className="max-w-screen-2xl mx-auto h-full px-6 flex items-center justify-between">

        {/* ─── Brand ─── */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/besiktas-belediyesi-logo.png"
            alt="Beşiktaş Belediyesi"
            width={160}
            height={48}
            className="h-10 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
            priority
          />
          {/* Only show "Dijital Müze" subtitle — logo already has municipality name */}
          <div className="hidden sm:block border-l border-white/15 pl-3">
            <div className="text-[var(--accent)] text-[11px] font-semibold tracking-[0.15em] uppercase leading-tight">
              Dijital Müze
            </div>
          </div>
        </Link>

        {/* ─── Desktop Navigation ─── */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, highlight }) => {
            const isActive = pathname === href;
            if (highlight) {
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--accent)] text-[#0d0e12] border-[var(--accent)]"
                      : "border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[#0d0e12]"
                  }`}
                >
                  <Map size={14} />
                  {label}
                </Link>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ─── Mobile Menu Toggle ─── */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menüyü aç/kapat"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ─── Mobile Dropdown ─── */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0d0e12]/95 backdrop-blur-xl border-b border-white/10 py-4 px-6 space-y-1 animate-slide-down">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`block py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? "text-[var(--accent)] bg-white/5"
                  : "text-[var(--muted)] hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
