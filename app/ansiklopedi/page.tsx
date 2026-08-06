"use client";
import { useState, useMemo, useEffect } from "react";
import { X, Search, BookOpen, MapPin, Calendar, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { HistoricalEvent, EventCategory } from "@/data/ansiklopediData";
import { fetchOlaylarFromDb } from "@/lib/db-service";

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

function EventModal({ event, onClose }: { event: HistoricalEvent; onClose: () => void }) {
  const eraColor = ERA_COLORS[event.era] ?? "#c5a059";
  const eventImages = (event.images && event.images.length > 0 ? event.images : [event.image]).filter(Boolean);
  const [imgIdx, setImgIdx] = useState(0);
  const hasMultipleImages = eventImages.length > 1;

  return (
    <>
      <div
        className="landmark-backdrop"
        onClick={onClose}
        aria-label="Kapat"
      />
      <div
        className="landmark-modal flex flex-col md:grid md:grid-cols-12 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        id={`event-modal-${event.id}`}
      >
        {/* ── Left Column: Bilgiler (MD: 7 cols) ── */}
        <div className="md:col-span-7 flex flex-col h-full overflow-y-auto p-6 md:p-8 order-2 md:order-1 border-t md:border-t-0 md:border-r border-white/10">
          
          {/* Era + Category + Date badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
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

          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4">
            {event.title}
          </h2>

          {event.location && (
            <div className="flex items-center gap-2 mb-4 text-sm text-[var(--muted)]">
              <MapPin size={14} style={{ color: eraColor }} />
              <span>{event.location}</span>
            </div>
          )}

          <p
            className="text-sm text-[var(--muted)] leading-relaxed italic border-l-2 pl-4 mb-5"
            style={{ borderColor: eraColor }}
          >
            {event.summary}
          </p>

          <div className="border-t border-white/8 mb-5" />

          <div className="text-sm text-neutral-300 leading-7 whitespace-pre-line mb-6 flex-1">
            {event.fullText || event.description || event.summary}
          </div>

          {/* Tags + Share */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-white/8 mt-auto">
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
        <div className="md:col-span-5 relative h-64 md:h-full bg-[#07080a] flex items-center justify-center order-1 md:order-2 overflow-hidden group">
          {eventImages.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={eventImages[imgIdx]}
              alt={`${event.title} foto ${imgIdx + 1}`}
              className="w-full h-full object-contain p-2"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl opacity-10">
              <BookOpen size={80} />
            </div>
          )}

          {/* Close button (top right) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-white hover:bg-black transition-colors z-20 shadow-lg border border-white/10"
            id={`event-modal-close-${event.id}`}
            aria-label="Kapat"
          >
            <X size={18} />
          </button>

          {/* Carousel Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={() => setImgIdx((i) => (i === 0 ? eventImages.length - 1 : i - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/90 transition-all z-20 border border-white/10"
                aria-label="Önceki fotoğraf"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setImgIdx((i) => (i + 1) % eventImages.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/90 transition-all z-20 border border-white/10"
                aria-label="Sonraki fotoğraf"
              >
                <ChevronRight size={18} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
                {eventImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === imgIdx ? "bg-[var(--accent)] w-5" : "bg-white/40 w-1.5"
                    }`}
                    aria-label={`Fotoğraf ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Photo Counter */}
          {eventImages.length > 0 && (
            <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] text-white/80 font-mono border border-white/10 z-20">
              {imgIdx + 1} / {eventImages.length}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default function AnsiklopediPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeEvent, setActiveEvent] = useState<HistoricalEvent | null>(null);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      try {
        const data = await fetchOlaylarFromDb();
        if (isMounted) {
          setEvents(data);
        }
      } catch (e) {
        console.error("Error loading events:", e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchCat = selectedCategory === "all" || e.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        e.era.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery, events]);

  return (
    <main className="min-h-screen pt-28 pb-24 px-6 md:px-[8vw]">
      {/* ─── Header ─── */}
      <div className="max-w-screen-xl mx-auto">
        <p className="eyebrow mb-3">Beşiktaş Belediyesi</p>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
          Beşiktaş&apos;ta Geçen
          <br />
          <span className="text-[var(--accent)]">Tarihi Olaylar</span>
        </h1>
        <p className="text-lg text-[var(--muted)] mb-10 max-w-2xl leading-relaxed">
          Yüzyıllar boyunca Beşiktaş&apos;ta yaşanan veya Beşiktaş&apos;ı doğrudan etkileyen
          tarihi dönüm noktaları; savaşlar, siyasi krizler, kültürel gelişmeler ve daha fazlası.
        </p>

        {/* ─── Search bar ─── */}
        <div className="relative max-w-md mb-8">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            id="ansiklopedi-search"
            placeholder="Olay, dönem veya etiket ara…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        {/* ─── Category filter ─── */}
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
                  className="ansiklopedi-card text-left"
                  onClick={() => setActiveEvent(event)}
                >
                  {/* Card image */}
                  {cardImage ? (
                    <div className="w-full h-44 rounded-xl overflow-hidden mb-4 bg-[#0a0b0e]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cardImage}
                        alt={event.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        loading="lazy"
                      />
                    </div>
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
                  <h2 className="text-base font-bold text-white leading-snug mb-2">
                    {event.title}
                  </h2>

                  {/* Summary */}
                  <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-3">
                    {event.summary}
                  </p>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-center gap-1.5 mt-3 text-[11px] text-[var(--muted)]">
                      <MapPin size={10} style={{ color: eraColor }} />
                      <span>{event.location}</span>
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
