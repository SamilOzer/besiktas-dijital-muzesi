"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { addContactMessage } from "@/lib/contact-store";
export default function IletisimPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sent) {
      successRef.current?.focus({ preventScroll: true });
      successRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }, [sent]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    addContactMessage({ name: form.name.trim(), email: form.email.trim(), message: form.message.trim() });
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };
  return <main id="main-content" className="interior-page museum-container">
    <div className="breadcrumb"><Link href="/">Ana sayfa</Link><span>/</span><span>İletişim</span></div>
    <div className="form-layout">
      <section className="form-intro"><h1>Bir merhaba<br />ile başlayalım.</h1><p>Müzeyle ilgili sorularınızı, önerilerinizi ve düzeltmelerinizi bizimle paylaşın.</p>
        <div className="contact-address"><h2>Beşiktaş Belediyesi</h2><address>Nisbetiye Mah. Aytar Cad. No:1<br />Beşiktaş / İstanbul<br /><a href="tel:+902122363134">0212 236 31 34</a><br /><a href="mailto:dijitalmuze@besiktas.bel.tr">dijitalmuze@besiktas.bel.tr</a></address></div>
        <div className="contact-address"><h2>Kültür Bilincini Geliştirme Vakfı</h2><address>Kültür Mirası Araştırma Merkezi<br />Beşiktaş / İstanbul<br /><a href="tel:+902122274545">0212 227 45 45</a><br /><a href="mailto:bilgi@kulturbilinci.org">bilgi@kulturbilinci.org</a></address></div>
      </section>
      <section className="museum-form"><h2>Bize yazın</h2>{sent ? <div ref={successRef} tabIndex={-1} role="status" className="success-message"><CheckCircle2 size={28} className="mb-4" /><p>Mesajınız kaydedildi. Paylaştığınız için teşekkür ederiz.</p><button className="text-link mt-5" onClick={() => setSent(false)}>Yeni mesaj yazın</button></div> :
        <form id="contact-form" onSubmit={handleSubmit} className="form-fields">
          <div className="field"><label htmlFor="contact-name">Adınız ve soyadınız</label><input id="contact-name" autoComplete="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Adınız ve soyadınız" /></div>
          <div className="field"><label htmlFor="contact-email">E-posta adresiniz</label><input id="contact-email" autoComplete="email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ornek@eposta.com" /></div>
          <div className="field"><label htmlFor="contact-message">Mesajınız</label><textarea id="contact-message" rows={6} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Sizi dinliyoruz…" /></div>
          <p className="form-caption">Tüm alanların doldurulması gerekir.</p><button type="submit" id="contact-submit" className="museum-button">Mesajı gönder <ArrowUpRight size={18} aria-hidden="true" /></button>
        </form>}</section>
    </div>
  </main>;
}
