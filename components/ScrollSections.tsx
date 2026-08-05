"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Map, ChevronDown } from "lucide-react";

const stats = [
  { value: "11", label: "Tarihi Mekân" },
  { value: "5", label: "Kategori" },
  { value: "500+", label: "Yıllık Miras" },
  { value: "∞", label: "Dijital Hafıza" },
];

export default function ScrollSections() {
  const mirasRef = useRef<HTMLDivElement>(null!);
  const [mirasVisible, setMirasVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setMirasVisible(true); },
      { threshold: 0.3 }
    );
    if (mirasRef.current) obs.observe(mirasRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="section-stack">

      {/* ── 1. HERO ──────────────────────────────────────── */}
      <section
        id="hero"
        className="scroll-section min-h-screen flex flex-col items-center justify-center text-center relative"
      >
        <div className="max-w-5xl mx-auto px-6 py-24">
          <p className="eyebrow mb-6 animate-fade-up">Beşiktaş Belediyesi</p>
          <h1 className="headline mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Beşiktaş&apos;ın
            <br />
            <span className="gradient-text">Dijital Hafızası</span>
          </h1>
          <p
            className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Heykeller, saraylar, tarihi yapılar ve spor mekânlarını keşfedin. Beşiktaş&apos;ın
            zengin kültürel dokusunu Belediye&apos;nin dijital arşiv platformuyla yaşatın.
          </p>
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link href="/harita" className="cta">
              <Map size={18} />
              Keşfetmeye Başla
              <ArrowRight size={16} />
            </Link>
            <Link href="/hakkimizda" className="cta cta-outline">
              Proje Hakkında
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--muted)] animate-bounce">
          <span className="text-xs tracking-widest uppercase">Kaydır</span>
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ── 2. KATMANLAR ─────────────────────────────────── */}
      <section id="katmanlar" className="scroll-section min-h-screen">
        <div className="max-w-4xl mx-auto">
          <p className="eyebrow mb-4">Kültürel Katmanlar</p>
          <h2 className="headline-md mb-8">
            Tarihin ve Sanatın
            <br />
            <span className="gradient-text">Kesişim Noktası</span>
          </h2>
          <p className="text-xl text-[var(--muted)] leading-relaxed max-w-2xl">
            Beşiktaş, Bizans&apos;tan Osmanlı&apos;ya, Osmanlı&apos;dan Cumhuriyet&apos;e uzanan
            binlerce yıllık bir tarihsel dokunun üzerinde kurulmuştur. Her köşe taşı bir
            dönemin izini, her yapı bir kültürün hafızasını taşır.
          </p>

          {/* Initiative badge */}
          <div className="mt-10 inline-flex items-center gap-3 glass rounded-2xl px-5 py-3 border border-white/10">
            <span className="text-xl">🏛️</span>
            <div>
              <div className="text-xs text-[var(--accent)] font-semibold uppercase tracking-widest">
                Beşiktaş Belediyesi Girişimi
              </div>
              <div className="text-sm text-white font-medium">Kent Belleği Dijital Arşiv Projesi</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. MİRAS ── Stats ────────────────────────────── */}
      <section id="miras" className="scroll-section min-h-screen" ref={mirasRef}>
        <div className="max-w-5xl mx-auto w-full">
          <p className="eyebrow mb-6 text-center">Dijital Arşiv</p>
          <h2 className="headline-md mb-16 text-center">
            Heykeller, Saraylar,
            <br />
            <span className="gradient-text">Tarihi Evler</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="stat-number mb-2">{value}</div>
                <p className="text-sm text-[var(--muted)] tracking-wide uppercase">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "🏰", label: "Saraylar & Kasırlar", count: "4" },
              { icon: "🗿", label: "Heykeller & Anıtlar", count: "2" },
              { icon: "⛪", label: "Dini & Kamusal Yapılar", count: "3" },
            ].map(({ icon, label, count }) => (
              <div
                key={label}
                className="glass rounded-2xl p-6 flex items-center gap-4 border border-white/8"
              >
                <span className="text-3xl">{icon}</span>
                <div>
                  <div className="text-2xl font-bold text-[var(--accent)]">{count}</div>
                  <div className="text-xs text-[var(--muted)] leading-snug">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. BELEDİYE VİZYONU ─────────────────────────── */}
      <section id="vizyon" className="scroll-section min-h-screen">
        <div className="max-w-4xl mx-auto">
          <p className="eyebrow mb-6">Beşiktaş Belediyesi</p>
          <h2 className="headline-md mb-8">
            Kent Hafızasını
            <br />
            <span className="gradient-text">Geleceğe Taşıyoruz</span>
          </h2>

          {/* Mission statement — municipality first, vakıf as supporting partner */}
          <p className="text-lg text-[var(--muted)] leading-relaxed mb-10 max-w-2xl">
            Beşiktaş Belediyesi olarak, ilçemizin sahip olduğu zengin tarihi mirası dijital
            çağın olanaklarıyla vatandaşlarımıza ve tüm dünyaya sunuyoruz. Kültürel belgeleme
            çalışmaları, Kültür Bilincini Geliştirme Vakfı işbirliğiyle akademik titizlikte
            yürütülmektedir.
          </p>

          {/* Municipality as primary, vakıf as partner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-6 border border-[var(--accent)]/30 md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/40 flex items-center justify-center">
                  <span className="text-lg">🏛️</span>
                </div>
                <div>
                  <div className="text-xs text-[var(--accent)] uppercase tracking-widest font-semibold">
                    Proje Sahibi
                  </div>
                  <div className="text-white font-bold">Beşiktaş Belediyesi</div>
                </div>
              </div>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                İnteraktif harita, dijital arşiv ve kent hafızası platformunu tasarlayan ve
                yürüten kurum. Vatandaşlara açık, sürekli güncellenen bir kültürel referans
                kaynağı oluşturma hedefiyle hayata geçirilmiştir.
              </p>
            </div>
            <div className="glass rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/15 flex items-center justify-center">
                  <span className="text-lg">📚</span>
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)] uppercase tracking-widest font-semibold">
                    Akademik Ortak
                  </div>
                  <div className="text-white text-sm font-semibold leading-tight">
                    Kültür Bilincini Geliştirme Vakfı
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Tarihi içeriklerin doğrulanması ve akademik belgeleme.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FINAL CTA ─────────────────────────────────── */}
      <section
        id="cta"
        className="scroll-section min-h-[80vh] flex flex-col items-center justify-center text-center"
      >
        <div className="max-w-3xl mx-auto px-6">
          <p className="eyebrow mb-6">Keşfe Başla</p>
          <h2 className="headline mb-10">
            Beşiktaş Kültür
            <br />
            <span className="gradient-text">Haritasını Aç</span>
          </h2>
          <p className="text-lg text-[var(--muted)] mb-12 leading-relaxed">
            11 tarihi mekânı, 5 kategoriyi ve yüzlerce yıllık mirası interaktif haritamızda
            keşfedin. Her pin bir hikaye, her mekân bir kültür katmanı.
          </p>
          <Link href="/harita" className="cta text-lg px-10 py-5">
            <Map size={22} />
            Kültür Haritasını Aç
            <ArrowRight size={20} />
          </Link>
          <p className="mt-6 text-xs text-[var(--muted)]">
            Beşiktaş Belediyesi · Kent Belleği Dijital Arşiv
          </p>
        </div>
      </section>
    </div>
  );
}
