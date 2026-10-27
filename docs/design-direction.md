# Beşiktaş: yaşayan kent hafızası

26 Ekim 2026. Kapsam: ziyaretçi sitesinin tamamı. İzin verilen skill'ler: design-dna, frontend-design, ponytail, scrollcraft.

## Önerilen tasarım sistemi

Bir dış referanstan ölçülmedi; mevcut gerçek mekân fotoğrafları ve kent müzesi bağlamı için önerildi.

- Boğaz mürekkebi #123D50: başlıklar, düğmeler, anlatı yüzeyi.
- Müze beyazı #F8FAFA: ana yüzey.
- Kıyı mavisi #E6EFF2: giriş ve yardımcı yüzeyler.
- Deniz mavisi #246A85: bağlantılar ve odak.
- Arşiv grisi #526771: açıklamalar.
- Çizgi #CBD8DD: alan sınırları.
- DM Sans: başlık, gezinme ve okuma için tek aile; başlıklarda 600–650, filtrelerde 650 ağırlık. Sistem sans-serif yedeği.
- Soldan hizalı içerik, 1280px genişlik, asimetrik fotoğraf ağırlıkları.

Yerleşim:
    Müze kimliği          Gezinme          Katkı
    Büyük başlık          Ortaköy fotoğrafı
    Kısa açıklama         Konum
    Keşfe başla
    Harita girişi         Ansiklopedi girişi
    Seçki başlığı         Açıklama
    Geniş fotoğraf        Fotoğraf       Fotoğraf
    Sabit kıyı fotoğrafı   Kaydırılan anlatı
    Katılım daveti        Form bağlantısı
    Kurum ve iletişim bilgileri

## Plan eleştirisi

Koyu-altın palet, sayısal sayaçlar, degrade başlıklar ve yinelenen kutular kaldırılır. Odak gerçek Beşiktaş fotoğraflarıdır. Sıcak krem/terrakota yerine fotoğraflardaki kıyıyı destekleyen serin mavi yüzeyler seçildi. Koleksiyon öğeleri fotoğraf-altı açıklamalı sergi parçalarıdır; her içerik kutuya kapatılmaz.

Scrollcraft: catalogue düzeninden dönüşümlü kompozisyon ve sakin anlatı ritmi alınır. Görsel stil mevcut kıyı fotoğraflarıdır. Next.js içinde iki bölümlü yerel CSS sticky anlatı uygulanır. Video/kare dizisi veya bağımsız Scrollcraft paketi üretilmez; pakete özgü doctor/verify yerine uygulamanın tarayıcı kontrolleri kullanılır. Mobilde ve azaltılmış hareket tercihinde içerik normal akışta kalır.

## Kapsam ve doğrulama

Ana sayfa, ortak gezinme, ansiklopedi ve detay penceresi, harita filtreleri ve mekân detayları, hakkında, iletişim, katkı formu. Mevcut veri servisleri ve yönetim iş akışları korunur. Yeni tasarım bağımlılığı yok. Kontroller: üretim derlemesi, TypeScript, masaüstü/mobil, arama/filtreleme, klavye, pencere açma/kapama, form doğrulaması ve yerel kayıt.


## 27 Ekim 2026 — kullanıcı yorumlarıyla revizyon

İnce serif görünüm yerine Türkçe karakterleri destekleyen DM Sans seçildi. Filtre etiketleri 14–15px ve 650 ağırlıkta; ansiklopedi filtreleri yazı renginde çerçeveli. Yol ve su renkleri ayrıştırıldı. Keşif bağlantılarında 28px rota ve arşiv ikonları, açık mavi zemin üzerinde kullanılıyor. Dolmabahçe tekrarını azaltmak için hakkında sayfasında iskele, anlatıda vapurlar ve koleksiyonda Ihlamur bahçesi fotoğrafları seçildi. Mevcut kaydırma düzeni korunuyor.
