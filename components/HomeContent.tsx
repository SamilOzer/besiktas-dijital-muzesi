"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Map,
  ChevronDown,
  Landmark,
  Crown,
  Church,
  Trophy,
  Sparkles,
  Clock,
  MapPin,
  BookOpen,
} from "lucide-react";

/* ─── Data ─────────────────────────────────────── */
const stats = [
  { value: "11", label: "Tarihi Mekân", icon: Landmark },
  { value: "5", label: "Kategori", icon: Crown },
  { value: "500+", label: "Yıllık Miras", icon: Clock },
  { value: "∞", label: "Dijital Hafıza", icon: Sparkles },
];

const categories = [
  {
    icon: Crown,
    title: "Saraylar & Kasırlar",
    count: "4",
    description: "Dolmabahçe, Çırağan ve daha fazlası",
    color: "#c5a059",
  },
  {
    icon: Landmark,
    title: "Heykeller & Anıtlar",
    count: "2",
    description: "Barbaros Hayrettin Paşa ve daha fazlası",
    color: "#7dd3fc",
  },
  {
    icon: Church,
    title: "Dini & Kamusal Yapılar",
    count: "3",
    description: "Tarihi camiler, kiliseler ve çeşmeler",
    color: "#a78bfa",
  },
  {
    icon: Trophy,
    title: "Spor & Kültür",
    count: "2",
    description: "BJK Müzesi ve spor tesisleri",
    color: "#34d399",
  },
];



/* ─── Intersection Observer Hook ───────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null!);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ─── Animated Counter ─────────────────────────── */
function AnimatedCounter({ value, visible }: { value: string; visible: boolean }) {
  const [display, setDisplay] = useState("0");
  const numericVal = parseInt(value.replace(/\D/g, ""));
  const suffix = value.replace(/\d/g, "");

  useEffect(() => {
    if (!visible || isNaN(numericVal)) {
      if (visible) setDisplay(value);
      return;
    }
    let start = 0;
    const duration = 1800;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(eased * numericVal);
      setDisplay(current + suffix);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [visible, numericVal, suffix, value]);

  return <>{display}</>;
}

/* ─── Parallax Mouse Tracker ───────────────────── */
function useMouseParallax(factor = 0.02) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setOffset({
        x: (e.clientX - cx) * factor,
        y: (e.clientY - cy) * factor,
      });
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, [factor]);

  return offset;
}

