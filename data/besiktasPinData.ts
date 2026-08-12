export type PinCategory =
  | "heykeller"
  | "saraylar"
  | "tarihi-yapilar"
  | "spor"
  | "dini-kamusal";

export type TimePeriod =
  | "1400-1600"
  | "1600-1800"
  | "1800-1850"
  | "1850-1900"
  | "1900-1960"
  | "1960-gunumuz";

export type Neighborhood =
  | "Abbasağa"
  | "Akatlar"
  | "Arnavutköy"
  | "Balmumcu"
  | "Bebek"
  | "Cihannüma"
  | "Dikilitaş"
  | "Etiler"
  | "Gayrettepe"
  | "Konaklar"
  | "Kuruçeşme"
  | "Kültür"
  | "Levazım"
  | "Levent"
  | "Mecidiye"
  | "Muradiye"
  | "Nisbetiye"
  | "Ortaköy"
  | "Sinanpaşa"
  | "Türkali"
  | "Ulus"
  | "Vişnezade"
  | "Yıldız";

export interface PinLocation {
  id: string;
  title: string;
  category: PinCategory;
  categoryLabel: string;
  coordinates: [number, number]; // [lat, lng]
  summary: string;
  fullHistory: string;
  images: string[];
  era?: string;
  address?: string;
  description?: string;
  timePeriod: TimePeriod;
  neighborhood: Neighborhood;
}

export const TIME_PERIODS: { id: TimePeriod | "all"; label: string; range: string }[] = [
  { id: "all",           label: "Tüm Dönemler",             range: "" },
  { id: "1400-1600",     label: "Osmanlı Klasik",           range: "1400 – 1600" },
  { id: "1600-1800",     label: "Osmanlı Orta",             range: "1600 – 1800" },
  { id: "1800-1850",     label: "Erken Tanzimat",           range: "1800 – 1850" },
  { id: "1850-1900",     label: "Tanzimat & Hamidiye",      range: "1850 – 1900" },
  { id: "1900-1960",     label: "Meşrutiyet & Cumhuriyet",  range: "1900 – 1960" },
  { id: "1960-gunumuz",  label: "Günümüz",                  range: "1960 – Günümüz" },
];

export const NEIGHBORHOODS: { id: Neighborhood | "all"; label: string }[] = [
  { id: "all",          label: "Tüm Mahalleler" },
  { id: "Abbasağa",     label: "Abbasağa" },
  { id: "Akatlar",      label: "Akatlar" },
  { id: "Arnavutköy",   label: "Arnavutköy" },
  { id: "Balmumcu",     label: "Balmumcu" },
  { id: "Bebek",        label: "Bebek" },
  { id: "Cihannüma",    label: "Cihannüma" },
  { id: "Dikilitaş",    label: "Dikilitaş" },
  { id: "Etiler",       label: "Etiler" },
  { id: "Gayrettepe",   label: "Gayrettepe" },
  { id: "Konaklar",     label: "Konaklar" },
  { id: "Kuruçeşme",    label: "Kuruçeşme" },
  { id: "Kültür",       label: "Kültür" },
  { id: "Levazım",      label: "Levazım" },
  { id: "Levent",       label: "Levent" },
  { id: "Mecidiye",     label: "Mecidiye" },
  { id: "Muradiye",     label: "Muradiye" },
  { id: "Nisbetiye",    label: "Nisbetiye" },
  { id: "Ortaköy",      label: "Ortaköy" },
  { id: "Sinanpaşa",    label: "Sinanpaşa" },
  { id: "Türkali",      label: "Türkali" },
  { id: "Ulus",         label: "Ulus" },
  { id: "Vişnezade",    label: "Vişnezade" },
  { id: "Yıldız",       label: "Yıldız" },
];

