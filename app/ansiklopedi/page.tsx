"use client";
import { useState, useMemo, useEffect } from "react";
import { X, Search, BookOpen, MapPin, Calendar, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";
import { ansiklopediData, HistoricalEvent, EventCategory } from "@/data/ansiklopediData";
import { fetchOlaylarFromDb, getCachedOlaylar } from "@/lib/db-service";

const CATEGORIES: { id: string; label: string; emoji: string }[] = [
  { id: "all",       label: "Tümü",              emoji: "📚" },
  { id: "siyasi",    label: "Siyasi",             emoji: "🏛️" },
  { id: "askeri",    label: "Askeri",             emoji: "⚔️" },
  { id: "kulturel",  label: "Kültürel",           emoji: "🎭" },
  { id: "toplumsal", label: "Toplumsal",          emoji: "👥" },
  { id: "spor",      label: "Spor",               emoji: "🏟️" },
  { id: "mimari",    label: "Mimari",             emoji: "🏗️" },
];

const ERA_COLORS: Record<string, string> = {
  "Osmanlı Klasik Dönemi": "#c5a059",
  "Tanzimat Dönemi":        "#9b6fd0",
  "Hamidiye Dönemi":        "#4a9ead",
  "II. Meşrutiyet Dönemi":  "#e85d3a",
  "Cumhuriyet Dönemi":      "#5a9a6b",
  "II. Abdülhamid Dönemi":  "#4a9ead",
};

function EventImage({ src, label, className = "" }: { src?: string; label: string; className?: string }) {
  const [imageState, setImageState] = useState<"loading" | "ready" | "error">(src ? "loading" : "error");

  useEffect(() => {
    setImageState(src ? "loading" : "error");
  }, [src]);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#10141a] ${className}`} aria-label={label} role="img">
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a2028] via-[#11161c] to-[#0b0e12] text-[var(--accent)]/35">
        <BookOpen size={34} strokeWidth={1.35} aria-hidden="true" />
      </div>
      {src && imageState !== "error" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${imageState === "ready" ? "opacity-100" : "opacity-0"}`}
          style={{ objectFit: "cover" }}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageState("ready")}
          onError={() => setImageState("error")}
        />
      )}
    </div>
  );
}

function EventModal({ event, onClose }: { event: HistoricalEvent; onClose: () => void }) {
  const eraColor = ERA_COLORS[event.era] ?? "#c5a059";
  const eventImages = (event.images && event.images.length > 0 ? event.images : [event.image]).filter(
    (image): image is string => Boolean(image)
  );
  const [imgIdx, setImgIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasMultipleImages = eventImages.length > 1;

  // ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        className="landmark-backdrop"
        onClick={onClose}
        aria-label="Kapat"
      />
      <div
        className="landmark-modal flex flex-col md:grid md:grid-cols-12"
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        id={`event-modal-${event.id}`}
      >
        {/* ── Left Column: Bilgiler (MD: 7 cols) ── */}
        <div
          className="md:col-span-7 flex flex-col min-h-0 overflow-y-auto p-5 md:p-8 order-2 md:order-1 border-t md:border-t-0 md:border-r border-white/10"
          style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}
        >

          {/* Era + Category + Date badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4 flex-shrink-0">
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: `${eraColor}28`, color: eraColor, border: `1px solid ${eraColor}50` }}
            >
              {event.era}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/6 text-[var(--muted)] border border-white/10">
              <Calendar size={11} /> {event.date}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/6 text-[var(--muted)] border border-white/10">
              {event.categoryLabel}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4 flex-shrink-0">
            {event.title}
          </h2>

          {event.location && (
            <div className="flex items-center gap-2 mb-4 text-sm text-[var(--muted)] flex-shrink-0">
              <MapPin size={14} style={{ color: eraColor }} />
              <span>{event.location}</span>
            </div>
          )}

          <div className="border-t border-white/8 mb-5 flex-shrink-0" />

          {/* Full description — no summary pull-quote */}
          <div className="mb-6 break-words whitespace-pre-line text-sm leading-7 text-neutral-300">
            {event.fullText || event.description || event.summary}
          </div>

          {/* Tags + Share */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-4">
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-xs bg-white/5 text-[var(--muted)] border border-white/8"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => {
                const url = `${window.location.origin}/ansiklopedi?olay=${event.id}`;
                if (navigator.share) {
                  navigator.share({ title: event.title, text: event.summary, url });
                } else {
                  navigator.clipboard.writeText(url);
                  alert('Link kopyalandı!');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors shadow-sm"
            >
              <Share2 size={14} />
              Paylaş
            </button>
          </div>
        </div>

        {/* ── Right Column: Fotoğraflar & Carousel (MD: 5 cols) ── */}
        <div className="md:col-span-5 relative flex-shrink-0 h-52 md:h-full bg-[#07080a] flex items-center justify-center order-1 md:order-2 overflow-hidden group">
          <EventImage
            src={eventImages[imgIdx]}
            label={`${event.title} fotoğrafı ${imgIdx + 1}`}
            className="[&>img]:!object-contain [&>img]:p-2"
          />

          {/* Close button (top right) */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-white hover:bg-black transition-colors z-20 shadow-lg border border-white/10"
            id={`event-modal-close-${event.id}`}
            aria-label="Kapat"
          >
            <X size={18} />
          </button>

          {/* Photo Counter Badge */}
          {eventImages.length > 0 && (
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md text-xs text-white font-semibold border border-white/15 z-20 flex items-center gap-1.5">
              <span>📷</span>
              <span>{imgIdx + 1} / {eventImages.length}</span>
            </div>
          )}

          {/* Carousel Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={() => setImgIdx((i) => (i === 0 ? eventImages.length - 1 : i - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/90 transition-all z-20 border border-white/10"
                aria-label="Önceki fotoğraf"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setImgIdx((i) => (i + 1) % eventImages.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/90 transition-all z-20 border border-white/10"
                aria-label="Sonraki fotoğraf"
              >
                <ChevronRight size={20} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
                {eventImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === imgIdx ? "bg-[var(--accent)] w-6" : "bg-white/40 w-2"
                    }`}
                    aria-label={`Fotoğraf ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </>,
    document.body
  );
}

export default function AnsiklopediPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEra, setSelectedEra] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeEvent, setActiveEvent] = useState<HistoricalEvent | null>(null);
  const [events, setEvents] = useState<HistoricalEvent[]>(ansiklopediData);

  useEffect(() => {
    let isMounted = true;

    // Static content renders with the first HTML response; the freshest browser
    // cache replaces it immediately, while Supabase sync continues in the background.
    setEvents(getCachedOlaylar());

    const loadEvents = async () => {
      try {
        const data = await fetchOlaylarFromDb();
        if (isMounted) {
          setEvents(data);
        }
      } catch (e) {
        console.error("Error loading events:", e);
      }
    };

    void loadEvents();

    const handleUpdate = () => {
      if (isMounted) setEvents(getCachedOlaylar());
    };
    window.addEventListener("besiktas_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("besiktas_data_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchCat = selectedCategory === "all" || e.category === selectedCategory;
      const matchEra = selectedEra === "all" || (e.era && e.era.toLowerCase().includes(selectedEra.toLowerCase()));
      const matchLoc = selectedLocation === "all" || (e.location && e.location.toLowerCase().includes(selectedLocation.toLowerCase()));
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        (e.fullText && e.fullText.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q)) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        e.era.toLowerCase().includes(q);
      return matchCat && matchEra && matchLoc && matchSearch;
    });
  }, [selectedCategory, selectedEra, selectedLocation, searchQuery, events]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedEra("all");
    setSelectedLocation("all");
    setSearchQuery("");
  };

  return (
    <main className="min-h-screen px-4 pb-24 pt-28 sm:px-6 md:px-[8vw]">
      {/* ─── Header ─── */}
      <div className="max-w-screen-xl mx-auto">
        <p className="eyebrow mb-3">Beşiktaş Belediyesi</p>
        <h1 className="mb-4 max-w-4xl break-words text-[clamp(2.45rem,6vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.035em] text-white">
          Beşiktaş&apos;ta Geçen
          <br />
          <span className="text-[var(--accent)]">Tarihi Olaylar</span>
        </h1>
        <p className="text-lg text-[var(--muted)] mb-10 max-w-2xl leading-relaxed">
          Yüzyıllar boyunca Beşiktaş&apos;ta yaşanan veya Beşiktaş&apos;ı doğrudan etkileyen
          tarihi dönüm noktaları; savaşlar, siyasi krizler, kültürel gelişmeler ve daha fazlası.
        </p>

        {/* ─── Search & Dropdown Filters Bar ─── */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-8">
          <div className="relative min-w-0 flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              id="ansiklopedi-search"
              placeholder="Olay, konu veya etiket ara…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center">
            {/* Era Filter */}
            <select
              value={selectedEra}
              onChange={(e) => setSelectedEra(e.target.value)}
              className="w-full min-w-0 rounded-xl border border-white/15 bg-[#14161d] px-4 py-3 text-xs text-white focus:border-[var(--accent)] focus:outline-none sm:w-auto [&>option]:bg-[#14161d]"
            >
              <option value="all">📅 Tüm Dönemler</option>
              <option value="Osmanlı Klasik Dönemi">Osmanlı Klasik Dönemi</option>
              <option value="Tanzimat Dönemi">Tanzimat Dönemi</option>
              <option value="Hamidiye Dönemi">Hamidiye Dönemi</option>
              <option value="II. Meşrutiyet Dönemi">II. Meşrutiyet Dönemi</option>
              <option value="Cumhuriyet Dönemi">Cumhuriyet Dönemi</option>
              <option value="19. Yüzyıl">19. Yüzyıl</option>
              <option value="20. Yüzyıl">20. Yüzyıl</option>
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full min-w-0 rounded-xl border border-white/15 bg-[#14161d] px-4 py-3 text-xs text-white focus:border-[var(--accent)] focus:outline-none sm:w-auto [&>option]:bg-[#14161d]"
            >
              <option value="all">📍 Tüm Konumlar</option>
              <option value="Beşiktaş Meydanı">Beşiktaş Meydanı</option>
              <option value="Dolmabahçe">Dolmabahçe</option>
              <option value="Ortaköy">Ortaköy</option>
              <option value="Yıldız">Yıldız</option>
              <option value="Akaretler">Akaretler</option>
              <option value="Ihlamur">Ihlamur</option>
              <option value="Bebek">Bebek</option>
              <option value="Arnavutköy">Arnavutköy</option>
              <option value="Levent">Levent</option>
              <option value="Abbasağa">Abbasağa</option>
              <option value="Vişnezade">Vişnezade</option>
              <option value="Sinanpaşa">Sinanpaşa</option>
              <option value="Kuruçeşme">Kuruçeşme</option>
            </select>

            {(selectedCategory !== "all" || selectedEra !== "all" || selectedLocation !== "all" || searchQuery !== "") && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[var(--accent)] hover:underline px-2 py-1"
              >
                Filtreleri Sıfırla
              </button>
            )}
          </div>
        </div>

        {/* ─── Category filter tabs ─── */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map(({ id, label, emoji }) => (
            <button
              key={id}
              id={`cat-${id}`}
              onClick={() => setSelectedCategory(id)}
              className={`cat-tab ${selectedCategory === id ? "active" : ""}`}
            >
              <span className="mr-1">{emoji}</span>
              {label}
            </button>
          ))}
        </div>

        {/* ─── Result count ─── */}
        <p className="text-xs text-[var(--muted)] mb-6">
          <span className="text-[var(--accent)] font-bold text-sm">{filtered.length}</span>
          &nbsp;olay listeleniyor
        </p>

        {/* ─── Event grid ─── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-[var(--muted)]">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Sonuç bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((event) => {
              const eraColor = ERA_COLORS[event.era] ?? "#c5a059";
              const cardImage = event.image || event.images?.[0];
              return (
                <button
                  key={event.id}
                  id={`event-card-${event.id}`}
                  className="ansiklopedi-card group flex h-full min-w-0 flex-col text-left"
                  onClick={() => setActiveEvent(event)}
                >
                  {/* Card image */}
                  {cardImage ? (
                    <EventImage
                      src={cardImage}
                      label={`${event.title} görseli`}
                      className="mb-4 h-44 rounded-xl [&>img]:opacity-85 group-hover:[&>img]:opacity-100"
                    />
                  ) : null}

                  {/* Era badge */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                      style={{ background: `${eraColor}20`, color: eraColor, border: `1px solid ${eraColor}40` }}
                    >
                      {event.era}
                    </span>
                    <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                      <Calendar size={10} /> {event.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="mb-2 break-words text-base font-bold leading-snug text-white">
                    {event.title}
                  </h2>

                  {/* Summary */}
                  <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-3">
                    {event.summary}
                  </p>

                  {/* Location */}
                  {event.location && (
                    <div className="mt-3 flex min-w-0 items-start gap-1.5 text-[11px] text-[var(--muted)]">
                      <MapPin size={10} style={{ color: eraColor }} />
                      <span className="min-w-0 break-words">{event.location}</span>
                    </div>
                  )}

                  {/* Read more hint */}
                  <div
                    className="mt-4 text-xs font-semibold"
                    style={{ color: eraColor }}
                  >
                    Devamını oku →
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Event detail modal ─── */}
      {activeEvent && (
        <EventModal event={activeEvent} onClose={() => setActiveEvent(null)} />
      )}
    </main>
  );
}
