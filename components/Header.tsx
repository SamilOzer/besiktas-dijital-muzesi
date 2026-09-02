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
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6">

        {/* ─── Brand ─── */}
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2.5">
          <Image
            src="/besiktas-belediyesi-logo.png"
            alt="Beşiktaş Belediyesi"
            width={160}
            height={48}
            className="h-9 w-auto max-w-[142px] object-contain opacity-90 transition-opacity duration-300 group-hover:opacity-100 sm:h-10 sm:max-w-[160px]"
            priority
          />
          {/* Only show "Dijital Müze" subtitle — logo already has municipality name */}
          <div className="hidden border-l border-white/15 pl-3 sm:block">
            <div className="text-[var(--accent)] text-[11px] font-semibold tracking-[0.15em] uppercase leading-tight">
              Dijital Müze
            </div>
          </div>
        </Link>

        {/* ─── Desktop Navigation ─── */}
        <nav className="hidden min-w-0 items-center gap-0.5 xl:flex">
          {navLinks.map(({ href, label, highlight }) => {
            const isActive = pathname === href;
            if (highlight) {
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-semibold transition-all duration-200 2xl:px-4 2xl:text-sm ${
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
                className={`shrink-0 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200 2xl:px-4 2xl:text-sm ${
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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition-colors hover:border-white/20 hover:text-white xl:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menüyü aç/kapat"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ─── Mobile Dropdown ─── */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full space-y-1 border-b border-white/10 bg-[#0d0e12]/95 px-4 py-4 shadow-2xl backdrop-blur-xl animate-slide-down sm:px-6 xl:hidden">
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
