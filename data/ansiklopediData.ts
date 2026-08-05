export interface HistoricalEvent {
  id: string;
  title: string;
  date: string;          // e.g. "1453", "10 Kasım 1938"
  era: string;           // short era label
  category: EventCategory;
  categoryLabel: string;
  summary: string;       // 1-2 sentence hook
  fullText: string;      // long-form article
  image?: string;        // Wikipedia/public domain image URL
  images?: string[];     // Array of image URLs
  description?: string; // Extended description
  location?: string;     // where in Beşiktaş it happened
  tags: string[];
}

export type EventCategory =
  | "siyasi"
  | "askeri"
  | "kulturel"
  | "toplumsal"
  | "spor"
  | "mimari";

export const ansiklopediData: HistoricalEvent[] = [
  {
    id: "barbaros-vefati",
    title: "Barbaros Hayreddin Paşa'nın Beşiktaş'ta Vefatı",
    date: "4 Temmuz 1546",
    era: "Osmanlı Klasik Dönemi",
    category: "askeri",
    categoryLabel: "Askeri Tarih",
    location: "Beşiktaş Tersanesi yakınları",
    summary:
      "Osmanlı'nın en büyük amirali, Akdeniz'i Türk gölüne çeviren Hayreddin Paşa, ömrünün son demlerini Beşiktaş'ta geçirdi ve burada hayata gözlerini yumdu.",
    fullText:
      "Hayreddin Barbaros, Hızır Hayreddin Paşa olarak da bilinen Osmanlı'nın en büyük deniz komutanı, 1478 yılında Midilli'de doğdu. Kardeşi Oruç Reis ile birlikte Akdeniz'de Osmanlı hâkimiyetini pekiştiren Barbaros, 1533 yılında Kaptan-ı Deryalık görevine getirildi. Preveze Deniz Muharebesi'nde (1538) Andrea Doria komutasındaki birleşik Haçlı donanmasını büyük bir yenilgiye uğratarak Akdeniz'i fiilen Osmanlı egemenliğine aldı.\n\nYaşamının son yıllarını Beşiktaş'taki yalısında geçiren Barbaros, 4 Temmuz 1546'da hayata gözlerini yumdu. Cenazesi, kendi yaptırdığı türbeye defnedildi. Bu türbe günümüzde Beşiktaş Meydanı'nda hâlâ ziyaretçilere açık olup 1944'te meydana dikilen anıtla birlikte Beşiktaş'ın en önemli tarihi simgelerinden biri olmayı sürdürmektedir. Osmanlı denizcilik tarihinin en büyük ismi olarak Barbaros, bugün de Beşiktaş'ın kültürel belleğinin merkezinde yer almaktadır.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Barbaros_Hey.jpg/800px-Barbaros_Hey.jpg",
    tags: ["Barbaros", "Osmanlı Denizcilik", "Preveze", "Kaptan-ı Derya"],
  },
  {
    id: "dolmabahce-acilis",
    title: "Dolmabahçe Sarayı'nın Açılışı",
    date: "7 Haziran 1856",
    era: "Tanzimat Dönemi",
    category: "mimari",
    categoryLabel: "Mimari & Yapı",
    location: "Dolmabahçe, Beşiktaş",
    summary:
      "On üç yıl süren inşaatın ardından Sultan Abdülmecid, Osmanlı'nın Batılı mekânla buluşmasının sembolü olan Dolmabahçe Sarayı'na taşındı.",
    fullText:
      "Osmanlı İmparatorluğu'nun son döneminde hızlanan Batılılaşma sürecinin en görkemli simgesi olan Dolmabahçe Sarayı, 1843-1856 yılları arasında Mimar Nikoğos Balyan tarafından inşa edildi. Sultan I. Abdülmecid'in emriyle Boğaz kıyısına doldurulan araziye kurulan saray, Avrupalı saray mimarisini Osmanlı süsleme anlayışıyla harmanlayan eşsiz bir sentezi temsil eder.\n\n285 oda, 46 salon ve 6 hamamdan oluşan sarayın inşaatında 14 ton altın ve 40 ton gümüş kullanıldığı bilinmektedir. Avrupa'nın en büyük Bohemya kristal avizesi olan ve 4,5 ton ağırlığındaki muazzam avize, Kraliçe Victoria'nın hediyesidir. Saray, padişahların yanı sıra Atatürk tarafından da kullanılmış ve 10 Kasım 1938'de Atatürk'ün hayatını kaybettiği yer olarak Türk tarihinin en önemli mekânlarından biri hâline gelmiştir.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Dolmabahce_Palace_main_entrance.jpg/1280px-Dolmabahce_Palace_main_entrance.jpg",
    tags: ["Dolmabahçe", "Abdülmecid", "Batılılaşma", "Saray Mimarisi"],
  },
  {
    id: "ataturk-vefati",
    title: "Atatürk'ün Dolmabahçe'de Vefatı",
    date: "10 Kasım 1938",
    era: "Cumhuriyet Dönemi",
    category: "siyasi",
    categoryLabel: "Siyasi Tarih",
    location: "Dolmabahçe Sarayı, Beşiktaş",
    summary:
      "Türkiye Cumhuriyeti'nin kurucusu Mustafa Kemal Atatürk, sabahın ilk saatlerinde Dolmabahçe Sarayı'nda hayata gözlerini yumdu; saatin 09:05'te durdurulduğu o an tarihe geçti.",
    fullText:
      "10 Kasım 1938 sabahı saat 09:05'te Türkiye Cumhuriyeti'nin kurucusu Gazi Mustafa Kemal Atatürk, Beşiktaş'taki Dolmabahçe Sarayı'nda hayatını kaybetti. Siroz hastalığıyla uzun süre mücadele eden Atatürk'ün son aylarda sağlığı hızla kötüleşmişti.\n\nAtatürk'ün vefat ettiği yatak odası, o günden bu yana değiştirilmeden korunmaktadır. Üzerinde öldüğü yatağın başucundaki saat 09:05'te durdurulmuş olup tüm sarayın saatleri aynı anda durdurulmuştur. Bu uygulama günümüzde de sürdürülmekte; her yıl 10 Kasım'da tüm Türkiye'de saat 09:05'te anma törenleri ve saygı duruşları gerçekleştirilmektedir.\n\nAtatürk'ün ölümü Beşiktaş'ı, Türk tarihinin en derin izini taşıyan semtlerinden biri hâline getirmiştir. Dolmabahçe Sarayı, bu nedenle her yıl yüz binlerce yerli ve yabancı ziyaretçiyi ağırlamaktadır.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Dolmabahce_Palace_main_entrance.jpg/1280px-Dolmabahce_Palace_main_entrance.jpg",
    tags: ["Atatürk", "Cumhuriyet", "Dolmabahçe", "10 Kasım"],
  },
  {
    id: "besiktas-kulup-kurulusu",
    title: "Beşiktaş Jimnastik Kulübü'nün Kuruluşu",
    date: "19 Mart 1903",
    era: "II. Abdülhamid Dönemi",
    category: "spor",
    categoryLabel: "Spor Tarihi",
    location: "Beşiktaş",
    summary:
      "Türkiye'nin en eski spor kulüplerinden biri olan Beşiktaş JK, 1903 yılında Beşiktaşlı gençlerin öncülüğünde kuruldu ve kısa sürede Osmanlı spor hayatının merkezine yerleşti.",
    fullText:
      "Beşiktaş Jimnastik Kulübü, 19 Mart 1903 tarihinde Beşiktaş'ta kuruldu. Osmanlı İmparatorluğu'nda Türklerin kurduğu ilk spor kulübü olma özelliğini taşıyan BJK, kuruluşundan itibaren toplumsal bir anlam taşıdı. O dönemde Türk gençleri spor alanında örgütlenmeye başlamış, Beşiktaş da bu hareketin merkezine oturmuştu.\n\nKulüp, başlangıçta jimnastik aktiviteleri üzerinden yükseldi; zamanla futbol, güreş, boks ve atletizm gibi branşları bünyesine kattı. 20. yüzyılın başında Osmanlı spor yaşamına damgasını vuran BJK, Cumhuriyet döneminde de Türk futbolunun en güçlü kulüplerinden biri olma özelliğini sürdürdü. Siyah-beyaz renkleri ve kartal amblemiyle tanınan kulüp, günümüzde 42.000 kişilik Vodafone Park'ta maçlarını oynayan köklü bir spor kuruluşudur.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Vodafone_Park_30_A%C4%9Fustos_2016.jpg/1280px-Vodafone_Park_30_A%C4%9Fustos_2016.jpg",
    tags: ["Beşiktaş JK", "Spor Kulübü", "Osmanlı Sporu", "1903"],
  },
  {
    id: "ciragan-yangini",
    title: "Çırağan Sarayı Yangını",
    date: "19 Ocak 1910",
    era: "II. Meşrutiyet Dönemi",
    category: "toplumsal",
    categoryLabel: "Toplumsal Olaylar",
    location: "Çırağan Sarayı, Beşiktaş",
    summary:
      "Beşiktaş Boğaz kıyısındaki en görkemli Osmanlı yapılarından biri olan Çırağan Sarayı, 1910'da çıkan büyük yangında yalnızca taş duvarlarını geride bırakarak küle döndü.",
    fullText:
      "19 Ocak 1910 gecesi Çırağan Sarayı'nda çıkan yangın, Osmanlı döneminin en büyük yapı felaketlerinden biri olarak tarihe geçti. Yangının kaynağı olarak farklı iddialar öne sürülmüş olsa da kesin bir neden tespit edilememiştir. Saraydaki ahşap kısımların hızla alev alması, yapının büyük çoğunluğunun yanmasına yol açtı.\n\nYangından yalnızca mermer ve taş duvarlar sağlam kurtuldu. 1867-1871 yılları arasında Nikoğos Balyan ve Sarkis Balyan tarafından inşa edilen ve Sultan V. Murat'ın 1876'dan 1904'e kadar ev hapsi yaşadığı bu görkemli yapı, defalarca yeniden yapım planlarına rağmen onlarca yıl metruk kaldı. Nihayet 1986'da başlayan restorasyon çalışmalarıyla 1991 yılında Kempinski Hotels bünyesinde yeniden açıldı. Bugün sarayın tarihi taş duvarları modern otel yapısını çevrelemekte ve İstanbul'un en lüks konaklama deneyimlerinden birini sunmaktadır.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ciragan_palace_istanbul.jpg/1280px-Ciragan_palace_istanbul.jpg",
    tags: ["Çırağan", "Yangın", "Saray Tarihi", "Restorasyon"],
  },
  {
    id: "ortakoy-pogrom",
    title: "İstanbul Pogromu ve Beşiktaş Toplumu",
    date: "6–7 Eylül 1955",
    era: "Cumhuriyet Dönemi",
    category: "toplumsal",
    categoryLabel: "Toplumsal Olaylar",
    location: "Beşiktaş ve çevresi",
    summary:
      "6-7 Eylül 1955'te İstanbul'da patlak veren şiddet olayları Beşiktaş'ı ve Ortaköy'ü de derinden sarstı; Rum, Ermeni ve Yahudi topluluklarına ait mülkler büyük hasar gördü.",
    fullText:
      "6 Eylül 1955 akşamı başlayan ve 7 Eylül sabahına kadar devam eden şiddet olayları, İstanbul tarihinin en karanlık sayfalarından birini oluşturur. Selanik'te Atatürk'ün doğduğu evi bombalandığına dair asılsız haberlerin ateşlediği bu olaylar, organize kalabalıkların Rum, Ermeni ve Yahudi mülklerine saldırmasıyla sonuçlandı.\n\nBeşiktaş ve Ortaköy bölgesindeki azınlıklara ait işyerleri, konutlar ve ibadethaneler bu saldırılardan nasibini aldı. Olaylar, İstanbul'un çok kültürlü dokusuna ciddi zarar verdi ve binlerce Rum vatandaşın ilerleyen yıllarda şehri terk etmesine zemin hazırladı. Türk tarihi açısından bu olaylar, toplumsal belleğin hassas kırılma noktalarından biri olmaya devam etmektedir. 2004 yılında dönemin Başbakanı Erdoğan olayları resmi olarak 'utanç verici' diye nitelendirmiştir.",
    tags: ["Pogrom", "6-7 Eylül", "Azınlıklar", "İstanbul Tarihi"],
  },
  {
    id: "bogaz-koprusu-acilis",
    title: "Boğaz Köprüsü'nün Açılışı ve Beşiktaş",
    date: "29 Ekim 1973",
    era: "Cumhuriyet Dönemi",
    category: "mimari",
    categoryLabel: "Mimari & Yapı",
    location: "Beşiktaş - Üsküdar arası",
    summary:
      "Avrupa ile Asya'yı birbirine bağlayan Boğaz Köprüsü, Cumhuriyet'in 50. yılında törenle açıldı ve Beşiktaş'ın siluetini sonsuza dek değiştirdi.",
    fullText:
      "29 Ekim 1973'te, Türkiye Cumhuriyeti'nin 50. kuruluş yıl dönümünde, İstanbul Boğazı'nın iki yakasını birbirine bağlayan köprü hizmete girdi. Beşiktaş yakasından Üsküdar'a uzanan ve uzunluğu 1.560 metreyi bulan bu köprü, o dönemde dünyanın en uzun dördüncü asma köprüsüydü.\n\nKöprünün yapımıyla birlikte Beşiktaş, Anadolu yakasına erişimin simgesi hâline geldi. Ortaköy sırtlarından yükselen köprünün silueti, Büyük Mecidiye Camii ile birlikte dünyanın en tanınan manzara fotoğraflarından birini oluşturmaktadır. Köprü, 2016 yılında 15 Temmuz Şehitler Köprüsü adını aldı. Bu değişim, köprünün Beşiktaş ve İstanbul için yalnızca fiziksel değil, sembolik önemini de pekiştirmiştir.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Ortakoy_mosque_%28Mecidiye_Mosque%29_and_Bosphorus_bridge.jpg/1280px-Ortakoy_mosque_%28Mecidiye_Mosque%29_and_Bosphorus_bridge.jpg",
    tags: ["Boğaz Köprüsü", "Mimari", "Cumhuriyet", "1973"],
  },
  {
    id: "besiktas-deniz-kuvvetleri",
    title: "Beşiktaş Tersanesi ve Osmanlı Deniz Gücünün Yükselişi",
    date: "16. Yüzyıl",
    era: "Osmanlı Klasik Dönemi",
    category: "askeri",
    categoryLabel: "Askeri Tarih",
    location: "Beşiktaş Tersanesi",
    summary:
      "Osmanlı'nın Akdeniz hâkimiyetinin inşa edildiği Beşiktaş Tersanesi, imparatorluğun en büyük deniz üslerinden biri olarak yüzyıllarca gemi yapımı ve donanma lojistiğinin merkezi oldu.",
    fullText:
      "Osmanlı İmparatorluğu'nun deniz gücü büyük ölçüde İstanbul kıyılarındaki tersanelerde şekillenmiştir. Beşiktaş, Haliç'teki büyük tersanenin tamamlayıcısı olarak deniz teknolojisinin geliştirildiği kritik bir üs işlevi gördü. Barbaros Hayreddin Paşa döneminde (1533-1546) Beşiktaş sahilindeki tesisler genişletildi ve modernleştirildi.\n\n16. yüzyılda Preveze (1538) ve Cerbe (1560) gibi büyük deniz zaferlerinin altyapısı, kısmen Beşiktaş'taki tersanelerde dökülen toplar, inşa edilen kadırgalar ve yetiştirilen denizcilerle oluştu. Tersane, yalnızca bir üretim merkezi değil, aynı zamanda denizci eğitiminin de ocağıydı. Deniz Müzesi'nde sergilenen Osmanlı dönemi kayık ve tekneleri, bu zengin denizcilik geleneğinin somut kalıntılarıdır.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Istanbul_Naval_Museum_003.jpg/1280px-Istanbul_Naval_Museum_003.jpg",
    tags: ["Tersane", "Osmanlı Denizcilik", "Barbaros", "Askeri Tarih"],
  },
  {
    id: "abdulhamid-yildiz",
    title: "II. Abdülhamid'in Yıldız Sarayı'ndan Yönetimi",
    date: "1876–1909",
    era: "Hamidiye Dönemi",
    category: "siyasi",
    categoryLabel: "Siyasi Tarih",
    location: "Yıldız Sarayı, Beşiktaş",
    summary:
      "33 yıl boyunca Osmanlı İmparatorluğu'nu Beşiktaş'taki Yıldız Sarayı'ndan yöneten II. Abdülhamid, müziği, fotoğrafı ve tiyatroyu seven sanatçı ruhlu yapısıyla tarihin ilginç figürlerinden biri oldu.",
    fullText:
      "Sultan II. Abdülhamid, 1876-1909 yılları arasındaki 33 yıllık saltanatı süresince Beşiktaş'taki Yıldız Sarayı kompleksini ana ikametgâh ve yönetim merkezi olarak kullandı. Dolmabahçe ve Çırağan saraylarından farklı olarak Yıldız, Boğaz'dan görülmeyen konumuyla sultanın güvenlik kaygılarına da cevap veriyordu.\n\nII. Abdülhamid, Osmanlı tarihinde müzik, tiyatro ve fotoğrafçılıkla en çok ilgilenen padişahlardan biridir. Yıldız'da kurduğu fotoğrafhane, bugün dünya kütüphanelerine dağılmış yüz binlerce belgeyi içeren devasa bir fotoğraf arşivini ortaya çıkardı. Marangozluğa olan tutkusuyla bilinen sultan, saray atölyelerinde bizzat mobilya üretmiştir. Aynı dönemde dünyanın dört bir yanından gelen elçi ve diplomatları da kabul eden Yıldız Sarayı, imparatorluğun son demlerinde hem dipomatik hem de kültürel bir merkez işlevi gördü.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Yildiz_palace_istanbul.jpg/1280px-Yildiz_palace_istanbul.jpg",
    tags: ["II. Abdülhamid", "Yıldız Sarayı", "Osmanlı Yönetimi", "Fotoğrafçılık"],
  },
  {
    id: "mimar-sinan-sinanpasa",
    title: "Mimar Sinan'ın Beşiktaş'taki Eseri: Sinan Paşa Camii",
    date: "1555–1556",
    era: "Osmanlı Klasik Dönemi",
    category: "kulturel",
    categoryLabel: "Kültürel Miras",
    location: "Sinan Paşa Camii, Beşiktaş Meydanı",
    summary:
      "Osmanlı'nın dahi mimarı Mimar Sinan, Kanuni döneminin ünlü kaptan-ı deryası Sinan Paşa için Beşiktaş Meydanı'nda kalıcı bir eser bıraktı.",
    fullText:
      "Mimar Koca Sinan, Osmanlı mimarisini doruğuna taşıyan dahi yapı ustası olarak Süleymaniye, Selimiye ve Şehzade gibi abidevi eserlerin mimarıdır. Beşiktaş'ta inşa ettiği Sinan Paşa Camii ise onun daha mütevazı ölçekli ama dönemin estetik anlayışını yansıtan özgün bir yapıtıdır.\n\nCami, Kanuni Sultan Süleyman döneminde kaptan-ı derya olan ve 1554'te vefat eden Sinan Paşa adına 1555-1556 yıllarında inşa edilmiştir. Tek minareli ve bir kubbeli sade planıyla Sinan'ın erken dönem çalışmalarının karakteristik özelliklerini sergiler. Klasik Osmanlı mimarisinin en belirgin niteliği olan yalınlık ve denge, bu camide de açıkça hissedilir. Beşiktaş Meydanı'nın tarihi dokusuna derinlik katan yapı, günümüzde de aktif ibadet yeri olarak işlev görmektedir.",
    tags: ["Mimar Sinan", "Osmanlı Mimarisi", "Cami", "Klasik Dönem"],
  },
];
