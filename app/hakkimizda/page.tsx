export default function HakkimizdaPage() {
  return (
    <main className="min-h-screen pt-36 pb-24 px-[8vw] max-w-5xl mx-auto">
      {/* ─── Header ─── */}
      <p className="eyebrow mb-3">Beşiktaş Belediyesi</p>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4 leading-tight">
        Beşiktaş&apos;ın Dijital Hafızasını
        <br />
        <span className="text-[var(--accent)]">Geleceğe Taşıyoruz</span>
      </h1>
      <p className="text-lg text-[var(--muted)] leading-relaxed mb-12 max-w-2xl">
        Beşiktaş Belediyesi&apos;nin öncülüğünde hayata geçirilen bu dijital platform, ilçemizin
        eşsiz kültürel ve tarihi mirasını interaktif bir arşiv olarak vatandaşlara ve
        araştırmacılara sunar.
      </p>

      {/* ─── Main mission block ─── */}
      <div className="glass rounded-3xl p-8 md:p-10 border border-[var(--accent)]/25 mb-10">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/35 flex items-center justify-center text-2xl flex-shrink-0">
            🏛️
          </div>
          <div>
            <div className="text-xs text-[var(--accent)] uppercase tracking-widest font-semibold mb-1">
              Proje Sahibi & Yürütücü Kurum
            </div>
            <h2 className="text-2xl font-bold text-white">Beşiktaş Belediyesi</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[var(--muted)] leading-relaxed text-base border-t border-white/8 pt-6">
          <p>
            Beşiktaş Belediyesi olarak, ilçemizin sahip olduğu zengin tarihi mirası —
            anıtları, heykelleri, sarayları, dini yapıları ve spor tarihini — dijital çağın
            olanaklarıyla vatandaşlarımıza ve tüm dünyaya açık hâle getiriyoruz.
          </p>
          <p>
            Bu platform; sadece bir bilgi arşivi değil, canlı ve sürekli güncellenen bir
            kent hafızasıdır. Beşiktaş&apos;ın geçmişini bugünün teknolojisiyle buluşturmak,
            geleceğe aktarmak temel misyonumuzdur.
          </p>
        </div>
      </div>

      {/* ─── Partner block (smaller, secondary) ─── */}
      <div className="glass rounded-2xl p-6 border border-white/8 mb-12">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/12 flex items-center justify-center text-xl flex-shrink-0">
            📚
          </div>
          <div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-widest font-semibold mb-1">
              Akademik İşbirliği Ortağı
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Kültür Bilincini Geliştirme Vakfı
            </h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Tarihi içeriklerin doğrulanması, akademik belgeleme ve araştırma süreçlerinde
              Beşiktaş Belediyesi&apos;ne destek sağlamaktadır. Vakfın katkılarıyla tüm tarihsel
              anlatılar akademik titizlikte hazırlanmıştır.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Mission pillars ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            icon: "🗺️",
            title: "İnteraktif Haritalama",
            body: "Tüm tarihi mekânları coğrafi konumlarıyla birlikte kataloglayan interaktif harita platformu.",
          },
          {
            icon: "📸",
            title: "Görsel Arşiv",
            body: "Fotoğraf galerileri, tarihi belgeler ve görsel kent hafızası koleksiyonu.",
          },
          {
            icon: "🏛️",
            title: "Akademik Doğrulama",
            body: "Tarihçiler ve araştırmacılar tarafından denetlenmiş kapsamlı tarihsel anlatılar.",
          },
        ].map(({ icon, title, body }) => (
          <div key={title} className="glass rounded-2xl p-6 border border-white/8">
            <div className="text-3xl mb-3">{icon}</div>
            <h4 className="font-semibold text-white mb-2">{title}</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