/* ════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════ */
export default function HomeContent() {
  const statsReveal = useReveal(0.2);
  const categoriesReveal = useReveal(0.15);
  const ctaReveal = useReveal(0.2);
  const mouse = useMouseParallax(0.015);

  return (
    <>
      {/* ══════════════════════════════════════════════
          SECTION 1: HERO — Full viewport cinematic hero
          ══════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
      >
        {/* Background layers */}
        <div className="absolute inset-0 z-0">
          {/* Gradient orbs */}
          <div
            className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full opacity-[0.07] blur-[120px]"
            style={{
              background: "radial-gradient(circle, #c5a059, transparent 70%)",
              transform: `translate(${mouse.x * 2}px, ${mouse.y * 2}px)`,
              transition: "transform 0.3s ease-out",
            }}
          />
          <div
            className="absolute bottom-[-30%] left-[-15%] w-[600px] h-[600px] rounded-full opacity-[0.05] blur-[100px]"
            style={{
              background: "radial-gradient(circle, #4466bb, transparent 70%)",
              transform: `translate(${-mouse.x * 1.5}px, ${-mouse.y * 1.5}px)`,
              transition: "transform 0.3s ease-out",
            }}
          />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20">
          {/* Beşiktaş Belediyesi logo — large centered */}
          <div className="mb-10 animate-fade-up">
            <Image
              src="/besiktas-belediyesi-logo.png"
              alt="Beşiktaş Belediyesi"
              width={280}
              height={84}
              className="h-16 md:h-20 w-auto object-contain mx-auto opacity-70"
              priority
            />
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 mb-8">
              <Sparkles size={14} className="text-[var(--accent)]" />
              <span className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase">
                Kent Belleği Dijital Arşiv
              </span>
            </div>
          </div>

          <h1
            className="headline mb-8 animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            Beşiktaş&apos;ın
            <br />
            <span className="gradient-text">Dijital Hafızası</span>
          </h1>

          <p
            className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.35s" }}
          >
            Saraylar, heykeller, tarihi yapılar ve spor mekânlarını keşfedin.
            Yüzlerce yılın kültürel dokusunu dijital arşiv platformuyla yaşatın.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.45s" }}
          >
            <Link href="/harita" className="cta group">
              <Map size={18} />
              Keşfetmeye Başla
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link href="/ansiklopedi" className="cta cta-outline">
              <BookOpen size={16} />
              Ansiklopedi
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--muted)] z-10">
          <div className="w-[1px] h-8 bg-gradient-to-b from-[var(--accent)]/50 to-transparent animate-pulse" />
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg)] to-transparent z-[5]" />
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2: STATISTICS — Animated counters
          ══════════════════════════════════════════════ */}
      <section
        id="istatistikler"
        className="relative py-32 overflow-hidden"
        ref={statsReveal.ref}
      >
        {/* Decorative line */}
        <div className="absolute left-1/2 top-0 w-[1px] h-16 bg-gradient-to-b from-transparent via-[var(--accent)]/30 to-transparent" />

        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="eyebrow mb-4">Dijital Arşiv</p>
            <h2 className="headline-md">
              Rakamlarla
              <br />
              <span className="gradient-text">Kültürel Miras</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <div
                key={label}
                className={`glass rounded-2xl p-4 md:p-5 flex items-center gap-3.5 border border-white/10 group transition-all duration-700 ${
                  statsReveal.visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shrink-0 group-hover:bg-[var(--accent)]/20 transition-all duration-300">
                  <Icon size={20} className="text-[var(--accent)]" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="text-2xl md:text-3xl font-extrabold text-[var(--accent)] leading-tight font-mono">
                    <AnimatedCounter
                      value={value}
                      visible={statsReveal.visible}
                    />
                  </div>
                  <p className="text-xs text-[var(--muted)] font-medium tracking-wide uppercase mt-0.5">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3: CATEGORIES — Interactive hover cards
          ══════════════════════════════════════════════ */}
      <section
        id="kategoriler"
        className="relative py-32"
        ref={categoriesReveal.ref}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: text */}
            <div
              className={`transition-all duration-1000 ${
                categoriesReveal.visible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-12"
              }`}
            >
              <p className="eyebrow mb-4">Kültürel Katmanlar</p>
              <h2 className="headline-md mb-8">
                Tarihin ve Sanatın
                <br />
                <span className="gradient-text">Kesişim Noktası</span>
              </h2>
              <p className="text-lg text-[var(--muted)] leading-relaxed mb-8 max-w-lg">
                Beşiktaş, Bizans&apos;tan Osmanlı&apos;ya, Osmanlı&apos;dan
                Cumhuriyet&apos;e uzanan binlerce yıllık tarihsel dokunun
                üzerinde kurulmuştur. Her köşe taşı bir dönemin izini taşır.
              </p>

              <Link
                href="/harita"
                className="inline-flex items-center gap-2 text-[var(--accent)] text-sm font-semibold group hover:gap-3 transition-all duration-200"
              >
                <MapPin size={16} />
                Haritada Keşfet
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>

            {/* Right: cards */}
            <div className="space-y-4">
              {categories.map(
                ({ icon: Icon, title, count, description, color }, i) => (
                  <div
                    key={title}
                    className={`group relative glass rounded-2xl p-6 border border-white/8 hover:border-white/15 cursor-pointer transition-all duration-500 hover:translate-x-2 ${
                      categoriesReveal.visible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-6"
                    }`}
                    style={{ transitionDelay: `${i * 120 + 200}ms` }}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at 0% 50%, ${color}08, transparent 70%)`,
                      }}
                    />
                    <div className="relative flex items-center gap-5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                        style={{
                          background: `${color}12`,
                          border: `1px solid ${color}25`,
                        }}
                      >
                        <Icon size={22} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3">
                          <h3 className="text-white font-semibold text-base">
                            {title}
                          </h3>
                          <span
                            className="text-xs font-bold"
                            style={{ color }}
                          >
                            {count}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          {description}
                        </p>
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-[var(--muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 shrink-0"
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          SECTION 5: FINAL CTA — Cinematic close
          ══════════════════════════════════════════════ */}
      <section
        id="cta"
        className="relative min-h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden"
        ref={ctaReveal.ref}
      >
        {/* Background treatment */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[100px] bg-[var(--accent)]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, rgba(197,160,89,0.15), transparent 60%)",
            }}
          />
        </div>

        <div
          className={`relative z-10 max-w-3xl mx-auto px-6 transition-all duration-1000 ${
            ctaReveal.visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <p className="eyebrow mb-6">Keşfe Başla</p>
          <h2 className="headline mb-10">
            Beşiktaş Kültür
            <br />
            <span className="gradient-text">Haritasını Aç</span>
          </h2>
          <p className="text-lg text-[var(--muted)] mb-12 leading-relaxed max-w-xl mx-auto">
            11 tarihi mekânı, 5 kategoriyi ve yüzlerce yıllık mirası
            interaktif haritamızda keşfedin. Her pin bir hikâye, her mekân bir
            kültür katmanı.
          </p>
          <Link href="/harita" className="cta text-lg px-10 py-5 group">
            <Map size={22} />
            Kültür Haritasını Aç
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <p className="mt-8 text-xs text-[var(--muted)]">
            Beşiktaş Belediyesi · Kent Belleği Dijital Arşiv
          </p>
        </div>
      </section>
    </>
  );
}
