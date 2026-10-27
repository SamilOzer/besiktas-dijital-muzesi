# Tasarım doğrulaması

26 Ekim 2026. Next.js üretim sürümü, yerel önizleme: http://localhost:3000/.

## Tamamlanan kontroller

- `npm run build`: başarılı; TypeScript ve 18 sayfanın üretimi tamamlandı.
- `git diff --check`: başarılı.
- Tasarım profili JSON olarak ayrıştırıldı.
- Masaüstünde ana sayfa, ansiklopedi, harita ve formlar görsel olarak incelendi. Ana sayfanın iki bölümlü sabit fotoğraf anlatısı ve bağlantısı çalışıyor.
- 390 × 844 ve 320 × 760 mobil görünüm kontrol edildi. Ana sayfa, hakkında ve haritada yatay taşma yok; katkı formu 390 pikselde taşmıyor. Mobil menü, filtre paneli ve 320 pikselde mekân detay penceresi kullanılabiliyor.
- Ansiklopedi araması, sonuçsuz arama, filtre temizleme ve detay açma/kapama doğrulandı. Escape detay penceresini kapatıyor ve odağı açan karta geri veriyor.
- Harita ilk durumda 16 mekân gösteriyor. Saraylar filtresi 4, ek Yıldız mahallesi filtresi 2 sonuç gösteriyor. Mekân listesi üzerinden detay açılabiliyor.
- Katkı türleri arasında geçiş ve zorunlu alanların tarayıcı doğrulaması çalışıyor. Mekân ve olay katkısında, iletişimde yerel test kayıtları ile başarı geri bildirimi doğrulandı. Mobil gönderim sonrası başarı mesajı odaklanıyor ve sabit başlığın altında görünür alana geliyor.
- Ana metin / açık yüzey kontrastı 11,08:1; ikincil metin 5,67:1; ikincil metin / mavi yüzey 5,09:1; bağlantı 5,77:1; düğme 11,61:1. Bu eşleşmeler normal metin için 4,5:1 eşiğini geçiyor.
- Azaltılmış hareket CSS kuralı incelendi: geçişler ve animasyonlar kapatılıyor, sabit fotoğraf normal akışa dönüyor. İşletim sistemi tercihiyle ayrıca test edilmedi.

## Sınırlar

- Canlı Supabase senkronizasyonu doğrulanamadı; mevcut veri servisi başarısız olduğunda yerel arşiv verileri gösteriliyor.
- Bazı mevcut uzak arşiv görselleri yüklenmiyor. Kullanılabilir yerel mekân fotoğrafları ve tarih temelli yedek görünüm var; kaynak kayıtlar değiştirilmedi.
- Katkı ve iletişim depoları projede zaten tarayıcı localStorage kullanıyordu. Bu davranış korundu; sunucuya teslim veya e-posta gönderimi eklenmedi. Test kayıtları yalnızca yerel önizleme tarayıcısında `[TEST]` başlığı / metni ile oluşturuldu.
- Dosya yükleme ve yönetici iş akışları uçtan uca test edilmedi. Safari ve gerçek mobil cihaz testi yapılmadı.
- Mevcut `lint` betiği `next lint` kullanıyor; ayrı lint kontrolü çalıştırılmadı. Üretim derlemesinin TypeScript kontrolü geçti.
- Yeni bağımlılık eklenmedi. Commit, GitHub push veya canlı yayın yapılmadı.

## 27 Ekim 2026 — yedi tarayıcı yorumu

- Üretim derlemesi tekrar geçti. Yeni katkı kategorisinin yerel depoda ekleme, okuma ve düzenleme sırasında korunduğu `node scripts/check-contribution-category.cjs` ile doğrulandı.
- Tüm site için DM Sans uygulandı; tarayıcıda hesaplanan yazı tipi doğrulandı. Ana sayfanın yeni rota ve kütüphane simgeleri masaüstü, 390 ve 320 piksel genişlikte incelendi; yatay taşma yok.
- Haritada sokaklar nötr taş tonlarında, su alanları mavi görünüyor. Saraylar filtresi doğru dört mekânı döndürüyor. Kategori yazıları 14 px / 650 ağırlıkta; 320 pikselde uzun adlar düğme içinde satıra bölünüyor, taşmıyor.
- Ansiklopedi kategorileri 15 px / 650 ağırlıkta ve metin rengiyle aynı 1 px kenarlığa sahip. 320 pikselde filtreler görünür ve yatay taşma yok.
- Olay katkısındaki “Diğer” seçeneği zorunlu açıklamayı açıyor. Boş açıklama `valueMissing`, yalnızca boşluk içeren açıklama `patternMismatch` ile gönderimi engelliyor. “Denizcilik tarihi” açıklamasıyla yerel test gönderimi başarılı; mobil başarı mesajı görünür.
- Hakkımızda iskele fotoğrafı, ana sayfada Ihlamur bahçesi ve vapur fotoğrafı yüklendi. Kaynak ve lisanslar hem sayfada hem `public/images/museum/ATTRIBUTION.md` içinde bulunuyor.
- Yönetici onayının canlı veritabanına aktarımı ayrıca sınanmadı. Yukarıdaki mevcut backend, gerçek cihaz ve azaltılmış hareket test sınırları geçerli.
