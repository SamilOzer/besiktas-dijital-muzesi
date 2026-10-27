import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, MapPin, LibraryBig, Route } from "lucide-react";

const places = [
  { id: "dolmabahce-sarayi", title: "Dolmabahçe Sarayı", category: "Saraylar ve kasırlar", image: "/images/map/dolmabahce-palace.webp", text: "Boğaz kıyısında bir dönemin izleri." },
  { id: "ihlamur-kasri", title: "Ihlamur Kasrı", category: "Saraylar ve kasırlar", image: "/images/museum/ihlamur-garden.jpg", text: "Manolyaların arasında bir bahar hikâyesi." },
  { id: "yildiz-sarayi", title: "Yıldız Sarayı", category: "Saraylar ve kasırlar", image: "/images/map/yildiz-palace.webp", text: "Ağaçların arasında saklı bir tarih." },
];

export default function HomeContent() {
  return <>
    <section className="museum-hero">
      <div className="hero-copy">
        <p className="section-kicker"><span className="live-dot" /> İstanbul’un yaşayan kent hafızası</p>
        <h1>Bir semt.<br />Binbir<br />hikâye.</h1>
        <p className="hero-description">Saraylardan sokaklara, geçmişten bugüne.<br />Beşiktaş’ı bir de hikâyeleriyle tanıyın.</p>
        <Link className="museum-button" href="/harita">Keşfe başlayın <ArrowUpRight size={20} aria-hidden="true" /></Link>
        <a className="hero-scroll" href="#koleksiyon"><ArrowDown size={16} aria-hidden="true" /> Müzede bir gezinti</a>
      </div>
      <figure className="hero-photo">
        <Image src="/images/map/ortakoy-mosque.webp" alt="Boğaz kıyısında Büyük Mecidiye Camii ve İstanbul Boğazı" fill priority sizes="(max-width: 760px) 100vw, 58vw" />
        <figcaption><span><MapPin size={15} aria-hidden="true" /> Ortaköy, Beşiktaş</span><Link href="/harita#ortakoy-camii" aria-label="Büyük Mecidiye Camii'ni haritada keşfet"><ArrowUpRight size={22} /></Link></figcaption>
        <span className="photo-side-note">Bir kentin hafızasına açılan pencere</span>
      </figure>
    </section>
    <div className="museum-paths">
      <Link href="/harita"><span className="path-icon"><Route size={28} strokeWidth={1.8} aria-hidden="true" /></span><span className="path-copy">Adım adım Beşiktaş<small>Kültür haritasını keşfedin</small></span><ArrowUpRight size={22} aria-hidden="true" /></Link>
      <Link href="/ansiklopedi"><span className="path-icon"><LibraryBig size={28} strokeWidth={1.8} aria-hidden="true" /></span><span className="path-copy">Geçmişin sayfaları<small>Kent ansiklopedisini okuyun</small></span><ArrowUpRight size={22} aria-hidden="true" /></Link>
    </div>
    <section id="koleksiyon" className="collection-section museum-container">
      <div className="section-heading"><div><p className="section-kicker">Koleksiyondan bir seçki</p><h2>Tanıdık yerler,<br />yeni hikâyeler.</h2></div><div><p>Her gün önünden geçtiğimiz yapılar,<br />yüzyıllardır anlatılmayı bekleyen hikâyeler.</p><Link className="text-link" href="/harita">Tüm mekânları keşfedin <ArrowUpRight size={18} aria-hidden="true" /></Link></div></div>
      <div className="place-grid">{places.map(place => <Link className="place-card" key={place.id} href={"/harita#" + place.id}><div className="place-image"><Image src={place.image} alt={place.title} fill sizes="(max-width: 760px) 100vw, 40vw" /><span className="image-link"><ArrowUpRight size={22} aria-hidden="true" /></span></div><p className="place-category">{place.category}</p><h3>{place.title}</h3><p>{place.text}</p></Link>)}</div><p className="photo-credit">Ihlamur fotoğrafı: Lambiam. <Link href="/hakkimizda#fotograf-kaynaklari">Fotoğraf kaynakları ve lisanslar</Link></p>
    </section>
    <section className="city-story" aria-labelledby="story-title">
      <div className="story-photograph"><div className="story-image"><Image src="/images/museum/besiktas-ferry.jpg" alt="Akşam saatlerinde Beşiktaş kıyısındaki vapurlar ve Boğaz Köprüsü" fill sizes="(max-width: 760px) 100vw, 50vw" /></div><span>Beşiktaş kıyısında akşam · <Link href="/hakkimizda#fotograf-kaynaklari">Adil Amiraslanov</Link></span></div>
      <div className="story-chapters">
        <article><p className="section-kicker">Kıyıdan kente</p><h2 id="story-title">Bir kıyıdan<br />fazlası.</h2><p>Vapurların yanaştığı, yolların kesiştiği, hayatların birbirine değdiği bir yer. Beşiktaş’ın hafızası, sokaklarında yaşamaya devam ediyor.</p><a className="story-next" href="#story-today">Hikâye devam ediyor <ArrowDown size={17} aria-hidden="true" /></a></article>
        <article id="story-today"><p className="section-kicker">Dünden bugüne</p><h2>Hatırlamak,<br />birlikte mümkün.</h2><p>Bir fotoğraf, bir yapı, bir hatıra… Bu müze, Beşiktaş’ın farklı dönemlerini ve onları birbirine bağlayan insan hikâyelerini bir araya getiriyor.</p><Link className="museum-button button-light" href="/ansiklopedi">Kent hafızasını okuyun <ArrowUpRight size={18} aria-hidden="true" /></Link></article>
      </div>
    </section>
    <section className="contribution-banner museum-container"><div><p className="section-kicker">Bu müzede sizin de yeriniz var</p><h2>Sizin Beşiktaş’ınız<br />nasıl bir yer?</h2></div><div><p>Bir aile albümü, unutulmuş bir mekân, semtinize ait bir hikâye. Bildiklerinizi paylaşın, kent hafızasını birlikte büyütelim.</p><Link className="museum-button" href="/katkida-bulun">Hafızaya katkı verin <ArrowUpRight size={18} aria-hidden="true" /></Link></div></section>
  </>;
}
