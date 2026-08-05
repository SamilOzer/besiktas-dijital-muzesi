"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { addContactMessage } from "@/lib/contact-store";

export default function IletisimPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    addContactMessage({
      name: form.name,
      email: form.email,
      message: form.message,
    });
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <main className="min-h-screen pt-36 pb-24 px-[8vw] max-w-4xl mx-auto">
      <p className="eyebrow mb-3">İletişim & Konum</p>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 leading-tight">
        Bizimle İletişime Geçin
      </h1>

      {/* Org contact cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#14161d] p-8 rounded-3xl border border-white/10 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🏛️</span>
            <h3 className="text-lg font-semibold text-[var(--accent)]">Beşiktaş Belediyesi</h3>
          </div>
          <address className="not-italic text-sm text-neutral-400 leading-relaxed">
            Nisbetiye Mah. Aytar Cad. No:1
            <br />
            Beşiktaş / İstanbul
            <br />
            <a
              href="tel:+902122363134"
              className="text-white hover:text-[var(--accent)] transition-colors mt-1 inline-block"
            >
              📞 0212 236 31 34
            </a>
            <br />
            <a
              href="mailto:dijitalmuze@besiktas.bel.tr"
              className="text-[var(--accent)] hover:underline mt-1 inline-block"
            >
              dijitalmuze@besiktas.bel.tr
            </a>
          </address>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📚</span>
            <h3 className="text-lg font-semibold text-[var(--accent)]">
              Kültür Bilincini Geliştirme Vakfı
            </h3>
          </div>
          <address className="not-italic text-sm text-neutral-400 leading-relaxed">
            Kültür Mirası Araştırma Merkezi
            <br />
            Beşiktaş / İstanbul
            <br />
            <a
              href="tel:+902122274545"
              className="text-white hover:text-[var(--accent)] transition-colors mt-1 inline-block"
            >
              📞 0212 227 45 45
            </a>
            <br />
            <a
              href="mailto:bilgi@kulturbilinci.org"
              className="text-[var(--accent)] hover:underline mt-1 inline-block"
            >
              bilgi@kulturbilinci.org
            </a>
          </address>
        </div>
      </div>

      {/* Contact form */}
      <div className="bg-[#14161d] p-8 rounded-3xl border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-6">Mesaj Gönderin</h2>

        {sent ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-[var(--accent)] font-semibold text-lg mb-2">
              Mesajınız iletildi!
            </p>
            <p className="text-sm text-[var(--muted)]">En kısa sürede yanıt vereceğiz.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" id="contact-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs text-[var(--muted)] mb-1.5 uppercase tracking-widest">
                  Ad Soyad
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  placeholder="Adınız Soyadınız"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs text-[var(--muted)] mb-1.5 uppercase tracking-widest">
                  E-Posta
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-xs text-[var(--muted)] mb-1.5 uppercase tracking-widest">
                Mesajınız
              </label>
              <textarea
                id="contact-message"
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                placeholder="Mesajınızı buraya yazın..."
              />
            </div>
            <button
              type="submit"
              className="cta w-full justify-center"
              id="contact-submit"
            >
              <Send size={16} />
              Gönder
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
