"use client";

import { useState } from "react";
import { addContribution } from "@/lib/contribution-store";
import ImageUploadInput from "@/components/ImageUploadInput";

const NEIGHBORHOODS = [
  "Abbasağa", "Akatlar", "Arnavutköy", "Balmumcu", "Bebek", "Cihannüma", 
  "Dikilitaş", "Etiler", "Gayrettepe", "Konaklar", "Kuruçeşme", "Kültür", 
  "Levazım", "Levent", "Mecidiye", "Muradiye", "Nisbetiye", "Ortaköy", 
  "Sinanpaşa", "Türkali", "Ulus", "Vişnezade", "Yıldız"
];

const ENCYCLOPEDIA_CATEGORIES = [
  "siyasi", "askeri", "kulturel", "toplumsal", "spor", "mimari"
];

export default function KatkidaBulunPage() {
  const [type, setType] = useState<"harita" | "ansiklopedi">("harita");
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<string[]>([""]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    addContribution({
      type,
      submitterName: data.submitterName as string,
      submitterEmail: data.submitterEmail as string,
      ...(type === "harita" ? {
        title: data.title as string,
        category: data.category as string,
        timePeriod: data.timePeriod as string,
        neighborhood: data.neighborhood as string,
        address: data.address as string,
        summary: data.summary as string,
        description: data.description as string,
        coordinates: [parseFloat(data.lat as string) || 0, parseFloat(data.lng as string) || 0],
        imageUrls: images.filter(Boolean),
      } : {
        eventTitle: data.title as string,
        eventDate: data.date as string,
        era: data.era as string,
        eventCategory: data.eventCategory as string,
        eventSummary: data.summary as string,
        eventDescription: data.description as string,
        eventLocation: data.location as string,
        tags: (data.tags as string).split(",").map(t => t.trim()).filter(Boolean),
        imageUrls: images.filter(Boolean),
      })
    });
    
    setSuccess(true);
    e.currentTarget.reset();
    setImages([""]);
    setTimeout(() => setSuccess(false), 5000);
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all [&>option]:bg-[#14161d] [&>option]:text-white";
  const labelClass = "block text-sm font-medium text-white/80 mb-1.5";

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Müzeye Katkıda Bulun</h1>
          <p className="text-white/60">
            Beşiktaş&apos;ın tarihine dair mekanları veya olayları ekleyerek dijital müzemizin büyümesine yardımcı olun.
          </p>
        </div>

        {success && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center backdrop-blur-md">
            Katkınız başarıyla alındı. Editörlerimiz tarafından incelendikten sonra yayına alınacaktır. Teşekkür ederiz!
          </div>
        )}

        <div className="bg-[#12141a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setType("harita")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                type === "harita" 
                  ? "bg-[var(--accent)] text-[#0d0e12] shadow-lg shadow-[var(--accent)]/20" 
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              Harita (Mekan) Ekle
            </button>
            <button
              onClick={() => setType("ansiklopedi")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                type === "ansiklopedi" 
                  ? "bg-[var(--accent)] text-[#0d0e12] shadow-lg shadow-[var(--accent)]/20" 
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              Ansiklopedi (Olay) Ekle
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Adınız Soyadınız *</label>
                <input required type="text" name="submitterName" className={inputClass} placeholder="Örn: Ahmet Yılmaz" />
              </div>
              <div>
                <label className={labelClass}>E-posta Adresiniz *</label>
                <input required type="email" name="submitterEmail" className={inputClass} placeholder="Örn: ahmet@example.com" />
              </div>
            </div>

            <hr className="border-white/10 my-6" />

            {type === "harita" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Mekan Adı *</label>
                    <input required type="text" name="title" className={inputClass} placeholder="Örn: Tarihi İskele" />
                  </div>
                  <div>
                    <label className={labelClass}>Kategori</label>
                    <select name="category" className={inputClass}>
                      <option value="tarihi">Tarihi Yapı</option>
                      <option value="kulturel">Kültürel Mekan</option>
                      <option value="dini">Dini Yapı</option>
                      <option value="diger">Diğer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Mahalle *</label>
                    <select required name="neighborhood" className={inputClass}>
                      <option value="">Seçiniz...</option>
                      {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Dönem</label>
                    <select name="timePeriod" className={inputClass}>
                      <option value="osmanli">Osmanlı</option>
                      <option value="cumhuriyet">Cumhuriyet</option>
                      <option value="bizans">Bizans</option>
                      <option value="diger">Diğer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Açık Adres</label>
                  <input type="text" name="address" className={inputClass} placeholder="Açık adres..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Enlem (Latitude)</label>
                    <input type="number" step="any" name="lat" className={inputClass} placeholder="Örn: 41.0422" />
                  </div>
                  <div>
                    <label className={labelClass}>Boylam (Longitude)</label>
                    <input type="number" step="any" name="lng" className={inputClass} placeholder="Örn: 29.0067" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Fotoğraflar</label>
                  <ImageUploadInput
                    images={images}
                    onChange={setImages}
                    darkStyle
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Olay Başlığı *</label>
                    <input required type="text" name="title" className={inputClass} placeholder="Örn: BJK Kuruluşu" />
                  </div>
                  <div>
                    <label className={labelClass}>Kategori *</label>
                    <select required name="eventCategory" className={inputClass}>
                      <option value="">Seçiniz...</option>
                      {ENCYCLOPEDIA_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Tarih *</label>
                    <input required type="text" name="date" className={inputClass} placeholder="Örn: 1903 veya 3 Mart 1924" />
                  </div>
                  <div>
                    <label className={labelClass}>Dönem</label>
                    <input type="text" name="era" className={inputClass} placeholder="Örn: 20. Yüzyıl" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Etiketler</label>
                  <input type="text" name="tags" className={inputClass} placeholder="Virgülle ayırarak yazın (Örn: spor, kulüp, jimnastik)" />
                </div>
                
                <div>
                  <label className={labelClass}>Konum/Mekan İlişkisi</label>
                  <input type="text" name="location" className={inputClass} placeholder="Olayın geçtiği mekan (varsa)" />
                </div>

                <div>
                  <label className={labelClass}>Fotoğraflar</label>
                  <ImageUploadInput
                    images={images}
                    onChange={setImages}
                    darkStyle
                  />
                </div>
              </>
            )}

            <div>
              <label className={labelClass}>Kısa Özet *</label>
              <textarea required name="summary" rows={2} className={`${inputClass} resize-none`} placeholder="Birkaç cümlelik özet..." />
            </div>

            <div>
              <label className={labelClass}>Detaylı Açıklama</label>
              <textarea name="description" rows={5} className={`${inputClass} resize-y`} placeholder="Tüm detayları buraya yazabilirsiniz..." />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[var(--accent)] text-[#0d0e12] rounded-xl font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Gönder
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