export const besiktasPinData: PinLocation[] = [
  {
    id: "barbaros-aniti",
    title: "Barbaros Hayreddin Paşa Anıtı",
    category: "heykeller",
    categoryLabel: "Heykeller & Anıtlar",
    coordinates: [41.0423, 29.0062],
    address: "Beşiktaş Meydanı, Çırağan Cd., 34353 Beşiktaş/İstanbul",
    timePeriod: "1900-1960",
    neighborhood: "Sinanpaşa",
    summary:
      "Ali Hadi Bara ve Zühtü Müridoğlu tarafından yapılan Beşiktaş Meydanı'nın simge anıtı.",
    fullHistory:
      "1944 yılında açılışı yapılan anıt, Kaptan-ı Derya Barbaros Hayreddin Paşa'nın anısını yaşatmak amacıyla Beşiktaş Meydanı'na dikilmiştir. Heykeltıraş Ali Hadi Bara ve Zühtü Müridoğlu'nun ortak eseri olan anıt, Cumhuriyet döneminin en önemli kamusal heykellerinden biridir. Barbaros Hayreddin Paşa, 16. yüzyılın ünlü Osmanlı denizcisi ve Cezayir Beyi'dir. Anıt, Akdeniz'de Osmanlı hâkimiyetini pekiştiren bu büyük denizcinin kalıcı hatırası olarak meydanda yer almaktadır. Her yıl 27 Kasım Deniz Şehitlerini Anma Günü'nde burada törenler düzenlenmektedir.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Barbaros_Hey.jpg/800px-Barbaros_Hey.jpg",
    ],
    era: "1944 (Cumhuriyet Dönemi)",
  },
  {
    id: "dolmabahce-sarayi",
    title: "Dolmabahçe Sarayı",
    category: "saraylar",
    categoryLabel: "Saraylar & Kasırlar",
    coordinates: [41.0391, 28.9983],
    address: "Vişnezade Mah. Dolmabahçe Cd. No:1, 34357 Beşiktaş/İstanbul",
    timePeriod: "1800-1850",
    neighborhood: "Vişnezade",
    summary:
      "Sultan I. Abdülmecid tarafından inşa ettirilen Osmanlı İmparatorluğu'nun son dönem idare merkezi.",
    fullHistory:
      "1843-1856 yılları arasında Mimar Nikoğos Balyan tarafından inşa edilen Dolmabahçe Sarayı, Batılılaşma mimarisinin Beşiktaş sahilindeki en görkemli örneğidir. 285 odası, 46 salonu, 6 hamamı ve 68 tuvaleti bulunan saray, Avrupa'nın en büyük Bohemya kristal avizesine ev sahipliği yapmaktadır. 4,5 tonluk bu avize, 750 adet kandil ve 684 adet ampulle donatılmıştır. Atatürk'ün hayatını kaybettiği çalışma odası günümüzde de saygıyla korunmakta ve saatin 09:05'te durdurulduğu anı simgelemektedir. Yılda yaklaşık 800.000 ziyaretçi ağırlayan saray, Türkiye'nin en çok ziyaret edilen müzelerinden biridir.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Dolmabahce_Palace_main_entrance.jpg/1280px-Dolmabahce_Palace_main_entrance.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Dolmabahce_palace_throne_hall.jpg/1280px-Dolmabahce_palace_throne_hall.jpg",
    ],
    era: "1843–1856 (Tanzimat Dönemi)",
  },
  {
    id: "ciragan-sarayi",
    title: "Çırağan Sarayı",
    category: "saraylar",
    categoryLabel: "Saraylar & Kasırlar",
    coordinates: [41.0435, 29.0157],
    address: "Çırağan Cd. No:32, 34349 Beşiktaş/İstanbul",
    timePeriod: "1850-1900",
    neighborhood: "Sinanpaşa",
    summary: "Boğaz kıyısında yükselen, günümüzde lüks otele dönüşmüş tarihi Osmanlı sarayı.",
    fullHistory:
      "Sultan II. Abdülhamid döneminde 1867-1871 yılları arasında Mimar Nikoğos Balyan ve Sarkis Balyan tarafından inşa edilen Çırağan Sarayı, Osmanlı-Barok mimarisinin en görkemli örneklerinden biridir. Boğaz'ın en güzel konumlarından birinde yer alan saray, Sultan V. Murat'ın 1876-1904 yılları arasında ev hapsi yaşadığı mekân olması nedeniyle tarihi açıdan büyük önem taşımaktadır. 1910 yılında çıkan yangında büyük hasar gören saray, yıllar içinde restore edilerek 1991'de Kempinski Hotels bünyesinde lüks bir otele dönüştürülmüştür.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ciragan_palace_istanbul.jpg/1280px-Ciragan_palace_istanbul.jpg",
    ],
    era: "1867–1871 (Tanzimat Dönemi)",
  },
  {
    id: "yildiz-sarayi",
    title: "Yıldız Sarayı",
    category: "saraylar",
    categoryLabel: "Saraylar & Kasırlar",
    coordinates: [41.0507, 29.0117],
    address: "Yıldız Mah. Çırağan Cd., 34349 Beşiktaş/İstanbul",
    timePeriod: "1850-1900",
    neighborhood: "Yıldız",
    summary:
      "II. Abdülhamid'in otuz yıl boyunca yönetim merkezi olarak kullandığı köşk ve yapılar kompleksi.",
    fullHistory:
      "Yıldız Sarayı, tek bir yapı değil; bahçe içinde konumlanmış çok sayıda köşk, kasr, sera ve servis binasından oluşan geniş bir komplekstir. Sultan II. Abdülhamid, 1876-1909 yılları arasındaki saltanatı boyunca imparatorluğu bu saraydan yönetmiştir. Kompleks içindeki Şale Kasrı, Malta Köşkü ve Çadır Köşkü önemli tarihi mekânlardır. Günümüzde İstanbul Büyükşehir Belediyesi'ne bağlı Yıldız Parkı içinde yer alan yapılar, ziyaretçilere açık olup İstanbul'un en güzel yeşil alanlarından birini oluşturmaktadır.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Yildiz_palace_istanbul.jpg/1280px-Yildiz_palace_istanbul.jpg",
    ],
    era: "19. Yüzyıl (Hamidiye Dönemi)",
  },
  {
    id: "inonu-stadyumu",
    title: "Vodafone Park / Tarihi İnönü Stadyumu",
    category: "spor",
    categoryLabel: "Stadyum & Spor Tarihi",
    coordinates: [41.0394, 28.9944],
    address: "Süleyman Seba Cd. No:5, 34353 Beşiktaş/İstanbul",
    timePeriod: "1900-1960",
    neighborhood: "Sinanpaşa",
    summary:
      "Türkiye'nin ve Beşiktaş Jimnastik Kulübü'nün tarihi spor mabedi — Boğaz manzaralı eşsiz konumuyla.",
    fullHistory:
      "1947 yılında İnönü Stadyumu adıyla açılan bu alan, Türk futbol tarihinin en köklü ve sembolik sahnelerinden birini oluşturmaktadır. Yıllar içinde defalarca yenilenen tesiste, Beşiktaş JK 2016 yılında modern Vodafone Park'ı inşa etmiştir. Boğaz'a bakan muhteşem tribünleriyle dünyanın en ikonik futbol stadyumlarından biri kabul edilen bu alan, yaklaşık 41.000 seyirci kapasitesine sahiptir. Vodafone Park, aynı zamanda çeşitli müzik festivalleri ve konser etkinliklerine de ev sahipliği yapmaktadır.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Vodafone_Park_30_A%C4%9Fustos_2016.jpg/1280px-Vodafone_Park_30_A%C4%9Fustos_2016.jpg",
    ],
    era: "1947 / 2016",
  },
  {
    id: "ortakoy-camii",
    title: "Büyük Mecidiye Camii (Ortaköy Camii)",
    category: "dini-kamusal",
    categoryLabel: "Dini & Kamusal Yapılar",
    coordinates: [41.0473, 29.0268],
    address: "Mecidiye Köyü, Büyük Mecidiye Cd., 34347 Beşiktaş/İstanbul",
    timePeriod: "1850-1900",
    neighborhood: "Ortaköy",
    summary:
      "Boğaz köprüsüyle birlikte İstanbul'un en ikonik siluetini oluşturan, Osmanlı Barok mimarisinin şaheseri.",
    fullHistory:
      "Sultan Abdülmecid döneminde 1854-1855 yılları arasında Mimar Nikoğos Balyan tarafından inşa edilen Büyük Mecidiye Camii, Ortaköy sahilinde Boğaz kıyısında yer almaktadır. Osmanlı Barok mimarisinin en güzel örneklerinden biri olan cami; ince minareleri, zarif kubbeleri ve Boğaz Köprüsü'nü arka fon olarak kullanan konumuyla İstanbul'un en çok fotoğraflanan yapılarından biridir. Cami, bugün de aktif olarak ibadet amacıyla kullanılmaktadır.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Ortakoy_mosque_%28Mecidiye_Mosque%29_and_Bosphorus_bridge.jpg/1280px-Ortakoy_mosque_%28Mecidiye_Mosque%29_and_Bosphorus_bridge.jpg",
    ],
    era: "1854–1855 (Tanzimat Dönemi)",
  },
  {
    id: "sinan-pasa-camii",
    title: "Sinan Paşa Camii",
    category: "dini-kamusal",
    categoryLabel: "Dini & Kamusal Yapılar",
    coordinates: [41.0434, 29.0053],
    address: "Sinanpaşa Mah. Beşiktaş Meydanı, 34353 Beşiktaş/İstanbul",
    timePeriod: "1400-1600",
    neighborhood: "Sinanpaşa",
    summary: "Mimar Sinan tarafından 1555'te inşa edilen, Beşiktaş'ın en eski cami yapısı.",
    fullHistory:
      "Kanuni Sultan Süleyman döneminin ünlü kaptan-ı deryası Sinan Paşa adına Mimar Sinan tarafından 1555-1556 yıllarında inşa edilen bu cami, Beşiktaş'ın en köklü dini yapılarından biridir. Klasik Osmanlı mimarisinin sade ve zarif özelliklerini taşıyan cami, tek minareli yapısıyla Beşiktaş sahilinin siluetine katkıda bulunmaktadır. Çeşitli dönemlerde onarım geçiren yapı, günümüzde de aktif ibadet yeri olarak hizmet vermektedir.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Sinan_Pasha_Mosque%2C_Besiktas.jpg/800px-Sinan_Pasha_Mosque%2C_Besiktas.jpg",
    ],
    era: "1555–1556 (Osmanlı Klasik Dönemi)",
  },
  {
    id: "ihlamur-kasri",
    title: "Ihlamur Kasrı",
    category: "saraylar",
    categoryLabel: "Saraylar & Kasırlar",
    coordinates: [41.0566, 29.0065],
    address: "Ihlamur Yolu Nişantaşı Cd. No:2, 34367 Beşiktaş/İstanbul",
    timePeriod: "1800-1850",
    neighborhood: "Yıldız",
    summary:
      "Sultan Abdülmecid dönemine ait, Barok mimarisiyle dikkat çeken mesire kasrı kompleksi.",
    fullHistory:
      "İstanbul'un Ihlamur semtinde, ıhlamur ağaçlarıyla çevrili bir alanda inşa edilen Ihlamur Kasrı, Sultan Abdülmecid tarafından 1849-1855 yılları arasında Mimar Nikoğos Balyan'a yaptırılmıştır. Kompleks, Merasim Köşkü ve Maiyet Köşkü olmak üzere iki ana yapıdan oluşmaktadır. Osmanlı Barok mimarisinin önemli örnekleri arasında yer alan kasır, günümüzde İstanbul Büyükşehir Belediyesi tarafından yönetilmekte ve ziyaretçilere açık tutulmaktadır.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ihlamur_kasri_istanbul_2007.jpg/1280px-Ihlamur_kasri_istanbul_2007.jpg",
    ],
    era: "1849–1855 (Tanzimat Dönemi)",
  },
  {
    id: "istanbul-deniz-muzesi",
    title: "İstanbul Deniz Müzesi",
    category: "dini-kamusal",
    categoryLabel: "Dini & Kamusal Yapılar",
    coordinates: [41.0432, 29.0038],
    address: "Sinanpaşa Mah. Beşiktaş Cd. No:1, 34353 Beşiktaş/İstanbul",
    timePeriod: "1850-1900",
    neighborhood: "Sinanpaşa",
    summary:
      "Türkiye'nin en kapsamlı denizcilik müzesi; Osmanlı kürekli kadırgaları ve deniz tarihi koleksiyonuyla.",
    fullHistory:
      "1897 yılında kurulan İstanbul Deniz Müzesi, Türkiye'nin en köklü ve en büyük denizcilik müzesidir. Beşiktaş'ta Boğaz kıyısında konumlanan müze; Osmanlı dönemine ait nadide kayıklar, padişah kayıkları, deniz silahları, sancaklar ve haritaları barındıran kapsamlı koleksiyonuyla Türk denizcilik tarihini belgeleyen en önemli kurum niteliğindedir. 2013 yılında restore edilerek yeniden açılan müze, modern sergileme anlayışıyla binlerce tarihi eseri ziyaretçilere sunmaktadır.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Istanbul_Naval_Museum_003.jpg/1280px-Istanbul_Naval_Museum_003.jpg",
    ],
    era: "1897 – Günümüz",
  },
  {
    id: "akaretler-siraevleri",
    title: "Akaretler Sıraevleri",
    category: "tarihi-yapilar",
    categoryLabel: "Tarihi Evler & Yapılar",
    coordinates: [41.0440, 29.0017],
    address: "Süleyman Seba Cd. No:47, 34353 Beşiktaş/İstanbul",
    timePeriod: "1850-1900",
    neighborhood: "Sinanpaşa",
    summary:
      "19. yüzyıldan kalma İstanbul'un ilk toplu konut projesi; günümüzde butik alışveriş ve gastronomi merkezi.",
    fullHistory:
      "1875 yılında Sultan Abdülaziz döneminde inşa edilen Akaretler Sıraevleri, Osmanlı İmparatorluğu'nun ilk modern toplu konut projesini oluşturmaktadır. Başlangıçta Dolmabahçe Sarayı çalışanları için inşa edilen 66 sıra evden oluşan kompleks, tipik Osmanlı neo-klasik mimarisinin özgün bir örneğidir. 2000'li yıllarda Akkök Grubu tarafından kapsamlı biçimde restore edilerek butik mağazalar, restoranlar ve ofis alanlarına dönüştürülmüştür.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Akaretler_row_houses_Besiktas_Istanbul.jpg/1280px-Akaretler_row_houses_Besiktas_Istanbul.jpg",
    ],
    era: "1875 (Tanzimat Dönemi)",
  },
  {
    id: "ataturk-aniti",
    title: "Atatürk-Cumhuriyet-Demokrasi Anıtı",
    category: "heykeller",
    categoryLabel: "Heykeller & Anıtlar",
    coordinates: [41.0418, 29.0055],
    address: "Beşiktaş Meydanı, 34353 Beşiktaş/İstanbul",
    timePeriod: "1900-1960",
    neighborhood: "Sinanpaşa",
    summary: "Beşiktaş Meydanı'nda Cumhuriyet ve demokrasi değerlerini temsil eden anıt.",
    fullHistory:
      "Beşiktaş Meydanı'nın merkezine konumlanan bu anıt, Türkiye Cumhuriyeti'nin kuruluş değerleri olan bağımsızlık, demokrasi ve laikliği simgelemektedir. Atatürk heykelinin yer aldığı anıt, her yıl çeşitli ulusal anma törenlerine sahne olmaktadır. Meydanın kamusal yapısına önemli katkılar sağlayan anıt, Beşiktaş'ın tarihi kimliğinin ayrılmaz bir parçası hâline gelmiştir.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Ataturk_heykel_istanbul_besiktas.jpg/800px-Ataturk_heykel_istanbul_besikras.jpg",
    ],
    era: "20. Yüzyıl (Cumhuriyet Dönemi)",
  },
  {
    id: "besiktas-belediye-binasi",
    title: "Beşiktaş Belediye Binası",
    category: "dini-kamusal",
    categoryLabel: "Dini & Kamusal Yapılar",
    coordinates: [41.0485, 29.0042],
    address: "Aytar Cd. No:2, 34340 Beşiktaş/İstanbul",
    timePeriod: "1900-1960",
    neighborhood: "Nisbetiye",
    summary: "Beşiktaş Belediyesi Hizmet Binası ve Kamusal Yönetim Merkezi.",
    fullHistory:
      "Beşiktaş Belediyesi hizmet binası, Nisbetiye/Abbasağa bölgesinde kent sakinlerine yerel yönetim hizmetleri sunan ana idari merkezdir.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Besiktas_Belediyesi_Logo.svg/1200px-Besiktas_Belediyesi_Logo.svg.png",
    ],
    era: "20. Yüzyıl (Cumhuriyet Dönemi)",
  },
  {
    id: "ortakoy-yalilari",
    title: "Naime Sultan & Hatice Sultan Yalısı (Ortaköy Yalıları)",
    category: "tarihi-yapilar",
    categoryLabel: "Tarihi Evler & Yapılar",
    coordinates: [41.0490, 29.0278],
    address: "Ortaköy Salhanesi Sk. No:1, 34347 Ortaköy/Beşiktaş/İstanbul",
    timePeriod: "1850-1900",
    neighborhood: "Ortaköy",
    summary: "Boğaz kıyısında yükselen, Osmanlı hanedanından sultanlara ait görkemli neo-barok sahil sarayı yalıları.",
    fullHistory:
      "19. yüzyılın sonlarında Sultan II. Abdülhamid tarafından kızları Naime Sultan ve Hatice Sultan için inşa ettirilen bu görkemli sahil sarayları, Boğaziçi sivil mimarisinin en seçkin örneklerindendir. Zengin ahşap süslemeleri, geniş cumba yapıları ve denizle bütünleşen rıhtımıyla Ortaköy sahilinin tarihi dokusuna damga vurmaktadır.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Ortakoy_mosque_%28Mecidiye_Mosque%29_and_Bosphorus_bridge.jpg/1280px-Ortakoy_mosque_%28Mecidiye_Mosque%29_and_Bosphorus_bridge.jpg"
    ],
    era: "19. Yüzyıl (Hamidiye Dönemi)",
  },
  {
    id: "misir-konsoloslugu-hidiva-palas",
    title: "Mısır Konsolosluğu (Hidiva Sarayı)",
    category: "tarihi-yapilar",
    categoryLabel: "Tarihi Evler & Yapılar",
    coordinates: [41.0770, 29.0438],
    address: "Cevdet Paşa Cd. No:12, 34342 Bebek/Beşiktaş/İstanbul",
    timePeriod: "1900-1960",
    neighborhood: "Bebek",
    summary: "Bebek sahilinde yer alan, mimar Raimondo D'Aronco imzalı dünyaca ünlü Art Nouveau şaheseri sahil sarayı.",
    fullHistory:
      "1902 yılında Mısır Hıdivi Abbas Hilmi Paşa'nın annesi Hıdiva Emine Valide Paşa tarafından İtalyan mimar Raimondo D'Aronco'ya yaptırılan bina, İstanbul'daki Art Nouveau mimarisinin en görkemli örneğidir. Boğaz'a sıfır rıhtımı ve zarif mermer detaylarıyla Bebek koyunun simgesidir.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Egyptian_Consulate_in_Istanbul.jpg/1280px-Egyptian_Consulate_in_Istanbul.jpg"
    ],
    era: "1902 (II. Meşrutiyet Dönemi)",
  },
  {
    id: "seyh-zafir-kulliyesi",
    title: "Şeyh Zafir Türbesi & Kütüphanesi",
    category: "tarihi-yapilar",
    categoryLabel: "Tarihi Evler & Yapılar",
    coordinates: [41.0458, 29.0068],
    address: "Serencebey Yokuşu No:12, 34349 Cihannüma/Beşiktaş/İstanbul",
    timePeriod: "1900-1960",
    neighborhood: "Cihannüma",
    summary: "Sultan II. Abdülhamid döneminde Raimondo D'Aronco tarafından tasarlanan ikonik Art Nouveau türbe ve kütüphane kompleksi.",
    fullHistory:
      "1905-1906 yıllarında inşa edilen kompleks; türbe, kütüphane ve çeşmeden oluşmaktadır. Saray mimarı Raimondo D'Aronco'nun doğu ve batı motiflerini harmanlayarak ortaya koyduğu bu özgün yapı, İstanbul'un taş mimarisindeki en zarif Art Nouveau detaylara sahiptir.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Barbaros_Hey.jpg/800px-Barbaros_Hey.jpg"
    ],
    era: "1905 (II. Meşrutiyet Dönemi)",
  },
  {
    id: "besiktas-tarihi-carsisi",
    title: "Tarihi Beşiktaş Çarşısı & Köyiçi",
    category: "tarihi-yapilar",
    categoryLabel: "Tarihi Evler & Yapılar",
    coordinates: [41.0438, 29.0048],
    address: "Köyiçi Sk., Sinanpaşa Mah., 34353 Beşiktaş/İstanbul",
    timePeriod: "1900-1960",
    neighborhood: "Sinanpaşa",
    summary: "Geleneksel mahalle yaşamının, pasajların ve tarihi esnaf kültürünün canlı olarak yaşatıldığı Beşiktaş'ın merkezi.",
    fullHistory:
      "Osmanlı döneminden bu yana Beşiktaş'ın ticari ve sosyal yaşamının kalbi olan Köyiçi bölgesi; kartal heykelli meydanı, tarihi balık pazarı, dar sokakları ve cumbalı eski dükkanlarıyla yaşayan bir kent mirasıdır.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Akaretler_row_houses_Besiktas_Istanbul.jpg/1280px-Akaretler_row_houses_Besiktas_Istanbul.jpg"
    ],
    era: "19. Yüzyıl – Günümüz",
  },
];
