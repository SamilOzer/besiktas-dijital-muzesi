"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { addContribution } from "@/lib/contribution-store";
import { NEIGHBORHOODS, TIME_PERIODS } from "@/data/besiktasPinData";
import ImageUploadInput from "@/components/ImageUploadInput";

const eventCategories = [["siyasi", "Siyasi"], ["askeri", "Askeri"], ["kulturel", "Kültürel"], ["toplumsal", "Toplumsal"], ["spor", "Spor"], ["mimari", "Mimari"], ["diger", "Diğer"]];
export default function KatkidaBulunPage() {
  const [type, setType] = useState<"harita" | "ansiklopedi">("harita");
  const [success, setSuccess] = useState(false);
  const [eventCategory, setEventCategory] = useState("");
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (success) {
      successRef.current?.focus({ preventScroll: true });
      successRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }, [success]);
  const [images, setImages] = useState<string[]>([]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    addContribution({
      type, submitterName: data.submitterName, submitterEmail: data.submitterEmail,
      ...(type === "harita" ? {
        title: data.title, category: data.category, timePeriod: data.timePeriod, neighborhood: data.neighborhood,
        address: data.address, summary: data.summary, description: data.description,
        coordinates: [parseFloat(data.lat) || 0, parseFloat(data.lng) || 0] as [number, number],
        imageUrls: images.filter(Boolean),
      } : {
        eventTitle: data.title, eventDate: data.date, era: data.era, eventCategory: data.eventCategory,
        eventCategoryLabel: data.eventCategory === "diger" ? data.eventCategoryLabel.trim() : undefined,
        eventSummary: data.summary, eventDescription: data.description, eventLocation: data.location,
        tags: (data.tags || "").split(",").map(t => t.trim()).filter(Boolean), imageUrls: images.filter(Boolean),
      }),
    });
    setSuccess(true);
    e.currentTarget.reset();
    setImages([]);
    setEventCategory("");
  };
  return <main id="main-content" className="interior-page museum-container">
    <div className="breadcrumb"><Link href="/">Ana sayfa</Link><span>/</span><span>Katkıda bulun</span></div>
    <div className="form-layout">
      <section className="form-intro"><h1>Bir hatıra da<br />sizden kalsın.</h1><p>Bildikleriniz, gördükleriniz, sakladıklarınız… Beşiktaş’ın ortak hafızasına küçük bir iz bırakın.</p>
        <div className="form-note"><h2>Neler paylaşabilirsiniz?</h2><p>Tarihi bir mekânı tanıtabilir, semtin geçmişinden bir olayı anlatabilir veya kendi arşivinizden fotoğraflar ekleyebilirsiniz.</p></div>
        <div className="form-note"><h2>Paylaştıktan sonra</h2><p>Katkılar, yayımlanmadan önce editörler tarafından incelenir. Bildiğiniz kaynakları açıklama alanına eklemeniz bu sürece yardımcı olur.</p></div>
      </section>
      <section className="museum-form">
        <h2>Hikâyenizi paylaşın</h2>
        {success ? <div ref={successRef} tabIndex={-1} role="status" className="success-message"><CheckCircle2 size={25} className="mb-3" /><p>Katkınız kaydedildi. İncelenmek üzere bekleyen katkılar arasına eklendi. Teşekkür ederiz.</p><button className="text-link mt-3" onClick={() => setSuccess(false)}>Yeni katkı ekleyin</button></div> : <>
        <div className="form-tabs" role="group" aria-label="Katkı türü"><button aria-pressed={type === "harita"} onClick={() => setType("harita")}>Bir mekân ekleyin</button><button aria-pressed={type === "ansiklopedi"} onClick={() => setType("ansiklopedi")}>Bir olay anlatın</button></div>
        <form onSubmit={handleSubmit} className="form-fields">
          <p className="form-caption">* işaretli alanların doldurulması gerekir.</p>
          <div className="form-row"><label className="field"><span>Adınız ve soyadınız *</span><input name="submitterName" autoComplete="name" required placeholder="Adınız ve soyadınız" /></label><label className="field"><span>E-posta adresiniz *</span><input name="submitterEmail" autoComplete="email" type="email" required placeholder="ornek@eposta.com" /></label></div>
          <hr className="form-divider" />
          {type === "harita" ? <>
            <label className="field"><span>Mekânın adı *</span><input name="title" required placeholder="Örneğin: Tarihi Beşiktaş İskelesi" /></label>
            <div className="form-row"><label className="field"><span>Kategori *</span><select name="category" required><option value="tarihi-yapilar">Tarihi evler ve yapılar</option><option value="heykeller">Heykeller ve anıtlar</option><option value="saraylar">Saraylar ve kasırlar</option><option value="spor">Stadyum ve spor tarihi</option><option value="dini-kamusal">Dini ve kamusal yapılar</option></select></label>
              <label className="field"><span>Mahalle *</span><select name="neighborhood" required defaultValue=""><option value="" disabled>Mahalle seçin</option>{NEIGHBORHOODS.filter(n => n.id !== "all").map(n => <option key={n.id} value={n.id}>{n.label}</option>)}</select></label></div>
            <label className="field"><span>Tarihi dönem *</span><select name="timePeriod" required>{TIME_PERIODS.filter(t => t.id !== "all").map(t => <option key={t.id} value={t.id}>{t.range} — {t.label}</option>)}</select></label>
            <label className="field"><span>Açık adres</span><input name="address" placeholder="Mahalle, sokak ve bina bilgisi" /></label>
            <div className="form-row"><label className="field"><span>Enlem (varsa)</span><input name="lat" type="number" step="any" min="-90" max="90" placeholder="41.0422" /></label><label className="field"><span>Boylam (varsa)</span><input name="lng" type="number" step="any" min="-180" max="180" placeholder="29.0067" /></label></div>
          </> : <>
            <label className="field"><span>Olayın başlığı *</span><input name="title" required placeholder="Anlatmak istediğiniz olay" /></label>
            <div className="form-row"><label className="field"><span>Kategori *</span><select name="eventCategory" required value={eventCategory} onChange={e => setEventCategory(e.target.value)}><option value="" disabled>Kategori seçin</option>{eventCategories.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label className="field"><span>Tarih *</span><input name="date" required placeholder="Örneğin: 1903" /></label></div>
            {eventCategory === "diger" && <label className="field"><span>Kategoriyi belirtin *</span><input name="eventCategoryLabel" required pattern=".*\S.*" maxLength={80} placeholder="Örneğin: Denizcilik tarihi" title="Lütfen kategori adını yazın." /></label>}
            <label className="field"><span>Dönem</span><input name="era" placeholder="Örneğin: Cumhuriyet Dönemi" /></label>
            <label className="field"><span>Olayın geçtiği yer</span><input name="location" placeholder="Mekân veya mahalle adı" /></label>
            <label className="field"><span>Etiketler</span><input name="tags" placeholder="Virgülle ayırın: spor, kulüp, jimnastik" /></label>
          </>}
          <label className="field"><span>Kısa özet *</span><textarea name="summary" required rows={3} placeholder="Hikâyeyi birkaç cümleyle anlatın." /></label>
          <label className="field"><span>Ayrıntılar ve kaynaklar</span><textarea name="description" rows={5} placeholder="Bildiklerinizi ve varsa yararlandığınız kaynakları ekleyin." /></label>
          <div className="field museum-upload"><span>Fotoğraflar</span><ImageUploadInput images={images} onChange={setImages} /></div>
          <button type="submit" className="museum-button">Katkıyı gönder <ArrowUpRight size={18} aria-hidden="true" /></button>
        </form>
        </>}
      </section>
    </div>
  </main>;
}
