"use client";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { ArrowUpRight, BookOpen, Search } from "lucide-react";
import { ansiklopediData, HistoricalEvent } from "@/data/ansiklopediData";
import { fetchOlaylarFromDb, getCachedOlaylar } from "@/lib/db-service";
import MuseumDetail, { ArchiveImage } from "@/components/MuseumDetail";

const categories = [
  { id: "all", label: "Tümü" }, { id: "siyasi", label: "Siyasi" }, { id: "askeri", label: "Askeri" },
  { id: "kulturel", label: "Kültürel" }, { id: "toplumsal", label: "Toplumsal" }, { id: "spor", label: "Spor" }, { id: "mimari", label: "Mimari" }, { id: "diger", label: "Diğer" },
];
// Current site photographs supplement archive images without replacing the source records.
const sitePhotos: Record<string, string> = {
  "dolmabahce-acilis": "/images/map/dolmabahce-palace.webp",
  "abdulhamid-yildiz": "/images/map/yildiz-palace.webp",
};
function eventPhotos(event: HistoricalEvent) {
  return Array.from(new Set([sitePhotos[event.id], ...(event.images?.length ? event.images : [event.image])].filter((image): image is string => Boolean(image))));
}
export default function AnsiklopediPage() {
  const [category, setCategory] = useState("all");
  const [era, setEra] = useState("all");
  const [location, setLocation] = useState("all");
  const [query, setQuery] = useState("");
  const [activeEvent, setActiveEvent] = useState<HistoricalEvent | null>(null);
  const [events, setEvents] = useState<HistoricalEvent[]>(ansiklopediData);
  useEffect(() => {
    let active = true;
    setEvents(getCachedOlaylar());
    fetchOlaylarFromDb().then(data => { if (active) setEvents(data); }).catch(console.error);
    const update = () => { if (active) setEvents(getCachedOlaylar()); };
    window.addEventListener("besiktas_data_updated", update);
    window.addEventListener("storage", update);
    return () => { active = false; window.removeEventListener("besiktas_data_updated", update); window.removeEventListener("storage", update); };
  }, []);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("olay");
    if (id) setActiveEvent(events.find(event => event.id === id) || null);
  }, [events]);
  const eras = useMemo(() => Array.from(new Set(events.map(e => e.era).filter(Boolean))), [events]);
  const locations = useMemo(() => Array.from(new Set(events.map(e => e.location).filter((v): v is string => Boolean(v)))).sort((a, b) => a.localeCompare(b, "tr")), [events]);
  const filtered = useMemo(() => {
    const search = query.toLocaleLowerCase("tr").trim();
    return events.filter(event => (category === "all" || event.category === category) && (era === "all" || event.era === era) && (location === "all" || event.location === location) && (!search || [event.title, event.summary, event.fullText, event.location, event.era, ...event.tags].filter(Boolean).join(" ").toLocaleLowerCase("tr").includes(search)));
  }, [category, era, location, query, events]);
  const reset = () => { setCategory("all"); setEra("all"); setLocation("all"); setQuery(""); };
  const open = (event: HistoricalEvent) => { setActiveEvent(event); window.history.replaceState(null, "", "/ansiklopedi?olay=" + encodeURIComponent(event.id)); };
  const close = () => { setActiveEvent(null); window.history.replaceState(null, "", "/ansiklopedi"); };
  return <main id="main-content" className="interior-page museum-container">
    <div className="breadcrumb"><Link href="/">Ana sayfa</Link><span>/</span><span>Ansiklopedi</span></div>
    <div className="archive-heading"><header className="page-heading"><h1>Geçmişin sayfalarında<br />Beşiktaş.</h1><p>Bir semti şekillendiren olaylar, insanlar ve dönüm noktaları.<br />Kent hafızasının izini sürün.</p></header><div className="archive-emblem"><BookOpen size={53} strokeWidth={1} aria-hidden="true" /></div></div>
    <div className="archive-tools">
      <div className="archive-search-row"><label className="archive-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Ansiklopedide ara</span><input className="museum-input" id="ansiklopedi-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Bir olay, yer veya hikâye arayın…" type="search" /></label>
        <select className="museum-input" aria-label="Tarihi dönem" value={era} onChange={e => setEra(e.target.value)}><option value="all">Tüm dönemler</option>{eras.map(v => <option key={v}>{v}</option>)}</select>
        <select className="museum-input" aria-label="Konum" value={location} onChange={e => setLocation(e.target.value)}><option value="all">Tüm konumlar</option>{locations.map(v => <option key={v}>{v}</option>)}</select>
      </div>
      <div className="archive-tabs" role="group" aria-label="Olay kategorileri">{categories.map(item => <button key={item.id} id={"cat-" + item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div>
    </div>
    <div className="archive-results"><p role="status"><strong>{filtered.length}</strong> hikâye keşfedilmeyi bekliyor</p>{(category !== "all" || era !== "all" || location !== "all" || query) && <button onClick={reset}>Filtreleri temizle</button>}</div>
    {filtered.length ? <div className="archive-grid">{filtered.map(event => <button key={event.id} id={"event-card-" + event.id} className="archive-card" onClick={() => open(event)}>
      <ArchiveImage key={event.image || event.id} src={eventPhotos(event)[0]} title={sitePhotos[event.id] ? event.location + ", günümüz görünümü" : event.title} fallback={event.date.match(/\d{4}/)?.[0] || "Arşiv"} />
      <div className="archive-card-meta"><span>{event.categoryLabel}</span><span>{event.date}</span></div><h2>{event.title}</h2><p className="line-clamp-3">{event.summary}</p><span className="archive-read">Hikâyeyi okuyun <ArrowUpRight size={18} aria-hidden="true" /></span>
    </button>)}</div> : <div className="empty-state"><h2>Henüz bir eşleşme yok.</h2><p>Başka bir kelime deneyin ya da filtreleri kaldırarak tüm arşivi inceleyin.</p><button className="museum-button" onClick={reset}>Tüm hikâyeleri göster</button></div>}
    {activeEvent && <MuseumDetail key={activeEvent.id} title={activeEvent.title} meta={[activeEvent.era, activeEvent.date, activeEvent.categoryLabel]} location={activeEvent.location} body={activeEvent.fullText || activeEvent.description || activeEvent.summary} images={eventPhotos(activeEvent)} tags={activeEvent.tags} sharePath={"/ansiklopedi?olay=" + encodeURIComponent(activeEvent.id)} onClose={close} />}
  </main>;
}
