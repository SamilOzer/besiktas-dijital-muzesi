"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Share2, Navigation, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { PinLocation } from "@/data/besiktasPinData";

interface LandmarkModalProps {
  pin: PinLocation;
  onClose: () => void;
}

const categoryColors: Record<string, string> = {
  heykeller: "#c5a059",
  saraylar: "#9b6fd0",
  "tarihi-yapilar": "#4a9ead",
  spor: "#e11d48",
  "dini-kamusal": "#5a9a6b",
};

const categoryIcons: Record<string, string> = {
  heykeller: "🗿",
  saraylar: "🏰",
  "tarihi-yapilar": "🏛️",
  spor: "🏟️",
  "dini-kamusal": "⛪",
};

export default function LandmarkModal({ pin, onClose }: LandmarkModalProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const color = categoryColors[pin.category] ?? "#c5a059";
  const catIcon = categoryIcons[pin.category] ?? "📍";
  const displayImages = (pin.images && pin.images.length > 0 ? pin.images : []).filter(Boolean);
  const hasMultipleImages = displayImages.length > 1;

  const handleDirections = () => {
    const [lat, lng] = pin.coordinates;
    window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
  };

  const handleShare = () => {
    const url = `${window.location.origin}/harita#${pin.id}`;
    if (navigator.share) {
      navigator.share({ title: pin.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => alert("Bağlantı kopyalandı!"));
    }
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* ── Backdrop ── */}
      <div
        className="landmark-backdrop"
        onClick={onClose}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        aria-label="Kapat"
      />

      {/* ── 2-Column Landscape Modal ── */}
      <div
        className="landmark-modal flex flex-col md:grid md:grid-cols-12 overflow-hidden overscroll-contain"
        role="dialog"
        aria-modal="true"
        aria-label={pin.title}
        id={`landmark-modal-${pin.id}`}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* ── Left Column: Bilgiler (MD: 7 cols) ── */}
        <div className="md:col-span-7 flex flex-col h-full overflow-y-auto overscroll-contain p-6 md:p-8 order-2 md:order-1 border-t md:border-t-0 md:border-r border-white/10">
          
          {/* Category & Era badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: `${color}28`, color, border: `1px solid ${color}50` }}
            >
              {catIcon} {pin.categoryLabel}
            </span>
            {pin.era && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/6 text-[var(--muted)] border border-white/10">
                📅 {pin.era}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4">
            {pin.title}
          </h2>

          {/* Address */}
          {pin.address && (
            <div className="flex items-start gap-2 mb-4 text-sm text-[var(--muted)]">
              <MapPin size={15} className="mt-0.5 flex-shrink-0" style={{ color }} />
              <span>{pin.address}</span>
            </div>
          )}

          {/* Summary pull-quote */}
          <p
            className="text-sm text-[var(--muted)] leading-relaxed italic border-l-2 pl-4 mb-5"
            style={{ borderColor: color }}
          >
            {pin.summary}
          </p>

          <div className="border-t border-white/8 mb-5" />

          {/* Full history */}
          <div className="mb-6 flex-1">
            <h3
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color }}
            >
              Tarihçe & Açıklama
            </h3>
            <p className="text-sm text-neutral-300 leading-7 whitespace-pre-line">
              {pin.fullHistory || pin.description || pin.summary}
            </p>
          </div>

          {/* Actions & Coordinates */}
          <div className="space-y-4 pt-2 mt-auto">
            <div className="flex gap-3">
              <button
                onClick={handleDirections}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 shadow-md"
                style={{ background: color, color: "#0d0e12" }}
                id={`landmark-directions-${pin.id}`}
              >
                <Navigation size={15} />
                Yol Tarifi
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-white/15 text-[var(--muted)] text-sm hover:border-white/30 hover:text-white transition-all"
                id={`landmark-share-${pin.id}`}
              >
                <Share2 size={15} />
                Paylaş
              </button>
            </div>

            <p className="text-[11px] text-white/30 font-mono">
              📍 Koordinatlar: {pin.coordinates[0].toFixed(5)}°N &nbsp; {pin.coordinates[1].toFixed(5)}°E
            </p>
          </div>

        </div>

        {/* ── Right Column: Fotoğraflar & Carousel (MD: 5 cols) ── */}
        <div className="md:col-span-5 relative h-64 md:h-full bg-[#07080a] flex items-center justify-center order-1 md:order-2 overflow-hidden group">
          {displayImages.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayImages[imgIndex]}
              alt={`${pin.title} foto ${imgIndex + 1}`}
              className="w-full h-full object-contain p-2"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl opacity-10">
              <span>{catIcon}</span>
            </div>
          )}

          {/* Close button (top right) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-white hover:bg-black transition-colors z-20 shadow-lg border border-white/10"
            aria-label="Kapat"
            id="landmark-modal-close"
          >
            <X size={18} />
          </button>

          {/* Carousel Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={() => setImgIndex((i) => (i === 0 ? displayImages.length - 1 : i - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/90 transition-all z-20 border border-white/10"
                aria-label="Önceki fotoğraf"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setImgIndex((i) => (i + 1) % displayImages.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/90 transition-all z-20 border border-white/10"
                aria-label="Sonraki fotoğraf"
              >
                <ChevronRight size={18} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
                {displayImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === imgIndex ? "bg-[var(--accent)] w-5" : "bg-white/40 w-1.5"
                    }`}
                    aria-label={`Fotoğraf ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Photo Counter */}
          {displayImages.length > 0 && (
            <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] text-white/80 font-mono border border-white/10 z-20">
              {imgIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>

      </div>
    </>,
    document.body
  );
}
